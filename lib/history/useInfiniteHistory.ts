"use client";

/**
 * Infinite history list for sidebar: page load, append, soft-delete helpers.
 */

import { useCallback, useRef, useState } from "react";
import {
  deleteExplanationById,
  fetchLearningTrailPage,
  restoreExplanationById,
} from "@/lib/api/explanations";
import type { Explanation, LearningTrailItem } from "@/types/explanation";
import { generationModeToDepth } from "@/lib/history/display";

export const HISTORY_PAGE_SIZE = 5;

export function explanationToTrailItem(
  explanation: Explanation,
  index = 0,
): LearningTrailItem | null {
  if (!explanation.id) return null;
  const analogy =
    explanation.familiarTopics.find((t) => t.trim())?.trim() || undefined;
  const generationMode = explanation.generationMode ?? "another";
  return {
    id: explanation.id,
    concept: explanation.concept,
    analogy,
    depth: generationModeToDepth(generationMode),
    generationMode,
    familiarTopics: explanation.familiarTopics,
    createdAt: explanation.createdAt ?? new Date().toISOString(),
    preview: explanation.analogyTitle,
    label: analogy
      ? `${explanation.concept} — ${analogy}`
      : explanation.concept,
    icon: index % 2 === 0 ? "heart" : "trend",
  };
}

export function useInfiniteHistory() {
  const [items, setItems] = useState<LearningTrailItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLock = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);

  const resetAndLoad = useCallback(async () => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setItems([]);
    setPage(0);
    pageRef.current = 0;
    setHasMore(true);
    hasMoreRef.current = true;

    try {
      const { items: pageItems, pagination } = await fetchLearningTrailPage({
        limit: HISTORY_PAGE_SIZE,
        page: 1,
      });
      setItems(pageItems);
      setTotal(pagination.total);
      pageRef.current = 1;
      setPage(1);
      const more =
        pagination.totalPages > 0 && pagination.page < pagination.totalPages;
      hasMoreRef.current = more;
      setHasMore(more);
    } catch (err) {
      console.error("[useInfiniteHistory] initial load failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t load your learning trail right now.",
      );
      setItems([]);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      loadingRef.current = false;
      setLoading(false);
      fetchLock.current = false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (fetchLock.current) return;
    if (!hasMoreRef.current) return;
    if (loadingRef.current || loadingMoreRef.current) return;

    fetchLock.current = true;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);

    const nextPage = pageRef.current + 1;

    try {
      const { items: pageItems, pagination } = await fetchLearningTrailPage({
        limit: HISTORY_PAGE_SIZE,
        page: nextPage,
      });

      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        const appended = pageItems.filter((i) => !seen.has(i.id));
        return [...prev, ...appended];
      });
      setTotal(pagination.total);
      pageRef.current = nextPage;
      setPage(nextPage);
      const more =
        pagination.totalPages > 0 && pagination.page < pagination.totalPages;
      hasMoreRef.current = more;
      setHasMore(more);
    } catch (err) {
      console.error("[useInfiniteHistory] load more failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t load your learning trail right now.",
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
      fetchLock.current = false;
    }
  }, []);

  const prependItem = useCallback((item: LearningTrailItem) => {
    setItems((prev) => {
      const without = prev.filter((entry) => entry.id !== item.id);
      return [item, ...without];
    });
    setTotal((n) => n + 1);
  }, []);

  const removeItemOptimistic = useCallback((id: string) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
    setTotal((n) => Math.max(0, n - 1));
  }, []);

  const softDeleteItem = useCallback(
    async (id: string) => {
      removeItemOptimistic(id);
      await deleteExplanationById(id);
    },
    [removeItemOptimistic],
  );

  const restoreItem = useCallback(
    async (item: LearningTrailItem) => {
      await restoreExplanationById(item.id);
      prependItem(item);
    },
    [prependItem],
  );

  return {
    items,
    page,
    hasMore,
    total,
    loading,
    loadingMore,
    error,
    resetAndLoad,
    loadMore,
    prependItem,
    removeItemOptimistic,
    softDeleteItem,
    restoreItem,
  };
}
