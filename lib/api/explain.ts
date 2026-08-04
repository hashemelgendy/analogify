import type {
  ExplainApiResponse,
  Explanation,
  ExplainRequest,
} from "@/types/explanation";

/**
 * Client helpers for explain flow.
 * UI → this module → API route → explain-service → AI / persistence
 * Credentials ensure guest cookie is included on same-origin calls.
 */
export async function requestExplanation(
  body: ExplainRequest,
): Promise<Explanation> {
  const response = await fetch("/api/explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });

  let payload: ExplainApiResponse;

  try {
    payload = (await response.json()) as ExplainApiResponse;
  } catch {
    throw new Error("Invalid response from explain API");
  }

  if (!payload.success || !payload.data) {
    throw new Error(payload.error ?? "Failed to create explanation");
  }

  return payload.data;
}

export function parseFamiliarTopicsInput(value: string): string[] {
  return value
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
