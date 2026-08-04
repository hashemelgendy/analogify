import { NextResponse } from "next/server";
import {
  createExplanation,
  ExplainValidationError,
} from "@/lib/explain-service";
import type { ExplainApiResponse } from "@/types/explanation";

/**
 * POST /api/explain
 *
 * Always returns:
 *   { success: boolean, data?: Explanation, error?: string }
 *
 * Flow:
 *   request → explain-service → analogy-generator → response
 */
function jsonResponse(body: ExplainApiResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      400,
    );
  }

  try {
    const data = await createExplanation(body);
    return jsonResponse({ success: true, data }, 200);
  } catch (error) {
    if (error instanceof ExplainValidationError) {
      return jsonResponse({ success: false, error: error.message }, 400);
    }

    console.error("[api/explain]", error);
    return jsonResponse(
      { success: false, error: "Failed to generate explanation" },
      500,
    );
  }
}
