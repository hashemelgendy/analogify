"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchExplanationById,
  fetchLearningTrailPage,
} from "@/lib/api/explanations";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n";
import type { Explanation, LearningTrailItem } from "@/types/explanation";
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("historyTitle")}
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
              {t("historySubtitle")}
            </p>
          </section>

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
                {t("historyEmptyTitle")}
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

                return (
                  <li key={item.id} className="flex flex-col gap-3">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => {
                        void handleToggleEntry(item);
                      }}
                      className={`w-full cursor-pointer rounded-3xl border border-transparent bg-surface p-6 text-start shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-8 ${
                        isExpanded
                          ? "ring-2 ring-primary/30"
                          : "hover:border-border"
                      }`}
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
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
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
                disabled={currentPage <= 1 || listLoading}
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
                disabled={currentPage >= totalPages || listLoading}
                onClick={goToNextPage}
              >
                {t("historyNext")}
              </Button>
            </nav>
          ) : null}
        </main>
      </div>
    </div>
  );
}
