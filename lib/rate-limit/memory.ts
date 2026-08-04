import type { RateLimitResult } from "@/lib/rate-limit/config";
import { EXPLAIN_RATE_LIMIT } from "@/lib/rate-limit/config";

/**
 * Fixed-window counter store for local/dev (and single-instance deploys).
 * Not shared across Vercel isolates — prefer Upstash in production.
 */

type Bucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, Bucket>();

/** Bound memory growth under random-IP abuse in long-lived processes */
const MAX_KEYS = 10_000;

function pruneIfNeeded() {
  if (buckets.size <= MAX_KEYS) return;
  const excess = buckets.size - MAX_KEYS;
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    removed += 1;
    if (removed >= excess) break;
  }
}

export function checkMemoryRateLimit(identifier: string): RateLimitResult {
  const limit = EXPLAIN_RATE_LIMIT.max;
  const windowMs = EXPLAIN_RATE_LIMIT.windowSeconds * 1000;
  const now = Date.now();
  const key = `${EXPLAIN_RATE_LIMIT.prefix}:${identifier}`;

  let bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    bucket = { count: 0, windowStart: now };
    buckets.set(key, bucket);
    pruneIfNeeded();
  }

  bucket.count += 1;
  const reset = bucket.windowStart + windowMs;
  const remaining = Math.max(0, limit - bucket.count);
  const success = bucket.count <= limit;
  const retryAfterSeconds = success
    ? 0
    : Math.max(1, Math.ceil((reset - now) / 1000));

  return {
    success,
    limit,
    remaining: success ? remaining : 0,
    reset,
    retryAfterSeconds,
  };
}
