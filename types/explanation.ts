/** Core domain model — shared by UI, API route, and AI service. */

import type { Language } from "@/lib/i18n/types";

export type { Language };

export type ExplanationMode = "simpler" | "another" | "deeper";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type LearningTrailIcon = "heart" | "trend";

/**
 * Generated analogy explanation.
 * Returned inside ApiResponse.data from POST /api/explain.
 */
export interface Explanation {
  /** Database row id when persisted (may be undefined if save failed / not configured) */
  id?: string;
  concept: string;
  familiarTopics: string[];
  analogyTitle: string;
  analogyContent: string;
  explanation: string;
  keyPoints: string[];
  difficultyLevel: DifficultyLevel;
  /** How this explanation was generated (echoed for clients that need it) */
  generationMode?: ExplanationMode;
  modelUsed?: string;
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
  /** UI language — drives AI response language */
  language?: Language;
}

/**
 * Input to the AI generator layer.
 * Stable contract for mock today and OpenAI later.
 */
export interface GenerateAnalogyInput {
  concept: string;
  familiarTopics: string[];
  mode?: ExplanationMode;
  /** Response language for generated content */
  language?: Language;
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
  concept: string;
  familiarTopics: string[];
  createdAt?: string;
  /** Short list preview (e.g. analogy title) */
  preview?: string;
}


export type LearningTrailApiResponse = ApiResponse<LearningTrailItem[]>;

/** Pagination meta for history / list endpoints (optional for trail callers). */
export interface LearningTrailPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  offset: number;
}

export type LearningTrailPageApiResponse = ApiResponse<LearningTrailItem[]> & {
  pagination?: LearningTrailPagination;
};

export interface FormDefaults {
  concept: string;
  /** Comma-separated string for the form input */
  familiarTopics: string;
}

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

/** Client → POST /api/feedback body */
export interface FeedbackRequest {
  explanationId: string;
  rating: FeedbackRating;
  comment?: string;
}

export interface FeedbackResult {
  id: string;
  explanationId: string;
  rating: FeedbackRating;
  comment: string | null;
  createdAt: string;
}

/** @deprecated Prefer FeedbackRequest; kept for FeedbackCard local callbacks */
export interface FeedbackPayload {
  explanationId?: string;
  concept?: string;
  rating: FeedbackRating;
  comment: string;
}

export type FeedbackApiResponse = ApiResponse<FeedbackResult>;

