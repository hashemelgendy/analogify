"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n";

/**
 * Header auth controls — Google only. Never blocks guest usage.
 */
export function AuthControls() {
  const { t } = useLanguage();
  const { user, isLoading, isConfigured, isClaiming, signInWithGoogle, signOut } =
    useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConfigured) {
    return null;
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("[AuthControls] Google sign-in failed:", err);
      setError(t("authSignInFailed"));
      setBusy(false);
    }
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

  if (isLoading) {
    return (
      <span className="hidden text-xs text-muted-light sm:inline">
        {t("authLoading")}
      </span>
    );
  }

  if (user) {
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
            className="cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-elevated disabled:opacity-60"
          >
            {t("authSignOut")}
          </button>
        </div>
        {error ? (
          <p className="max-w-[12rem] text-end text-[11px] text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => {
          void handleGoogle();
        }}
        disabled={busy}
        className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60 sm:text-sm"
      >
        {busy ? t("authSigningIn") : t("authContinueGoogle")}
      </button>
      {error ? (
        <p className="max-w-[12rem] text-end text-[11px] text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
