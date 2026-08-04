import type {
  ExplainApiResponse,
  Explanation,
  ExplainRequest,
} from "@/types/explanation";

/**
 * Client helper for POST /api/explain.
 * UI → this module → API route → explain-service → AI layer
 *
 * Components only receive `Explanation`; they never touch the API envelope.
 */
export async function requestExplanation(
  body: ExplainRequest,
): Promise<Explanation> {
  const response = await fetch("/api/explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
