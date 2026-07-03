import { createClient } from "@supabase/supabase-js";

import { requireServiceRoleEnv, requireSupabaseEnv } from "@/lib/env";

export function createAdminClient() {
  const env = requireServiceRoleEnv();

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createPublicServerClient() {
  const env = requireSupabaseEnv();

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
