import { getClientIp } from "@/lib/rate-limit/ip";
import type { RateLimitResult } from "@/lib/rate-limit/config";
import { EXPLAIN_RATE_LIMIT } from "@/lib/rate-limit/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import {
  checkUpstashRateLimit,
  isUpstashRateLimitConfigured,
} from "@/lib/rate-limit/upstash";
import { getOrCreateGuestId, readGuestId } from "@/lib/guest/session";

export type { RateLimitResult } from "@/lib/rate-limit/config";
export { EXPLAIN_RATE_LIMIT } from "@/lib/rate-limit/config";
export { getClientIp } from "@/lib/rate-limit/ip";

type IdentityKey = {
  storageKey: string;
  subject: "guest" | "ip";
  keyLabel: string;
};

/**
 * Primary: guest_id cookie (persistent anonymous identity).
 * Fallback: client IP if guest cookie cannot be resolved.
 */
async function resolveRateLimitIdentity(
  request: Request,
): Promise<IdentityKey> {
  try {
    // Prefer existing cookie; create if missing so limits stick across requests
    const existing = await readGuestId();
    const guestId = existing ?? (await getOrCreateGuestId());
    return {
      storageKey: `${EXPLAIN_RATE_LIMIT.prefix}:guest:${guestId}`,
      subject: "guest",
      keyLabel: `guest:${guestId.slice(0, 8)}…`,
    };
  } catch (error) {
    console.warn(
      "[rate-limit] guest cookie unavailable, falling back to IP:",
      error instanceof Error ? error.message : "unknown",
    );
    const ip = getClientIp(request);
    return {
      storageKey: `${EXPLAIN_RATE_LIMIT.prefix}:ip:${ip}`,
      subject: "ip",
      keyLabel: `ip:${ip}`,
    };
  }
}

/**
 * Rate-limit POST /api/explain for the current guest (or IP).
 * MVP storage: in-memory sliding window of timestamps.
 * Optional: Upstash when REST credentials are set (distributed).
 */
export async function rateLimitExplain(
  request: Request,
): Promise<RateLimitResult & { backend: "upstash" | "memory" }> {
  const identity = await resolveRateLimitIdentity(request);
  const meta = {
    subject: identity.subject,
    keyLabel: identity.keyLabel,
  };

  if (isUpstashRateLimitConfigured()) {
    try {
      const result = await checkUpstashRateLimit(identity.storageKey, meta);
      if (result) {
        return { ...result, backend: "upstash" };
      }
    } catch (error) {
      console.error(
        "[rate-limit] Upstash failed, falling back to memory:",
        error instanceof Error ? error.message : "unknown",
      );
    }
  }

  return {
    ...checkMemoryRateLimit(identity.storageKey, meta),
    backend: "memory",
  };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
    ...(result.success
      ? {}
      : { "Retry-After": String(result.retryAfterSeconds) }),
  };
}

export function rateLimitExceededMessage(result: RateLimitResult): string {
  const max = result.limit;
  const windowSec = EXPLAIN_RATE_LIMIT.windowSeconds;
  const windowLabel =
    windowSec >= 3600 && windowSec % 3600 === 0
      ? `${windowSec / 3600} hour${windowSec / 3600 === 1 ? "" : "s"}`
      : windowSec >= 60 && windowSec % 60 === 0
        ? `${windowSec / 60} minute${windowSec / 60 === 1 ? "" : "s"}`
        : `${windowSec} second${windowSec === 1 ? "" : "s"}`;

  return (
    `You’ve reached the limit of ${max} explanations per ${windowLabel}. ` +
    `Please try again in ${result.retryAfterSeconds} second${
      result.retryAfterSeconds === 1 ? "" : "s"
    }.`
  );
}
