import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export type SupabaseHealthResult =
  | {
      ok: true;
      configured: true;
      urlHost: string;
      latencyMs: number;
      message: string;
    }
  | {
      ok: false;
      configured: boolean;
      urlHost?: string;
      latencyMs?: number;
      message: string;
    };

/**
 * Verifies Supabase env + network reachability without requiring tables.
 * Uses the Auth health endpoint (public project infrastructure check).
 */
export async function verifySupabaseConnection(): Promise<SupabaseHealthResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      configured: false,
      message:
        "Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  const url = getSupabaseUrl()!;
  const anonKey = getSupabaseAnonKey()!;
  let urlHost: string;

  try {
    urlHost = new URL(url).host;
  } catch {
    return {
      ok: false,
      configured: true,
      message: "NEXT_PUBLIC_SUPABASE_URL is not a valid URL",
    };
  }

  const started = Date.now();

  try {
    // Lightweight project ping — no DB tables required.
    const healthResponse = await fetch(`${url}/auth/v1/health`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });

    const latencyMs = Date.now() - started;

    if (!healthResponse.ok) {
      return {
        ok: false,
        configured: true,
        urlHost,
        latencyMs,
        message: `Supabase auth health returned HTTP ${healthResponse.status}`,
      };
    }

    // Confirm the JS client can initialize against the same project.
    const supabase = createClient<Database>(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.auth.getSession();

    if (error) {
      return {
        ok: false,
        configured: true,
        urlHost,
        latencyMs: Date.now() - started,
        message: `Supabase client error: ${error.message}`,
      };
    }

    return {
      ok: true,
      configured: true,
      urlHost,
      latencyMs: Date.now() - started,
      message: "Supabase connection verified",
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      urlHost,
      latencyMs: Date.now() - started,
      message:
        error instanceof Error
          ? error.message
          : "Failed to reach Supabase",
    };
  }
}
