"use client";

import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ContinueWithGoogleButton } from "./ContinueWithGoogleButton";

type SavePromptProps = {
  /** Generations completed this browser (local counter) */
  generationCount: number;
};

/** Soft save prompt after a few guest generations */
const PROMPT_AFTER = 2;

/**
 * Soft nudge after a few guest generations — never blocks the product.
 * Reuses the same Google CTA pattern as under Create Explanation.
 */
export function SaveExplanationsPrompt({ generationCount }: SavePromptProps) {
  const { t } = useLanguage();
  const { user, isConfigured, isLoading } = useAuth();

  if (!isConfigured || isLoading || user) return null;
  if (generationCount < PROMPT_AFTER) return null;

  return (
    <div
      role="status"
      className="rounded-xl border border-border/80 bg-surface/80 px-4 py-4"
    >
      <p className="mb-3 text-sm text-muted-light">{t("authSavePrompt")}</p>
      <ContinueWithGoogleButton showHelper={false} />
    </div>
  );
}
