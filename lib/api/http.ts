import type { ApiResponse } from "@/types/explanation";

/**
 * Shared client fetch helpers for same-origin JSON APIs.
 * UI modules use these so error envelopes stay consistent.
 */

export const sameOriginGet: RequestInit = {
  method: "GET",
  headers: { Accept: "application/json" },
  cache: "no-store",
  credentials: "same-origin",
};

export function sameOriginJsonPost(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    credentials: "same-origin",
  };
}

export async function readJsonOrThrow<T>(
  response: Response,
  invalidMessage: string,
): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(invalidMessage);
  }
}

/**
 * Parse a standard { success, data?, error? } envelope and return data.
 * Throws with the API error string (or fallback) when unsuccessful.
 */
export async function readApiDataOrThrow<T>(
  response: Response,
  options: {
    invalidMessage: string;
    failureFallback: string;
  },
): Promise<T> {
  const payload = await readJsonOrThrow<ApiResponse<T>>(
    response,
    options.invalidMessage,
  );

  if (!payload.success || payload.data == null) {
    throw new Error(payload.error ?? options.failureFallback);
  }

  return payload.data;
}
