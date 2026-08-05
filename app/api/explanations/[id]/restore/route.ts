import { NextResponse } from "next/server";
import {
  ExplanationQueryError,
  restoreExplanationById,
} from "@/lib/explanations/queries";
import type { ApiResponse } from "@/types/explanation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/explanations/[id]/restore
 * Clears soft-delete (deleted_at) for an owned explanation (undo).
 */
export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const data = await restoreExplanationById(id);
    return NextResponse.json(
      { success: true, data } satisfies ApiResponse<{ restored: number }>,
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ExplanationQueryError) {
      return NextResponse.json(
        { success: false, error: error.message } satisfies ApiResponse<never>,
        { status: error.status },
      );
    }

    console.error("[api/explanations/[id]/restore]", error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn’t restore that explanation right now.",
      },
      { status: 500 },
    );
  }
}
