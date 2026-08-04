/**
 * Shared rate-limit configuration (server-only).
 *
 * Adjust via env without code changes:
 *   RATE_LIMIT_EXPLAIN_MAX              default 10
 *   RATE_LIMIT_EXPLAIN_WINDOW_SECONDS   default 60
 */

function positiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const EXPLAIN_RATE_LIMIT = {
  /** Max requests per IP in the window */
  get max() {
    return positiveInt(process.env.RATE_LIMIT_EXPLAIN_MAX, 10);
  },
  /** Window length in seconds */
  get windowSeconds() {
    return positiveInt(process.env.RATE_LIMIT_EXPLAIN_WINDOW_SECONDS, 60);
  },
  /** Prefix for Redis keys / diagnostics */
  prefix: "analogify:ratelimit:explain",
} as const;

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix epoch ms when the current window resets */
  reset: number;
  /** Seconds until a retry is allowed when blocked */
  retryAfterSeconds: number;
};
