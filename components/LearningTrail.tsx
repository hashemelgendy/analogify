"use client";

import { Card } from "./ui";
import type { LearningTrailItem } from "@/types/explanation";

export type { LearningTrailItem };

interface LearningTrailProps {
  items: LearningTrailItem[];
  isLoading?: boolean;
  error?: string | null;
  activeId?: string | null;
  onSelect?: (item: LearningTrailItem) => void;
  onRetry?: () => void;
  heading?: string;
  eyebrow?: string;
  viewAllLabel?: string;
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0 text-white/90"
      aria-hidden
    >
      <path d="M10 17.2s-5.8-3.6-7.6-6.5C1 8.3 1.6 5.4 4.2 4.5c1.6-.6 3.3 0 4.2 1.3.9-1.3 2.6-1.9 4.2-1.3 2.6.9 3.2 3.8 1.8 6.2-1.8 2.9-7.4 6.5-7.4 6.5z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 shrink-0 text-white/90"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 15L15 5M8 5h7v7"
      />
    </svg>
  );
}

export function LearningTrail({
  items,
  isLoading = false,
  error = null,
  activeId = null,
  onSelect,
  onRetry,
  eyebrow = "Your learning trail",
  heading = "Keep your best “aha!” moments close.",
  viewAllLabel = "View saved explanations →",
}: LearningTrailProps) {
  return (
    <Card variant="dark" className="flex flex-col gap-5" id="history">
      <div className="cursor-default">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-muted">
          {eyebrow}
        </p>
        <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {heading}
        </h3>
      </div>

      {isLoading ? (
        <p
          className="text-[15px] text-white/70"
          role="status"
          aria-live="polite"
        >
          Loading your learning trail…
        </p>
      ) : null}

      {!isLoading && error ? (
        <div className="flex flex-col gap-3" role="alert">
          <p className="text-[15px] text-white/80">{error}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex w-fit cursor-pointer text-sm font-medium text-primary-muted transition-colors hover:text-white"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <p className="text-[15px] text-white/70">
          Your saved explanations will show up here after you create one.
        </p>
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <ul className="flex flex-col gap-3.5">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(item)}
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-xl text-left text-[15px] text-white/95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-muted focus-visible:ring-offset-2 focus-visible:ring-offset-trail ${
                    isActive
                      ? "bg-white/10 px-3 py-2"
                      : "px-0 py-0 hover:text-white"
                  }`}
                >
                  {item.icon === "heart" ? <HeartIcon /> : <TrendIcon />}
                  <span className="min-w-0 flex-1">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <span className="mt-1 inline-flex w-fit items-center text-sm font-medium text-primary-muted">
        {viewAllLabel}
      </span>
    </Card>
  );
}
