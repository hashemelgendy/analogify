import { persistFeedback } from "@/lib/feedback/persist";
import type {
  FeedbackRating,
  FeedbackRequest,
  FeedbackResult,
} from "@/types/explanation";

/**
 * Application service for feedback.
 *
 *   app/api/feedback/route.ts
 *           ↓
 *   lib/feedback-service.ts
 *           ↓
 *   lib/feedback/persist.ts → Supabase (service role)
 */

export class FeedbackValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackValidationError";
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isFeedbackRating(value: unknown): value is FeedbackRating {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

export function parseFeedbackRequest(body: unknown): FeedbackRequest {
  if (!body || typeof body !== "object") {
    throw new FeedbackValidationError("Invalid JSON body");
  }

  const { explanationId, rating, comment } = body as Partial<FeedbackRequest>;

  if (typeof explanationId !== "string" || !explanationId.trim()) {
    throw new FeedbackValidationError("Field `explanationId` is required");
  }

  if (!UUID_RE.test(explanationId.trim())) {
    throw new FeedbackValidationError("Field `explanationId` must be a valid UUID");
  }

  if (!isFeedbackRating(rating)) {
    throw new FeedbackValidationError(
      "Field `rating` must be an integer between 1 and 5",
    );
  }

  if (comment !== undefined && comment !== null && typeof comment !== "string") {
    throw new FeedbackValidationError("Field `comment` must be a string");
  }

  return {
    explanationId: explanationId.trim(),
    rating,
    comment: typeof comment === "string" ? comment : undefined,
  };
}

/**
 * Persist feedback for an explanation.
 * Throws FeedbackValidationError on bad input.
 * Throws Error when persistence is unavailable or fails (route maps to 503/500).
 */
export async function submitFeedback(
  body: unknown,
): Promise<FeedbackResult> {
  const request = parseFeedbackRequest(body);

  const result = await persistFeedback({
    explanationId: request.explanationId,
    rating: request.rating,
    comment: request.comment,
  });

  if (!result) {
    throw new Error(
      "Failed to save feedback. Check that SUPABASE_SERVICE_ROLE_KEY is set and the explanation exists.",
    );
  }

  return result;
}
