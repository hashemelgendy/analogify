"use client";

import { useState } from "react";
import {
  DEFAULT_FORM_VALUES,
  SAMPLE_EXPLANATION,
  SAMPLE_LEARNING_TRAIL,
  SUGGESTED_TOPICS,
} from "@/data/mock";
import {
  parseFamiliarTopicsInput,
  requestExplanation,
} from "@/lib/api/explain";
import type { Explanation, ExplanationMode } from "@/types/explanation";
import { ExplanationCard } from "./ExplanationCard";
import { FeedbackCard } from "./FeedbackCard";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { InputCard } from "./InputCard";
import { LearningTrail } from "./LearningTrail";

export function HomePage() {
  const [concept, setConcept] = useState(DEFAULT_FORM_VALUES.concept);
  const [familiarTopicsInput, setFamiliarTopicsInput] = useState(
    DEFAULT_FORM_VALUES.familiarTopics,
  );
  const [explanation, setExplanation] = useState<Explanation | null>(
    SAMPLE_EXPLANATION,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createExplanation(mode: ExplanationMode = "another") {
    if (!concept.trim() || isLoading) return;

    const familiarTopics = parseFamiliarTopicsInput(familiarTopicsInput);
    if (familiarTopics.length === 0) {
      setError("Add at least one familiar topic");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Frontend only depends on Explanation; AI stays server-side.
      const result = await requestExplanation({
        concept: concept.trim(),
        familiarTopics,
        mode,
      });
      setExplanation(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create explanation",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleRating(rating: number) {
    setExplanation((current) =>
      current ? { ...current, rating } : current,
    );
  }

  return (
    <div className="min-h-full cursor-default bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <Header />

        <main className="mt-12 flex flex-col gap-8 sm:mt-16 sm:gap-10">
          <Hero />

          <InputCard
            concept={concept}
            familiarTopics={familiarTopicsInput}
            suggestedTopics={SUGGESTED_TOPICS}
            onConceptChange={setConcept}
            onFamiliarTopicsChange={setFamiliarTopicsInput}
            onSubmit={() => {
              void createExplanation("another");
            }}
            isLoading={isLoading}
          />

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {explanation ? (
            <>
              <ExplanationCard
                data={explanation}
                isLoading={isLoading}
                onModeChange={(mode) => {
                  void createExplanation(mode);
                }}
              />
              <FeedbackCard
                key={explanation.concept + explanation.analogyTitle}
                concept={explanation.concept}
                rating={explanation.rating}
                onSubmit={(payload) => handleRating(payload.rating)}
              />
            </>
          ) : null}

          <LearningTrail items={SAMPLE_LEARNING_TRAIL} />
        </main>
      </div>
    </div>
  );
}
