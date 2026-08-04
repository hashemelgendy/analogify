import { generateAnalogyExplanation } from "@/lib/ai/analogy-generator";
import type {
  Explanation,
  ExplainRequest,
  GenerateAnalogyInput,
} from "@/types/explanation";

/**
 * Application service for explanations.
 *
 * Orchestrates validation + generation. The API route calls this layer only.
 *
 *   app/api/explain/route.ts
 *           ↓
 *   lib/explain-service.ts   ← you are here
 *           ↓
 *   lib/ai/analogy-generator.ts
 *           ↓
 *   OpenAI / mock implementation
 */

export class ExplainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExplainValidationError";
  }
}

export function normalizeFamiliarTopics(
  value: ExplainRequest["familiarTopics"],
): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Validate and normalize an untrusted request body into generator input. */
export function parseExplainRequest(body: unknown): GenerateAnalogyInput {
  if (!body || typeof body !== "object") {
    throw new ExplainValidationError("Invalid JSON body");
  }

  const { concept, familiarTopics, mode } = body as Partial<ExplainRequest>;

  if (typeof concept !== "string" || !concept.trim()) {
    throw new ExplainValidationError("Field `concept` is required");
  }

  if (
    familiarTopics === undefined ||
    (typeof familiarTopics !== "string" && !Array.isArray(familiarTopics))
  ) {
    throw new ExplainValidationError(
      "Field `familiarTopics` is required (string or string[])",
    );
  }

  const topics = normalizeFamiliarTopics(familiarTopics);

  if (topics.length === 0) {
    throw new ExplainValidationError(
      "Field `familiarTopics` must include at least one topic",
    );
  }

  if (
    mode !== undefined &&
    mode !== "simpler" &&
    mode !== "another" &&
    mode !== "deeper"
  ) {
    throw new ExplainValidationError(
      "Field `mode` must be simpler, another, or deeper",
    );
  }

  return {
    concept: concept.trim(),
    familiarTopics: topics,
    mode,
  };
}

/**
 * Create an explanation for the given request body.
 * Delegates generation to the AI layer — swap only that layer for real models.
 */
export async function createExplanation(
  body: unknown,
): Promise<Explanation> {
  const input = parseExplainRequest(body);
  return generateAnalogyExplanation(input);
}
