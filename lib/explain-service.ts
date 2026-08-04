import { generateAnalogyExplanation } from "@/lib/ai/analogy-generator";
import { persistExplanation } from "@/lib/explanations/persist";
import { resolveAccessIdentity } from "@/lib/guest/session";
import type {
  Explanation,
  ExplanationMode,
  ExplainRequest,
  GenerateAnalogyInput,
} from "@/types/explanation";

/**
 * Application service for explanations.
 *
 * Orchestrates guest identity → AI generation → isolated Supabase persistence.
 *
 *   app/api/explain/route.ts
 *           ↓
 *   lib/explain-service.ts
 *           ↓
 *   lib/ai/analogy-generator.ts + lib/explanations/persist.ts
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

function resolveModelUsed(): string {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return "mock";
  }
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

/**
 * Create an explanation for the given request body.
 * Attaches guest_id (or future user_id) so trail history stays isolated.
 */
export async function createExplanation(
  body: unknown,
): Promise<Explanation> {
  const input = parseExplainRequest(body);
  const generationMode: ExplanationMode = input.mode ?? "another";
  const modelUsed = resolveModelUsed();
  const identity = await resolveAccessIdentity();

  const explanation = await generateAnalogyExplanation(input);

  const id = await persistExplanation({
    input,
    explanation,
    generationMode,
    modelUsed,
    guestId: identity.guestId,
    userId: identity.userId,
  });

  return {
    ...explanation,
    id: id ?? undefined,
    generationMode,
    modelUsed,
  };
}
