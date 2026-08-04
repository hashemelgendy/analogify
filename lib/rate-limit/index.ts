import type { RateLimitResult } from "@/lib/rate-limit/config";
import { EXPLAIN_RATE_LIMIT } from "@/lib/rate-limit/config";
import { checkMemoryRateLimit } from "@/lib/rate-limit/memory";
import {
  checkUpstashRateLimit,
  isUpstashRateLimitConfigured,
} from "@/lib/rate-limit/upstash";

export type { RateLimitResult } from "@/lib/rate-limit/config";
export { EXPLAIN_RATE_LIMIT } from "@/lib/rate-limit/config";

/**
 * Extract client IP for rate limiting.
 * On Vercel / reverse proxies, the left-most X-Forwarded-For hop is the client.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const vercel = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (vercel) {
    const first = vercel.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}

/**
 * Rate-limit the /api/explain path per IP.
 * Prefers Upstash when configured; falls back to in-memory otherwise.
 */
export async function rateLimitExplain(
  request: Request,
): Promise<RateLimitResult & { backend: "upstash" | "memory" }> {
  const ip = getClientIp(request);
  const identifier = `ip:${ip}`;

  if (isUpstashRateLimitConfigured()) {
    try {
      const result = await checkUpstashRateLimit(identifier);
      if (result) {
        return { ...result, backend: "upstash" };
      }
    } catch (error) {
      console.error(
        "[rate-limit] Upstash failed, falling back to memory:",
        error instanceof Error ? error.message : "unknown",
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — using in-memory limits (not shared across Vercel instances).",
    );
  }

  return {
    ...checkMemoryRateLimit(identifier),
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
  const window = EXPLAIN_RATE_LIMIT.windowSeconds;
  return (
    `Rate limit exceeded: max ${result.limit} explanation requests per ${window}s per IP. ` +
    `Try again in ${result.retryAfterSeconds} second${result.retryAfterSeconds === 1 ? "" : "s"}.`
  );
}
