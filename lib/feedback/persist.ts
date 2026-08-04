import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import type { FeedbackInsert } from "@/lib/supabase/types";
import type { FeedbackRating, FeedbackResult } from "@/types/explanation";

export type PersistFeedbackInput = {
  explanationId: string;
  rating: FeedbackRating;
  comment?: string | null;
};

/**
 * Server-only feedback insert. Returns the new row, or null on failure.
 * Never throws to the service — failures are logged.
 */
export async function persistFeedback(
  input: PersistFeedbackInput,
): Promise<FeedbackResult | null> {
  if (!isSupabaseServiceRoleConfigured()) {
    console.warn(
      "[feedback.persist] Skipped: SUPABASE_SERVICE_ROLE_KEY (or URL) not configured",
    );
    return null;
  }

  const comment =
    typeof input.comment === "string" && input.comment.trim()
      ? input.comment.trim().slice(0, 2000)
      : null;

  const row: FeedbackInsert = {
    explanation_id: input.explanationId,
    rating: input.rating,
    comment,
    user_id: null,
  };

  try {
    const supabase = createServiceRoleSupabaseClient();

    const { data, error } = await supabase
      .from("feedback")
      .insert(row)
      .select("id, explanation_id, rating, comment, created_at")
      .single();

    if (error) {
      console.error("[feedback.persist] Insert failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      explanationId: data.explanation_id,
      rating: data.rating as FeedbackRating,
      comment: data.comment,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error(
      "[feedback.persist] Unexpected error:",
      error instanceof Error ? error.message : "unknown",
    );
    return null;
  }
}
