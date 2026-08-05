"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import type { LearningTrailItem } from "@/types/explanation";

type HistorySidebarItemProps = {
  item: LearningTrailItem;
  active: boolean;
  collapsed: boolean;
  deleting: boolean;
  onSelect: (item: LearningTrailItem) => void;
  onDelete: (item: LearningTrailItem) => void;
};

function formatTime(
  value: string | undefined,
  unknownLabel: string,
  language: string,
): string {
  if (!value) return unknownLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return unknownLabel;
  return date.toLocaleDateString(language === "ar" ? "ar" : "en", {
    month: "short",
    day: "numeric",
  });
}

function truncate(text: string, max = 48): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/**
 * Single sidebar history row with kebab menu (delete).
 */
export function HistorySidebarItem({
  item,
  active,
  collapsed,
  deleting,
  onSelect,
  onDelete,
}: HistorySidebarItemProps) {
  const { language, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const title = truncate(item.concept || item.label || t("historyNoExplanations"));
  const time = formatTime(item.createdAt, t("historyUnknownDate"), language);

  if (collapsed) {
    return (
      <button
        type="button"
        title={title}
        aria-current={active ? "true" : undefined}
        disabled={deleting}
        onClick={() => onSelect(item)}
        className={`mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          active
            ? "bg-primary text-white"
            : "bg-input-bg text-muted hover:bg-border/80 hover:text-foreground"
        } ${deleting ? "opacity-50" : ""}`}
      >
        {(item.concept || "?").slice(0, 1).toUpperCase()}
      </button>
    );
  }

  return (
    <div
      className={`group relative flex items-stretch gap-0.5 rounded-xl transition-colors ${
        active ? "bg-primary-soft" : "hover:bg-input-bg"
      } ${deleting ? "opacity-55" : ""}`}
    >
      <button
        type="button"
        aria-current={active ? "true" : undefined}
        disabled={deleting}
        onClick={() => onSelect(item)}
        className="min-w-0 flex-1 cursor-pointer rounded-xl px-3 py-2.5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <p
          className={`truncate text-sm font-medium ${
            active ? "text-primary" : "text-foreground"
          }`}
        >
          {title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-light">{time}</p>
      </button>

      <div className="relative flex shrink-0 items-start pe-1 pt-1.5" ref={menuRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={t("sidebarItemMenu")}
          disabled={deleting}
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((open) => !open);
          }}
          className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-opacity hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:opacity-0 sm:group-hover:opacity-100 ${
            menuOpen || active ? "opacity-100" : ""
          }`}
        >
          <MoreIcon />
        </button>

        {menuOpen ? (
          <div
            id={menuId}
            role="menu"
            className="absolute end-0 top-9 z-20 min-w-[10rem] rounded-xl border border-border bg-surface py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-start text-sm text-red-600 transition-colors hover:bg-red-50"
              onClick={() => {
                setMenuOpen(false);
                onDelete(item);
              }}
            >
              <TrashIcon />
              {t("historyDelete")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
      <circle cx="10" cy="4.5" r="1.4" />
      <circle cx="10" cy="10" r="1.4" />
      <circle cx="10" cy="15.5" r="1.4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 6h11M8 6V4.75A1.25 1.25 0 019.25 3.5h1.5A1.25 1.25 0 0112 4.75V6m2.5 0v9.25A1.25 1.25 0 0113.25 16.5h-6.5A1.25 1.25 0 015.5 15.25V6"
      />
    </svg>
  );
}
