import type { Explanation } from "@/types/explanation";

/** Presentation helpers derived from Explanation — UI only. */

export function conceptTag(explanation: Explanation): string {
  const cleaned = explanation.concept
    .replace(/^how does\s+/i, "")
    .replace(/\?$/, "")
    .trim();
  return (cleaned.split(/\s+/)[0] || explanation.concept).toUpperCase();
}

export function primaryFamiliarTag(explanation: Explanation): string {
  return (explanation.familiarTopics[0] || "familiar").toUpperCase();
}
