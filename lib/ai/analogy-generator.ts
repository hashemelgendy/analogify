import OpenAI from "openai";
import { EXPLANATION_VARIANTS, SAMPLE_EXPLANATIONS } from "@/data/mock";
import {
  buildInDepthSystemPrompt,
  buildInDepthUserPrompt,
} from "@/lib/ai/in-depth-prompt";
import { buildMockInDepthBody } from "@/lib/explanation-sections";
import type {
  DifficultyLevel,
  Explanation,
  ExplanationMode,
  GenerateAnalogyInput,
  Language,
} from "@/types/explanation";

/**
 * AI generation layer — sole place that talks to OpenAI.
 *
 * Flow:
 *   explain-service → generateAnalogyExplanation() → OpenAI (or mock fallback)
 *
 * Keep the function signature and Explanation return type stable.
 * Mode "deeper" uses the In-Depth Analogy prompt (structured markers).
 */

function buildSystemPrompt(language: Language, mode: ExplanationMode): string {
  if (mode === "deeper") {
    return buildInDepthSystemPrompt(language);
  }

  const languageBlock =
    language === "ar"
      ? `LANGUAGE (critical):
- Write ALL user-facing string fields in natural, modern Arabic (Modern Standard Arabic that is clear and readable).
- Fields that must be in Arabic: analogyTitle, analogyContent, explanation, keyPoints.
- Keep difficultyLevel as the English enum values only (beginner | intermediate | advanced).
- concept and familiarTopics: echo the learner's input (may be Arabic or English) without translating unless needed for clarity.
- Use correct Arabic punctuation and flowing sentences — avoid broken machine-translated tone.`
      : `LANGUAGE:
- Write ALL user-facing string fields in clear, natural English.
- Fields: analogyTitle, analogyContent, explanation, keyPoints.
- Keep difficultyLevel as beginner | intermediate | advanced.
- concept and familiarTopics: echo the learner's input.`;

  return `You are Anuminate, an AI tutor that helps people understand difficult concepts by creating personalized analogies.

The analogy should:
- Use concepts the learner already understands
- Be accurate to the original concept
- Explain the mapping between the analogy and the real concept
- Avoid oversimplifying important details
- Be clear, memorable, and educational

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
}`;
}

const DIFFICULTY_LEVELS = new Set<DifficultyLevel>([
  "beginner",
  "intermediate",
  "advanced",
]);

function conceptLabel(concept: string): string {
  return (
    concept
      .replace(/^how does\s+/i, "")
      .replace(/\?$/, "")
      .trim() || concept.trim()
  );
}

function withTimestamp(
  explanation: Omit<Explanation, "createdAt"> & { createdAt?: string },
): Explanation {
  return {
    ...explanation,
    createdAt: explanation.createdAt ?? new Date().toISOString(),
  };
}

function buildModeInstruction(mode: ExplanationMode): string {
  switch (mode) {
    case "simpler":
      return "Make the analogy simpler and more beginner-friendly. Prefer difficultyLevel \"beginner\".";
    case "deeper":
      // Full instructions live in the In-Depth system prompt when mode is deeper
      return "Mode: In-Depth Analogy — follow the structured marker format exactly.";
    case "another":
    default:
      return "Provide a strong, fresh alternative analogy at an intermediate depth. Prefer difficultyLevel \"intermediate\".";
  }
}

function buildUserPrompt(input: {
  concept: string;
  familiarTopics: string[];
  mode: ExplanationMode;
  language: Language;
}): string {
  if (input.mode === "deeper") {
    return buildInDepthUserPrompt(input);
  }

  const outputLang =
    input.language === "ar"
      ? "Arabic (natural Modern Standard Arabic)"
      : "English";

  return [
    `Concept to explain: ${input.concept}`,
    `Familiar topics the learner already understands: ${input.familiarTopics.join(", ")}`,
    `Output language: ${outputLang}`,
    buildModeInstruction(input.mode),
    "",
    "Requirements:",
    "- Ground the analogy in one or more of the familiar topics.",
    `- analogyTitle: a short memorable line in ${outputLang}.`,
    `- analogyContent: the core analogy (2–4 sentences) in ${outputLang}.`,
    `- explanation: how the analogy maps back to the real concept, in ${outputLang}.`,
    `- keyPoints: 3–5 concise bullet-worthy takeaways as strings in ${outputLang}.`,
    "- Set concept and familiarTopics to match the request (use the same familiar topics list).",
    "- difficultyLevel must be exactly beginner, intermediate, or advanced.",
  ].join("\n");
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

/**
 * Parse and validate model JSON into Explanation.
 * Throws if structure is invalid.
 */
export function parseAnalogyJson(
  raw: string,
  fallback: { concept: string; familiarTopics: string[] },
): Explanation {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI JSON must be an object");
  }

  const obj = parsed as Record<string, unknown>;

  const concept = isNonEmptyString(obj.concept)
    ? obj.concept.trim()
    : fallback.concept;
  const familiarTopics = isStringArray(obj.familiarTopics)
    ? obj.familiarTopics.map((t) => t.trim())
    : fallback.familiarTopics;

  if (!isNonEmptyString(obj.analogyTitle)) {
    throw new Error("AI response missing analogyTitle");
  }
  if (!isNonEmptyString(obj.analogyContent)) {
    throw new Error("AI response missing analogyContent");
  }
  if (!isNonEmptyString(obj.explanation)) {
    throw new Error("AI response missing explanation");
  }
  if (!isStringArray(obj.keyPoints)) {
    throw new Error("AI response missing keyPoints array");
  }
  if (
    typeof obj.difficultyLevel !== "string" ||
    !DIFFICULTY_LEVELS.has(obj.difficultyLevel as DifficultyLevel)
  ) {
    throw new Error("AI response has invalid difficultyLevel");
  }

  return withTimestamp({
    concept,
    familiarTopics,
    analogyTitle: obj.analogyTitle.trim(),
    analogyContent: obj.analogyContent.trim(),
    explanation: obj.explanation.trim(),
    keyPoints: obj.keyPoints.map((p) => p.trim()),
    difficultyLevel: obj.difficultyLevel as DifficultyLevel,
  });
}

/** Strip optional markdown fences some models still emit. */
function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

function findCatalogueMatch(
  concept: string,
  familiarTopics: string[],
): Explanation | undefined {
  const conceptKey = concept.toLowerCase();
  const familiarKey = familiarTopics.map((t) => t.toLowerCase());

  return SAMPLE_EXPLANATIONS.find((sample) => {
    const sampleConcept = sample.concept.toLowerCase();
    const conceptMatch =
      conceptKey.includes(sampleConcept) ||
      sampleConcept.includes(conceptKey) ||
      conceptKey.includes(conceptLabel(sample.concept).toLowerCase());

    const familiarMatch = sample.familiarTopics.some((topic) =>
      familiarKey.some(
        (input) =>
          input.includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(input),
      ),
    );

    return conceptMatch && (familiarMatch || familiarKey.length === 0);
  });
}

/**
 * Local mock fallback when the API key is missing, the call fails,
 * or the model returns unusable JSON.
 */
function generateMockAnalogyExplanation(input: {
  concept: string;
  familiarTopics: string[];
  mode: ExplanationMode;
  language: Language;
}): Explanation {
  const { concept, familiarTopics, mode, language } = input;
  const primaryFamiliar =
    familiarTopics[0] ??
    (language === "ar" ? "شيء مألوف" : "something familiar");
  const label = conceptLabel(concept);

  // English catalogue samples only when mocking English
  if (language === "en") {
    const catalogue = findCatalogueMatch(concept, familiarTopics);

    if (catalogue && mode === "another") {
      return withTimestamp({
        ...catalogue,
        concept,
        familiarTopics:
          familiarTopics.length > 0 ? familiarTopics : catalogue.familiarTopics,
      });
    }

    if (catalogue && mode !== "another") {
      const variants = EXPLANATION_VARIANTS[mode];
      const isBlockchainSample = catalogue.concept
        .toLowerCase()
        .includes("blockchain");

      if (isBlockchainSample) {
        return withTimestamp({
          concept,
          familiarTopics:
            familiarTopics.length > 0
              ? familiarTopics
              : catalogue.familiarTopics,
          ...variants,
        });
      }
    }
  }

  if (language === "ar") {
    const genericAr: Record<
      ExplanationMode,
      Pick<
        Explanation,
        | "analogyTitle"
        | "analogyContent"
        | "explanation"
        | "keyPoints"
        | "difficultyLevel"
      >
    > = {
      simpler: {
        analogyTitle: `تخيّل «${label}» مثل ${primaryFamiliar}.`,
        analogyContent: `تصوّر الأجزاء الصعبة من «${label}» كلحظات بسيطة من عالم ${primaryFamiliar} التي تثق بها بالفعل.`,
        explanation: `باختصار: يعمل «${label}» بإعادة استخدام أنماط تعرفها من ${primaryFamiliar}. ركّز على الفكرة المشتركة، لا على المصطلحات.`,
        keyPoints: [
          `اربط «${label}» بلحظة مألوفة من ${primaryFamiliar}`,
          "تجاهل المصطلحات حتى تتضح الفكرة الأساسية",
          "تشبيه واحد واضح يكفي للبداية",
        ],
        difficultyLevel: "beginner",
      },
      another: {
        analogyTitle: `فكّر في «${label}» مثل ${primaryFamiliar}.`,
        analogyContent: `في ${primaryFamiliar} يبدو التقدّم طبيعيًا لأن كل خطوة تعتمد على السابقة. «${label}» يتبع سلسلة مشابهة من خطوات صغيرة يمكن التحقق منها.`,
        explanation: `قد يبدو «${label}» مجرّدًا حتى تربطه بـ ${primaryFamiliar}. عندما يتضح التشبيه، يصبح التعريف الرسمي أسهل للاستيعاب.`,
        keyPoints: [
          `${primaryFamiliar} يزوّدك بالنموذج الذهني`,
          `«${label}» يعكس هذا الهيكل التدريجي`,
          "المصطلحات الرسمية تلتصق بسهولة بعد ثبات التشبيه",
        ],
        difficultyLevel: "intermediate",
      },
      deeper: {
        analogyTitle: `فكّر في «${label}» مثل ${primaryFamiliar}:`,
        analogyContent: buildMockInDepthBody(label, primaryFamiliar, "ar"),
        explanation: `إجمالًا، «${label}» يشبه ${primaryFamiliar}: أدوار واضحة، مراحل متتابعة، وقيود حقيقية.`,
        keyPoints: [
          "خريطة أدوار واضحة بين المفهوم والتشبيه",
          "رحلة على مراحل يمكن متابعتها",
          "قيود واقعية تحافظ على صدق التشبيه",
        ],
        difficultyLevel: "advanced",
      },
    };

    return withTimestamp({
      concept,
      familiarTopics:
        familiarTopics.length > 0 ? familiarTopics : [primaryFamiliar],
      ...genericAr[mode],
    });
  }

  const generic: Record<
    ExplanationMode,
    Pick<
      Explanation,
      | "analogyTitle"
      | "analogyContent"
      | "explanation"
      | "keyPoints"
      | "difficultyLevel"
    >
  > = {
    simpler: {
      analogyTitle: `Think of ${label.toLowerCase()} like ${primaryFamiliar}.`,
      analogyContent: `Imagine the hard parts of ${label.toLowerCase()} as simple moments from ${primaryFamiliar} you already trust.`,
      explanation: `Stripped down: ${label} works by reusing patterns you already know from ${primaryFamiliar}. Focus on the one shared idea, not the jargon.`,
      keyPoints: [
        `Map ${label} onto one familiar moment from ${primaryFamiliar}`,
        "Ignore jargon until the core idea clicks",
        "One clear parallel is enough to start",
      ],
      difficultyLevel: "beginner",
    },
    another: {
      analogyTitle: `Think of ${label.toLowerCase()} like ${primaryFamiliar}.`,
      analogyContent: `In ${primaryFamiliar}, progress feels natural because each step depends on the last. ${label} follows a similar chain of small, checkable steps.`,
      explanation: `${label} can feel abstract until you map it onto ${primaryFamiliar}. Once the analogy clicks, the formal definition becomes easier to hold onto.`,
      keyPoints: [
        `${primaryFamiliar} supplies the mental model`,
        `${label} mirrors that stepwise structure`,
        "Formal terms attach more easily after the analogy lands",
      ],
      difficultyLevel: "intermediate",
    },
    deeper: {
      analogyTitle: `Think of ${label.toLowerCase()} like ${primaryFamiliar}:`,
      analogyContent: buildMockInDepthBody(label, primaryFamiliar, "en"),
      explanation: `Overall, ${label} works like ${primaryFamiliar}: clear roles, sequenced stages, and realistic constraints that keep the analogy coherent.`,
      keyPoints: [
        "Clear role mapping between concept and domain",
        "A staged journey you can follow step by step",
        "Real constraints keep the analogy honest",
      ],
      difficultyLevel: "advanced",
    },
  };

  return withTimestamp({
    concept,
    familiarTopics:
      familiarTopics.length > 0 ? familiarTopics : [primaryFamiliar],
    ...generic[mode],
  });
}

async function callOpenAI(input: {
  concept: string;
  familiarTopics: string[];
  mode: ExplanationMode;
  language: Language;
}): Promise<Explanation> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(input.language, input.mode) },
      {
        role: "user",
        content: buildUserPrompt(input),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return parseAnalogyJson(extractJsonPayload(content), {
    concept: input.concept,
    familiarTopics: input.familiarTopics,
  });
}

/**
 * Generates an analogy-based explanation for a concept via OpenAI.
 * Falls back to mock data if the key is missing, the API fails, or JSON is invalid.
 */
export async function generateAnalogyExplanation(
  input: GenerateAnalogyInput,
): Promise<Explanation> {
  const concept = input.concept.trim();
  const familiarTopics = input.familiarTopics
    .map((t) => t.trim())
    .filter(Boolean);
  const mode: ExplanationMode = input.mode ?? "another";
  const language: Language = input.language ?? "en";
  const normalized = { concept, familiarTopics, mode, language };

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "[analogy-generator] OPENAI_API_KEY missing — using mock fallback",
    );
    return generateMockAnalogyExplanation(normalized);
  }

  try {
    return await callOpenAI(normalized);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown OpenAI error";
    console.error(
      "[analogy-generator] OpenAI failed, falling back to mock:",
      message,
    );
    return generateMockAnalogyExplanation(normalized);
  }
}
