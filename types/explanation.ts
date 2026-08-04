/** Core domain model — shared by UI, API route, and AI service. */

export type ExplanationMode = "simpler" | "another" | "deeper";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type LearningTrailIcon = "heart" | "trend";

/**
 * Generated analogy explanation.
 * Returned inside ApiResponse.data from POST /api/explain.
 */
export interface Explanation {
  concept: string;
  familiarTopics: string[];
  analogyTitle: string;
  analogyContent: string;
  explanation: string;
  keyPoints: string[];
  difficultyLevel: DifficultyLevel;
  rating?: number;
  createdAt?: string;
}

/** Request body for POST /api/explain */
export interface ExplainRequest {
  concept: string;
  /** List of familiar worlds, or a single comma-separated string */
  familiarTopics: string[] | string;
  /** Optional refinement for mode buttons */
  mode?: ExplanationMode;
}

/**
 * Input to the AI generator layer.
 * Stable contract for mock today and OpenAI later.
 */
export interface GenerateAnalogyInput {
  concept: string;
  familiarTopics: string[];
  mode?: ExplanationMode;
}

/** Standard JSON envelope for /api/explain */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ExplainApiResponse = ApiResponse<Explanation>;

export interface LearningTrailItem {
  id: string;
  label: string;
  icon: LearningTrailIcon;
}

export interface FormDefaults {
  concept: string;
  /** Comma-separated string for the form input */
  familiarTopics: string;
}

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface FeedbackPayload {
  concept: string;
  rating: FeedbackRating;
  comment: string;
}
