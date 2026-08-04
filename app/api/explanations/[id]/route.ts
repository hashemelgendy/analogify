import { NextResponse } from "next/server";
import {
  ExplanationQueryError,
  getExplanationById,
} from "@/lib/explanations/queries";
import type { ExplainApiResponse } from "@/types/explanation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/explanations/[id]
 * Returns a full explanation for trail selection.
 */
function jsonResponse(body: ExplainApiResponse, status: number) {
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
