"use client";

import { useState } from "react";
import { Button, Card, Input } from "./ui";
import type { FeedbackPayload, FeedbackRating } from "@/types/explanation";

interface FeedbackCardProps {
  concept?: string;
  explanationId?: string;
  title?: string;
  subtitle?: string;
  commentPlaceholder?: string;
  /** Blocks interaction while a parent request is in flight */
  disabled?: boolean;
  /**
   * Called only on explicit "Submit Feedback" click.
   * Resolve to mark submitted; reject/throw to leave form editable.
   */
  onSubmit?: (payload: FeedbackPayload) => void | Promise<void>;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.4 6.6 20.3l1-6.1-4.4-4.3 6.1-.9L12 3.5z"
      />
    </svg>
  );
}

export function FeedbackCard({
  concept = "",
  explanationId,
  title = "Did this explanation help you understand?",
  subtitle = "Your feedback helps Anuminate learn how you learn.",
  commentPlaceholder = "Anything to improve? (optional)",
  disabled = false,
  onSubmit,
}: FeedbackCardProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const locked = disabled || isSubmitting || isSubmitted;

  function handleSelectRating(value: FeedbackRating) {
    if (locked) return;
    setRating(value);
    setValidationError(null);
  }

  async function handleSubmit() {
    if (locked) return;

    if (rating < 1) {
      setValidationError("Please select a star rating before submitting.");
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      await onSubmit?.({
        explanationId,
        concept,
        rating: rating as FeedbackRating,
        comment,
      });
      setIsSubmitted(true);
    } catch {
      // Parent already surfaces API errors; keep form editable for another try
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="cursor-default">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>

      <div
        className="flex items-center gap-1 text-primary"
        role="radiogroup"
        aria-label="Rating"
      >
        {([1, 2, 3, 4, 5] as const).map((value) => {
          const active = (hoverRating || rating) >= value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              disabled={locked}
              onMouseEnter={() => {
                if (!locked) setHoverRating(value);
              }}
              onMouseLeave={() => setHoverRating(0)}
              onFocus={() => {
                if (!locked) setHoverRating(value);
              }}
              onBlur={() => setHoverRating(0)}
              onClick={() => handleSelectRating(value)}
              className="cursor-pointer rounded-md p-0.5 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <StarIcon filled={active} />
            </button>
          );
        })}
      </div>

      <Input
        id="feedback-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={commentPlaceholder}
        aria-label="Optional feedback"
        disabled={locked}
      />

      {validationError ? (
        <p className="text-sm text-muted" role="alert">
          {validationError}
        </p>
      ) : null}

      {isSubmitted ? (
        <p className="text-sm font-medium text-primary" role="status">
          Thanks — your feedback was submitted.
        </p>
      ) : (
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={locked}
          >
            {isSubmitting ? "Submitting…" : "Submit Feedback"}
          </Button>
        </div>
      )}
    </Card>
  );
}
