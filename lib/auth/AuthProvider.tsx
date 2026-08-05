"use client";

/**
 * Central auth + guest mirror for the client.
 * Google OAuth only; guests remain fully usable without signing in.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  hasGuestMergedForUser,
  markGuestMergedForUser,
  readLocalGuestId,
  writeLocalGuestId,
} from "@/lib/guest/client-storage";

type AuthContextValue = {
  user: User | null;
  /** Primary key when signed in */
  effectiveUserId: string | null;
  guestId: string | null;
  isLoading: boolean;
  isConfigured: boolean;
  isClaiming: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchGuestFromServer(): Promise<string | null> {
  try {
    const res = await fetch("/api/guest", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success?: boolean;
      data?: { guestId?: string };
    };
    return json.data?.guestId?.trim() || null;
  } catch {
    return null;
  }
}

async function claimGuestHistory(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/claim", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(configured);
  const [isClaiming, setIsClaiming] = useState(false);
  const claimInFlight = useRef(false);

  /**
   * Source of truth for isolation is the httpOnly guest cookie (set by API).
   * Mirror to localStorage.guest_id for client UX / merge flags.
   * If the mirror is missing, generate a UUID only after server ensure fails
   * so the app never depends on a blank guest_id in the client.
   */
  const ensureGuestMirror = useCallback(async () => {
    const fromServer = await fetchGuestFromServer();
    if (fromServer) {
      writeLocalGuestId(fromServer);
      setGuestId(fromServer);
      return fromServer;
    }

    let local = readLocalGuestId();
    if (!local && typeof crypto !== "undefined" && "randomUUID" in crypto) {
      local = crypto.randomUUID();
      writeLocalGuestId(local);
    }
    setGuestId(local);
    return local;
  }, []);

  const runClaimOnce = useCallback(async (nextUser: User) => {
    if (claimInFlight.current) return;
    if (hasGuestMergedForUser(nextUser.id)) return;

    claimInFlight.current = true;
    setIsClaiming(true);
    try {
      await ensureGuestMirror();
      const ok = await claimGuestHistory();
      if (ok) {
        markGuestMergedForUser(nextUser.id);
      }
    } finally {
      claimInFlight.current = false;
      setIsClaiming(false);
    }
  }, [ensureGuestMirror]);

  useEffect(() => {
    let cancelled = false;

    if (!configured) {
      // Mirror guest cookie → localStorage; setState is intentional hydration.
      void (async () => {
        await ensureGuestMirror();
        if (!cancelled) {
          setIsLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    const supabase = createBrowserSupabaseClient();

    void (async () => {
      await ensureGuestMirror();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        void runClaimOnce(session.user);
      }
      setIsLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const next = session?.user ?? null;
      setUser(next);

      if (event === "SIGNED_IN" && next) {
        void runClaimOnce(next);
      }

      if (event === "SIGNED_OUT") {
        // Guest mode resumes; cookie remains or is re-created by next API call
        void ensureGuestMirror();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured, ensureGuestMirror, runClaimOnce]);

  const signInWithGoogle = useCallback(async () => {
    if (!configured) {
      throw new Error("Supabase is not configured");
    }
    const supabase = createBrowserSupabaseClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
  }, [configured]);

  const signOut = useCallback(async () => {
    if (!configured) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    await ensureGuestMirror();
  }, [configured, ensureGuestMirror]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      effectiveUserId: user?.id ?? null,
      guestId,
      isLoading,
      isConfigured: configured,
      isClaiming,
      signInWithGoogle,
      signOut,
    }),
    [
      user,
      guestId,
      isLoading,
      configured,
      isClaiming,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
