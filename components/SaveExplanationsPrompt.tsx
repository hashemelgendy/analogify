"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  isSavePromptDismissed,
  markSavePromptDismissed,
} from "@/lib/guest/client-storage";
import { useLanguage } from "@/lib/i18n";
import { ContinueWithGoogleButton } from "./ContinueWithGoogleButton";

type SavePromptProps = {
  /** Generations completed this browser (local counter) */
  generationCount: number;
};

/** Soft save prompt after a few guest generations */
const PROMPT_AFTER = 2;

/**
 * One-time modal after a few guest generations — not a permanent page section.
 * Dismiss (or complete OAuth) hides it via localStorage.
 */
export function SaveExplanationsPrompt({ generationCount }: SavePromptProps) {
  const { t } = useLanguage();
  const { user, isConfigured, isLoading } = useAuth();
  const titleId = useId();
  const descriptionId = useId();
  const dismissRef = useRef<HTMLButtonElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Client-only dismissed flag so SSR/hydration stay empty.
    queueMicrotask(() => {
      setDismissed(isSavePromptDismissed());
      setHydrated(true);
    });
  }, []);

  const open =
    hydrated &&
    isConfigured &&
    !isLoading &&
    !user &&
    !dismissed &&
    generationCount >= PROMPT_AFTER;

  useEffect(() => {
    if (!open) return;
    dismissRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        markSavePromptDismissed();
        setDismissed(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleDismiss() {
    markSavePromptDismissed();
    setDismissed(true);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      role="presentation"
      onClick={handleDismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id={titleId}
          className="text-lg font-bold tracking-tight text-foreground"
        >
          {t("authSavePromptTitle")}
        </h2>
        <p
          id={descriptionId}
          className="mt-2 text-[15px] leading-relaxed text-muted"
        >
          {t("authSavePrompt")}
        </p>

        <div className="mt-5">
          <ContinueWithGoogleButton showHelper={false} />
        </div>

        <button
          ref={dismissRef}
          type="button"
          onClick={handleDismiss}
          className="mt-4 w-full cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-input-bg hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {t("authSavePromptDismiss")}
        </button>
      </div>
    </div>
  );
}
