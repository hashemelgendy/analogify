/**
 * POST /api/auth/claim
 *
 * Attaches guest explanations (cookie guest_id) to the signed-in user.
 * Safe to call multiple times — only claims rows where user_id IS NULL.
 */
import { NextResponse } from "next/server";
import { claimGuestExplanations } from "@/lib/guest/claim";
import { readGuestId } from "@/lib/guest/session";
import { getAuthenticatedUserId } from "@/lib/supabase/server-auth";

export async function POST() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const guestId = await readGuestId();
  const result = await claimGuestExplanations({ userId, guestId });

  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 503 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { claimed: result.claimed, guestId },
  });
}
