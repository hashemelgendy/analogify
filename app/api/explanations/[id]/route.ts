import { NextResponse } from "next/server";
import {
  ExplanationQueryError,
  deleteExplanationById,
  getExplanationById,
} from "@/lib/explanations/queries";
import type { ApiResponse, ExplainApiResponse } from "@/types/explanation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/explanations/[id]
 * Returns a full explanation for trail selection.
 *
 * DELETE /api/explanations/[id]
 * Soft-deletes one owned explanation (sets deleted_at; scoped by ownership).
 */
function jsonResponse(
  body: ExplainApiResponse | ApiResponse<{ deleted: number }>,
  status: number,
) {
  return NextResponse.json(body, { status });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const data = await getExplanationById(id);
    return jsonResponse({ success: true, data }, 200);
  } catch (error) {
    if (error instanceof ExplanationQueryError) {
      return jsonResponse(
        { success: false, error: error.message },
        error.status,
      );
    }

    console.error("[api/explanations/[id]]", error);
    return jsonResponse(
      {
        success: false,
        error: "We couldn’t load that explanation right now.",
      },
      500,
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const data = await deleteExplanationById(id);
    return jsonResponse({ success: true, data }, 200);
  } catch (error) {
    if (error instanceof ExplanationQueryError) {
      return jsonResponse(
        { success: false, error: error.message },
        error.status,
      );
    }

    console.error("[api/explanations/[id] DELETE]", error);
    return jsonResponse(
      {
        success: false,
        error: "We couldn’t delete that explanation right now.",
      },
      500,
    );
  }
}
