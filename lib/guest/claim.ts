/**
 * Server helpers for guest → authenticated user history migration.
 * Call after a successful sign-up/sign-in when a guest cookie is present.
 *
 * Example (future auth service):
 *   await claimGuestExplanations({ userId: session.user.id, guestId: await readGuestId() })
 */

import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { isGuestId } from "@/lib/guest/session";

export type ClaimGuestResult =
  | { ok: true; claimed: number }
  | { ok: false; error: string };

/**
 * Attach unclaimed guest explanations to a real auth user.
 * Safe to re-run: only updates rows where user_id is still null.
 */
export async function claimGuestExplanations(input: {
  userId: string;
  guestId: string | null | undefined;
}): Promise<ClaimGuestResult> {
  if (!isGuestId(input.guestId)) {
    return { ok: true, claimed: 0 };
  }

  if (!input.userId.trim()) {
    return { ok: false, error: "userId is required" };
  }

  if (!isSupabaseServiceRoleConfigured()) {
    return { ok: false, error: "Supabase service role is not configured" };
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data, error } = await supabase
      .from("explanations")
      .update({ user_id: input.userId })
      .eq("guest_id", input.guestId)
      .is("user_id", null)
      .select("id");

    if (error) {
      console.error("[guest.claim] Failed:", {
        message: error.message,
        code: error.code,
      });
      return { ok: false, error: error.message };
    }

    return { ok: true, claimed: data?.length ?? 0 };
  } catch (error) {
    console.error(
      "[guest.claim] Unexpected:",
      error instanceof Error ? error.message : "unknown",
    );
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
