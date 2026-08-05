"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n";

type SavePromptProps = {
  /** Generations completed this browser (local counter) */
  generationCount: number;
};

/** Soft save prompt after a few guest generations */
const PROMPT_AFTER = 2;

/**
 * Soft nudge after a few guest generations — never blocks the product.
 */
export function SaveExplanationsPrompt({ generationCount }: SavePromptProps) {
  const { t } = useLanguage();
  const { user, isConfigured, isLoading, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!isConfigured || isLoading || user) return null;
  if (generationCount < PROMPT_AFTER) return null;

  return (
    <div
      role="status"
      className="rounded-xl border border-border/80 bg-surface/80 px-4 py-3 text-sm text-foreground"
    >
      <p className="text-muted-light">{t("authSavePrompt")}</p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void signInWithGoogle().catch(() => setBusy(false));
        }}
        className="mt-2 cursor-pointer text-sm font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-60"
      >
        {busy ? t("authSigningIn") : t("authContinueGoogle")}
      </button>
    </div>
  );
}
