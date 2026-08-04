"use client";

import { useLanguage } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  function select(next: Language) {
    if (next === language) return;
    setLanguage(next);
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-xs font-semibold"
      role="group"
      aria-label={t("languageSwitcherLabel")}
    >
      <button
        type="button"
        onClick={() => select("en")}
        className={`cursor-pointer rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
          language === "en"
            ? "bg-primary text-white"
            : "text-muted hover:text-foreground"
        }`}
        aria-pressed={language === "en"}
      >
        {t("languageEn")}
      </button>
      <button
        type="button"
        onClick={() => select("ar")}
        className={`cursor-pointer rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
          language === "ar"
            ? "bg-primary text-white"
            : "text-muted hover:text-foreground"
        }`}
        aria-pressed={language === "ar"}
      >
        {t("languageAr")}
      </button>
    </div>
  );
}
