import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser / client-component Supabase client.
 * Uses the public anon key only. Keep this out of React UI logic —
 * import from services or data modules instead of scattering clients in components.
 */

let browserClient: SupabaseClient<Database> | undefined;

export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  const { url, anonKey } = requireSupabaseEnv();

  // Reuse a single client in the browser to avoid multiple GoTrue instances.
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
