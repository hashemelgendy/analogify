"use client";

import type { ReactNode } from "react";
import { useLanguage, type TranslationKey } from "@/lib/i18n";
import {
  hasInDepthMarkers,
  parseInDepthSections,
} from "@/lib/explanation-sections";
import { conceptTag, primaryFamiliarTag } from "@/lib/explanation-display";
import {
  formatInlineMarkdown,
  formatRichText,
} from "@/lib/format-inline-markdown";
import type { Explanation, ExplanationMode } from "@/types/explanation";
import { Button, Card, Tag } from "./ui";

export type { Explanation, ExplanationMode };

interface ExplanationCardProps {
  data: Explanation;
  onModeChange?: (mode: ExplanationMode) => void;
  isLoading?: boolean;
  /** Hide simpler / another / deeper actions (saved history views). */
  showRefinementActions?: boolean;
}

/** Section shell matching The Analogy / Elaboration surfaces. */
function ContentSection({
  title,
  titleClassName,
  titleAsHeading = false,
  children,
}: {
  title: string;
  titleClassName: string;
  /** Dynamic markdown titles use sentence case; fixed labels use eyebrow styling. */
  titleAsHeading?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="explanation-prose cursor-text rounded-2xl bg-analogy-bg px-5 py-4">
      {title ? (
        <p
          className={
            titleAsHeading
              ? `mb-3 text-[15px] font-bold tracking-tight ${titleClassName}`
              : `mb-2 cursor-default text-[11px] font-semibold uppercase tracking-[0.14em] ${titleClassName}`
          }
        >
          {title}
        </p>
      ) : null}
      <div className="min-w-0 select-text">{children}</div>
    </div>
  );
}

function FormattedBody({ text }: { text: string }) {
  return formatRichText(text);
}

function InDepthBody({ content }: { content: string }) {
  const { t } = useLanguage();
  const sections = parseInDepthSections(content);

  if (sections.length === 0) {
    return (
      <ContentSection
        title={t("elaboration")}
        titleClassName="text-tag-target-text"
      >
        <FormattedBody text={content} />
      </ContentSection>
    );
  }

  return (
    <>
      {sections.map((section, index) => {
        const title =
          section.titleKey != null
            ? t(section.titleKey as TranslationKey)
            : section.title || t("elaboration");
        const titleAsHeading = section.titleKey == null && Boolean(section.title);

        return (
          <ContentSection
            key={section.id}
            title={title}
            titleAsHeading={titleAsHeading}
            titleClassName={
              index % 2 === 0 ? "text-primary" : "text-tag-target-text"
            }
          >
            <FormattedBody text={section.body} />
          </ContentSection>
        );
      })}
    </>
  );
}

export function ExplanationCard({
  data,
  onModeChange,
  isLoading = false,
  showRefinementActions = true,
}: ExplanationCardProps) {
  const { t } = useLanguage();

  const isInDepth =
    data.generationMode === "deeper" || hasInDepthMarkers(data.analogyContent);

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Tag variant="source">{conceptTag(data)}</Tag>
        <span className="cursor-default text-muted-light" aria-hidden>
          →
        </span>
        <Tag variant="target">{primaryFamiliarTag(data)}</Tag>
      </div>

      <h2 className="explanation-prose cursor-text text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {formatInlineMarkdown(data.analogyTitle)}
      </h2>

      {isInDepth ? (
        <>
          <div className="cursor-default">
            <p className="mb-3 cursor-default text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t("inDepthAnalogy")}
            </p>
            <div className="flex flex-col gap-4">
              <InDepthBody content={data.analogyContent} />
            </div>
          </div>
        </>
      ) : (
        <>
          <ContentSection title={t("theAnalogy")} titleClassName="text-primary">
            <FormattedBody text={data.analogyContent} />
          </ContentSection>

          <ContentSection
            title={t("elaboration")}
            titleClassName="text-tag-target-text"
          >
            <FormattedBody text={data.explanation} />
          </ContentSection>
        </>
      )}

      {showRefinementActions ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={isLoading}
            onClick={() => onModeChange?.("simpler")}
          >
            {t("makeSimpler")}
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={isLoading}
            onClick={() => onModeChange?.("another")}
          >
            {t("useAnotherAnalogy")}
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={isLoading}
            onClick={() => onModeChange?.("deeper")}
          >
            {t("explainDeeper")}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
