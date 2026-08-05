/**
 * Server Supabase client bound to the request cookie store (auth session).
 * Use for reading the signed-in user in Route Handlers / Server Components.
 * Do not import into client components.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type TypedSupabaseServerClient = SupabaseClient<Database>;

export async function createServerAuthClient(): Promise<TypedSupabaseServerClient> {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where cookies are read-only — safe to ignore
          // when middleware is already refreshing the session.
        }
      },
    },
  });
}

/** Returns the authenticated user id, or null if signed out / unconfigured. */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const supabase = await createServerAuthClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user?.id) return null;
    return user.id;
  } catch {
    // Supabase public env missing in some local setups
    return null;
  }
}
