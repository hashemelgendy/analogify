"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchExplanationById,
  fetchLearningTrail,
} from "@/lib/api/explanations";
import type { Explanation, LearningTrailItem } from "@/types/explanation";
import { ExplanationCard } from "./ExplanationCard";
import { Header } from "./Header";
import { Button, Card } from "./ui";

const HISTORY_LIMIT = 50;

function formatCreatedAt(value?: string): string {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function familiarLabel(topics: string[]): string {
  if (topics.length === 0) return "—";
  return topics.join(", ");
}

export function HistoryPage() {
  const [items, setItems] = useState<LearningTrailItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Explanation | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setListLoading(true);
    setListError(null);

    try {
      const data = await fetchLearningTrail(HISTORY_LIMIT);
      setItems(data);
    } catch (err) {
      console.error("[HistoryPage] load failed:", err);
      setListError(
        err instanceof Error
          ? err.message
          : "We couldn’t load your saved explanations.",
      );
      setItems([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function openExplanation(item: LearningTrailItem) {
    setDetailLoading(true);
    setDetailError(null);
    setSelected(null);

    try {
      // DB-only path — no OpenAI regeneration
      const full = await fetchExplanationById(item.id);
      setSelected(full);
      document
        .getElementById("history-detail")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error("[HistoryPage] open failed:", err);
      setDetailError(
        err instanceof Error
          ? err.message
          : "We couldn’t open that explanation.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="min-h-full cursor-default bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <Header
          trailing={
            <Link
              href="/"
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              ← New explanation
            </Link>
          }
        />

        <main className="mt-12 flex flex-col gap-8 sm:mt-16 sm:gap-10">
          <section className="cursor-default">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Your learning trail
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Saved explanations
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
              Revisit analogies you&apos;ve created — each one stays tied to
              this browser until you sign in later.
            </p>
          </section>

          {listLoading ? (
            <Card role="status" aria-live="polite" className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                Loading
              </p>
              <p className="text-[15px] text-muted">
                Loading your saved explanations…
              </p>
            </Card>
          ) : null}

          {!listLoading && listError ? (
            <Card role="alert" className="flex flex-col gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                Something went wrong
              </p>
              <p className="text-[15px] leading-relaxed text-muted">
                {listError}
              </p>
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void loadHistory();
                  }}
                >
                  Try again
                </Button>
              </div>
            </Card>
          ) : null}

          {!listLoading && !listError && items.length === 0 ? (
            <Card className="border border-dashed border-border/80 shadow-none">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                Empty trail
              </p>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground">
                Your learning trail is empty. Create your first explanation!
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Head home, pick a concept and a familiar world, then save your
                first “aha!” moment here.
              </p>
              <div className="mt-5">
                <Link href="/">
                  <Button type="button">Create an explanation</Button>
                </Link>
              </div>
            </Card>
          ) : null}

          {!listLoading && !listError && items.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {items.map((item) => {
                const isActive = selected?.id === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        void openExplanation(item);
                      }}
                      className={`w-full cursor-pointer rounded-3xl border border-transparent bg-surface p-6 text-left shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-8 ${
                        isActive ? "ring-2 ring-primary/30" : "hover:border-border"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-light">
                          {formatCreatedAt(item.createdAt)}
                        </p>
                        {isActive ? (
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                            Viewing
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">
                        {item.concept}
                      </h2>
                      <p className="mt-1.5 text-sm text-muted">
                        Through{" "}
                        <span className="font-medium text-foreground/80">
                          {familiarLabel(item.familiarTopics)}
                        </span>
                      </p>
                      {item.preview ? (
                        <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-muted">
                          {item.preview}
                        </p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div id="history-detail" className="flex flex-col gap-4">
            {detailLoading ? (
              <Card role="status" aria-live="polite">
                <p className="text-[15px] text-muted">
                  Opening saved explanation…
                </p>
              </Card>
            ) : null}

            {detailError ? (
              <Card role="alert" className="flex flex-col gap-3">
                <p className="text-[15px] text-muted">{detailError}</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-fit"
                  onClick={() => setDetailError(null)}
                >
                  Dismiss
                </Button>
              </Card>
            ) : null}

            {selected && !detailLoading ? (
              <ExplanationCard
                data={selected}
                showRefinementActions={false}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
