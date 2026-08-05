"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteAllExplanations,
  deleteExplanationById,
  fetchExplanationById,
  fetchLearningTrailPage,
  restoreExplanationById,
} from "@/lib/api/explanations";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n";
import type { Explanation, LearningTrailItem } from "@/types/explanation";
import { ConfirmDialog } from "./ConfirmDialog";
import { ExplanationCard } from "./ExplanationCard";
import { Header } from "./Header";
import { Button, Card } from "./ui";

const PAGE_SIZE = 5;

function formatCreatedAt(
  value: string | undefined,
  unknownLabel: string,
  language: string,
): string {
  if (!value) return unknownLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return unknownLabel;
  return date.toLocaleDateString(language === "ar" ? "ar" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function familiarLabel(topics: string[], language: string): string {
  if (topics.length === 0) return "—";
  return topics.join(language === "ar" ? "، " : ", ");
}

function formatPageLabel(
  template: string,
  page: number,
  totalPages: number,
): string {
  return template
    .replace("{page}", String(page))
    .replace("{totalPages}", String(Math.max(totalPages, 1)));
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 6h11M8 6V4.75A1.25 1.25 0 019.25 3.5h1.5A1.25 1.25 0 0112 4.75V6m2.5 0v9.25A1.25 1.25 0 0113.25 16.5h-6.5A1.25 1.25 0 015.5 15.25V6M8.5 9v4.5M11.5 9v4.5"
      />
    </svg>
  );
}

function SpinnerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M18 10a8 8 0 00-8-8v2.5A5.5 5.5 0 0115.5 10H18z"
      />
    </svg>
  );
}

type PendingDelete =
  | { type: "one"; item: LearningTrailItem }
  | { type: "all" }
  | null;

export function HistoryPage() {
  const { language, t } = useLanguage();
  const { effectiveUserId, isClaiming } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<LearningTrailItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  /** Cache of loaded full explanations — skip re-fetch when reopening. */
  const [explanationCache, setExplanationCache] = useState<
    Record<string, Explanation>
  >({});
  const [loadingEntryId, setLoadingEntryId] = useState<string | null>(null);
  const [expandError, setExpandError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [undoItem, setUndoItem] = useState<LearningTrailItem | null>(null);
  const [undoBusy, setUndoBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadHistoryPage = useCallback(
    async (page: number) => {
      setListLoading(true);
      setListError(null);

      try {
        const { items: pageItems, pagination } = await fetchLearningTrailPage({
          limit: PAGE_SIZE,
          page,
        });
        setItems(pageItems);
        setTotalPages(pagination.totalPages);
        setTotalCount(pagination.total);
        setCurrentPage(pagination.page > 0 ? pagination.page : page);
        // Collapse accordion when the page list changes
        setExpandedEntryId(null);
        setExpandError(null);
        setLoadingEntryId(null);
      } catch (err) {
        console.error("[HistoryPage] load failed:", err);
        setListError(
          err instanceof Error ? err.message : t("historyListFailed"),
        );
        setItems([]);
        setTotalPages(0);
        setTotalCount(0);
      } finally {
        setListLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    // Wait for guest→user claim so history includes merged rows after login.
    if (isClaiming) return;
    // Client-only paged history load when page or identity changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- remote list hydration
    void loadHistoryPage(currentPage);
  }, [currentPage, loadHistoryPage, effectiveUserId, isClaiming]);

  useEffect(() => {
    if (!toast && !undoItem) return;
    if (!undoItem && toast) {
      const timer = window.setTimeout(() => setToast(null), 2800);
      return () => window.clearTimeout(timer);
    }
    // Undo window: 5 seconds for single-item soft delete
    if (undoItem) {
      const timer = window.setTimeout(() => {
        setUndoItem(null);
        setToast(null);
      }, 5000);
      return () => window.clearTimeout(timer);
    }
  }, [toast, undoItem]);

  async function handleUndo() {
    if (!undoItem || undoBusy) return;
    const item = undoItem;
    setUndoBusy(true);
    setActionError(null);

    try {
      await restoreExplanationById(item.id);
      setUndoItem(null);
      setToast(t("historyRestored"));
      // Refetch so ordering / pagination stay correct
      await loadHistoryPage(currentPage);
    } catch (err) {
      console.error("[HistoryPage] restore failed:", err);
      setActionError(
        err instanceof Error ? err.message : t("historyRestoreFailed"),
      );
    } finally {
      setUndoBusy(false);
    }
  }

  async function loadExplanationDetail(id: string) {
    setLoadingEntryId(id);
    setExpandError(null);

    try {
      const full = await fetchExplanationById(id);
      setExplanationCache((prev) => ({ ...prev, [id]: full }));
    } catch (err) {
      console.error("[HistoryPage] open failed:", err);
      setExpandError(
        err instanceof Error ? err.message : t("historyOpenFailed"),
      );
    } finally {
      setLoadingEntryId((current) => (current === id ? null : current));
    }
  }

  async function handleToggleEntry(item: LearningTrailItem) {
    // Accordion toggle: same entry closes
    if (expandedEntryId === item.id) {
      setExpandedEntryId(null);
      setExpandError(null);
      setLoadingEntryId(null);
      return;
    }

    setExpandedEntryId(item.id);
    setExpandError(null);

    // Reuse cached payload — no network
    if (explanationCache[item.id]) {
      setLoadingEntryId(null);
      return;
    }

    await loadExplanationDetail(item.id);
  }

  function goToPreviousPage() {
    if (currentPage <= 1 || listLoading) return;
    setCurrentPage((p) => Math.max(1, p - 1));
  }

  function goToNextPage() {
    if (listLoading || totalPages === 0 || currentPage >= totalPages) return;
    setCurrentPage((p) => p + 1);
  }

  async function executeDeleteOne(item: LearningTrailItem) {
    setDeleteBusy(true);
    setDeletingId(item.id);
    setActionError(null);

    const previousItems = items;
    const previousTotal = totalCount;
    const previousExpanded = expandedEntryId;
    const previousCache = explanationCache;

    // Optimistic removal
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    const nextCount = Math.max(0, previousTotal - 1);
    setTotalCount(nextCount);
    setTotalPages(nextCount === 0 ? 0 : Math.ceil(nextCount / PAGE_SIZE));
    if (expandedEntryId === item.id) {
      setExpandedEntryId(null);
    }
    setExplanationCache((cache) => {
      const next = { ...cache };
      delete next[item.id];
      return next;
    });

    try {
      await deleteExplanationById(item.id);
      setToast(t("historyDeleted"));
      setUndoItem(item);
      setPendingDelete(null);

      const nextTotalPages =
        nextCount === 0 ? 0 : Math.ceil(nextCount / PAGE_SIZE);

      // Last item on this page and not page 1 → step back
      if (
        previousItems.length <= 1 &&
        currentPage > 1 &&
        nextTotalPages < currentPage
      ) {
        setCurrentPage((page) => Math.max(1, page - 1));
      } else if (previousItems.length <= 1) {
        // Empty after delete on page 1 (or only page) — refresh empty accuracy
        await loadHistoryPage(currentPage);
      } else if (
        previousItems.length === PAGE_SIZE &&
        nextCount > (currentPage - 1) * PAGE_SIZE
      ) {
        // Fill the slot that opened on this page
        await loadHistoryPage(currentPage);
      }
    } catch (err) {
      console.error("[HistoryPage] delete failed:", err);
      setItems(previousItems);
      setTotalCount(previousTotal);
      setTotalPages(
        previousTotal === 0 ? 0 : Math.ceil(previousTotal / PAGE_SIZE),
      );
      setExpandedEntryId(previousExpanded);
      setExplanationCache(previousCache);
      setActionError(
        err instanceof Error ? err.message : t("historyDeleteFailed"),
      );
    } finally {
      setDeleteBusy(false);
      setDeletingId(null);
    }
  }

  async function executeClearAll() {
    setDeleteBusy(true);
    setActionError(null);

    const previousItems = items;
    const previousTotal = totalCount;
    const previousCache = explanationCache;

    setItems([]);
    setTotalCount(0);
    setTotalPages(0);
    setExpandedEntryId(null);
    setExplanationCache({});

    try {
      await deleteAllExplanations();
      setUndoItem(null);
      setToast(t("historyCleared"));
      setPendingDelete(null);
      setCurrentPage(1);
      await loadHistoryPage(1);
    } catch (err) {
      console.error("[HistoryPage] clear all failed:", err);
      setItems(previousItems);
      setTotalCount(previousTotal);
      setExplanationCache(previousCache);
      setActionError(
        err instanceof Error ? err.message : t("historyClearFailed"),
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || deleteBusy) return;
    if (pendingDelete.type === "one") {
      await executeDeleteOne(pendingDelete.item);
      return;
    }
    await executeClearAll();
  }

  const showPagination =
    !listLoading && !listError && totalCount > 0 && totalPages > 1;

  return (
    <div className="min-h-full cursor-default bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <Header
          trailing={
            <Link
              href="/"
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              {t("historyNewExplanation")}
            </Link>
          }
        />

        <main className="mt-12 flex flex-col gap-8 sm:mt-16 sm:gap-10">
          <section className="cursor-default">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {t("historyEyebrow")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {t("historyTitle")}
                </h1>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                  {t("historySubtitle")}
                </p>
              </div>
              {!listLoading && !listError && totalCount > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 text-sm"
                  disabled={deleteBusy}
                  onClick={() => {
                    setActionError(null);
                    setPendingDelete({ type: "all" });
                  }}
                >
                  {t("historyClearAll")}
                </Button>
              ) : null}
            </div>
          </section>

          {actionError ? (
            <p className="text-sm text-red-600" role="alert">
              {actionError}
            </p>
          ) : null}

          {toast || undoItem ? (
            <div
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground shadow-sm"
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
                  className="cursor-pointer font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {undoBusy ? "…" : t("historyUndo")}
                </button>
              ) : null}
            </div>
          ) : null}

          {listLoading ? (
            <Card role="status" aria-live="polite" className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                {t("historyLoadingEyebrow")}
              </p>
              <p className="text-[15px] text-muted">{t("historyLoading")}</p>
            </Card>
          ) : null}

          {!listLoading && listError ? (
            <Card role="alert" className="flex flex-col gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                {t("historyErrorEyebrow")}
              </p>
              <p className="text-[15px] leading-relaxed text-muted">
                {listError}
              </p>
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void loadHistoryPage(currentPage);
                  }}
                >
                  {t("retry")}
                </Button>
              </div>
            </Card>
          ) : null}

          {!listLoading && !listError && items.length === 0 ? (
            <Card className="border border-dashed border-border/80 shadow-none">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                {t("historyEmptyEyebrow")}
              </p>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground">
                {t("historyNoExplanations")}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {t("historyEmptyDescription")}
              </p>
              <div className="mt-5">
                <Link href="/">
                  <Button type="button">{t("historyCreateCta")}</Button>
                </Link>
              </div>
            </Card>
          ) : null}

          {!listLoading && !listError && items.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {items.map((item) => {
                const isExpanded = expandedEntryId === item.id;
                const cached = explanationCache[item.id];
                const isOpening = loadingEntryId === item.id;
                const isDeleting = deletingId === item.id;

                return (
                  <li key={item.id} className="flex flex-col gap-3">
                    <div
                      className={`relative w-full rounded-3xl border border-transparent bg-surface p-6 text-start shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] transition-[opacity,box-shadow] sm:p-8 ${
                        isExpanded
                          ? "ring-2 ring-primary/30"
                          : "hover:border-border"
                      } ${isDeleting ? "opacity-60" : ""}`}
                    >
                      <button
                        type="button"
                        aria-label={t("historyDelete")}
                        disabled={deleteBusy}
                        onClick={(event) => {
                          event.stopPropagation();
                          setActionError(null);
                          setPendingDelete({ type: "one", item });
                        }}
                        className="absolute end-4 top-4 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:end-5 sm:top-5"
                      >
                        {isDeleting ? (
                          <SpinnerIcon />
                        ) : (
                          <TrashIcon />
                        )}
                      </button>

                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        disabled={isDeleting}
                        onClick={() => {
                          void handleToggleEntry(item);
                        }}
                        className="w-full cursor-pointer pe-10 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                            {formatCreatedAt(
                              item.createdAt,
                              t("historyUnknownDate"),
                              language,
                            )}
                          </p>
                          {isExpanded ? (
                            <span className="me-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                              {t("historyViewing")}
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">
                          {item.concept}
                        </h2>
                        <p className="mt-1.5 text-sm text-muted">
                          {t("historyThrough")}{" "}
                          <span className="font-medium text-foreground/80">
                            {familiarLabel(item.familiarTopics, language)}
                          </span>
                        </p>
                        {item.preview ? (
                          <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-muted">
                            {item.preview}
                          </p>
                        ) : null}
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="flex flex-col gap-3 ps-0 sm:ps-2">
                        {isOpening && !cached ? (
                          <Card role="status" aria-live="polite">
                            <p className="text-[15px] text-muted">
                              {t("historyOpening")}
                            </p>
                          </Card>
                        ) : null}

                        {expandError && !cached && !isOpening ? (
                          <Card role="alert" className="flex flex-col gap-3">
                            <p className="text-[15px] text-muted">
                              {expandError}
                            </p>
                            <Button
                              type="button"
                              variant="secondary"
                              className="w-fit"
                              onClick={() => {
                                void loadExplanationDetail(item.id);
                              }}
                            >
                              {t("retry")}
                            </Button>
                          </Card>
                        ) : null}

                        {cached && !isOpening ? (
                          <ExplanationCard
                            data={cached}
                            showRefinementActions={false}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}

          {showPagination ? (
            <nav
              className="flex flex-col items-center justify-between gap-3 sm:flex-row"
              aria-label="Pagination"
            >
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage <= 1 || listLoading || deleteBusy}
                onClick={goToPreviousPage}
              >
                {t("historyPrevious")}
              </Button>
              <p className="text-sm font-medium text-muted" aria-live="polite">
                {formatPageLabel(
                  t("historyPageOf"),
                  currentPage,
                  totalPages,
                )}
              </p>
              <Button
                type="button"
                variant="secondary"
                disabled={
                  currentPage >= totalPages || listLoading || deleteBusy
                }
                onClick={goToNextPage}
              >
                {t("historyNext")}
              </Button>
            </nav>
          ) : null}
        </main>
      </div>

      <ConfirmDialog
        open={pendingDelete != null}
        title={
          pendingDelete?.type === "all"
            ? t("historyClearConfirmTitle")
            : t("historyDeleteConfirmTitle")
        }
        description={
          pendingDelete?.type === "all"
            ? t("historyClearConfirmBody")
            : t("historyDeleteConfirmBody")
        }
        confirmLabel={
          pendingDelete?.type === "all"
            ? t("historyClearConfirm")
            : t("historyDeleteConfirm")
        }
        cancelLabel={t("historyCancel")}
        danger
        busy={deleteBusy}
        onCancel={() => {
          if (!deleteBusy) setPendingDelete(null);
        }}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
}
