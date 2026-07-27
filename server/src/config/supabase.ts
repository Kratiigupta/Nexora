import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Supabase Admin Client — uses the service_role key.
 * This bypasses Row Level Security (RLS) and should ONLY
 * be used server-side for admin operations.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Create a Supabase client scoped to a specific user's JWT.
 * This respects RLS policies and should be used for
 * user-scoped database operations.
 */
export const createSupabaseClient = (accessToken: string) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};
