/**
 * Map API / network errors to user-facing copy.
 * Client-only UX helper — does not change server or AI logic.
 */
import { t, type Language } from "@/lib/i18n";

export function toFriendlyExplainError(
  error: unknown,
  language: Language = "en",
): string {
  const raw =
    error instanceof Error ? error.message.trim() : "Something went wrong";
  const lower = raw.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("load failed")
  ) {
    return t(language, "errNetwork");
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("too many") ||
    lower.includes("try again in")
  ) {
    return t(language, "errRateLimit");
  }

  if (
    lower.includes("invalid json") ||
    lower.includes("invalid response") ||
    lower.includes("failed to generate")
  ) {
    return t(language, "errGenerate");
  }

  if (
    lower.includes("concept") &&
    (lower.includes("required") || lower.includes("field"))
  ) {
    return t(language, "errConceptRequired");
  }

  if (
    lower.includes("familiar") &&
    (lower.includes("required") ||
      lower.includes("at least") ||
      lower.includes("topic"))
  ) {
    return t(language, "errFamiliarRequired");
  }

  // Avoid dumping raw server/dev strings into the UI
  if (
    lower.includes("openai") ||
    lower.includes("supabase") ||
    lower.includes("api key") ||
    lower.includes("stack") ||
    lower.includes("etag") ||
    lower.includes("internal")
  ) {
    return t(language, "errGeneric");
  }

  if (raw.length > 0 && raw.length < 160 && !lower.includes("error:")) {
    // Short, already readable server messages (e.g. validation) are fine
    return raw;
  }

  return t(language, "errGeneric");
}
