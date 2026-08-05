/**
 * GET /api/guest
 *
 * Ensures the httpOnly guest cookie exists and returns the id so the client
 * can mirror it to localStorage for merge flags / UX. Does not require auth.
 */
import { NextResponse } from "next/server";
import { getOrCreateGuestId } from "@/lib/guest/session";
import { getAuthenticatedUserId } from "@/lib/supabase/server-auth";

export async function GET() {
  try {
    const guestId = await getOrCreateGuestId();
    const userId = await getAuthenticatedUserId();
    return NextResponse.json({
      success: true,
      data: { guestId, userId },
    });
  } catch (error) {
    console.error("[api/guest]", error);
    return NextResponse.json(
      { success: false, error: "Could not resolve guest identity" },
      { status: 500 },
    );
  }
}
