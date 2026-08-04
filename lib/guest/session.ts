import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Persistent anonymous guest identity (server-only).
 *
 * - UUID v4, not derived from IP
 * - Stored in httpOnly cookie (readable only by the server)
 * - No Supabase Auth user is created
 *
 * Future auth attach:
 *   UPDATE explanations SET user_id = <auth uid> WHERE guest_id = <cookie> AND user_id IS NULL
 */

export const GUEST_COOKIE_NAME = "analogify_guest_id";

const GUEST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400; // ~13 months

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isGuestId(value: string | undefined | null): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE_SECONDS,
  };
}

/** Read guest id without creating one. */
export async function readGuestId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(GUEST_COOKIE_NAME)?.value;
  if (!isGuestId(raw)) return null;
  return raw.trim();
}

/**
 * Ensure a guest id exists for this browser session.
 * Safe to call from Route Handlers (sets cookie when missing/invalid).
 */
export async function getOrCreateGuestId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE_NAME)?.value;

  if (isGuestId(existing)) {
    // Refresh expiry so active guests stay sticky
    store.set(GUEST_COOKIE_NAME, existing.trim(), cookieOptions());
    return existing.trim();
  }

  const guestId = randomUUID();
  store.set(GUEST_COOKIE_NAME, guestId, cookieOptions());
  return guestId;
}

/**
 * Identity context used for isolation queries.
 * When auth is added, populate userId from the session and prefer it over guest.
 */
export type AccessIdentity = {
  guestId: string | null;
  /** Future: auth.uid() */
  userId: string | null;
};

/**
 * Resolve the current request identity (guest cookie today; auth later).
 * Creates a guest cookie when none exists so write/read stay consistent.
 */
export async function resolveAccessIdentity(): Promise<AccessIdentity> {
  // TODO(auth): const userId = await getAuthenticatedUserId(); if (userId) return { userId, guestId: await readGuestId() };
  const guestId = await getOrCreateGuestId();
  return {
    guestId,
    userId: null,
  };
}
