import { readApiDataOrThrow, sameOriginJsonPost } from "@/lib/api/http";
import type {
  FeedbackRequest,
  FeedbackResult,
} from "@/types/explanation";

/**
 * Client helper for POST /api/feedback.
 * UI → this module → API route → feedback-service → Supabase
 */
export async function submitFeedbackRequest(
  body: FeedbackRequest,
): Promise<FeedbackResult> {
  const response = await fetch("/api/feedback", sameOriginJsonPost(body));

  return readApiDataOrThrow<FeedbackResult>(response, {
    invalidMessage: "Invalid response from feedback API",
    failureFallback: "Failed to save feedback",
  });
}
