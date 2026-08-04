/**
 * Supabase foundation — import from here rather than UI components.
 *
 * Future usage sketch (not implemented yet):
 * - repositories/explanations.ts  → save/load Explanation rows
 * - repositories/feedback.ts      → ratings
 * - repositories/learning-trail.ts
 * - auth helpers once login is added
 */

export {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
  requireSupabaseEnv,
} from "@/lib/supabase/env";
export { createBrowserSupabaseClient } from "@/lib/supabase/client";
export { createServerSupabaseClient } from "@/lib/supabase/server";
export {
  verifySupabaseConnection,
  type SupabaseHealthResult,
} from "@/lib/supabase/health";
export type { Database, Json } from "@/lib/supabase/types";
