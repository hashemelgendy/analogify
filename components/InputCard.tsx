"use client";

import { useLanguage, type SuggestedTopicId } from "@/lib/i18n";
import { Button, Card, Input } from "./ui";

interface InputCardProps {
  concept: string;
  familiarTopics: string;
  onConceptChange: (value: string) => void;
  onFamiliarTopicsChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function InputCard({
  concept,
  familiarTopics,
  onConceptChange,
  onFamiliarTopicsChange,
  onSubmit,
  isLoading = false,
}: InputCardProps) {
  const { t, topicLabel, suggestedTopicIds } = useLanguage();

  function handleTopicChip(topicId: SuggestedTopicId) {
    if (isLoading) return;

    const chip = topicLabel(topicId);

    if (!familiarTopics.trim()) {
      onFamiliarTopicsChange(chip);
      return;
    }

    const existing = familiarTopics
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (existing.includes(chip.toLowerCase())) return;

    onFamiliarTopicsChange(`${familiarTopics.trim()}, ${chip}`);
  }

  return (
    <Card>
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (isLoading || !concept.trim()) return;
          onSubmit();
        }}
      >
        <Input
          label={t("labelLearn")}
          id="learn-concept"
          value={concept}
          onChange={(event) => onConceptChange(event.target.value)}
          placeholder={t("placeholderLearn")}
          autoComplete="off"
          disabled={isLoading}
        />

        <div className="flex flex-col gap-3">
          <Input
            label={t("labelFamiliar")}
            id="familiar-topics"
            value={familiarTopics}
            onChange={(event) => onFamiliarTopicsChange(event.target.value)}
            placeholder={t("placeholderFamiliar")}
            autoComplete="off"
            disabled={isLoading}
          />
          <p className="flex cursor-default flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted">
            <span>{t("tryFamiliarWorld")}</span>
            {suggestedTopicIds.map((topicId, index) => (
              <span key={topicId} className="inline-flex items-center gap-x-1.5">
                {index > 0 ? (
                  <span className="text-muted-light" aria-hidden>
                    ·
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleTopicChip(topicId)}
                  disabled={isLoading}
                  className="cursor-pointer font-medium text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {topicLabel(topicId)}
                </button>
              </span>
            ))}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Button type="submit" disabled={isLoading || !concept.trim()}>
            {isLoading ? t("creatingExplanation") : t("createExplanation")}
          </Button>
          {isLoading ? (
            <p
              className="text-sm text-muted"
              role="status"
              aria-live="polite"
            >
              {t("buildingAnalogy")}
            </p>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
