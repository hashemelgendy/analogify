import type {
  Explanation,
  ExplanationMode,
  FormDefaults,
  LearningTrailItem,
} from "@/types/explanation";

export const SUGGESTED_TOPICS = [
  "Cooking",
  "Gaming",
  "Fitness",
  "Business",
  "Movies",
  "Sports",
  "Programming",
] as const;

/** Initial form values (demo defaults, not component hardcoding). */
export const DEFAULT_FORM_VALUES: FormDefaults = {
  concept: "How does blockchain work?",
  familiarTopics: "cooking",
};

/**
 * Content variants for mock generation / refinement modes.
 * Extended fields match future AI output shape.
 */
export const EXPLANATION_VARIANTS: Record<
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
    analogyTitle: "Think of blockchain like a shared recipe book.",
    analogyContent:
      "Everyone has the same book. New pages get checked by lots of cooks before they stick.",
    explanation:
      "In simple terms: no single person owns the only copy. Changes only become permanent when many independent people agree they look right.",
    keyPoints: [
      "Everyone keeps the same copy of the record",
      "New entries are checked before they stick",
      "No single person can quietly rewrite history",
    ],
    difficultyLevel: "beginner",
  },
  another: {
    analogyTitle: "Think of blockchain like a shared recipe book.",
    analogyContent:
      "Every cook gets the same copy of the recipe book. When someone adds a new recipe, everyone checks it follows the rules before it becomes a permanent new page.",
    explanation:
      "Blockchain is a shared digital record. Instead of one person holding the only copy, many people keep matching versions — so tampering is hard without rewriting everyone else's book.",
    keyPoints: [
      "Shared distributed ledger instead of a single owner",
      "New blocks validated by network consensus",
      "Chained history makes stealth rewrites costly",
    ],
    difficultyLevel: "intermediate",
  },
  deeper: {
    analogyTitle:
      "Think of blockchain like a shared recipe book with strict kitchen rules.",
    analogyContent:
      "Recipes are chained: each new page references the last. Changing an old page would invalidate every dish that depended on it afterward.",
    explanation:
      "Blocks reference prior blocks via cryptographic hashes. Network consensus decides which chain is authoritative — making coordinated rewrites expensive and visible.",
    keyPoints: [
      "Each block contains a hash of the previous block",
      "Consensus rules pick the canonical chain",
      "Reorganizing history requires outpacing honest participants",
    ],
    difficultyLevel: "advanced",
  },
};

/** Sample explanation catalogue (design reference + AI-shaped mock seeds). */
export const SAMPLE_EXPLANATIONS: Explanation[] = [
  {
    concept: "How does blockchain work?",
    familiarTopics: ["cooking"],
    analogyTitle: "Think of blockchain like a shared recipe book.",
    analogyContent:
      "Every cook gets the same copy of the recipe book. When someone adds a new recipe, everyone checks it follows the rules before it becomes a permanent new page.",
    explanation:
      "Blockchain is a shared digital record. Instead of one person holding the only copy, many people keep matching versions — so tampering is hard without rewriting everyone else's book.",
    keyPoints: [
      "Shared distributed ledger instead of a single owner",
      "New blocks validated by network consensus",
      "Chained history makes stealth rewrites costly",
    ],
    difficultyLevel: "intermediate",
    createdAt: "2026-08-04T00:00:00.000Z",
  },
  {
    concept: "How neural networks learn",
    familiarTopics: ["gardening"],
    analogyTitle: "Think of neural networks like a garden learning the seasons.",
    analogyContent:
      "Each plant adjusts how deep its roots grow based on where water and sunlight actually appear — not where you hoped they would.",
    explanation:
      "A neural network updates weighted connections from many examples, reinforcing paths that reduce error the same way a garden rewards conditions that work.",
    keyPoints: [
      "Learning comes from many small adjustments",
      "Useful paths get reinforced over time",
      "Feedback from outcomes shapes the system",
    ],
    difficultyLevel: "intermediate",
    createdAt: "2026-08-04T00:00:00.000Z",
  },
  {
    concept: "Inflation",
    familiarTopics: ["concert tickets"],
    analogyTitle: "Think of inflation like rising concert ticket prices.",
    analogyContent:
      "If the same seats cost more every year for the same show, your money buys less fan experience than before.",
    explanation:
      "Inflation is a general rise in prices over time, so each unit of currency purchases fewer goods and services — including tickets.",
    keyPoints: [
      "Prices rise across many goods, not just one item",
      "Same money buys less purchasing power",
      "Can feel personal when familiar costs go up",
    ],
    difficultyLevel: "beginner",
    createdAt: "2026-08-04T00:00:00.000Z",
  },
];

/** Default card content before the user generates (first catalogue entry). */
export const SAMPLE_EXPLANATION: Explanation = SAMPLE_EXPLANATIONS[0];

/** Learning trail UI items derived from saved samples. */
export const SAMPLE_LEARNING_TRAIL: LearningTrailItem[] = [
  {
    id: "trail_neural_gardening",
    label: "How neural networks learn — through gardening",
    icon: "heart",
  },
  {
    id: "trail_inflation_concerts",
    label: "Inflation — through concert tickets",
    icon: "trend",
  },
];
