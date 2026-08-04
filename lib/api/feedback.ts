import type {
  FeedbackApiResponse,
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
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let payload: FeedbackApiResponse;

  try {
    payload = (await response.json()) as FeedbackApiResponse;
  } catch {
    throw new Error("Invalid response from feedback API");
  }

  if (!payload.success || !payload.data) {
    throw new Error(payload.error ?? "Failed to save feedback");
  }

  return payload.data;
}
