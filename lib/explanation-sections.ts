/**
 * Parse In-Depth Analogy bodies into UI sections.
 *
 * Prefer dynamic markdown headings (## Title).
 * Fall back to older [[MARKER]] packs for saved history rows.
 */

export interface InDepthSection {
  /** Stable key for React lists */
  id: string;
  /** Display title (from model heading or legacy label key) */
  title: string;
  body: string;
  /** When set, UI may look up a translation; when null, use `title` as-is */
  titleKey?: string | null;
}

/** Legacy fixed markers (older generations). */
export const IN_DEPTH_SECTION_MARKERS = {
  you: "[[YOU]]",
  coreEntities: "[[CORE_ENTITIES]]",
  processFlow: "[[PROCESS_FLOW]]",
  gatekeepers: "[[GATEKEEPERS]]",
  externalForces: "[[EXTERNAL_FORCES]]",
  alternativePaths: "[[ALTERNATIVE_PATHS]]",
  successFailure: "[[SUCCESS_FAILURE]]",
  summary: "[[SUMMARY]]",
} as const;

const LEGACY_IN_DEPTH_MARKERS = {
  roleMapping: "[[ROLE_MAPPING]]",
  process: "[[PROCESS]]",
  optionalPaths: "[[OPTIONAL_PATHS]]",
  constraints: "[[CONSTRAINTS]]",
} as const;

const LEGACY_TITLE_KEYS: Record<string, string> = {
  you: "inDepthYou",
  coreEntities: "inDepthCoreEntities",
  processFlow: "inDepthProcessFlow",
  gatekeepers: "inDepthGatekeepers",
  externalForces: "inDepthExternalForces",
  alternativePaths: "inDepthAlternativePaths",
  successFailure: "inDepthSuccessFailure",
  summary: "inDepthSummary",
  roleMapping: "inDepthRoleMapping",
  process: "inDepthProcess",
  optionalPaths: "inDepthOptionalPaths",
  constraints: "inDepthConstraints",
};

const ALL_LEGACY_MARKERS: { id: string; marker: string }[] = [
  ...Object.entries(IN_DEPTH_SECTION_MARKERS).map(([id, marker]) => ({
    id,
    marker,
  })),
  ...Object.entries(LEGACY_IN_DEPTH_MARKERS).map(([id, marker]) => ({
    id,
    marker,
  })),
];

const HEADING_RE = /^#{1,3}\s+(.+)$/;

/**
 * Parse markdown-style ## sections (dynamic structure).
 */
function parseMarkdownSections(content: string): InDepthSection[] {
  const text = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!text) return [];

  const lines = text.split("\n");
  const sections: InDepthSection[] = [];
  let currentTitle: string | null = null;
  let bodyLines: string[] = [];
  let index = 0;

  const flush = () => {
    const body = bodyLines.join("\n").trim();
    if (currentTitle && body) {
      sections.push({
        id: `md-${index++}-${slugify(currentTitle)}`,
        title: currentTitle,
        body,
        titleKey: null,
      });
    } else if (!currentTitle && body) {
      sections.push({
        id: `md-${index++}-intro`,
        title: "",
        body,
        titleKey: null,
      });
    }
    bodyLines = [];
  };

  for (const line of lines) {
    const heading = line.match(HEADING_RE);
    if (heading) {
      flush();
      currentTitle = heading[1].trim();
      continue;
    }
    bodyLines.push(line);
  }
  flush();

  // Need at least one real heading to treat as structured markdown sections
  const withTitles = sections.filter((s) => s.title.length > 0);
  return withTitles.length > 0 ? withTitles : [];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/**
 * Parse legacy [[MARKER]] blocks.
 */
function parseMarkerSections(content: string): InDepthSection[] {
  const text = content.trim();
  if (!text) return [];

  const found: { id: string; index: number; markerLen: number }[] = [];
  for (const { id, marker } of ALL_LEGACY_MARKERS) {
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
    if (!body) continue;
    sections.push({
      id: current.id,
      title: current.id,
      body,
      titleKey: LEGACY_TITLE_KEYS[current.id] ?? null,
    });
  }
  return sections;
}

/**
 * Parse structured In-Depth body into sections for the UI.
 * Prefers dynamic ## headings, then legacy markers.
 */
export function parseInDepthSections(content: string): InDepthSection[] {
  const markdown = parseMarkdownSections(content);
  if (markdown.length > 0) return markdown;
  return parseMarkerSections(content);
}

export function hasInDepthMarkers(content: string): boolean {
  if (!content?.trim()) return false;
  if (/^#{1,3}\s+\S+/m.test(content)) return true;
  return ALL_LEGACY_MARKERS.some(({ marker }) => content.includes(marker));
}

/** Mock / fallback body — dynamic ## structure (system-level). */
export function buildMockInDepthBody(
  conceptLabel: string,
  familiar: string,
  language: "en" | "ar",
): string {
  if (language === "ar") {
    return [
      `## الأشخاص والأدوار`,
      `- **المتعلّم / الفاعل الرئيسي = الوافد الجديد إلى عالم ${familiar}**`,
      `  - يدخل الهدف والقواعد نفسها التي يستخدمها المحترفون في هذا العالم.`,
      `- **«${conceptLabel}» كمنظومة = النظام الكامل لـ ${familiar} الموسَّع**`,
      `  - ليس جزءًا واحدًا، بل شبكة أدوار وتبعيات.`,
      "",
      `## الأدوات والموارد`,
      `- **المكوّنات الأساسية = الأدوات والمخازن داخل ${familiar}**`,
      `  - تُخزَّن المعلومات والمواد وتُستعاد عند الحاجة.`,
      "",
      `## سير العمل`,
      `1. الدخول والتهيئة كما يبدأ أي عضو في ${familiar}.`,
      `2. التنفيذ خطوة بخطوة مع اعتماد على الموارد والأدوار.`,
      `3. التحقق وإعادة المحاولة عند الفشل.`,
      "",
      `## الفشل والتعافي`,
      `- **نقطة الاختناق = اللحظة التي يتوقف فيها تدفق العمل في ${familiar}**`,
      `  - يُكشف العطل عبر ردود الفعل، ثم يُصلَح بمعايير العالم نفسه.`,
      "",
      `## كيف يلتقي كل شيء`,
      `«${conceptLabel}» يُفهم عندما ترى ${familiar} منظومة مترابطة: أدوار، موارد، تدفقات، وفشل قابل للإصلاح — وليس كلمات مجردة.`,
    ].join("\n");
  }

  return [
    `## People and Roles`,
    `- **You (the learner) = a new hire walking into a full ${familiar} operation**`,
    `  - You do not need jargon first — you need to see who does what, who decides, and who depends on whom.`,
    `- **${conceptLabel} as a system = the entire ${familiar} ecosystem (expanded, not a single object)**`,
    `  - Roles, tools, rules, and pressure make the concept understandable as behavior, not labels.`,
    "",
    `## Tools and Resources`,
    `- **Core components = the real tools and stores inside ${familiar}**`,
    `  - They hold state, materials, or information that others rely on mid-workflow.`,
    `- **Shared resources = supplies everyone competes for or coordinates around**`,
    `  - Scarcity and scheduling explain bottlenecks in the original concept.`,
    "",
    `## How Work Flows`,
    `1. Entry: a request or goal arrives the way work arrives in ${familiar}.`,
    `2. Handoffs: information or materials move through specific controlled channels.`,
    `3. Decisions: gatekeepers accept, reject, or send work back.`,
    `4. Outcome: results leave the system (customers, fans, users, or markets).`,
    "",
    `## Failures and Recovery`,
    `- **Bottleneck = a jammed station in ${familiar}**`,
    `  - Work piles up; feedback surfaces the problem; recovery follows house rules.`,
    `- **Failure mode = a broken dependency that cascades**`,
    `  - One weak link forces others to idle or invent risky workarounds.`,
    "",
    `## Under Pressure and Growth`,
    `- **Scale = more games, more shifts, more customers without collapsing quality**`,
    `  - Processes and roles must absorb load the same way the original system must.`,
    "",
    `## How It All Fits Together`,
    `${conceptLabel} becomes clear when you treat ${familiar} as a living system: concrete roles, vivid tools, controlled flows, real failure points, and recovery loops — not a vague rename of technical terms.`,
  ].join("\n");
}
