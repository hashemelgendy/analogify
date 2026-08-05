import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import type { AccessIdentity } from "@/lib/guest/session";
import type { ExplanationInsert, ExplanationRow } from "@/lib/supabase/types";
import type {
  DifficultyLevel,
  Explanation,
  ExplanationMode,
  GenerateAnalogyInput,
  LearningTrailIcon,
  LearningTrailItem,
} from "@/types/explanation";

export type PersistExplanationInput = {
  input: GenerateAnalogyInput;
  explanation: Explanation;
  generationMode: ExplanationMode;
  modelUsed: string;
  /** Anonymous guest cookie id (preferred when not logged in) */
  guestId?: string | null;
  /** Future: authenticated user id */
  userId?: string | null;
};

/**
 * Maps domain Explanation → explanations Insert row.
 * Called only from the explain service (never from the UI or AI modules).
 */
export function toExplanationInsert(
  payload: PersistExplanationInput,
): ExplanationInsert {
  const { input, explanation, generationMode, modelUsed, guestId, userId } =
    payload;

  return {
    input_concept: input.concept,
    input_familiar_topics: input.familiarTopics,
    concept: explanation.concept,
    familiar_topics: explanation.familiarTopics,
    analogy_title: explanation.analogyTitle,
    analogy_content: explanation.analogyContent,
    explanation: explanation.explanation,
    key_points: explanation.keyPoints,
    difficulty_level: explanation.difficultyLevel as DifficultyLevel,
    generation_mode: generationMode,
    model_used: modelUsed,
    // Logged-in writes own under user_id only; guests keep guest_id isolation
    guest_id: userId ? null : (guestId ?? null),
    user_id: userId ?? null,
  };
}

/** DB row → domain Explanation used by the UI */
export function explanationFromRow(row: ExplanationRow): Explanation {
  return {
    id: row.id,
    concept: row.concept,
    familiarTopics: row.familiar_topics,
    analogyTitle: row.analogy_title,
    analogyContent: row.analogy_content,
    explanation: row.explanation,
    keyPoints: row.key_points,
    difficultyLevel: row.difficulty_level,
    generationMode: row.generation_mode,
    modelUsed: row.model_used,
    createdAt: row.created_at,
  };
}

export function trailItemFromRow(
  row: ExplanationRow,
  index: number,
): LearningTrailItem {
  const familiar = row.familiar_topics[0] ?? "familiar worlds";
  const icon: LearningTrailIcon = index % 2 === 0 ? "heart" : "trend";
  const preview =
    row.analogy_title.trim() ||
    (row.analogy_content.length > 140
      ? `${row.analogy_content.slice(0, 140).trim()}…`
      : row.analogy_content);

  return {
    id: row.id,
    // UI formats "through" with i18n; keep a plain English fallback for API/debug only.
    label: `${row.concept} — through ${familiar}`,
    icon,
    concept: row.concept,
    familiarTopics: row.familiar_topics,
    createdAt: row.created_at,
    preview,
  };
}

/**
 * Insert a generated explanation. Returns the new row id, or null on failure.
 * Never throws — callers should still return the in-memory explanation.
 */
export async function persistExplanation(
  payload: PersistExplanationInput,
): Promise<string | null> {
  if (!isSupabaseServiceRoleConfigured()) {
    console.warn(
      "[explanations.persist] Skipped: SUPABASE_SERVICE_ROLE_KEY (or URL) not configured",
    );
    return null;
  }

  if (!payload.userId && !payload.guestId) {
    console.warn(
      "[explanations.persist] Skipped: no guestId or userId for ownership",
    );
    return null;
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const row = toExplanationInsert(payload);

    const { data, error } = await supabase
      .from("explanations")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error("[explanations.persist] Insert failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return null;
    }

    return data?.id ?? null;
  } catch (error) {
    console.error(
      "[explanations.persist] Unexpected error:",
      error instanceof Error ? error.message : "unknown",
    );
    return null;
  }
}

export type FetchExplanationsResult =
  | { ok: true; rows: ExplanationRow[]; total: number }
  | { ok: false; error: string };

export interface FetchExplanationsOptions {
  limit?: number;
  /** Zero-based row offset for pagination */
  offset?: number;
}

/**
 * Ownership filter:
 * - Guest: guest_id matches (and typically user_id is null)
 * - Signed-in: user_id matches OR still-unclaimed guest rows for this browser
 *   (guest_id = cookie AND user_id IS NULL)
 */
function applyOwnershipFilter<
  Q extends {
    eq: (col: string, val: string) => Q;
    or: (filters: string) => Q;
  },
>(query: Q, identity: AccessIdentity): Q {
  const { userId, guestId } = identity;

  if (userId && guestId) {
    return query.or(
      `user_id.eq.${userId},and(guest_id.eq.${guestId},user_id.is.null)`,
    );
  }
  if (userId) {
    return query.eq("user_id", userId);
  }
  if (guestId) {
    return query.eq("guest_id", guestId);
  }
  return query;
}

/**
 * Recent explanations for a single owner identity, newest first.
 * Supports limit + offset; total is the full matching count for that owner.
 */
export async function fetchRecentExplanationRows(
  identity: AccessIdentity,
  options: FetchExplanationsOptions | number = {},
): Promise<FetchExplanationsResult> {
  // Back-compat: callers that passed a bare limit number
  const opts: FetchExplanationsOptions =
    typeof options === "number" ? { limit: options } : options;

  if (!isSupabaseServiceRoleConfigured()) {
    return {
      ok: false,
      error: "Supabase service role is not configured",
    };
  }

  if (!identity.userId && !identity.guestId) {
    return { ok: true, rows: [], total: 0 };
  }

  const safeLimit = Math.min(Math.max(1, opts.limit ?? 10), 50);
  const safeOffset = Math.max(0, opts.offset ?? 0);
  const rangeEnd = safeOffset + safeLimit - 1;

  try {
    const supabase = createServiceRoleSupabaseClient();
    const query = applyOwnershipFilter(
      supabase
        .from("explanations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(safeOffset, rangeEnd),
      identity,
    );

    const { data, error, count } = await query;

    if (error) {
      console.error("[explanations.fetchRecent] Failed:", {
        message: error.message,
        code: error.code,
      });
      return { ok: false, error: error.message };
    }

    return {
      ok: true,
      rows: data ?? [],
      total: count ?? data?.length ?? 0,
    };
  } catch (error) {
    console.error(
      "[explanations.fetchRecent] Unexpected:",
      error instanceof Error ? error.message : "unknown",
    );
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export type FetchExplanationByIdResult =
  | { ok: true; row: ExplanationRow }
  | { ok: false; error: string; notFound?: boolean };

/**
 * Load one explanation only if it belongs to the given identity.
 * Returns notFound for other visitors (no cross-guest leaks).
 */
export async function fetchExplanationRowById(
  id: string,
  identity: AccessIdentity,
): Promise<FetchExplanationByIdResult> {
  if (!isSupabaseServiceRoleConfigured()) {
    return {
      ok: false,
      error: "Supabase service role is not configured",
    };
  }

  if (!identity.userId && !identity.guestId) {
    return { ok: false, error: "Explanation not found", notFound: true };
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const query = applyOwnershipFilter(
      supabase.from("explanations").select("*").eq("id", id),
      identity,
    );

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[explanations.fetchById] Failed:", {
        message: error.message,
        code: error.code,
      });
      return { ok: false, error: error.message };
    }

    if (!data) {
      return { ok: false, error: "Explanation not found", notFound: true };
    }

    return { ok: true, row: data };
  } catch (error) {
    console.error(
      "[explanations.fetchById] Unexpected:",
      error instanceof Error ? error.message : "unknown",
    );
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
