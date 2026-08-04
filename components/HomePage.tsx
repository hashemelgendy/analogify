"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_FORM_VALUES,
  SUGGESTED_TOPICS,
} from "@/data/mock";
import { toFriendlyExplainError } from "@/lib/client/explain-errors";
import {
  parseFamiliarTopicsInput,
  requestExplanation,
} from "@/lib/api/explain";
import {
  fetchExplanationById,
  fetchLearningTrail,
} from "@/lib/api/explanations";
import { submitFeedbackRequest } from "@/lib/api/feedback";
import type {
  Explanation,
  ExplanationMode,
  FeedbackPayload,
  LearningTrailItem,
} from "@/types/explanation";
import { ExplanationCard } from "./ExplanationCard";
import {
  ExplanationEmptyState,
  ExplanationErrorState,
  ExplanationLoadingState,
} from "./ExplanationStatus";
import { FeedbackCard } from "./FeedbackCard";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { InputCard } from "./InputCard";
import { LearningTrail } from "./LearningTrail";

const TRAIL_LIMIT = 10;

export function HomePage() {
  const [concept, setConcept] = useState(DEFAULT_FORM_VALUES.concept);
  const [familiarTopicsInput, setFamiliarTopicsInput] = useState(
    DEFAULT_FORM_VALUES.familiarTopics,
  );
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMode, setLastMode] = useState<ExplanationMode>("another");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const [trailItems, setTrailItems] = useState<LearningTrailItem[]>([]);
  const [trailLoading, setTrailLoading] = useState(true);
  const [trailError, setTrailError] = useState<string | null>(null);
  const [isSelectingTrail, setIsSelectingTrail] = useState(false);

  const inFlightRef = useRef(false);

  const loadTrail = useCallback(async () => {
    setTrailLoading(true);
    setTrailError(null);

    try {
      const items = await fetchLearningTrail(TRAIL_LIMIT);
      setTrailItems(items);
    } catch (err) {
      console.error("[HomePage] learning trail failed:", err);
      setTrailError(
        err instanceof Error
          ? err.message
          : "We couldn’t load your learning trail right now.",
      );
      setTrailItems([]);
    } finally {
      setTrailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrail();
  }, [loadTrail]);

  async function createExplanation(mode: ExplanationMode = "another") {
    if (inFlightRef.current || isLoading) return;
    if (!concept.trim()) return;

    const familiarTopics = parseFamiliarTopicsInput(familiarTopicsInput);
    if (familiarTopics.length === 0) {
      setError(
        "Add at least one familiar topic so we can ground the analogy.",
      );
      return;
    }

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    setFeedbackError(null);
    setLastMode(mode);

    try {
      const result = await requestExplanation({
        concept: concept.trim(),
        familiarTopics,
        mode,
      });
      setExplanation(result);
      setError(null);
      void loadTrail();
    } catch (err) {
      console.error("[HomePage] explain failed:", err);
      setError(toFriendlyExplainError(err));
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }

  function handleRetry() {
    void createExplanation(lastMode);
  }

  async function handleSelectTrailItem(item: LearningTrailItem) {
    if (isLoading || isSelectingTrail) return;

    setIsSelectingTrail(true);
    setError(null);
    setFeedbackError(null);

    try {
      const full = await fetchExplanationById(item.id);
      setExplanation(full);
      // Scroll toward the result cards for UX (keeps design intact)
      document
        .getElementById("explanation-result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error("[HomePage] trail select failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t load that explanation right now.",
      );
    } finally {
      setIsSelectingTrail(false);
    }
  }

  async function handleFeedback(payload: FeedbackPayload) {
    if (!payload.explanationId) {
      setFeedbackError(
        "This explanation was not saved, so feedback could not be linked. Create a new explanation to rate it.",
      );
      throw new Error("Missing explanation id");
    }

    setIsSavingFeedback(true);
    setFeedbackError(null);

    try {
      await submitFeedbackRequest({
        explanationId: payload.explanationId,
        rating: payload.rating,
        comment: payload.comment,
      });
      setExplanation((current) =>
        current ? { ...current, rating: payload.rating } : current,
      );
    } catch (err) {
      console.error("[HomePage] feedback save failed:", err);
      setFeedbackError(
        "We couldn’t save your feedback right now. Please try again.",
      );
      throw err;
    } finally {
      setIsSavingFeedback(false);
    }
  }

  const showEmpty = !explanation && !isLoading && !isSelectingTrail && !error;
  const showLoading = isLoading || isSelectingTrail;
  const showError = Boolean(error) && !isLoading && !isSelectingTrail;
  const showResult = Boolean(explanation) && !isLoading && !isSelectingTrail;

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
            isLoading={isLoading || isSelectingTrail}
          />

          {showEmpty ? <ExplanationEmptyState /> : null}

          {showLoading ? (
            <ExplanationLoadingState
              message={
                isSelectingTrail
                  ? "Opening saved explanation…"
                  : "Crafting your analogy…"
              }
              detail={
                isSelectingTrail
                  ? "Loading the full analogy from your learning trail."
                  : "We’re mapping the concept onto things you already understand. This usually takes a few seconds."
              }
            />
          ) : null}

          {showError && error ? (
            <ExplanationErrorState
              message={error}
              onRetry={handleRetry}
              isRetrying={isLoading}
            />
          ) : null}

          {showResult && explanation ? (
            <div id="explanation-result" className="flex flex-col gap-8">
              <ExplanationCard
                data={explanation}
                isLoading={isLoading}
                onModeChange={(mode) => {
                  void createExplanation(mode);
                }}
              />
              <FeedbackCard
                key={
                  explanation.id ??
                  explanation.concept + explanation.analogyTitle
                }
                concept={explanation.concept}
                explanationId={explanation.id}
                disabled={isSavingFeedback || isLoading}
                onSubmit={handleFeedback}
              />
              {feedbackError ? (
                <p className="text-sm text-muted" role="alert">
                  {feedbackError}
                </p>
              ) : null}
            </div>
          ) : null}

          <LearningTrail
            items={trailItems}
            isLoading={trailLoading}
            error={trailError}
            activeId={explanation?.id ?? null}
            onSelect={(item) => {
              void handleSelectTrailItem(item);
            }}
            onRetry={() => {
              void loadTrail();
            }}
          />
        </main>
      </div>
    </div>
  );
}
