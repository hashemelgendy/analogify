/**
 * Depth-aware quality checks for generated analogies.
 *
 * Modes:
 * - simplified: light sanity check (pass ≥ 5), 1 regen max
 * - normal: balanced (pass ≥ 6.5), 2 regens
 * - in_depth: strict (pass ≥ 8), 3 regens + strong fix guidance
 *
 * Used by analogy-generator after OpenAI generation (skipped for pure mocks).
 */

import OpenAI from "openai";
import type {
  Explanation,
  ExplanationDepth,
  ExplanationMode,
} from "@/types/explanation";
import { generationModeToDepth } from "@/lib/history/display";

export type QualityCheckInput = {
  concept: string;
  analogy: string;
  explanation: Pick<
    Explanation,
    "analogyTitle" | "analogyContent" | "explanation" | "keyPoints"
  >;
  depth: ExplanationDepth;
};

export type QualityCheckResult = {
  score: number;
  pass: boolean;
  issues: string[];
  fix_suggestion: string;
};

/** Structured counters for dashboards / later tuning. */
type DepthBucket = {
  checks: number;
  passes: number;
  fails: number;
  skips: number;
  issueCounts: Record<string, number>;
};

const METRICS: Record<ExplanationDepth, DepthBucket> = {
  simplified: emptyBucket(),
  normal: emptyBucket(),
  in_depth: emptyBucket(),
};

function emptyBucket(): DepthBucket {
  return {
    checks: 0,
    passes: 0,
    fails: 0,
    skips: 0,
    issueCounts: {},
  };
}

export function explanationDepthFromMode(
  mode: ExplanationMode | undefined,
): ExplanationDepth {
  return generationModeToDepth(mode);
}

export function qualityPassThreshold(depth: ExplanationDepth): number {
  switch (depth) {
    case "simplified":
      return 5;
    case "in_depth":
      return 8;
    case "normal":
    default:
      return 6.5;
  }
}

/** Max regeneration attempts after the first generation (not counting first). */
export function maxQualityRegenerations(depth: ExplanationDepth): number {
  switch (depth) {
    case "simplified":
      return 1;
    case "in_depth":
      return 3;
    case "normal":
    default:
      return 2;
  }
}

const IN_DEPTH_FIX_GUIDANCE = `Fix the analogy by:
- aligning abstraction levels
- correcting role relationships
- removing forced or unrealistic mappings
- ensuring full structural coverage`;

export function inDepthFixGuidance(): string {
  return IN_DEPTH_FIX_GUIDANCE;
}

function explanationBodyLength(
  explanation: QualityCheckInput["explanation"],
): number {
  return (
    explanation.analogyTitle.length +
    explanation.analogyContent.length +
    explanation.explanation.length +
    explanation.keyPoints.join(" ").length
  );
}

/**
 * Skip the AI judge for short simplified answers (cheap heuristic gate).
 * Returns a synthetic result when skip applies; null when full check should run.
 */
export function maybeSkipAiQualityCheck(
  input: QualityCheckInput,
): QualityCheckResult | null {
  if (input.depth !== "simplified") return null;

  const len = explanationBodyLength(input.explanation);
  // Short + light path: only require non-empty core fields already guaranteed by parser
  if (len > 0 && len < 900) {
    METRICS.simplified.skips += 1;
    console.info("[quality-check] skip_ai", {
      depth: "simplified",
      reason: "short_response",
      length: len,
    });
    return {
      score: 6,
      pass: true,
      issues: [],
      fix_suggestion: "",
    };
  }

  return null;
}

function buildDepthCriteria(depth: ExplanationDepth): string {
  switch (depth) {
    case "simplified":
      return `MODE: SIMPLIFIED (LIGHT CHECK)
Purpose: ensure the answer is not nonsense; prioritize clarity over precision.

Check ONLY:
- No obvious logical contradictions
- Analogy is understandable to a beginner
- No absurd / ridiculous mappings

DO NOT enforce:
- Full structural coverage
- Perfect abstraction alignment
- Exhaustive role mapping

Score generously. Pass threshold will be applied by the system (≥ 5).`;

    case "in_depth":
      return `MODE: IN-DEPTH (STRICT CHECK)
Purpose: high-quality, structured, reliable analogy. Be rigorous.

STRICT CRITERIA — score down hard when any fail:

1. ABSTRACTION CONSISTENCY
   - All mappings must share the same abstraction level
   - System ↔ system, role ↔ role, process ↔ process
   - Reject mismatches (e.g. "shoes = the whole system")

2. ROLE & RELATIONSHIP ACCURACY
   - Cause/effect must be correct; no inverted logic
   - Real-world behavior of the analogy domain must make sense

3. STRUCTURAL COMPLETENESS (expect coverage in analogyContent / body)
   - Core entities
   - Roles
   - Process flow
   - External forces / constraints
   - Success / failure conditions

4. INTERNAL CONSISTENCY
   - No contradictions across sections

5. NON-FORCED MAPPING
   - Avoid mapping everything without necessity
   - Prefer skipping weak parallels over force-fitting

6. CLARITY + DEPTH BALANCE
   - Deep but still understandable
   - No vague or generic filler

Pass threshold will be applied by the system (≥ 8).`;

    case "normal":
    default:
      return `MODE: NORMAL (BALANCED CHECK)
Purpose: good general-purpose quality.

Check:
- Basic abstraction alignment (no obvious object vs system mismatches)
- Roles mostly correct
- Covers the main idea of the concept
- Clear and understandable

Pass threshold will be applied by the system (≥ 6.5).`;
  }
}

function buildQualitySystemPrompt(depth: ExplanationDepth): string {
  return `You are a strict but fair quality judge for Anuminate analogy explanations.

${buildDepthCriteria(depth)}

Respond with a single JSON object only (no markdown fences):
{
  "score": number,          // 0–10 continuous score
  "issues": string[],       // short concrete issues (empty if excellent)
  "fix_suggestion": string // concrete instructions to improve on regenerate (empty if pass-worthy)
}

Do not include a "pass" field — the system derives it from score + depth threshold.
Be specific in issues and fix_suggestion so a second model call can correct the analogy.`;
}

function buildQualityUserPrompt(input: QualityCheckInput): string {
  const { concept, analogy, explanation, depth } = input;
  return [
    `Depth mode: ${depth}`,
    `Concept: ${concept}`,
    `Analogy domain / familiar world: ${analogy}`,
    "",
    "Generated explanation JSON fields:",
    `analogyTitle: ${explanation.analogyTitle}`,
    `analogyContent: ${explanation.analogyContent}`,
    `explanation (mapping prose): ${explanation.explanation}`,
    `keyPoints: ${JSON.stringify(explanation.keyPoints)}`,
    "",
    "Judge quality for this depth mode and return score, issues, fix_suggestion.",
  ].join("\n");
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return trimmed;
}

function parseQualityJson(raw: string, depth: ExplanationDepth): QualityCheckResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Quality check returned invalid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Quality check JSON must be an object");
  }

  const obj = parsed as Record<string, unknown>;
  const scoreRaw = typeof obj.score === "number" ? obj.score : Number(obj.score);
  const score = Number.isFinite(scoreRaw)
    ? Math.min(10, Math.max(0, scoreRaw))
    : 0;

  const issues = Array.isArray(obj.issues)
    ? obj.issues
        .filter((i): i is string => typeof i === "string" && i.trim().length > 0)
        .map((i) => i.trim())
    : [];

  const fix =
    typeof obj.fix_suggestion === "string" ? obj.fix_suggestion.trim() : "";

  const threshold = qualityPassThreshold(depth);
  return {
    score,
    pass: score >= threshold,
    issues,
    fix_suggestion: fix,
  };
}

/** Model used for the judge: strong only for in-depth. */
export function qualityJudgeModel(depth: ExplanationDepth): string {
  const fast =
    process.env.OPENAI_MODEL_QUALITY_FAST?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "gpt-4o-mini";
  const strong =
    process.env.OPENAI_MODEL_QUALITY_STRONG?.trim() ||
    process.env.OPENAI_MODEL_IN_DEPTH?.trim() ||
    "gpt-4o";

  return depth === "in_depth" ? strong : fast;
}

function recordMetrics(depth: ExplanationDepth, result: QualityCheckResult) {
  const bucket = METRICS[depth];
  bucket.checks += 1;
  if (result.pass) {
    bucket.passes += 1;
  } else {
    bucket.fails += 1;
  }
  for (const issue of result.issues) {
    const key = issue.slice(0, 120);
    bucket.issueCounts[key] = (bucket.issueCounts[key] ?? 0) + 1;
  }

  console.info("[quality-check] result", {
    depth,
    score: result.score,
    pass: result.pass,
    threshold: qualityPassThreshold(depth),
    issues: result.issues,
    metrics: {
      checks: bucket.checks,
      passes: bucket.passes,
      fails: bucket.fails,
      failureRate:
        bucket.checks > 0
          ? Number((bucket.fails / bucket.checks).toFixed(3))
          : 0,
      skips: bucket.skips,
      topIssues: Object.entries(bucket.issueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([issue, count]) => ({ issue, count })),
    },
  });
}

export function getQualityMetricsSnapshot(): typeof METRICS {
  return structuredClone(METRICS);
}

/**
 * Run the depth-aware AI quality judge.
 * On judge failure, returns a soft pass for simplified, soft fail for others
 * so generation can still finish.
 */
export async function qualityCheckExplanation(
  input: QualityCheckInput,
): Promise<QualityCheckResult> {
  const skipped = maybeSkipAiQualityCheck(input);
  if (skipped) {
    recordMetrics(input.depth, skipped);
    return skipped;
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    const passthrough: QualityCheckResult = {
      score: qualityPassThreshold(input.depth),
      pass: true,
      issues: [],
      fix_suggestion: "",
    };
    recordMetrics(input.depth, passthrough);
    return passthrough;
  }

  try {
    const client = new OpenAI({ apiKey });
    const model = qualityJudgeModel(input.depth);

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildQualitySystemPrompt(input.depth) },
        { role: "user", content: buildQualityUserPrompt(input) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Quality check returned empty response");
    }

    const result = parseQualityJson(extractJsonPayload(content), input.depth);
    recordMetrics(input.depth, result);
    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown quality error";
    console.error("[quality-check] judge failed:", message);

    // Fail-open for simplified so UX stays snappy; soft-fail for deeper modes
    const fallback: QualityCheckResult =
      input.depth === "simplified"
        ? {
            score: 6,
            pass: true,
            issues: [`quality_judge_error: ${message}`],
            fix_suggestion: "",
          }
        : {
            score: qualityPassThreshold(input.depth) - 0.1,
            pass: false,
            issues: [`quality_judge_error: ${message}`],
            fix_suggestion:
              input.depth === "in_depth"
                ? IN_DEPTH_FIX_GUIDANCE
                : "Improve clarity, fix incorrect mappings, and strengthen the analogy.",
          };

    recordMetrics(input.depth, fallback);
    return fallback;
  }
}

export function buildRegenerationFixBlock(
  depth: ExplanationDepth,
  check: QualityCheckResult,
): string {
  const parts: string[] = [
    "QUALITY REVIEW FAILED — regenerate an improved version.",
    `Depth mode: ${depth}`,
    `Score: ${check.score} (need ≥ ${qualityPassThreshold(depth)})`,
  ];

  if (check.issues.length > 0) {
    parts.push("Issues:", ...check.issues.map((i) => `- ${i}`));
  }

  if (check.fix_suggestion.trim()) {
    parts.push("", "Fix suggestion:", check.fix_suggestion.trim());
  }

  if (depth === "in_depth") {
    parts.push("", IN_DEPTH_FIX_GUIDANCE);
  }

  return parts.join("\n");
}

export function buildFallbackSimplifyGuidance(): string {
  return [
    "QUALITY FALLBACK: the previous attempt still failed review.",
    "Produce a slightly simplified but still accurate intermediate analogy:",
    "- Keep core mappings correct",
    "- Prefer clarity over exhaustive detail",
    "- Drop weak / forced parallels",
  ].join("\n");
}

export function toQualityCheckInput(
  concept: string,
  analogyDomain: string,
  explanation: Explanation,
  depth: ExplanationDepth,
): QualityCheckInput {
  return {
    concept,
    analogy: analogyDomain,
    explanation: {
      analogyTitle: explanation.analogyTitle,
      analogyContent: explanation.analogyContent,
      explanation: explanation.explanation,
      keyPoints: explanation.keyPoints,
    },
    depth,
  };
}
