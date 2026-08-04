/**
 * POST /api/explain
 *
 * Always returns:
 *   { success: boolean, data?: Explanation, error?: string }
 *
 * Flow:
 *   request → rate-limit → explain-service → AI → (persist) → response
 */
import { NextResponse } from "next/server";
import {
  createExplanation,
  ExplainValidationError,
} from "@/lib/explain-service";
import {
  rateLimitExceededMessage,
  rateLimitExplain,
  rateLimitHeaders,
} from "@/lib/rate-limit";
import type { ExplainApiResponse } from "@/types/explanation";

function jsonResponse(
  body: ExplainApiResponse,
  status: number,
  headers?: HeadersInit,
) {
  return NextResponse.json(body, { status, headers });
}

export async function POST(request: Request) {
  const limitResult = await rateLimitExplain(request);
  const limitHeaders = rateLimitHeaders(limitResult);

  if (!limitResult.success) {
    return jsonResponse(
      {
        success: false,
        error: rateLimitExceededMessage(limitResult),
      },
      429,
      limitHeaders,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      400,
      limitHeaders,
    );
  }

  try {
    const data = await createExplanation(body);
    return jsonResponse({ success: true, data }, 200, limitHeaders);
  } catch (error) {
    if (error instanceof ExplainValidationError) {
      return jsonResponse(
        { success: false, error: error.message },
        400,
        limitHeaders,
      );
    }

    console.error("[api/explain]", error);
    return jsonResponse(
      { success: false, error: "Failed to generate explanation" },
      500,
      limitHeaders,
    );
  }
}
