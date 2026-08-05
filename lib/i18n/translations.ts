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
  inDepthYou: "You",
  inDepthCoreEntities: "Core Entities",
  inDepthProcessFlow: "Process Flow",
  inDepthGatekeepers: "Gatekeepers / Filters",
  inDepthExternalForces: "External Forces",
  inDepthAlternativePaths: "Alternative Paths",
  inDepthSuccessFailure: "Success and Failure",
  inDepthSummary: "Final Summary",
  // Legacy in-depth section titles (older saved content)
  inDepthRoleMapping: "Role Mapping",
  inDepthProcess: "Process / Journey",
  inDepthOptionalPaths: "Optional Paths / Variations",
  inDepthConstraints: "Real-World Constraints",
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

  // Learning trail (home) — legacy keys still used by sidebar / loading states
  trailEyebrow: "Your learning trail",
  trailHeading: 'Keep your best "aha!" moments close.',
  trailLoading: "Loading your history…",
  trailEmpty: "Your saved explanations will show up here after you create one.",
  trailTryAgain: "Try again",
  trailViewAll: "View saved explanations →",
  trailLoadFailed: "We couldn't load your history right now.",
  trailOpenFailed: "We couldn't load that explanation right now.",

  // History sidebar
  sidebarEyebrow: "History",
  sidebarTitle: "Explanations",
  sidebarCollapse: "Collapse sidebar",
  sidebarExpand: "Expand sidebar",
  sidebarClose: "Close history",
  sidebarOpenMenu: "Open history",
  sidebarItemMenu: "Explanation options",
  sidebarLoadingMore: "Loading more…",
  sidebarEnd: "You're all caught up",

  // History page
  historyNewExplanation: "← New explanation",
  historyEyebrow: "Your learning trail",
  historyTitle: "Saved explanations",
  historySubtitle:
    "Revisit analogies you've created — guests keep them in this browser; signing in with Google saves them to your account.",
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
  historyClearAll: "Clear all history",
  historyDelete: "Delete explanation",
  historyDeleteConfirmTitle: "Delete this explanation?",
  historyDeleteConfirmBody:
    "Are you sure you want to delete this explanation? This cannot be undone.",
  historyClearConfirmTitle: "Clear all history?",
  historyClearConfirmBody:
    "This will delete all your explanations. This cannot be undone.",
  historyDeleteConfirm: "Delete",
  historyClearConfirm: "Delete all",
  historyCancel: "Cancel",
  historyDeleted: "Explanation deleted",
  historyUndo: "Undo",
  historyRestored: "Explanation restored",
  historyRestoreFailed:
    "We couldn't restore that explanation. Please try again.",
  historyCleared: "History cleared",
  historyDeleteFailed: "We couldn't delete that explanation. Please try again.",
  historyClearFailed: "We couldn't clear your history. Please try again.",
  historyNoExplanations: "No explanations yet",

  // Auth (Google only)
  authContinueGoogle: "Continue with Google",
  authSignOut: "Sign out",
  authSigningIn: "Signing in…",
  authLoading: "…",
  authSignedIn: "Signed in",
  authMergingHistory: "Saving your trail…",
  authSignInFailed: "Sign-in failed. Please try again.",
  authSignOutFailed: "Sign-out failed. Please try again.",
  authSaveHelper: "Sign in to save your explanations",
  authSavePromptTitle: "Keep your explanations",
  authSavePrompt:
    "Sign in to save your explanations permanently across devices.",
  authSavePromptDismiss: "Not now",

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
  inDepthYou: "أنت",
  inDepthCoreEntities: "الكيانات الأساسية",
  inDepthProcessFlow: "مسار العملية",
  inDepthGatekeepers: "بوابات / مرشّحات",
  inDepthExternalForces: "قوى خارجية",
  inDepthAlternativePaths: "مسارات بديلة",
  inDepthSuccessFailure: "النجاح والفشل",
  inDepthSummary: "الخلاصة",
  inDepthRoleMapping: "ربط الأدوار",
  inDepthProcess: "العملية / الرحلة",
  inDepthOptionalPaths: "مسارات وخيارات بديلة",
  inDepthConstraints: "قيود الواقع",
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
  trailLoading: "جارٍ تحميل سجلك…",
  trailEmpty: "ستظهر شروحاتك المحفوظة هنا بعد إنشائها.",
  trailTryAgain: "أعد المحاولة",
  trailViewAll: "عرض الشروحات المحفوظة ←",
  trailLoadFailed: "تعذر تحميل سجلك الآن.",
  trailOpenFailed: "تعذر تحميل هذا الشرح الآن.",

  sidebarEyebrow: "السجل",
  sidebarTitle: "الشروحات",
  sidebarCollapse: "طي الشريط الجانبي",
  sidebarExpand: "توسيع الشريط الجانبي",
  sidebarClose: "إغلاق السجل",
  sidebarOpenMenu: "فتح السجل",
  sidebarItemMenu: "خيارات الشرح",
  sidebarLoadingMore: "جارٍ تحميل المزيد…",
  sidebarEnd: "وصلت للنهاية",

  historyNewExplanation: "شرح جديد →",
  historyEyebrow: "مسار تعلّمك",
  historyTitle: "الشروحات المحفوظة",
  historySubtitle:
    "أعد زيارة التشبيهات التي أنشأتها — للزوار تبقى في هذا المتصفح؛ وعند تسجيل الدخول عبر Google تُحفظ في حسابك.",
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
  historyClearAll: "مسح كل السجل",
  historyDelete: "حذف الشرح",
  historyDeleteConfirmTitle: "حذف هذا الشرح؟",
  historyDeleteConfirmBody:
    "هل أنت متأكد من حذف هذا الشرح؟ لا يمكن التراجع عن ذلك.",
  historyClearConfirmTitle: "مسح كل السجل؟",
  historyClearConfirmBody: "سيحذف هذا كل شروحاتك. لا يمكن التراجع عن ذلك.",
  historyDeleteConfirm: "حذف",
  historyClearConfirm: "حذف الكل",
  historyCancel: "إلغاء",
  historyDeleted: "تم حذف الشرح",
  historyUndo: "تراجع",
  historyRestored: "تم استعادة الشرح",
  historyRestoreFailed: "تعذر استعادة هذا الشرح. حاول مرة أخرى.",
  historyCleared: "تم مسح السجل",
  historyDeleteFailed: "تعذر حذف هذا الشرح. حاول مرة أخرى.",
  historyClearFailed: "تعذر مسح سجلك. حاول مرة أخرى.",
  historyNoExplanations: "لا توجد شروحات بعد",

  authContinueGoogle: "المتابعة مع Google",
  authSignOut: "تسجيل الخروج",
  authSigningIn: "جارٍ تسجيل الدخول…",
  authLoading: "…",
  authSignedIn: "مسجّل الدخول",
  authMergingHistory: "جارٍ حفظ مسارك…",
  authSignInFailed: "فشل تسجيل الدخول. حاول مرة أخرى.",
  authSignOutFailed: "فشل تسجيل الخروج. حاول مرة أخرى.",
  authSaveHelper: "سجّل الدخول لحفظ شروحاتك",
  authSavePromptTitle: "احفظ شروحاتك",
  authSavePrompt: "سجّل الدخول لحفظ شروحاتك بشكل دائم عبر أجهزتك.",
  authSavePromptDismiss: "ليس الآن",

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
