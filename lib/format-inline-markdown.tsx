import type { ReactNode } from "react";

/**
 * Render plain explanation prose with light markdown:
 * - **bold** → <strong>
 * - newlines preserved when used inside whitespace-pre-wrap
 *
 * Escapes nothing special beyond not injecting HTML — text is always React nodes.
 */
export function formatInlineMarkdown(text: string): ReactNode[] {
  if (!text) return [];

  const nodes: ReactNode[] = [];
  // **bold** only (non-greedy). Avoids matching empty ** **.
  const re = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <strong key={`b-${key++}`} className="font-semibold text-foreground">
        {match[1]}
      </strong>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}
