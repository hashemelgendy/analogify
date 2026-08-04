"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
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

/** Same-tab updates for language (storage event only fires across tabs). */
const LANGUAGE_CHANGE_EVENT = "anuminate-language-change";

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

function subscribeLanguage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handle = () => onStoreChange();
  window.addEventListener(LANGUAGE_CHANGE_EVENT, handle);
  window.addEventListener("storage", handle);
  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, handle);
    window.removeEventListener("storage", handle);
  };
}

function getLanguageSnapshot(): Language {
  return readStoredLanguage();
}

function getServerLanguageSnapshot(): Language {
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyDocumentLanguage(next);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      dir: languageToDir(language),
      t: (key: TranslationKey) => translate(language, key),
      topicLabel: (topicId: SuggestedTopicId) =>
        translateTopic(language, topicId),
      suggestedTopicIds: SUGGESTED_TOPIC_IDS,
    }),
    [language, setLanguage],
  );

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
