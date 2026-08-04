import {
  readApiDataOrThrow,
  sameOriginJsonPost,
} from "@/lib/api/http";
import type { Explanation, ExplainRequest } from "@/types/explanation";
import { splitTopicList } from "@/lib/topics";

/**
 * Client helpers for explain flow.
 * UI → this module → API route → explain-service → AI / persistence
 * Credentials ensure guest cookie is included on same-origin calls.
 */
export async function requestExplanation(
  body: ExplainRequest,
): Promise<Explanation> {
  const response = await fetch("/api/explain", sameOriginJsonPost(body));

  return readApiDataOrThrow<Explanation>(response, {
    invalidMessage: "Invalid response from explain API",
    failureFallback: "Failed to create explanation",
  });
}

export function parseFamiliarTopicsInput(value: string): string[] {
  return splitTopicList(value);
}
