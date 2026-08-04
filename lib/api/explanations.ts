import type {
  ApiResponse,
  ExplainApiResponse,
  Explanation,
  LearningTrailItem,
} from "@/types/explanation";

export type LearningTrailListResponse = ApiResponse<LearningTrailItem[]>;

/**
 * Client helpers for explanation history.
 * UI → these modules → API routes → services → Supabase
 */

export async function fetchLearningTrail(
  limit = 10,
): Promise<LearningTrailItem[]> {
  const response = await fetch(`/api/explanations?limit=${limit}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  let payload: LearningTrailListResponse;
  try {
    payload = (await response.json()) as LearningTrailListResponse;
  } catch {
    throw new Error("Invalid response from explanations API");
  }

  if (!payload.success || !payload.data) {
    throw new Error(payload.error ?? "Failed to load learning trail");
  }

  return payload.data;
}

export async function fetchExplanationById(
  id: string,
): Promise<Explanation> {
  const response = await fetch(`/api/explanations/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  let payload: ExplainApiResponse;
  try {
    payload = (await response.json()) as ExplainApiResponse;
  } catch {
    throw new Error("Invalid response from explanation API");
  }

  if (!payload.success || !payload.data) {
    throw new Error(payload.error ?? "Failed to load explanation");
  }

  return payload.data;
}
