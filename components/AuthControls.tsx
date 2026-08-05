"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n";

/**
 * Header auth: sign-out only when logged in.
 * Guest "Continue with Google" lives under Create Explanation.
 */
export function AuthControls() {
  const { t } = useLanguage();
  const { user, isLoading, isConfigured, isClaiming, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConfigured || isLoading || !user) {
    return null;
  }

  async function handleSignOut() {
    setBusy(true);
    setError(null);
    try {
      await signOut();
    } catch (err) {
      console.error("[AuthControls] sign-out failed:", err);
      setError(t("authSignOutFailed"));
    } finally {
      setBusy(false);
    }
  }

  const label =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    t("authSignedIn");

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <span
          className="hidden max-w-[9rem] truncate text-xs text-muted-light sm:inline"
          title={user.email ?? undefined}
        >
          {isClaiming ? t("authMergingHistory") : label}
        </span>
        <button
          type="button"
          onClick={() => {
            void handleSignOut();
          }}
          disabled={busy}
          className="cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {t("authSignOut")}
        </button>
      </div>
      {error ? (
        <p className="max-w-[12rem] text-end text-[11px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
