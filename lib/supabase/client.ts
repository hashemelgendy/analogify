import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser / client-component Supabase client.
 * Typed against production Database (lib/supabase/types.ts).
 * Keep this out of React UI — use services/repositories instead.
 */

export type TypedSupabaseClient = SupabaseClient<Database>;

let browserClient: TypedSupabaseClient | undefined;

export function createBrowserSupabaseClient(): TypedSupabaseClient {
  const { url, anonKey } = requireSupabaseEnv();

  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createClient<Database>(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return browserClient;
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
