import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { RateLimitResult } from "@/lib/rate-limit/config";
import { EXPLAIN_RATE_LIMIT } from "@/lib/rate-limit/config";

/**
 * Distributed fixed-window rate limit via Upstash Redis (Vercel-friendly).
 * Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (server-only).
 */

let limiter: Ratelimit | null | undefined;

function getUpstashCredentials():
  | { url: string; token: string }
  | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

export function isUpstashRateLimitConfigured(): boolean {
  return getUpstashCredentials() !== null;
}

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;

  const creds = getUpstashCredentials();
  if (!creds) {
    limiter = null;
    return null;
  }

  const redis = new Redis({
    url: creds.url,
    token: creds.token,
  });

  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(
      EXPLAIN_RATE_LIMIT.max,
      `${EXPLAIN_RATE_LIMIT.windowSeconds} s`,
    ),
    prefix: EXPLAIN_RATE_LIMIT.prefix,
    analytics: false,
  });

  return limiter;
}

/** Reset cached limiter (e.g. after env changes in tests). */
export function resetUpstashLimiterCache(): void {
  limiter = undefined;
}

export async function checkUpstashRateLimit(
  identifier: string,
): Promise<RateLimitResult | null> {
  const client = getLimiter();
  if (!client) return null;

  const result = await client.limit(identifier);
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
  };
}
