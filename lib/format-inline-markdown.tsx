import type { ReactNode } from "react";

/**
 * Lightweight markdown rendering for AI explanation prose.
 *
 * Blocks: paragraphs, nested lists, mapping rows (`Left = Right`)
 * Inline: **bold**, __bold__, *italic*, _italic_, `code`
 *
 * Nested list hierarchy:
 *   1. **Title**
 *      - detail under title
 */

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string };

/** Normalize common LLM / unicode quirks so **bold** parsing is reliable. */
function normalizeInlineSource(input: string): string {
  return (
    input
      .replace(/[\uFF0A\u2217\u204E\u066D]/g, "*")
      .replace(/[\u200B\u200C\u200D\uFEFF\u2060]/g, "")
      .replace(/\u00AD/g, "")
      .replace(/\\(\*)/g, "$1")
  );
}

function tokenizeInline(raw: string): InlineToken[] {
  const text = normalizeInlineSource(raw);
  if (!text) return [];

  const tokens: InlineToken[] = [];
  let i = 0;
  let buf = "";

  const flushText = () => {
    if (buf) {
      tokens.push({ type: "text", value: buf });
      buf = "";
    }
  };

  while (i < text.length) {
    if (text[i] === "*" && text[i + 1] === "*") {
      const close = text.indexOf("**", i + 2);
      if (close !== -1) {
        flushText();
        tokens.push({ type: "bold", value: text.slice(i + 2, close) });
        i = close + 2;
        continue;
      }
    }

    if (text[i] === "_" && text[i + 1] === "_") {
      const close = text.indexOf("__", i + 2);
      if (close !== -1) {
        flushText();
        tokens.push({ type: "bold", value: text.slice(i + 2, close) });
        i = close + 2;
        continue;
      }
    }

    if (text[i] === "`") {
      const close = text.indexOf("`", i + 1);
      if (close !== -1) {
        flushText();
        tokens.push({ type: "code", value: text.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
    }

    if (text[i] === "*" && text[i + 1] !== "*") {
      const close = text.indexOf("*", i + 1);
      if (close !== -1 && close > i + 1 && text[close + 1] !== "*") {
        flushText();
        tokens.push({ type: "italic", value: text.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
    }

    if (text[i] === "_" && text[i + 1] !== "_") {
      const close = text.indexOf("_", i + 1);
      if (close !== -1 && close > i + 1 && text[close + 1] !== "_") {
        flushText();
        tokens.push({ type: "italic", value: text.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
    }

    buf += text[i];
    i += 1;
  }

  flushText();
  return tokens.length > 0 ? tokens : [{ type: "text", value: text }];
}

/** Inline-only formatting (titles, single lines). */
export function formatInlineMarkdown(text: string): ReactNode[] {
  if (!text) return [];

  return tokenizeInline(text).map((token, i) => {
    switch (token.type) {
      case "bold":
        return (
          <strong key={`b-${i}`} className="font-semibold text-foreground">
            {token.value}
          </strong>
        );
      case "italic":
        return (
          <em key={`i-${i}`} className="italic text-foreground/90">
            {token.value}
          </em>
        );
      case "code":
        return (
          <code
            key={`c-${i}`}
            className="rounded bg-input-bg px-1 py-0.5 font-mono text-[0.9em] text-foreground"
          >
            {token.value}
          </code>
        );
      default:
        return <span key={`t-${i}`}>{token.value}</span>;
    }
  });
}

type ListKind = "ul" | "ol";

type NestedListItem = {
  text: string;
  /** Nested bullets or nested explanations under this item */
  children: NestedListItem[];
  /** Non-list prose lines nested under the item (indented body) */
  notes: string[];
};

type Block =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; kind: ListKind; items: NestedListItem[] }
  | { type: "mappings"; lines: string[] };

const LIST_LINE_RE = /^(\s*)(?:([-*•])|(\d+)[.)])\s+(.+)$/;
const MAP_RE = /^(.+?)\s+=\s+(.+)$/;
const INDENT_BODY_RE = /^([ \t]{2,})(\S.*)$/;

function isMappingLine(line: string): boolean {
  const t = line.trim();
  if (!/\s=\s/.test(t)) return false;
  return MAP_RE.test(t);
}

function lineIndent(line: string): number {
  const m = line.match(/^([ \t]*)/);
  if (!m) return 0;
  // tabs count as 2 spaces for nesting
  return m[1].replace(/\t/g, "  ").length;
}

function isTitleLike(text: string): boolean {
  const t = text.trim();
  if (t.length <= 90) return true;
  if (/\*\*[^*]+\*\*/.test(t) && t.length <= 140) return true;
  // Short title with parenthetical: "Drafting (Acquisition)"
  if (/^.{1,80}\([^)]{1,40}\)\s*$/.test(t.replace(/\*\*/g, ""))) return true;
  return false;
}

function isBodyLike(text: string, title: string): boolean {
  const t = text.trim();
  if (t.length < 40) return false;
  if (t.length <= title.trim().length) return false;
  // Bodies tend to be sentences
  return /[.!?…]/.test(t) || t.length >= 70;
}

/**
 * Repair flattened "1. Title 2. Body 3. Title 4. Body" into nested structure.
 */
function nestFlatTitleBodyPairs(items: NestedListItem[]): NestedListItem[] {
  if (items.length < 2) return items;
  // Only when no item already has nesteds
  if (items.some((i) => i.children.length > 0 || i.notes.length > 0)) {
    return items;
  }

  const out: NestedListItem[] = [];
  let i = 0;
  let paired = 0;

  while (i < items.length) {
    const cur = items[i];
    const next = items[i + 1];
    if (
      next &&
      isTitleLike(cur.text) &&
      isBodyLike(next.text, cur.text) &&
      !isTitleLike(next.text)
    ) {
      out.push({
        text: cur.text,
        children: [],
        notes: [next.text],
      });
      paired += 1;
      i += 2;
      continue;
    }
    out.push(cur);
    i += 1;
  }

  // Only accept if we actually nested several pairs (avoid accidental joins)
  return paired >= 1 ? out : items;
}

/**
 * Parse consecutive list lines into a nested tree using indentation.
 */
function parseNestedListLines(
  lines: string[],
  preferredKind?: ListKind,
): { kind: ListKind; items: NestedListItem[] } | null {
  type StackEntry = { indent: number; item: NestedListItem };

  const roots: NestedListItem[] = [];
  const stack: StackEntry[] = [];
  let rootKind: ListKind | null = preferredKind ?? null;
  let sawList = false;

  for (const raw of lines) {
    const listMatch = raw.match(LIST_LINE_RE);
    if (listMatch) {
      sawList = true;
      const indent = lineIndent(raw);
      const kind: ListKind = listMatch[2] ? "ul" : "ol";
      if (rootKind == null && indent === 0) {
        rootKind = kind;
      }
      const text = listMatch[4].trim();
      const item: NestedListItem = { text, children: [], notes: [] };

      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      if (stack.length === 0) {
        roots.push(item);
      } else {
        stack[stack.length - 1].item.children.push(item);
      }
      stack.push({ indent, item });
      continue;
    }

    // Indented prose under the current list item
    const bodyMatch = raw.match(INDENT_BODY_RE);
    if (bodyMatch && stack.length > 0) {
      stack[stack.length - 1].item.notes.push(bodyMatch[2].trim());
      continue;
    }

    // Non-list line with indent still nest under current item if present
    if (stack.length > 0 && lineIndent(raw) >= 2) {
      stack[stack.length - 1].item.notes.push(raw.trim());
      continue;
    }

    // Loose line: break nested list parsing
    return null;
  }

  if (!sawList || roots.length === 0) return null;

  const kind = rootKind ?? "ul";
  const items =
    kind === "ol" ? nestFlatTitleBodyPairs(roots) : roots;

  return { kind, items };
}

function parseBlocks(text: string): Block[] {
  const normalized = normalizeInlineSource(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
  if (!normalized) return [];

  const chunks = normalized.split(/\n{2,}/);
  const blocks: Block[] = [];

  for (const chunk of chunks) {
    // Keep indent for list nesting (don't trimLeft fully)
    const lines = chunk
      .split("\n")
      .map((l) => l.replace(/\s+$/g, ""))
      .filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;

    const trimmedAll = lines.map((l) => l.trim());
    if (trimmedAll.every(isMappingLine)) {
      blocks.push({ type: "mappings", lines: trimmedAll });
      continue;
    }

    // Prefer nested list parse on whole chunk
    const nested = parseNestedListLines(lines);
    if (nested) {
      blocks.push({ type: "list", kind: nested.kind, items: nested.items });
      continue;
    }

    // Mixed: walk line by line
    let para: string[] = [];
    let listLines: string[] = [];
    let mapBuf: string[] = [];

    const flushPara = () => {
      if (para.length > 0) {
        blocks.push({ type: "paragraph", lines: para });
        para = [];
      }
    };
    const flushList = () => {
      if (listLines.length > 0) {
        const n = parseNestedListLines(listLines);
        if (n) {
          blocks.push({ type: "list", kind: n.kind, items: n.items });
        } else {
          // fallback flat
          blocks.push({
            type: "list",
            kind: "ul",
            items: listLines.map((l) => ({
              text: l.replace(LIST_LINE_RE, "$4").trim() || l.trim(),
              children: [],
              notes: [],
            })),
          });
        }
        listLines = [];
      }
    };
    const flushMaps = () => {
      if (mapBuf.length > 0) {
        blocks.push({ type: "mappings", lines: mapBuf });
        mapBuf = [];
      }
    };

    for (const line of lines) {
      const t = line.trim();
      if (LIST_LINE_RE.test(line) || (listLines.length > 0 && lineIndent(line) >= 2)) {
        flushPara();
        flushMaps();
        listLines.push(line);
        continue;
      }

      if (isMappingLine(t)) {
        flushPara();
        flushList();
        mapBuf.push(t);
        continue;
      }

      flushList();
      flushMaps();
      para.push(t);
    }

    flushList();
    flushMaps();
    flushPara();
  }

  return blocks;
}

function renderMappingLine(line: string, key: string): ReactNode {
  const m = line.trim().match(MAP_RE);
  if (!m) {
    return (
      <p key={key} className="text-[15px] leading-relaxed text-foreground/90">
        {formatInlineMarkdown(line)}
      </p>
    );
  }
  return (
    <p key={key} className="text-[15px] leading-relaxed text-foreground/90">
      <strong className="font-semibold text-foreground">
        {formatInlineMarkdown(m[1])}
      </strong>
      <span className="mx-1 text-muted">=</span>
      <span>{formatInlineMarkdown(m[2])}</span>
    </p>
  );
}

function renderParagraphLines(lines: string[], keyBase: string): ReactNode {
  return lines.map((line, i) => (
    <span key={`${keyBase}-ln-${i}`}>
      {i > 0 ? <br /> : null}
      {formatInlineMarkdown(line)}
    </span>
  ));
}

function renderNestedItems(
  items: NestedListItem[],
  kind: ListKind,
  keyPrefix: string,
): ReactNode {
  const ListTag = kind === "ol" ? "ol" : "ul";
  const listClass =
    kind === "ol"
      ? "list-decimal space-y-2.5 ps-5 text-[15px] leading-relaxed text-foreground/90 marker:font-semibold marker:text-muted"
      : "list-disc space-y-2 ps-5 text-[15px] leading-relaxed text-foreground/90 marker:text-muted";

  return (
    <ListTag className={listClass}>
      {items.map((item, j) => (
        <li key={`${keyPrefix}-${j}`} className="ps-0.5">
          <div className="font-medium text-foreground">
            {formatInlineMarkdown(item.text)}
          </div>
          {item.notes.length > 0 ? (
            <div className="mt-1.5 space-y-1.5 font-normal text-foreground/90">
              {item.notes.map((note, n) => (
                <p key={n} className="text-[15px] leading-relaxed">
                  {formatInlineMarkdown(note)}
                </p>
              ))}
            </div>
          ) : null}
          {item.children.length > 0 ? (
            <div className="mt-1.5 font-normal">
              {renderNestedItems(item.children, "ul", `${keyPrefix}-${j}-c`)}
            </div>
          ) : null}
        </li>
      ))}
    </ListTag>
  );
}

/**
 * Full prose formatter for analogy / elaboration bodies.
 */
export function formatRichText(text: string): ReactNode {
  if (!text?.trim()) return null;

  const blocks = parseBlocks(text);
  if (blocks.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-foreground/90">
        {formatInlineMarkdown(text)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => {
        if (block.type === "list") {
          return (
            <div key={`list-${i}`}>
              {renderNestedItems(block.items, block.kind, `l${i}`)}
            </div>
          );
        }

        if (block.type === "mappings") {
          return (
            <div key={`maps-${i}`} className="flex flex-col gap-2">
              {block.lines.map((line, j) =>
                renderMappingLine(line, `map-${i}-${j}`),
              )}
            </div>
          );
        }

        return (
          <p
            key={`p-${i}`}
            className="text-[15px] leading-relaxed text-foreground/90"
          >
            {renderParagraphLines(block.lines, `p-${i}`)}
          </p>
        );
      })}
    </div>
  );
}
