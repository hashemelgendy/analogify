import { NextResponse } from "next/server";
import { verifySupabaseConnection } from "@/lib/supabase/health";

/**
 * GET /api/health/supabase
 * Verifies env + connection. Safe to call from tools/CI; no UI dependency.
 */
export async function GET() {
  const result = await verifySupabaseConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
