/**
 * Rate-limit configuration for POST /api/explain (server-only).
 *
 * Defaults: 10 requests per hour per guest (or IP if no guest cookie).
 *
 * Override without code changes:
 *   RATE_LIMIT_EXPLAIN_MAX=10
 *   RATE_LIMIT_EXPLAIN_WINDOW_SECONDS=3600
 */

function positiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const EXPLAIN_RATE_LIMIT = {
  /** Max requests per identity in the rolling window */
  get max() {
    return positiveInt(process.env.RATE_LIMIT_EXPLAIN_MAX, 10);
  },
  /** Window length in seconds (default 1 hour) */
  get windowSeconds() {
    return positiveInt(process.env.RATE_LIMIT_EXPLAIN_WINDOW_SECONDS, 3600);
  },
  get windowMs() {
    return this.windowSeconds * 1000;
  },
  /** Key prefix for stores */
  prefix: "analogify:ratelimit:explain",
} as const;

export type RateLimitSubject = "guest" | "ip";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix epoch ms when the oldest counted request falls out of the window */
  reset: number;
  /** Seconds until a retry is allowed when blocked */
  retryAfterSeconds: number;
  /** How this request was identified */
  subject: RateLimitSubject;
  /** Opaque key used for storage (safe to log without full guest UUID if preferred) */
  keyLabel: string;
};
