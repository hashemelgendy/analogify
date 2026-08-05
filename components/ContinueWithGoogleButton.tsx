"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLanguage } from "@/lib/i18n";
import { GoogleGIcon } from "./GoogleGIcon";

type ContinueWithGoogleButtonProps = {
  /** Show muted helper under the button (default true) */
  showHelper?: boolean;
  className?: string;
  /** Optional form context: keep type="button" so it never submits a parent form */
  disabled?: boolean;
};

/**
 * Secondary Google OAuth CTA. Reuses useAuth().signInWithGoogle.
 * Hidden when signed in, loading, or Supabase auth is not configured.
 */
export function ContinueWithGoogleButton({
  showHelper = true,
  className = "",
  disabled = false,
}: ContinueWithGoogleButtonProps) {
  const { t } = useLanguage();
  const { user, isLoading, isConfigured, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConfigured || isLoading || user) {
    return null;
  }

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("[ContinueWithGoogleButton] sign-in failed:", err);
      setError(t("authSignInFailed"));
      setBusy(false);
    }
  }

  const isDisabled = busy || disabled;
  const label = busy ? t("authSigningIn") : t("authContinueGoogle");

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`.trim()}>
      <button
        type="button"
        onClick={() => {
          void handleClick();
        }}
        disabled={isDisabled}
        aria-label={t("authContinueGoogle")}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-border bg-white px-5 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-[background-color,box-shadow,border-color] hover:border-border hover:bg-neutral-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleGIcon />
        <span>{label}</span>
      </button>

      {showHelper ? (
        <p className="text-center text-xs text-muted-light sm:text-start">
          {t("authSaveHelper")}
        </p>
      ) : null}

      {error ? (
        <p className="text-center text-xs text-red-600 sm:text-start" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
