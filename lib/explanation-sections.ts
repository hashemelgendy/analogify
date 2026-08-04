/**
 * Section markers for In-Depth Analogy structured content.
 * Markers stay English in model output so the UI can parse reliably;
 * section bodies follow the learner's language.
 */
export const IN_DEPTH_SECTION_MARKERS = {
  roleMapping: "[[ROLE_MAPPING]]",
  process: "[[PROCESS]]",
  optionalPaths: "[[OPTIONAL_PATHS]]",
  constraints: "[[CONSTRAINTS]]",
  summary: "[[SUMMARY]]",
} as const;

export type InDepthSectionId = keyof typeof IN_DEPTH_SECTION_MARKERS;

export const IN_DEPTH_SECTION_ORDER: InDepthSectionId[] = [
  "roleMapping",
  "process",
  "optionalPaths",
  "constraints",
  "summary",
];

export interface InDepthSection {
  id: InDepthSectionId;
  body: string;
}

const MARKER_ENTRIES = IN_DEPTH_SECTION_ORDER.map((id) => ({
  id,
  marker: IN_DEPTH_SECTION_MARKERS[id],
}));

/**
 * Parse structured In-Depth Analogy body text into ordered sections.
 * Returns [] when no markers are present (falls back to plain prose UI).
 */
export function parseInDepthSections(content: string): InDepthSection[] {
  const text = content.trim();
  if (!text) return [];

  const found: { id: InDepthSectionId; index: number; markerLen: number }[] =
    [];

  for (const { id, marker } of MARKER_ENTRIES) {
    const index = text.indexOf(marker);
    if (index >= 0) {
      found.push({ id, index, markerLen: marker.length });
    }
  }

  if (found.length === 0) return [];

  found.sort((a, b) => a.index - b.index);

  const sections: InDepthSection[] = [];
  for (let i = 0; i < found.length; i++) {
    const current = found[i];
    const start = current.index + current.markerLen;
    const end = i + 1 < found.length ? found[i + 1].index : text.length;
    const body = text.slice(start, end).trim();
    if (body) {
      sections.push({ id: current.id, body });
    }
  }

  return sections;
}

export function hasInDepthMarkers(content: string): boolean {
  return IN_DEPTH_SECTION_ORDER.some((id) =>
    content.includes(IN_DEPTH_SECTION_MARKERS[id]),
  );
}

/** Mock / fallback body for In-Depth Analogy mode. */
export function buildMockInDepthBody(
  conceptLabel: string,
  familiar: string,
  language: "en" | "ar",
): string {
  if (language === "ar") {
    return [
      IN_DEPTH_SECTION_MARKERS.roleMapping,
      `${conceptLabel} = الفكرة المركزية في ${familiar}`,
      `قواعد النظام = قوانين اللعبة في ${familiar}`,
      `المشاركون = اللاعبون أو الأدوار داخل ${familiar}`,
      "",
      IN_DEPTH_SECTION_MARKERS.process,
      `المرحلة 1: تدخل إلى عالم ${familiar} بهدف واضح.`,
      `المرحلة 2: تتبع قواعد معروفة خطوة بخطوة.`,
      `المرحلة 3: تتحقق من النتيجة كما تتحقق في ${familiar}.`,
      "",
      IN_DEPTH_SECTION_MARKERS.optionalPaths,
      `قد تسلك طريقًا مختصرًا إن سمحت قواعد ${familiar} بذلك، أو مسارًا أطول أدق وأكثر أمانًا.`,
      "",
      IN_DEPTH_SECTION_MARKERS.constraints,
      `مثل ${familiar}، توجد حدود للوقت والموارد والمنافسة — لا يعمل كل شيء بلا تكلفة.`,
      "",
      IN_DEPTH_SECTION_MARKERS.summary,
      `إجمالًا، «${conceptLabel}» يشبه ${familiar}: أدوار واضحة، مراحل متتابعة، وقيود حقيقية تحافظ على تماسك التشبيه.`,
    ].join("\n");
  }

  return [
    IN_DEPTH_SECTION_MARKERS.roleMapping,
    `${conceptLabel} = the central idea in ${familiar}`,
    `System rules = the house rules of ${familiar}`,
    `Participants = the roles people play in ${familiar}`,
    "",
    IN_DEPTH_SECTION_MARKERS.process,
    `Stage 1: Enter ${familiar} with a clear goal.`,
    `Stage 2: Move through familiar steps that ${familiar} already makes intuitive.`,
    `Stage 3: Verify the outcome the way you would in ${familiar}.`,
    "",
    IN_DEPTH_SECTION_MARKERS.optionalPaths,
    `You may take a shorter path when ${familiar} allows shortcuts, or a longer one when precision and safety matter more.`,
    "",
    IN_DEPTH_SECTION_MARKERS.constraints,
    `Like ${familiar}, time, resources, and competition set real limits — nothing works without cost.`,
    "",
    IN_DEPTH_SECTION_MARKERS.summary,
    `Overall, ${conceptLabel} works like ${familiar}: clear roles, sequenced stages, and realistic constraints that keep the analogy coherent.`,
  ].join("\n");
}
