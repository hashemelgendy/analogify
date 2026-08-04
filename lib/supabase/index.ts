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
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
  isSupabaseServiceRoleConfigured,
  requireSupabaseEnv,
  requireSupabaseServiceRoleEnv,
} from "@/lib/supabase/env";
export {
  createBrowserSupabaseClient,
  type TypedSupabaseClient,
} from "@/lib/supabase/client";
export {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
export {
  verifySupabaseConnection,
  type SupabaseHealthResult,
} from "@/lib/supabase/health";
export type {
  CompositeTypes,
  Database,
  DifficultyLevelEnum,
  Enums,
  ExplanationInsert,
  ExplanationRow,
  ExplanationUpdate,
  FeedbackInsert,
  FeedbackRow,
  FeedbackUpdate,
  GenerationModeEnum,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/types";
export { Constants } from "@/lib/supabase/types";
