/**
 * OAuth callback — exchanges the auth code for a session cookie.
 * Redirects home on success; guest usage is never blocked on failure.
 */
import { NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server-auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    try {
      const supabase = await createServerAuthClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, origin));
      }
      console.error("[auth/callback] exchange failed:", error.message);
    } catch (error) {
      console.error(
        "[auth/callback] unexpected:",
        error instanceof Error ? error.message : "unknown",
      );
    }
  }

  // Soft-fail to home so guests can keep using the app
  return NextResponse.redirect(new URL("/?auth_error=1", origin));
}
