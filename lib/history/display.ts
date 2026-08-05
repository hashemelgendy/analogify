/**
 * History item display helpers (depth mapping, secondary line).
 */

import type {
  ExplanationDepth,
  ExplanationMode,
  LearningTrailItem,
} from "@/types/explanation";

export function generationModeToDepth(
  mode: ExplanationMode | string | null | undefined,
): ExplanationDepth {
  switch (mode) {
    case "simpler":
      return "simplified";
    case "deeper":
      return "in_depth";
    case "another":
    default:
      return "normal";
  }
}

export function resolveTrailDepth(item: LearningTrailItem): ExplanationDepth {
  if (item.depth) return item.depth;
  return generationModeToDepth(item.generationMode);
}

/** Primary analogy domain for a trail row. */
export function resolveTrailAnalogy(item: LearningTrailItem): string {
  const analogy = item.analogy?.trim();
  if (analogy) return analogy;
  const firstTopic = item.familiarTopics?.[0]?.trim();
  return firstTopic || "";
}

/**
 * Secondary sidebar line: "Basketball • In-Depth"
 * Omits parts that are missing.
 */
export function formatTrailSecondaryLine(
  item: LearningTrailItem,
  depthLabel: string,
): string {
  const analogy = resolveTrailAnalogy(item);
  if (analogy && depthLabel) {
    return `${analogy} • ${depthLabel}`;
  }
  return analogy || depthLabel;
}

/** Collapsed tooltip / title: "Programming → Basketball • In-Depth" */
export function formatTrailCollapsedTitle(
  item: LearningTrailItem,
  depthLabel: string,
): string {
  const concept = item.concept.trim() || item.label;
  const analogy = resolveTrailAnalogy(item);
  const secondary = formatTrailSecondaryLine(item, depthLabel);

  if (concept && analogy) {
    return `${concept} → ${secondary}`;
  }
  if (concept && depthLabel) {
    return `${concept} • ${depthLabel}`;
  }
  return concept || secondary || item.label;
}

/** Single collapsed chip label: "Programming → Basketball" */
export function formatTrailCollapsedChip(item: LearningTrailItem): string {
  const concept = item.concept.trim();
  const analogy = resolveTrailAnalogy(item);
  if (concept && analogy) {
    return `${concept} → ${analogy}`;
  }
  return concept || analogy || item.label;
}
