import type {
  ExplainApiResponse,
  Explanation,
  LearningTrailItem,
  LearningTrailPageApiResponse,
  LearningTrailPagination,
} from "@/types/explanation";

/**
 * Client helpers for guest Learning Trail / explanation history.
 *
 * Frontend → /api/explanations → queries service → Supabase (guest_id filtered)
 * Never imports service-role keys or queries Supabase from the browser.
 */

const fetchOptions: RequestInit = {
  method: "GET",
  headers: { Accept: "application/json" },
  cache: "no-store",
  // Ensure httpOnly analogify_guest_id cookie is sent on same-origin requests
  credentials: "same-origin",
};

export interface LearningTrailPageResult {
  items: LearningTrailItem[];
  pagination: LearningTrailPagination;
}

/**
 * Fetch a page of trail items (limit + offset or page).
 * Used by history pagination and (with defaults) the home learning trail.
 */
export async function fetchLearningTrailPage(options?: {
  limit?: number;
  page?: number;
  offset?: number;
}): Promise<LearningTrailPageResult> {
  const limit = options?.limit ?? 10;
  const params = new URLSearchParams();
  params.set("limit", String(limit));

  if (options?.offset != null) {
    params.set("offset", String(options.offset));
  } else if (options?.page != null) {
    params.set("page", String(options.page));
  }

  const response = await fetch(
    `/api/explanations?${params.toString()}`,
    fetchOptions,
  );

  let payload: LearningTrailPageApiResponse;
  try {
    payload = (await response.json()) as LearningTrailPageApiResponse;
  } catch {
    throw new Error("Invalid response from explanations API");
  }

  if (!payload.success || !payload.data) {
    throw new Error(
      payload.error ?? "We couldn’t load your learning trail right now.",
    );
  }

  const items = payload.data;
  const pagination: LearningTrailPagination = payload.pagination ?? {
    total: items.length,
    page: 1,
    pageSize: limit,
    totalPages: items.length > 0 ? 1 : 0,
    offset: 0,
  };

  return { items, pagination };
}

/** Convenience wrapper — returns only items (home trail). */
export async function fetchLearningTrail(
  limit = 10,
): Promise<LearningTrailItem[]> {
  const { items } = await fetchLearningTrailPage({ limit, page: 1 });
  return items;
}

/** Loads a saved explanation by id — no AI generation. */
export async function fetchExplanationById(
  id: string,
): Promise<Explanation> {
  const response = await fetch(
    `/api/explanations/${encodeURIComponent(id)}`,
    fetchOptions,
  );

  let payload: ExplainApiResponse;
  try {
    payload = (await response.json()) as ExplainApiResponse;
  } catch {
    throw new Error("Invalid response from explanation API");
  }

  if (!payload.success || !payload.data) {
    throw new Error(
      payload.error ?? "We couldn’t load that explanation right now.",
    );
  }

  return payload.data;
}
