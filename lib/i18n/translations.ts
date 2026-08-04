import type { Language } from "@/lib/i18n/types";

export type TranslationKey = keyof typeof en;

const en = {
  // Brand / header
  tagline: "Illuminate your understanding",
  languageEn: "EN",
  languageAr: "AR",
  languageSwitcherLabel: "Language",

  // Hero
  heroEyebrow: "Personalized learning",
  heroTitle: "Understand anything through things you already know",
  heroSubtitle:
    "Tell Anuminate what feels confusing — then share the worlds you know. We'll meet you there.",

  // Input card
  labelLearn: "What do you want to learn?",
  labelFamiliar: "What topics do you already know?",
  placeholderLearn: "e.g. How does blockchain work?",
  placeholderFamiliar: "e.g. cooking, gaming, fitness...",
  tryFamiliarWorld: "Try a familiar world:",
  createExplanation: "Create Explanation",
  creatingExplanation: "Creating Explanation...",
  buildingAnalogy: "Building a personalized analogy for you…",

  // Suggested topics
  topicCooking: "Cooking",
  topicGaming: "Gaming",
  topicFitness: "Fitness",
  topicBusiness: "Business",
  topicMovies: "Movies",
  topicSports: "Sports",
  topicProgramming: "Programming",

  // Empty / loading / error result states
  emptyEyebrow: "Ready when you are",
  emptyTitle: "Your explanation will appear here",
  emptyDescription:
    "Share what you want to learn and a familiar world you already know. We'll craft an analogy that meets you there.",
  loadingEyebrow: "Creating explanation",
  loadingCrafting: "Crafting your analogy…",
  loadingCraftingDetail:
    "We're mapping the concept onto things you already understand. This usually takes a few seconds.",
  loadingOpening: "Opening saved explanation…",
  loadingOpeningDetail: "Loading the full analogy from your learning trail.",
  errorEyebrow: "Couldn't create explanation",
  errorTitle: "Let's try that again",
  retry: "Try again",
  retrying: "Retrying…",
  errorFamiliarRequired:
    "Add at least one familiar topic so we can ground the analogy.",

  // Explanation card
  theAnalogy: "The analogy",
  elaboration: "Elaboration",
  inDepthAnalogy: "In-Depth Analogy",
  inDepthRoleMapping: "Role Mapping",
  inDepthProcess: "Process / Journey",
  inDepthOptionalPaths: "Optional Paths / Variations",
  inDepthConstraints: "Real-World Constraints",
  inDepthSummary: "Final Summary",
  makeSimpler: "Make it simpler",
  useAnotherAnalogy: "Use another analogy",
  explainDeeper: "In-Depth Analogy",

  // Feedback
  feedbackTitle: "Did this explanation help you understand?",
  feedbackSubtitle: "Your feedback helps Anuminate learn how you learn.",
  feedbackPlaceholder: "Anything to improve? (optional)",
  feedbackValidationRating: "Please select a star rating before submitting.",
  feedbackSubmit: "Submit Feedback",
  feedbackSubmitting: "Submitting…",
  feedbackThanks: "Thanks — your feedback was submitted.",
  feedbackMissingId:
    "This explanation was not saved, so feedback could not be linked. Create a new explanation to rate it.",
  feedbackSaveFailed:
    "We couldn't save your feedback right now. Please try again.",

  // Learning trail (home)
  trailEyebrow: "Your learning trail",
  trailHeading: 'Keep your best "aha!" moments close.',
  trailLoading: "Loading your learning trail…",
  trailEmpty: "Your saved explanations will show up here after you create one.",
  trailTryAgain: "Try again",
  trailViewAll: "View saved explanations →",
  trailLoadFailed: "We couldn't load your learning trail right now.",
  trailOpenFailed: "We couldn't load that explanation right now.",

  // History page
  historyNewExplanation: "← New explanation",
  historyEyebrow: "Your learning trail",
  historyTitle: "Saved explanations",
  historySubtitle:
    "Revisit analogies you've created — each one stays tied to this browser until you sign in later.",
  historyLoadingEyebrow: "Loading",
  historyLoading: "Loading your saved explanations…",
  historyErrorEyebrow: "Something went wrong",
  historyEmptyEyebrow: "Empty trail",
  historyEmptyTitle:
    "Your learning trail is empty. Create your first explanation!",
  historyEmptyDescription:
    'Head home, pick a concept and a familiar world, then save your first "aha!" moment here.',
  historyCreateCta: "Create an explanation",
  historyThrough: "Through",
  historyViewing: "Viewing",
  historyOpening: "Opening saved explanation…",
  historyOpenFailed: "We couldn't open that explanation.",
  historyListFailed: "We couldn't load your saved explanations.",
  historyDismiss: "Dismiss",
  historyUnknownDate: "Unknown date",
  historyPrevious: "Previous",
  historyNext: "Next",
  historyPageOf: "Page {page} of {totalPages}",
  historyPageLabel: "Page {page}",

  // Client error messages
  errNetwork:
    "We couldn't reach Anuminate. Check your connection and try again.",
  errRateLimit:
    "You're creating explanations a bit too quickly. Wait a moment, then try again.",
  errGenerate:
    "We couldn't build that explanation. Please try again in a moment.",
  errConceptRequired: "Tell us what you want to learn, then try again.",
  errFamiliarRequired:
    "Add at least one familiar topic so we can ground the analogy.",
  errGeneric:
    "Something went wrong while creating your explanation. Please try again.",
} as const;

const ar: { [K in TranslationKey]: string } = {
  tagline: "أضئ فهمك",
  languageEn: "EN",
  languageAr: "ع",
  languageSwitcherLabel: "اللغة",

  heroEyebrow: "تعلّم مخصص",
  heroTitle: "افهم أي شيء عبر ما تعرفُه بالفعل",
  heroSubtitle:
    "أخبر أنومنيت ما يبدو محيّرًا — ثم شارك العوالم التي تعرفها. سنلتقي بك هناك.",

  labelLearn: "ماذا تريد أن تتعلم؟",
  labelFamiliar: "ما المواضيع التي تعرفها بالفعل؟",
  placeholderLearn: "مثال: كيف تعمل سلسلة الكتل؟",
  placeholderFamiliar: "مثال: الطبخ، الألعاب، اللياقة…",
  tryFamiliarWorld: "جرّب عالمًا مألوفًا:",
  createExplanation: "أنشئ الشرح",
  creatingExplanation: "جارٍ إنشاء الشرح...",
  buildingAnalogy: "نبني لك تشبيهًا يناسبك…",

  topicCooking: "الطبخ",
  topicGaming: "الألعاب",
  topicFitness: "اللياقة",
  topicBusiness: "الأعمال",
  topicMovies: "الأفلام",
  topicSports: "الرياضة",
  topicProgramming: "البرمجة",

  emptyEyebrow: "جاهزون عندما تكون",
  emptyTitle: "سيظهر شرحك هنا",
  emptyDescription:
    "شارك ما تريد تعلمه وعالمًا مألوفًا تعرفه. سنصنع تشبيهًا يلتقيك هناك.",
  loadingEyebrow: "جارٍ إنشاء الشرح",
  loadingCrafting: "نصيغ التشبيه…",
  loadingCraftingDetail:
    "نربط المفهوم بما تفهمه بالفعل. عادةً يستغرق ذلك بضع ثوانٍ.",
  loadingOpening: "جارٍ فتح الشرح المحفوظ…",
  loadingOpeningDetail: "نحمّل التشبيه الكامل من مسار تعلّمك.",
  errorEyebrow: "تعذر إنشاء الشرح",
  errorTitle: "لنُعد المحاولة",
  retry: "أعد المحاولة",
  retrying: "جارٍ إعادة المحاولة…",
  errorFamiliarRequired:
    "أضف موضوعًا مألوفًا واحدًا على الأقل لنبني التشبيه عليه.",

  theAnalogy: "التشبيه",
  elaboration: "التفصيل",
  inDepthAnalogy: "تشبيه متعمّق",
  inDepthRoleMapping: "ربط الأدوار",
  inDepthProcess: "العملية / الرحلة",
  inDepthOptionalPaths: "مسارات وخيارات بديلة",
  inDepthConstraints: "قيود الواقع",
  inDepthSummary: "الخلاصة",
  makeSimpler: "بسّطه أكثر",
  useAnotherAnalogy: "تشبيه آخر",
  explainDeeper: "تشبيه متعمّق",

  feedbackTitle: "هل ساعدك هذا الشرح على الفهم؟",
  feedbackSubtitle: "ملاحظاتك تساعد أنومنيت على فهم أسلوب تعلّمك.",
  feedbackPlaceholder: "أي شيء للتحسين؟ (اختياري)",
  feedbackValidationRating: "يرجى اختيار تقييم بالنجوم قبل الإرسال.",
  feedbackSubmit: "إرسال الملاحظات",
  feedbackSubmitting: "جارٍ الإرسال…",
  feedbackThanks: "شكرًا — تم إرسال ملاحظاتك.",
  feedbackMissingId:
    "لم يُحفظ هذا الشرح، لذا لا يمكن ربط الملاحظات. أنشئ شرحًا جديدًا لتقييمه.",
  feedbackSaveFailed: "تعذر حفظ ملاحظاتك الآن. حاول مرة أخرى.",

  trailEyebrow: "مسار تعلّمك",
  trailHeading: "أبقِ لحظات «آها!» قريبة منك.",
  trailLoading: "جارٍ تحميل مسار التعلّم…",
  trailEmpty: "ستظهر شروحاتك المحفوظة هنا بعد إنشائها.",
  trailTryAgain: "أعد المحاولة",
  trailViewAll: "عرض الشروحات المحفوظة ←",
  trailLoadFailed: "تعذر تحميل مسار التعلّم الآن.",
  trailOpenFailed: "تعذر تحميل هذا الشرح الآن.",

  historyNewExplanation: "شرح جديد →",
  historyEyebrow: "مسار تعلّمك",
  historyTitle: "الشروحات المحفوظة",
  historySubtitle:
    "أعد زيارة التشبيهات التي أنشأتها — تبقى مرتبطة بهذا المتصفح حتى تسجّل الدخول لاحقًا.",
  historyLoadingEyebrow: "جارٍ التحميل",
  historyLoading: "جارٍ تحميل شروحاتك المحفوظة…",
  historyErrorEyebrow: "حدث خطأ",
  historyEmptyEyebrow: "مسار فارغ",
  historyEmptyTitle: "مسار تعلّمك فارغ. أنشئ شرحك الأول!",
  historyEmptyDescription:
    "ارجع للصفحة الرئيسية، اختر مفهومًا وعالمًا مألوفًا، ثم احفظ أول لحظة فهم هنا.",
  historyCreateCta: "أنشئ شرحًا",
  historyThrough: "عبر",
  historyViewing: "قيد العرض",
  historyOpening: "جارٍ فتح الشرح المحفوظ…",
  historyOpenFailed: "تعذر فتح هذا الشرح.",
  historyListFailed: "تعذر تحميل شروحاتك المحفوظة.",
  historyDismiss: "إغلاق",
  historyUnknownDate: "تاريخ غير معروف",
  historyPrevious: "السابق",
  historyNext: "التالي",
  historyPageOf: "صفحة {page} من {totalPages}",
  historyPageLabel: "صفحة {page}",

  errNetwork: "تعذر الوصول إلى أنومنيت. تحقق من اتصالك وحاول مرة أخرى.",
  errRateLimit:
    "تنشئ شروحات بسرعة كبيرة. انتظر لحظة ثم حاول مرة أخرى.",
  errGenerate: "تعذر بناء هذا الشرح. حاول مرة أخرى بعد لحظات.",
  errConceptRequired: "أخبرنا بما تريد تعلمه، ثم حاول مرة أخرى.",
  errFamiliarRequired:
    "أضف موضوعًا مألوفًا واحدًا على الأقل لنبني التشبيه عليه.",
  errGeneric: "حدث خطأ أثناء إنشاء الشرح. حاول مرة أخرى.",
};

export const translations: Record<Language, { [K in TranslationKey]: string }> =
  {
    en,
    ar,
  };

export type SuggestedTopicId =
  | "Cooking"
  | "Gaming"
  | "Fitness"
  | "Business"
  | "Movies"
  | "Sports"
  | "Programming";

export const SUGGESTED_TOPIC_IDS: readonly SuggestedTopicId[] = [
  "Cooking",
  "Gaming",
  "Fitness",
  "Business",
  "Movies",
  "Sports",
  "Programming",
] as const;

const topicKeyMap: Record<SuggestedTopicId, TranslationKey> = {
  Cooking: "topicCooking",
  Gaming: "topicGaming",
  Fitness: "topicFitness",
  Business: "topicBusiness",
  Movies: "topicMovies",
  Sports: "topicSports",
  Programming: "topicProgramming",
};

export function translateTopic(
  language: Language,
  topicId: SuggestedTopicId,
): string {
  return translations[language][topicKeyMap[topicId]];
}

export function t(language: Language, key: TranslationKey): string {
  return translations[language][key] ?? translations.en[key] ?? key;
}
