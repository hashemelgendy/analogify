import { NextResponse } from "next/server";
import {
  ExplanationQueryError,
  deleteAllOwnedExplanations,
  getLearningTrailItems,
} from "@/lib/explanations/queries";
import type {
  ApiResponse,
  LearningTrailPageApiResponse,
} from "@/types/explanation";

/**
 * GET /api/explanations?limit=10
 * GET /api/explanations?limit=5&page=1
 * GET /api/explanations?limit=5&offset=0
 *
 * Returns recent explanations for the learning trail / history (newest first).
 * `data` remains LearningTrailItem[] so existing clients keep working.
 * Optional `pagination` meta is always included for page-aware UIs.
 *
 * DELETE /api/explanations
 * Soft-deletes all active explanations owned by the current guest/user.
 */
function jsonResponse(
  body: LearningTrailPageApiResponse | ApiResponse<{ deleted: number }>,
  status: number,
) {
  return NextResponse.json(body, { status });
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (value == null || value === "") return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const limit = rawLimit ? Number.parseInt(rawLimit, 10) : 10;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;

  const pageParam = searchParams.get("page");
  const offsetParam = searchParams.get("offset");

  let offset = 0;
  if (offsetParam != null && offsetParam !== "") {
    offset = parsePositiveInt(offsetParam, 0);
  } else if (pageParam != null && pageParam !== "") {
    const page = Math.max(1, parsePositiveInt(pageParam, 1));
    offset = (page - 1) * safeLimit;
  }

  try {
    const result = await getLearningTrailItems(safeLimit, offset);
    return jsonResponse(
      {
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          pageSize: result.limit,
          totalPages: result.totalPages,
          offset: result.offset,
        },
      },
      200,
    );
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

export async function DELETE() {
  try {
    const data = await deleteAllOwnedExplanations();
    return jsonResponse({ success: true, data }, 200);
  } catch (error) {
    if (error instanceof ExplanationQueryError) {
      return jsonResponse(
        { success: false, error: error.message },
        error.status,
      );
    }

    console.error("[api/explanations DELETE]", error);
    return jsonResponse(
      {
        success: false,
        error: "We couldn’t clear your history right now.",
      },
      500,
    );
  }
}
