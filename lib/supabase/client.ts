import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser Supabase client with cookie-backed auth session (@supabase/ssr).
 * For Client Components only — never use the service role key here.
 */

export type TypedSupabaseClient = SupabaseClient<Database>;

let browserClient: TypedSupabaseClient | undefined;

export function createBrowserSupabaseClient(): TypedSupabaseClient {
  const { url, anonKey } = requireSupabaseEnv();

  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createBrowserClient<Database>(url, anonKey);
    }
    return browserClient;
  }

  // Non-window (SSR safety): ephemeral client without session persistence
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
