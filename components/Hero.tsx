"use client";

import { useLanguage } from "@/lib/i18n";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-2xl cursor-default text-center">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        {t("heroEyebrow")}
      </p>
      <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl sm:leading-[1.2]">
        {t("heroTitle")}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-pretty text-[15px] leading-relaxed text-muted sm:text-base">
        {t("heroSubtitle")}
      </p>
    </section>
  );
}
