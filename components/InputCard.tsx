"use client";

import { Button, Card, Input } from "./ui";

interface InputCardProps {
  concept: string;
  familiarTopics: string;
  suggestedTopics: readonly string[];
  onConceptChange: (value: string) => void;
  onFamiliarTopicsChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function InputCard({
  concept,
  familiarTopics,
  suggestedTopics,
  onConceptChange,
  onFamiliarTopicsChange,
  onSubmit,
  isLoading = false,
}: InputCardProps) {
  function handleTopicChip(chip: string) {
    if (isLoading) return;

    if (!familiarTopics.trim()) {
      onFamiliarTopicsChange(chip.toLowerCase());
      return;
    }

    const existing = familiarTopics
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (existing.includes(chip.toLowerCase())) return;

    onFamiliarTopicsChange(`${familiarTopics.trim()}, ${chip.toLowerCase()}`);
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
          label="What do you want to learn?"
          id="learn-concept"
          value={concept}
          onChange={(event) => onConceptChange(event.target.value)}
          placeholder="e.g. How does blockchain work?"
          autoComplete="off"
          disabled={isLoading}
        />

        <div className="flex flex-col gap-3">
          <Input
            label="What topics do you already know?"
            id="familiar-topics"
            value={familiarTopics}
            onChange={(event) => onFamiliarTopicsChange(event.target.value)}
            placeholder="e.g. cooking, gaming, fitness..."
            autoComplete="off"
            disabled={isLoading}
          />
          <p className="flex cursor-default flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted">
            <span>Try a familiar world:</span>
            {suggestedTopics.map((chip, index) => (
              <span key={chip} className="inline-flex items-center gap-x-1.5">
                {index > 0 ? (
                  <span className="text-muted-light" aria-hidden>
                    ·
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleTopicChip(chip)}
                  disabled={isLoading}
                  className="cursor-pointer font-medium text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {chip}
                </button>
              </span>
            ))}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Button type="submit" disabled={isLoading || !concept.trim()}>
            {isLoading ? "Creating Explanation..." : "Create Explanation"}
          </Button>
          {isLoading ? (
            <p
              className="text-sm text-muted"
              role="status"
              aria-live="polite"
            >
              Building a personalized analogy for you…
            </p>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
