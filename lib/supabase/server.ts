import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  requireSupabaseEnv,
  requireSupabaseServiceRoleEnv,
} from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Server-side Supabase clients for API routes and services.
 * Typed against production Database (lib/supabase/types.ts).
 * Do not import into client components.
 */

export type TypedSupabaseClient = SupabaseClient<Database>;

/** Anon client — subject to RLS (no write access until policies exist). */
export function createServerSupabaseClient(): TypedSupabaseClient {
  const { url, anonKey } = requireSupabaseEnv();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Service-role client — bypasses RLS for trusted server writes.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createServiceRoleSupabaseClient(): TypedSupabaseClient {
  const { url, serviceRoleKey } = requireSupabaseServiceRoleEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
