export type { Language, Language as AppLanguage } from "@/lib/i18n/types";
export {
  isLanguage,
  LANGUAGE_STORAGE_KEY,
  languageToDir,
  LANGUAGES,
} from "@/lib/i18n/types";
export {
  SUGGESTED_TOPIC_IDS,
  t,
  translateTopic,
  translations,
  type SuggestedTopicId,
  type TranslationKey,
} from "@/lib/i18n/translations";
export { LanguageProvider, useLanguage } from "@/lib/i18n/context";
