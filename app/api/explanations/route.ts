import { NextResponse } from "next/server";
import {
  ExplanationQueryError,
  getLearningTrailItems,
} from "@/lib/explanations/queries";
import type { LearningTrailApiResponse } from "@/types/explanation";

/**
 * GET /api/explanations?limit=10
 * Returns recent explanations for the learning trail (newest first).
 */
function jsonResponse(body: LearningTrailApiResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const limit = rawLimit ? Number.parseInt(rawLimit, 10) : 10;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;

  try {
    const data = await getLearningTrailItems(safeLimit);
    return jsonResponse({ success: true, data }, 200);
  } catch (error) {
    if (error instanceof ExplanationQueryError) {
      return jsonResponse(
        { success: false, error: error.message },
        error.status,
      );
    }

    console.error("[api/explanations]", error);
    return jsonResponse(
      {
        success: false,
        error: "We couldn’t load your learning trail right now.",
      },
      500,
    );
  }
}
