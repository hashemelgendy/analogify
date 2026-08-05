"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import type { LearningTrailItem } from "@/types/explanation";
import { HistorySidebarItem } from "./HistorySidebarItem";

const SCROLL_THRESHOLD_PX = 80;
const SCROLL_DEBOUNCE_MS = 120;

type HistorySidebarProps = {
  items: LearningTrailItem[];
  activeId: string | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  /** Desktop collapse (icons only) */
  collapsed: boolean;
  /** Mobile drawer open */
  mobileOpen: boolean;
  deletingId: string | null;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
  onSelect: (item: LearningTrailItem) => void;
  onDelete: (item: LearningTrailItem) => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

/**
 * Left history sidebar: independent scroll + infinite load.
 * Desktop: collapsible rail. Mobile: drawer overlay.
 */
export function HistorySidebar({
  items,
  activeId,
  loading,
  loadingMore,
  hasMore,
  error,
  collapsed,
  mobileOpen,
  deletingId,
  onCloseMobile,
  onToggleCollapse,
  onSelect,
  onDelete,
  onLoadMore,
  onRetry,
}: HistorySidebarProps) {
  const { t } = useLanguage();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const makeScrollHandler = useCallback(
    (listEl: HTMLDivElement | null) => {
      if (!listEl) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (loadingMore || loading || !hasMore) return;
        const remaining =
          listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight;
        if (remaining < SCROLL_THRESHOLD_PX) {
          onLoadMore();
        }
      }, SCROLL_DEBOUNCE_MS);
    },
    [hasMore, loading, loadingMore, onLoadMore],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function handleSelect(item: LearningTrailItem) {
    onSelect(item);
    onCloseMobile();
  }

  function renderPanel(opts: {
    forceExpanded: boolean;
    showMobileClose: boolean;
    showDesktopCollapse: boolean;
  }) {
    const isCollapsed = opts.forceExpanded ? false : collapsed;

    return (
      <aside
        className={`flex h-full flex-col border-e border-border bg-surface transition-[width] duration-200 ease-out ${
          isCollapsed ? "w-[4.25rem]" : "w-[280px]"
        } ${opts.forceExpanded ? "!w-full max-w-[280px]" : ""}`}
        aria-label={t("sidebarTitle")}
      >
        <div
          className={`flex shrink-0 items-center gap-2 border-b border-border px-3 py-3 ${
            isCollapsed ? "flex-col" : "justify-between"
          }`}
        >
          {!isCollapsed ? (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                {t("sidebarEyebrow")}
              </p>
              <h2 className="truncate text-sm font-bold text-foreground">
                {t("sidebarTitle")}
              </h2>
            </div>
          ) : null}

          {opts.showDesktopCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-input-bg hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={
                isCollapsed ? t("sidebarExpand") : t("sidebarCollapse")
              }
              title={isCollapsed ? t("sidebarExpand") : t("sidebarCollapse")}
            >
              <CollapseIcon collapsed={isCollapsed} />
            </button>
          ) : null}

          {opts.showMobileClose ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="ms-auto inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={t("sidebarClose")}
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>

        <div
          onScroll={(event) => {
            makeScrollHandler(event.currentTarget);
          }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
        >
          {loading ? (
            <p className="px-2 py-4 text-sm text-muted" role="status">
              {t("trailLoading")}
            </p>
          ) : null}

          {!loading && error ? (
            <div className="flex flex-col gap-2 px-2 py-4" role="alert">
              <p className="text-sm text-muted">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="w-fit cursor-pointer text-sm font-medium text-primary hover:underline"
              >
                {t("trailTryAgain")}
              </button>
            </div>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-light">
              {t("historyNoExplanations")}
            </p>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <ul
              className={`flex flex-col ${
                isCollapsed ? "items-center gap-2" : "gap-0.5"
              }`}
            >
              {items.map((item) => (
                <li key={item.id} className="w-full">
                  <HistorySidebarItem
                    item={item}
                    active={activeId === item.id}
                    collapsed={isCollapsed}
                    deleting={deletingId === item.id}
                    onSelect={handleSelect}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {loadingMore ? (
            <p
              className="px-2 py-3 text-center text-xs text-muted-light"
              role="status"
            >
              {t("sidebarLoadingMore")}
            </p>
          ) : null}

          {!loading && !loadingMore && !hasMore && items.length > 0 ? (
            <p className="px-2 py-3 text-center text-[11px] text-muted-light">
              {t("sidebarEnd")}
            </p>
          ) : null}
        </div>
      </aside>
    );
  }

  return (
    <>
      <div className="hidden h-full shrink-0 md:block">
        {renderPanel({
          forceExpanded: false,
          showMobileClose: false,
          showDesktopCollapse: true,
        })}
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("sidebarTitle")}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-foreground/40"
            aria-label={t("sidebarClose")}
            onClick={onCloseMobile}
          />
          <div className="absolute inset-y-0 start-0 z-10 h-full w-[min(280px,88vw)] shadow-xl">
            {renderPanel({
              forceExpanded: true,
              showMobileClose: true,
              showDesktopCollapse: false,
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 transition-transform duration-200 ${
        collapsed ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.5 4.5 7 10l5.5 5.5"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}
