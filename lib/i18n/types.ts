export type Language = "en" | "ar";

export const LANGUAGES: Language[] = ["en", "ar"];

export const LANGUAGE_STORAGE_KEY = "anuminate_language";

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "ar";
}

export function languageToDir(language: Language): "ltr" | "rtl" {
  return language === "ar" ? "rtl" : "ltr";
}
