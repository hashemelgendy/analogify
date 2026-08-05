"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_FORM_VALUES } from "@/data/mock";
import { toFriendlyExplainError } from "@/lib/client/explain-errors";
import {
  parseFamiliarTopicsInput,
  requestExplanation,
} from "@/lib/api/explain";
import { fetchExplanationById } from "@/lib/api/explanations";
import { submitFeedbackRequest } from "@/lib/api/feedback";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  incrementGenerationCount,
  readGenerationCount,
} from "@/lib/guest/client-storage";
import {
  explanationToTrailItem,
  useInfiniteHistory,
} from "@/lib/history/useInfiniteHistory";
import { useLanguage } from "@/lib/i18n";
import type {
  Explanation,
  ExplanationMode,
  FeedbackPayload,
  LearningTrailItem,
} from "@/types/explanation";
import { ConfirmDialog } from "./ConfirmDialog";
import { ExplanationCard } from "./ExplanationCard";
import {
  ExplanationEmptyState,
  ExplanationErrorState,
  ExplanationLoadingState,
} from "./ExplanationStatus";
import { FeedbackCard } from "./FeedbackCard";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { HistorySidebar } from "./HistorySidebar";
import { InputCard } from "./InputCard";
import { SaveExplanationsPrompt } from "./SaveExplanationsPrompt";

export function HomePage() {
  const { language, t } = useLanguage();
  const { effectiveUserId, isClaiming } = useAuth();
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
  const [generationCount, setGenerationCount] = useState(0);

  const [isSelectingTrail, setIsSelectingTrail] = useState(false);
  const [lastSelectedTrailId, setLastSelectedTrailId] = useState<string | null>(
    null,
  );
  const [errorSource, setErrorSource] = useState<"generate" | "select" | null>(
    null,
  );

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<LearningTrailItem | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [undoItem, setUndoItem] = useState<LearningTrailItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [undoBusy, setUndoBusy] = useState(false);

  const {
    items: historyItems,
    loading: historyLoading,
    loadingMore: historyLoadingMore,
    hasMore: historyHasMore,
    error: historyError,
    resetAndLoad,
    loadMore,
    prependItem,
    softDeleteItem,
    restoreItem,
  } = useInfiniteHistory();

  const inFlightRef = useRef(false);
  const explanationRef = useRef<HTMLDivElement>(null);
  const shouldScrollToExplanationRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate soft-prompt counter
    setGenerationCount(readGenerationCount());
  }, []);

  useEffect(() => {
    if (isClaiming) return;
    void resetAndLoad();
  }, [effectiveUserId, isClaiming, resetAndLoad]);

  useEffect(() => {
    if (!shouldScrollToExplanationRef.current) return;
    if (isSelectingTrail) return;
    if (!explanation) {
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

  useEffect(() => {
    if (!undoItem && toast) {
      const timer = window.setTimeout(() => setToast(null), 2800);
      return () => window.clearTimeout(timer);
    }
    if (undoItem) {
      const timer = window.setTimeout(() => {
        setUndoItem(null);
        setToast(null);
      }, 5000);
      return () => window.clearTimeout(timer);
    }
  }, [toast, undoItem]);

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
      setLastSelectedTrailId(result.id ?? null);
      setGenerationCount(incrementGenerationCount());

      const trailItem = explanationToTrailItem(result);
      if (trailItem) {
        prependItem(trailItem);
      } else {
        // Persist may have failed to return id — refresh list
        void resetAndLoad();
      }
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
      const full = await fetchExplanationById(item.id);
      setExplanation(full);
    } catch (err) {
      console.error("[HomePage] history select failed:", err);
      setError(err instanceof Error ? err.message : t("trailOpenFailed"));
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

  async function confirmDelete() {
    if (!pendingDelete || deleteBusy) return;
    const item = pendingDelete;
    setDeleteBusy(true);
    setDeletingId(item.id);

    try {
      await softDeleteItem(item.id);
      if (explanation?.id === item.id) {
        setExplanation(null);
        setLastSelectedTrailId(null);
      }
      setPendingDelete(null);
      setUndoItem(item);
      setToast(t("historyDeleted"));
    } catch (err) {
      console.error("[HomePage] soft delete failed:", err);
      void resetAndLoad();
      setToast(null);
      setError(
        err instanceof Error ? err.message : t("historyDeleteFailed"),
      );
    } finally {
      setDeleteBusy(false);
      setDeletingId(null);
    }
  }

  async function handleUndo() {
    if (!undoItem || undoBusy) return;
    const item = undoItem;
    setUndoBusy(true);
    try {
      await restoreItem(item);
      setUndoItem(null);
      setToast(t("historyRestored"));
    } catch (err) {
      console.error("[HomePage] restore failed:", err);
      setError(
        err instanceof Error ? err.message : t("historyRestoreFailed"),
      );
    } finally {
      setUndoBusy(false);
    }
  }

  const showEmpty = !explanation && !isLoading && !isSelectingTrail && !error;
  const showLoading = isLoading || isSelectingTrail;
  const showError = Boolean(error) && !isLoading && !isSelectingTrail;
  const showResult = Boolean(explanation) && !isLoading && !isSelectingTrail;

  const activeId = explanation?.id ?? lastSelectedTrailId;

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <HistorySidebar
        items={historyItems}
        activeId={activeId}
        loading={historyLoading}
        loadingMore={historyLoadingMore}
        hasMore={historyHasMore}
        error={
          historyError ===
          "We couldn’t load your learning trail right now."
            ? t("trailLoadFailed")
            : historyError
        }
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        deletingId={deletingId}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onSelect={(item) => {
          void handleSelectTrailItem(item);
        }}
        onDelete={(item) => setPendingDelete(item)}
        onLoadMore={() => {
          void loadMore();
        }}
        onRetry={() => {
          void resetAndLoad();
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
          <Header
            tagline={t("tagline")}
            leading={
              <button
                type="button"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-foreground hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
                aria-label={t("sidebarOpenMenu")}
                onClick={() => setMobileSidebarOpen(true)}
              >
                <BurgerIcon />
              </button>
            }
          />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
            {(toast || undoItem) && (
              <div
                className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground shadow-sm"
                role="status"
                aria-live="polite"
              >
                <span>{toast ?? t("historyDeleted")}</span>
                {undoItem ? (
                  <button
                    type="button"
                    disabled={undoBusy}
                    onClick={() => {
                      void handleUndo();
                    }}
                    className="cursor-pointer font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-50"
                  >
                    {undoBusy ? "…" : t("historyUndo")}
                  </button>
                ) : null}
              </div>
            )}

            <div className="flex flex-col gap-8 sm:gap-10">
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

              <SaveExplanationsPrompt generationCount={generationCount} />

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
                    disabled={
                      isSavingFeedback || isLoading || isSelectingTrail
                    }
                    onSubmit={handleFeedback}
                  />
                  {feedbackError ? (
                    <p className="text-sm text-muted" role="alert">
                      {feedbackError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={pendingDelete != null}
        title={t("historyDeleteConfirmTitle")}
        description={t("historyDeleteConfirmBody")}
        confirmLabel={t("historyDeleteConfirm")}
        cancelLabel={t("historyCancel")}
        danger
        busy={deleteBusy}
        onCancel={() => {
          if (!deleteBusy) setPendingDelete(null);
        }}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </div>
  );
}

function BurgerIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      <path strokeLinecap="round" d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" />
    </svg>
  );
}
