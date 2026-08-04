import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { RateLimitResult, RateLimitSubject } from "@/lib/rate-limit/config";
import { EXPLAIN_RATE_LIMIT } from "@/lib/rate-limit/config";

/**
 * Optional distributed sliding-window via Upstash (shared across Vercel instances).
 * Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 */

let limiter: Ratelimit | null | undefined;

function getCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

export function isUpstashRateLimitConfigured(): boolean {
  return getCredentials() !== null;
}

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;

  const creds = getCredentials();
  if (!creds) {
    limiter = null;
    return null;
  }

  limiter = new Ratelimit({
    redis: new Redis({ url: creds.url, token: creds.token }),
    limiter: Ratelimit.slidingWindow(
      EXPLAIN_RATE_LIMIT.max,
      `${EXPLAIN_RATE_LIMIT.windowSeconds} s`,
    ),
    prefix: EXPLAIN_RATE_LIMIT.prefix,
    analytics: false,
  });

  return limiter;
}

export function resetUpstashLimiterCache(): void {
  limiter = undefined;
}

export async function checkUpstashRateLimit(
  storageKey: string,
  meta: { subject: RateLimitSubject; keyLabel: string },
): Promise<RateLimitResult | null> {
  const client = getLimiter();
  if (!client) return null;

  const result = await client.limit(storageKey);
  const now = Date.now();
  const retryAfterSeconds = result.success
    ? 0
    : Math.max(1, Math.ceil((result.reset - now) / 1000));

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfterSeconds,
    subject: meta.subject,
    keyLabel: meta.keyLabel,
  };
}
