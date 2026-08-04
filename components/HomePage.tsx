"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_FORM_VALUES } from "@/data/mock";
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
import { useLanguage } from "@/lib/i18n";
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

/** Newest explanations for the current guest (API default max handled server-side). */
const TRAIL_LIMIT = 10;

export function HomePage() {
  const { language, t } = useLanguage();
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

  // Learning Trail — real API data only (no mock)
  const [trailItems, setTrailItems] = useState<LearningTrailItem[]>([]);
  const [trailLoading, setTrailLoading] = useState(true);
  const [trailError, setTrailError] = useState<string | null>(null);
  const [isSelectingTrail, setIsSelectingTrail] = useState(false);
  const [lastSelectedTrailId, setLastSelectedTrailId] = useState<string | null>(
    null,
  );
  const [errorSource, setErrorSource] = useState<"generate" | "select" | null>(
    null,
  );

  const inFlightRef = useRef(false);
  /** Result panel target when opening a learning-trail entry from the landing page. */
  const explanationRef = useRef<HTMLDivElement>(null);
  /** Scroll only after trail open completes and the result container is painted. */
  const shouldScrollToExplanationRef = useRef(false);

  const loadTrail = useCallback(async () => {
    setTrailLoading(true);
    setTrailError(null);

    try {
      const items = await fetchLearningTrail(TRAIL_LIMIT);
      setTrailItems(items);
    } catch (err) {
      console.error("[HomePage] learning trail failed:", err);
      setTrailError(
        err instanceof Error ? err.message : t("trailLoadFailed"),
      );
      setTrailItems([]);
    } finally {
      setTrailLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadTrail();
  }, [loadTrail]);

  // Smooth-scroll to the explanation after a learning-trail click paints the result.
  useEffect(() => {
    if (!shouldScrollToExplanationRef.current) return;
    if (isSelectingTrail) return;
    if (!explanation) {
      // Trail open failed and nothing to show — drop the pending scroll.
      if (errorSource === "select") {
        shouldScrollToExplanationRef.current = false;
      }
      return;
    }

    shouldScrollToExplanationRef.current = false;
    explanationRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [explanation, isSelectingTrail, errorSource]);

  async function createExplanation(mode: ExplanationMode = "another") {
    if (inFlightRef.current || isLoading || isSelectingTrail) return;
    if (!concept.trim()) return;

    const familiarTopics = parseFamiliarTopicsInput(familiarTopicsInput);
    if (familiarTopics.length === 0) {
      setError(t("errorFamiliarRequired"));
      setErrorSource("generate");
      return;
    }

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    setErrorSource(null);
    setFeedbackError(null);
    setLastMode(mode);

    try {
      const result = await requestExplanation({
        concept: concept.trim(),
        familiarTopics,
        mode,
        language,
      });
      setExplanation(result);
      setError(null);
      // Refresh guest trail after successful save path
      await loadTrail();
    } catch (err) {
      console.error("[HomePage] explain failed:", err);
      setError(toFriendlyExplainError(err, language));
      setErrorSource("generate");
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }

  async function handleSelectTrailItem(item: LearningTrailItem) {
    if (isLoading || isSelectingTrail || inFlightRef.current) return;

    shouldScrollToExplanationRef.current = true;
    setIsSelectingTrail(true);
    setError(null);
    setErrorSource(null);
    setFeedbackError(null);
    setLastSelectedTrailId(item.id);

    try {
      // DB load only — never regenerates via OpenAI
      const full = await fetchExplanationById(item.id);
      setExplanation(full);
    } catch (err) {
      console.error("[HomePage] trail select failed:", err);
      setError(
        err instanceof Error ? err.message : t("trailOpenFailed"),
      );
      setErrorSource("select");
    } finally {
      setIsSelectingTrail(false);
    }
  }

  function handleRetry() {
    if (errorSource === "select" && lastSelectedTrailId) {
      void handleSelectTrailItem({
        id: lastSelectedTrailId,
        label: "",
        icon: "heart",
        concept: "",
        familiarTopics: [],
      });
      return;
    }
    void createExplanation(lastMode);
  }

  async function handleFeedback(payload: FeedbackPayload) {
    if (!payload.explanationId) {
      setFeedbackError(t("feedbackMissingId"));
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
      setFeedbackError(t("feedbackSaveFailed"));
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
        <Header tagline={t("tagline")} />

        <main className="mt-12 flex flex-col gap-8 sm:mt-16 sm:gap-10">
          <Hero />

          <InputCard
            concept={concept}
            familiarTopics={familiarTopicsInput}
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
                  ? t("loadingOpening")
                  : t("loadingCrafting")
              }
              detail={
                isSelectingTrail
                  ? t("loadingOpeningDetail")
                  : t("loadingCraftingDetail")
              }
            />
          ) : null}

          {showError && error ? (
            <ExplanationErrorState
              message={error}
              onRetry={handleRetry}
              isRetrying={isLoading || isSelectingTrail}
            />
          ) : null}

          {showResult && explanation ? (
            <div
              ref={explanationRef}
              id="explanation-result"
              className="flex flex-col gap-8"
            >
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
                disabled={isSavingFeedback || isLoading || isSelectingTrail}
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
