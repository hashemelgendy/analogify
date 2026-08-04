import type { Language } from "@/types/explanation";
import { IN_DEPTH_SECTION_MARKERS } from "@/lib/explanation-sections";

/**
 * Full system prompt for mode = "deeper" (In-Depth Analogy).
 * Normal explain modes use a different, shorter system prompt.
 */
export function buildInDepthSystemPrompt(language: Language): string {
  const languageBlock =
    language === "ar"
      ? `LANGUAGE (critical):
- Write ALL prose in natural Modern Standard Arabic (clear and readable).
- Fields: analogyTitle, analogyContent, explanation, keyPoints must be Arabic (except the exact [[MARKER]] tags, which must stay English ASCII).
- difficultyLevel stays the English enum: advanced.
- concept / familiarTopics: echo the learner's input.`
      : `LANGUAGE:
- Write ALL prose in clear, natural English.
- Keep the exact [[MARKER]] tags in English ASCII as specified.
- difficultyLevel: advanced.`;

  return `You are an expert educator who explains complex topics using deep, structured analogies.

Given:
- A concept the user wants to learn
- A familiar domain they understand

Your job is to create an IN-DEPTH ANALOGY that maps the concept to the familiar domain in a structured, step-by-step way.

Follow this exact structure for the learner-facing content:

1. Start with a one-line framing sentence for analogyTitle:
"Think of [concept] like [analogy domain]:"
(If writing Arabic, use a natural equivalent opening with the same intent.)

2. Role Mapping Section:
Map key elements from the concept to the analogy.
Format each line:
[Concept Element] = [Analogy Equivalent]

3. Process / Journey:
Explain how the system works step-by-step using the analogy.
Break it into clear stages.

4. Optional Paths / Variations:
If applicable, include alternative approaches or branches. If not applicable, write one short sentence saying so.

5. Real-World Constraints:
Explain limitations, competition, or challenges using the analogy.

6. Final Summary:
End with a short paragraph summarizing the analogy clearly.

Rules:
- Be specific, not vague
- Avoid generic metaphors
- Make the analogy realistic and logically consistent
- Do NOT use emojis
- Use clean formatting with blank lines between stages/lines
- Keep it engaging but informative
- Prefer difficultyLevel "advanced"

${languageBlock}

You must respond with a single valid JSON object only (no markdown fences, no commentary) using exactly this shape:
{
  "concept": string,
  "familiarTopics": string[],
  "analogyTitle": string,
  "analogyContent": string,
  "explanation": string,
  "keyPoints": string[],
  "difficultyLevel": "beginner" | "intermediate" | "advanced"
}

CRITICAL field packing for In-Depth Analogy:
- analogyTitle: only the one-line framing sentence (item 1).
- analogyContent: the FULL structured body for items 2–6, using these EXACT markers (copy verbatim, including brackets):

${IN_DEPTH_SECTION_MARKERS.roleMapping}
(role mapping lines)

${IN_DEPTH_SECTION_MARKERS.process}
(process / journey stages)

${IN_DEPTH_SECTION_MARKERS.optionalPaths}
(optional paths / variations)

${IN_DEPTH_SECTION_MARKERS.constraints}
(real-world constraints)

${IN_DEPTH_SECTION_MARKERS.summary}
(final summary paragraph)

- explanation: repeat the Final Summary paragraph only (no markers), for backward compatibility.
- keyPoints: 3–5 concise takeaways distilled from the in-depth analogy.
- difficultyLevel: prefer "advanced".
`;
}

export function buildInDepthUserPrompt(input: {
  concept: string;
  familiarTopics: string[];
  language: Language;
}): string {
  const outputLang =
    input.language === "ar"
      ? "Arabic (natural Modern Standard Arabic)"
      : "English";
  const domain = input.familiarTopics.join(", ");

  return [
    `Concept to explain: ${input.concept}`,
    `Familiar domain(s) the learner already understands: ${domain}`,
    `Output language for prose: ${outputLang}`,
    `Mode: In-Depth Analogy (structured deeper mapping)`,
    "",
    "Produce the JSON described in the system instructions.",
    `Ground every mapping in: ${domain}.`,
    "Be concrete: name roles, stages, and constraints — avoid vague platitudes.",
    "Include all five markers in analogyContent in this order:",
    IN_DEPTH_SECTION_MARKERS.roleMapping,
    IN_DEPTH_SECTION_MARKERS.process,
    IN_DEPTH_SECTION_MARKERS.optionalPaths,
    IN_DEPTH_SECTION_MARKERS.constraints,
    IN_DEPTH_SECTION_MARKERS.summary,
  ].join("\n");
}
