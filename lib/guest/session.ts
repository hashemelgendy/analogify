/**
 * Guest identity via httpOnly cookie (primary guest system).
 * Optional localStorage mirror is handled client-side for merge flags / UX.
 *
 * Server-only: do not import into client components.
 */

import { cookies } from "next/headers";
import { getAuthenticatedUserId } from "@/lib/supabase/server-auth";

export const GUEST_COOKIE_NAME = "analogify_guest_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type AccessIdentity = {
  userId: string | null;
  guestId: string | null;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/** Type guard / validator for guest ids (cookie or claim input). */
export function isGuestId(value: string | null | undefined): value is string {
  return typeof value === "string" && isUuid(value.trim());
}

/** Read guest id from cookie without creating one. */
export async function readGuestId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(GUEST_COOKIE_NAME)?.value?.trim() ?? "";
  if (!raw || !isUuid(raw)) return null;
  return raw;
}

/**
 * Returns the guest id cookie, creating one if missing.
 * Call from API routes / server actions that mutate cookies.
 */
export async function getOrCreateGuestId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(GUEST_COOKIE_NAME)?.value?.trim();
  if (existing && isUuid(existing)) {
    return existing;
  }

  const guestId = crypto.randomUUID();
  jar.set(GUEST_COOKIE_NAME, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
  return guestId;
}

/**
 * Prefer signed-in user when present; otherwise guest cookie.
 * When signed in, guestId is still returned if cookie exists (for claim merge).
 */
export async function resolveAccessIdentity(): Promise<AccessIdentity> {
  const userId = await getAuthenticatedUserId();

  if (userId) {
    const guestId = await readGuestId();
    return { userId, guestId };
  }

  const guestId = await getOrCreateGuestId();
  return { userId: null, guestId };
}
