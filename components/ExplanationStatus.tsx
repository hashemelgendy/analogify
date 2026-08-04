"use client";

import { useLanguage } from "@/lib/i18n";
import { Button, Card } from "./ui";

interface ExplanationEmptyStateProps {
  title?: string;
  description?: string;
}

/** Clean initial state when no explanation has been generated yet. */
export function ExplanationEmptyState({
  title,
  description,
}: ExplanationEmptyStateProps) {
  const { t } = useLanguage();

  return (
    <Card className="border border-dashed border-border/80 bg-surface/80 text-center shadow-none">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        {t("emptyEyebrow")}
      </p>
      <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {title ?? t("emptyTitle")}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        {description ?? t("emptyDescription")}
      </p>
    </Card>
  );
}

interface ExplanationLoadingStateProps {
  message?: string;
  detail?: string;
}

/** Polished loading card while /api/explain is in flight. */
export function ExplanationLoadingState({
  message,
  detail,
}: ExplanationLoadingStateProps) {
  const { t } = useLanguage();

  return (
    <Card
      className="flex flex-col gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        <span
          className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
          aria-hidden
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          {t("loadingEyebrow")}
        </p>
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {message ?? t("loadingCrafting")}
      </h2>
      <p className="text-[15px] leading-relaxed text-muted">
        {detail ?? t("loadingCraftingDetail")}
      </p>
      <div className="space-y-2.5" aria-hidden>
        <div className="h-3 w-full rounded-full bg-input-bg" />
        <div className="h-3 w-11/12 rounded-full bg-input-bg" />
        <div className="h-3 w-4/5 rounded-full bg-input-bg" />
      </div>
    </Card>
  );
}

interface ExplanationErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

/** Error card with retry — same card/button language as the rest of the app. */
export function ExplanationErrorState({
  message,
  onRetry,
  isRetrying = false,
}: ExplanationErrorStateProps) {
  const { t } = useLanguage();

  return (
    <Card className="flex flex-col gap-4" role="alert">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        {t("errorEyebrow")}
      </p>
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {t("errorTitle")}
      </h2>
      <p className="text-[15px] leading-relaxed text-muted">{message}</p>
      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? t("retrying") : t("retry")}
        </Button>
      </div>
    </Card>
  );
}
