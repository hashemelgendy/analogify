/**
 * Placeholder Database schema for future Supabase typing.
 *
 * Planned features (tables not created yet):
 * - explanations   — saved generated explanations
 * - profiles       — user accounts
 * - feedback       — ratings and free-text feedback
 * - learning_trail — learning history items
 *
 * When tables exist, generate types with:
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts
 * and replace this stub.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
