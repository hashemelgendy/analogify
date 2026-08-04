"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SUGGESTED_TOPIC_IDS,
  t as translate,
  translateTopic,
  type SuggestedTopicId,
  type TranslationKey,
} from "@/lib/i18n/translations";
import {
  isLanguage,
  LANGUAGE_STORAGE_KEY,
  languageToDir,
  type Language,
} from "@/lib/i18n/types";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  dir: "ltr" | "rtl";
  t: (key: TranslationKey) => string;
  topicLabel: (topicId: SuggestedTopicId) => string;
  suggestedTopicIds: readonly SuggestedTopicId[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(raw)) return raw;
  } catch {
    // ignore storage access errors
  }
  return "en";
}

function applyDocumentLanguage(language: Language) {
  if (typeof document === "undefined") return;
  const dir = languageToDir(language);
  document.documentElement.lang = language;
  document.documentElement.dir = dir;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredLanguage();
    setLanguageState(stored);
    applyDocumentLanguage(stored);
    setReady(true);
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    applyDocumentLanguage(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage,
      dir: languageToDir(language),
      t: (key: TranslationKey) => translate(language, key),
      topicLabel: (topicId: SuggestedTopicId) =>
        translateTopic(language, topicId),
      suggestedTopicIds: SUGGESTED_TOPIC_IDS,
    };
  }, [language, setLanguage]);

  // Avoid a flash of wrong direction once mounted; first paint is en.
  if (!ready) {
    return (
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
