import { Button, Card, Tag } from "./ui";
import { conceptTag, primaryFamiliarTag } from "@/lib/explanation-display";
import type { Explanation, ExplanationMode } from "@/types/explanation";

export type { Explanation, ExplanationMode };

interface ExplanationCardProps {
  data: Explanation;
  onModeChange?: (mode: ExplanationMode) => void;
  isLoading?: boolean;
}

export function ExplanationCard({
  data,
  onModeChange,
  isLoading = false,
}: ExplanationCardProps) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Tag variant="source">{conceptTag(data)}</Tag>
        <span className="cursor-default text-muted-light" aria-hidden>
          →
        </span>
        <Tag variant="target">{primaryFamiliarTag(data)}</Tag>
      </div>

      <h2 className="cursor-default text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {data.analogyTitle}
      </h2>

      <div className="cursor-default rounded-2xl bg-analogy-bg px-5 py-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          The analogy
        </p>
        <p className="text-[15px] leading-relaxed text-foreground/90">
          {data.analogyContent}
        </p>
      </div>

      <p className="cursor-default text-[15px] leading-relaxed text-muted">
        {data.explanation}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={isLoading}
          onClick={() => onModeChange?.("simpler")}
        >
          Make it simpler
        </Button>
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={isLoading}
          onClick={() => onModeChange?.("another")}
        >
          Use another analogy
        </Button>
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={isLoading}
          onClick={() => onModeChange?.("deeper")}
        >
          Explain deeper
        </Button>
      </div>
    </Card>
  );
}
