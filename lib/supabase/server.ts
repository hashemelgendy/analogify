import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Server-side Supabase client for API routes and server modules.
 * Safe for Route Handlers / Server Actions. Do not export this to the browser bundle via client components.
 */

export function createServerSupabaseClient(): SupabaseClient<Database> {
  const { url, anonKey } = requireSupabaseEnv();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
