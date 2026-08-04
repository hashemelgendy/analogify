import {
  explanationFromRow,
  fetchExplanationRowById,
  fetchRecentExplanationRows,
  trailItemFromRow,
} from "@/lib/explanations/persist";
import { resolveAccessIdentity } from "@/lib/guest/session";
import type { Explanation, LearningTrailItem } from "@/types/explanation";

/**
 * Learning trail / history service (server-only).
 *
 *   app/api/explanations/* → this module → persist + guest isolation
 */

export class ExplanationQueryError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ExplanationQueryError";
    this.status = status;
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface LearningTrailPage {
  items: LearningTrailItem[];
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
}

/**
 * Latest saved explanations for the current guest/user (newest first).
 * Supports limit + offset for history pagination.
 */
export async function getLearningTrailItems(
  limit = 10,
  offset = 0,
): Promise<LearningTrailPage> {
  const identity = await resolveAccessIdentity();
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const safeOffset = Math.max(0, offset);

  const result = await fetchRecentExplanationRows(identity, {
    limit: safeLimit,
    offset: safeOffset,
  });

  if (!result.ok) {
    throw new ExplanationQueryError(
      "We couldn’t load your learning trail right now.",
      503,
    );
  }

  const items = result.rows.map((row, index) =>
    trailItemFromRow(row, safeOffset + index),
  );
  const total = result.total;
  const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);
  const page =
    safeOffset === 0 ? 1 : Math.floor(safeOffset / safeLimit) + 1;

  return {
    items,
    total,
    limit: safeLimit,
    offset: safeOffset,
    page,
    totalPages,
  };
}

/**
 * Load a full explanation by id if owned by the current guest/user.
 */
export async function getExplanationById(id: string): Promise<Explanation> {
  if (!id.trim() || !UUID_RE.test(id.trim())) {
    throw new ExplanationQueryError("Invalid explanation id", 400);
  }

  const identity = await resolveAccessIdentity();
  const result = await fetchExplanationRowById(id.trim(), identity);

  if (!result.ok) {
    if (result.notFound) {
      throw new ExplanationQueryError("Explanation not found", 404);
    }
    throw new ExplanationQueryError(
      "We couldn’t load that explanation right now.",
      503,
    );
  }

  return explanationFromRow(result.row);
}
