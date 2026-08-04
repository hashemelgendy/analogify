import type { RateLimitResult, RateLimitSubject } from "@/lib/rate-limit/config";
import { EXPLAIN_RATE_LIMIT } from "@/lib/rate-limit/config";

/**
 * In-memory sliding-window store (MVP).
 * Tracks request timestamps per identity.
 * Not shared across Vercel isolates — fine for single-instance / local dev.
 */

type Bucket = {
  /** Epoch ms of each accepted (and rejected after full) request timestamps in window */
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();
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

function pruneWindow(bucket: Bucket, now: number, windowMs: number) {
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
}

export function checkMemoryRateLimit(
  storageKey: string,
  meta: { subject: RateLimitSubject; keyLabel: string },
): RateLimitResult {
  const limit = EXPLAIN_RATE_LIMIT.max;
  const windowMs = EXPLAIN_RATE_LIMIT.windowMs;
  const now = Date.now();

  let bucket = buckets.get(storageKey);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(storageKey, bucket);
    pruneIfNeeded();
  }

  pruneWindow(bucket, now, windowMs);

  const used = bucket.timestamps.length;
  const success = used < limit;

  if (success) {
    bucket.timestamps.push(now);
  }

  const remaining = Math.max(0, limit - bucket.timestamps.length);
  const oldest = bucket.timestamps[0] ?? now;
  const reset = success
    ? oldest + windowMs
    : oldest + windowMs;

  // When blocked, reset when oldest request exits the window
  const retryAfterSeconds = success
    ? 0
    : Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

  return {
    success,
    limit,
    remaining: success ? remaining : 0,
    reset,
    retryAfterSeconds,
    subject: meta.subject,
    keyLabel: meta.keyLabel,
  };
}

/** Test helper — clear all in-memory counters */
export function clearMemoryRateLimits(): void {
  buckets.clear();
}
