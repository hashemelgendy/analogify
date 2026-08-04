/**
 * App environment helpers (server-safe).
 *
 * APP_ENV:
 *   - "production" — full safeguards (e.g. rate limits)
 *   - "staging"    — relaxed for testing
 *
 * If APP_ENV is undefined, defaults to production behavior.
 */

export type AppEnv = "staging" | "production";

/** Resolved environment; undefined / unknown → production (safe default). */
export const APP_ENV: AppEnv =
  process.env.APP_ENV === "staging" ? "staging" : "production";

export const isProduction = APP_ENV === "production";
export const isStaging = APP_ENV === "staging";

/**
 * Rate limits apply only in production.
 * Staging (and any non-production APP_ENV after normalize) skips them.
 */
export function shouldApplyRateLimit(): boolean {
  return isProduction;
}

// Server boot marker (logs once per module evaluation)
if (typeof window === "undefined") {
  console.log(
    "Running in:",
    process.env.APP_ENV ?? `production (default; APP_ENV unset)`,
  );
}
