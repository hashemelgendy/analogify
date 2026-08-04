/**
 * Map API / network errors to user-facing copy.
 * Client-only UX helper — does not change server or AI logic.
 */
export function toFriendlyExplainError(error: unknown): string {
  const raw =
    error instanceof Error ? error.message.trim() : "Something went wrong";
  const lower = raw.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("load failed")
  ) {
    return "We couldn’t reach Anuminate. Check your connection and try again.";
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("too many") ||
    lower.includes("try again in")
  ) {
    return "You’re creating explanations a bit too quickly. Wait a moment, then try again.";
  }

  if (
    lower.includes("invalid json") ||
    lower.includes("invalid response") ||
    lower.includes("failed to generate")
  ) {
    return "We couldn’t build that explanation. Please try again in a moment.";
  }

  if (
    lower.includes("concept") &&
    (lower.includes("required") || lower.includes("field"))
  ) {
    return "Tell us what you want to learn, then try again.";
  }

  if (
    lower.includes("familiar") &&
    (lower.includes("required") ||
      lower.includes("at least") ||
      lower.includes("topic"))
  ) {
    return "Add at least one familiar topic so we can ground the analogy.";
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
    return "Something went wrong while creating your explanation. Please try again.";
  }

  if (raw.length > 0 && raw.length < 160 && !lower.includes("error:")) {
    // Short, already readable server messages (e.g. validation) are fine
    return raw;
  }

  return "Something went wrong while creating your explanation. Please try again.";
}
