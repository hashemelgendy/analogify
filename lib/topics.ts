/**
 * Shared topic-list parsing (client form input + server normalize path).
 * Keep behavior: split on comma/semicolon, trim, drop empties.
 */
export function splitTopicList(value: string): string[] {
  return value
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
