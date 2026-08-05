/**
 * Client localStorage helpers for guest mirror + one-time merge flags.
 * Source of truth for guest identity remains the httpOnly cookie on the server.
 */

export const LOCAL_GUEST_ID_KEY = "guest_id";
export const LOCAL_GUEST_MERGED_PREFIX = "guest_merged:";

export function readLocalGuestId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(LOCAL_GUEST_ID_KEY)?.trim() ?? "";
    return value || null;
  } catch {
    return null;
  }
}

export function writeLocalGuestId(guestId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_GUEST_ID_KEY, guestId);
  } catch {
    // private mode / quota
  }
}

export function guestMergedKey(userId: string): string {
  return `${LOCAL_GUEST_MERGED_PREFIX}${userId}`;
}

export function hasGuestMergedForUser(userId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(guestMergedKey(userId)) === "true";
  } catch {
    return false;
  }
}

export function markGuestMergedForUser(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(guestMergedKey(userId), "true");
  } catch {
    // ignore
  }
}

/** Soft-prompt: generations this guest session (not persisted long-term required). */
export const LOCAL_GENERATION_COUNT_KEY = "anuminate_generation_count";
/** User closed the "sign in to save" popup — do not re-show this session/browser. */
export const LOCAL_SAVE_PROMPT_DISMISSED_KEY = "anuminate_save_prompt_dismissed";

export function readGenerationCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const n = Number(localStorage.getItem(LOCAL_GENERATION_COUNT_KEY) ?? "0");
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function incrementGenerationCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const next = readGenerationCount() + 1;
    localStorage.setItem(LOCAL_GENERATION_COUNT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function isSavePromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LOCAL_SAVE_PROMPT_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function markSavePromptDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_SAVE_PROMPT_DISMISSED_KEY, "true");
  } catch {
    // ignore
  }
}
