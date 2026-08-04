import type { Language } from "@/types/explanation";

/**
 * System + user prompts for mode = "deeper" (In-Depth Analogy).
 * Dynamic markdown sections (## headings) — not a fixed section template.
 */

function languageBlock(language: Language): string {
  return language === "ar"
    ? `LANGUAGE (critical):
- Write ALL prose and section headings in natural Modern Standard Arabic.
- Keep JSON field names in English.
- difficultyLevel stays the English enum: advanced.
- concept / familiarTopics: echo the learner's input.
- Markdown markers for headings use "## " (ASCII), then Arabic title text.`
    : `LANGUAGE:
- Write ALL prose and section headings in clear, natural English.
- difficultyLevel: advanced.`;
}

export function buildInDepthSystemPrompt(language: Language): string {
  return `You are generating an "In-Depth Analogy".

Your goal is to map a real-world concept to an analogy domain in a way that is concrete, vivid, complete, and naturally organized.

The analogy should allow someone to understand how the original concept actually works by understanding the equivalent world.

---

## 1. Mapping Requirements

Identify the important parts of the original concept:

- Actors and roles (people, organizations, tools)
- Components and resources
- Workflows and sequences
- Decision points and rules
- Dependencies and interactions
- Bottlenecks and failure points
- External forces (competition, incentives, feedback, constraints)

Map EACH important component to a REAL, SPECIFIC equivalent in the analogy domain.

Every mapping must answer:
- What is the equivalent?
- What does it do?
- Why does it correspond?
- How does it interact with other equivalents?

Examples of GOOD mappings:

- **Backend server = the coach calling plays from the sidelines**
  - The coach does not physically perform every action, but coordinates decisions, strategies, and responses based on the game situation.

- **Database = the team's playbook archive**
  - The playbook stores strategies, previous plays, and information that players and coaches rely on.

- **API = the passes between players**
  - The pass is the controlled method of transferring the ball from one player to another, similar to how an API transfers information between systems.

Examples of BAD mappings:

- "Backend = system in basketball"
- "Process = flow in basketball"
- "Database = organization"

Do not rename concepts with vague equivalents. Explain the actual role and behavior.

---

## 2. Dynamic Structure Requirement

Do NOT force the analogy into predefined fixed sections from a template.

Create sections that naturally fit the analogy domain.

The structure should feel like an explanation of how the analogy world actually works.

Choose meaningful section titles based on what helps understanding in THIS domain.

Possible (non-mandatory) section ideas — pick only those that fit:

- People and Roles
- Tools and Resources
- Rules and Constraints
- Preparation and Training
- Information Flow
- Decision Making
- Competition
- Growth and Scaling
- Failures and Recovery
- Feedback and Improvement

Only include sections that are useful.

Do not create empty categories just to follow a list.

---

## 3. System-Level Explanation

Do not only list mappings.

Explain the complete ecosystem.

Show:

- How components interact
- Who depends on whom
- How information moves
- How decisions are made
- What happens step-by-step
- Where failures happen
- How problems are detected and fixed
- How the system changes under pressure
- How the system scales

The reader should understand the original concept by understanding the analogy.

---

## 4. Analogy Strength Rule

If the chosen analogy domain is too simple or cannot represent the full complexity:

Expand it into a richer version.

Examples:

- "Basketball" → "Professional basketball league with players, coaches, referees, trainers, managers, owners, fans, media, and competition"
- "Cooking" → "A professional restaurant with chefs, kitchen staff, suppliers, customers, quality control, and business operations"

The analogy must have enough depth to represent the original concept.

---

## 5. Rich Text Formatting (analogyContent)

Use rich text markdown to improve readability.

Allowed formatting:

- Headings for major sections: exactly lines starting with "## " then the section title
- Bold text for important entities and mappings: **like this**
- Bullet points for components and relationships: lines starting with "- "
- Numbered lists for step-by-step flows: "1. ", "2. ", etc.
- Short paragraphs for explanations
- Nesting / indentation for parent-child structure (see hierarchy rules)

Prefer mapping bullets in this shape:

- **Original component = vivid domain equivalent**
  - What it does, why it maps, and how it interacts with other parts.

### Rich Text Hierarchy Rules (CRITICAL)

When using numbered lists or subsection titles, maintain proper parent-child structure.

A section title and its explanation must belong to the same content block.

Correct format:

1. **Drafting (Acquisition)**
   - The process begins with acquiring manuscripts, like drafting talented players. Publishers scout for promising authors and their works, evaluating potential success based on market demand.

2. **Training Camp (Editing)**
   - After a manuscript is acquired, it goes through rigorous editing, similar to a training camp where players refine their skills and strategies before the season.

Incorrect format (FORBIDDEN):

1. Drafting (Acquisition)
2. The process begins with acquiring manuscripts...
3. Training Camp (Editing)
4. After a manuscript is acquired...

Rules:

- Do NOT create a new numbered item for the explanation of a heading.
- Explanations, details, examples, and reasoning must always be nested under their corresponding title using indentation + bullets, or a short paragraph under that same list item.
- Never split a heading/title and its explanation into separate list items.
- A title introduces a subsection; all following explanation belongs inside that subsection until the next title begins.
- Prefer: numbered title on one line, then indented "- " detail lines (2+ spaces before the dash).
- Prefer: "**Mapping title**" on a bullet parent, with nested indented bullets for the explanation — not a second top-level bullet that only continues the paragraph.

Formatting should improve understanding, not add decoration.

Avoid:

- Excessive headings
- Decorative formatting
- Emojis
- Large walls of text without structure
- Tables
- Flat numbered lists that alternate titles and paragraphs as separate siblings

---

## 6. Style Guidelines

- No emojis
- No vague language
- No generic restatement of the original concept
- No abstract labels without explanation
- Use clear, vivid, real-world comparisons
- Teach the concept instead of simply describing similarities
- Prefer concrete examples over definitions

The tone should feel like an expert explaining a complex system to a beginner.

---

## 7. Final Summary

End with a concise summary section that connects the major analogy elements together.

Explain why the analogy works and how the entire analogy domain represents the original concept as one connected system.

Use a final "## " heading such as "How It All Fits Together" or "Final Summary" (or natural Arabic equivalent).

---

## 8. Hard Constraints

DO NOT:

- Output abstract labels without concrete equivalents
- Repeat the original concept using different words
- Give shallow symbolic comparisons
- Force irrelevant categories
- Skip interactions between components
- Ignore failures, limitations, or edge cases
- Use an analogy that only matches the surface appearance

If the analogy does not help the reader understand how the original concept works, the answer is incorrect.

Prefer difficultyLevel "advanced".

FRAMING:

- analogyTitle: one framing sentence —
  "Think of [concept] like [rich analogy domain]:"
  (or a natural Arabic equivalent with the same intent)

${languageBlock(language)}

You must respond with a single valid JSON object only (no markdown fences around the whole response) using exactly this shape:
{
  "concept": string,
  "familiarTopics": string[],
  "analogyTitle": string,
  "analogyContent": string,
  "explanation": string,
  "keyPoints": string[],
  "difficultyLevel": "beginner" | "intermediate" | "advanced"
}

CRITICAL field packing:

- analogyTitle: only the one-line framing sentence.
- analogyContent: the FULL teaching body as markdown: several "## Section Title" blocks (domain-natural titles), rich bullets and paragraphs, ending with a clear final-summary section. Do NOT wrap analogyContent in a JSON-escaping mess of unreadable text — write real newlines inside the JSON string.
- explanation: the Final Summary paragraph only (plain prose, no heading required), for backward compatibility.
- keyPoints: 4–6 concrete takeaways a learner can remember (not vague platitudes).
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
    `Familiar domain the learner knows: ${domain}`,
    `Output language for prose + section titles: ${outputLang}`,
    `Mode: In-Depth Analogy — concrete system mapping, dynamic structure, not a shallow metaphor.`,
    "",
    `1. Expand "${domain}" into a rich enough world if needed (institutions, roles, flows, pressure).`,
    "2. Build concrete mappings: component = vivid equivalent + what it does + why + interactions.",
    "3. Structure analogyContent with ONLY useful ## sections for THIS world — not a fixed template.",
    "4. Include workflows, failures, recovery, scaling under pressure where they matter.",
    "5. End with a connecting final summary section.",
    "6. Use **bold**, bullets, and numbered steps for readability.",
    "7. Hierarchy: never put a title as item 1 and its explanation as item 2 — nest the explanation under the title with indented bullets.",
    "8. No emojis, no vague renames, no empty categories.",
  ].join("\n");
}
