import { NextResponse } from "next/server";
import {
  FeedbackValidationError,
  submitFeedback,
} from "@/lib/feedback-service";
import type { FeedbackApiResponse } from "@/types/explanation";

/**
 * POST /api/feedback
 *
 * Body: { explanationId, rating, comment? }
 * Response: { success, data?: FeedbackResult, error? }
 *
 * Flow: request → feedback-service → persist → Supabase
 */
function jsonResponse(body: FeedbackApiResponse, status: number) {
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
    const data = await submitFeedback(body);
    return jsonResponse({ success: true, data }, 201);
  } catch (error) {
    if (error instanceof FeedbackValidationError) {
      return jsonResponse({ success: false, error: error.message }, 400);
    }

    console.error("[api/feedback]", error);
    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save feedback",
      },
      503,
    );
  }
}
