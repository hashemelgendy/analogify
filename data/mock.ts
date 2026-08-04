import type {
  Explanation,
  ExplanationMode,
  FormDefaults,
} from "@/types/explanation";

/** Initial form values — empty so inputs start blank. */
export const DEFAULT_FORM_VALUES: FormDefaults = {
  concept: "",
  familiarTopics: "",
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
      "Think of blockchain like a professional restaurant group sharing one sealed recipe archive across every kitchen station:",
    analogyContent: [
      "## People and Roles",
      "- **You = a cook who cannot trust a private notebook alone**",
      "  - You need every station to agree which plates (transactions) are real before service continues.",
      "- **Miners / validators = kitchen stations racing to seal the next official page of recipes**",
      "  - They compete to publish the next accepted page of history under house rules.",
      "",
      "## Tools and Resources",
      "- **Ledger = the master bound cookbook each station keeps in sync**",
      "  - It stores ordered pages of history that everyone cooks from.",
      "- **Block = a sealed recipe page locked after kitchen review**",
      "  - Changing an earlier page would break the seals on every later page.",
      "- **Hash link = the wax seal that references the previous page**",
      "  - Tampering leaves a visible break in the chain of seals.",
      "",
      "## How Work Flows",
      "1. A cook proposes a new page of recipes (transactions).",
      "2. Other stations re-check the page against house standards.",
      "3. Enough stations must accept before the page is sealed into every book.",
      "4. Service continues only from the longest sealed, accepted edition.",
      "",
      "## Gatekeepers and Rules",
      "- **Consensus = the kitchen council that accepts or rejects a page**",
      "  - Acceptance is a shared decision, not one chef's opinion.",
      "- **Inclusion rules = quality standards before a recipe earns a line on the next page**",
      "  - Invalid lines never make it into the official book.",
      "",
      "## Outside Pressure",
      "- **Auditors / critics = food inspectors challenging invalid recipes**",
      "  - Bad pages are discarded and reputation suffers.",
      "- **Rival kitchens = competing restaurant groups racing for the longest valid book**",
      "  - Honest stations must stay faster than attackers who would reprint history.",
      "",
      "## Failures, Forks, and Recovery",
      "- **Fork = two rival cookbook editions briefly competing**",
      "  - The industry follows one edition; the other becomes a dead branch of history.",
      "- **Rewrite attack = forcing stations to reseal old pages**",
      "  - Recovery depends on the cost of rewriting history exceeding any payoff.",
      "",
      "## How It All Fits Together",
      "Blockchain is this restaurant group taken seriously: shared sealed books, station validation, council acceptance, outside scrutiny, and history that is expensive to fake — so the chain reads as kitchen behavior, not jargon.",
    ].join("\n"),
    explanation:
      "Blockchain is this restaurant group taken seriously: shared sealed books, station validation, council acceptance, outside scrutiny, and history that is expensive to fake — so the chain is understood as kitchen behavior, not abstract jargon.",
    keyPoints: [
      "Shared sealed cookbooks stand in for the distributed ledger",
      "Stations + council rules map validation and consensus",
      "Forks and rewrites explain pressure and failure",
      "The ecosystem teaches how the system behaves, not a one-word metaphor",
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

/** Default card content for design reference / offline demos only — not used by Learning Trail UI. */
export const SAMPLE_EXPLANATION: Explanation = SAMPLE_EXPLANATIONS[0];
