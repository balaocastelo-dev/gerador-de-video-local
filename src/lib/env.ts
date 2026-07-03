const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  mockSocialApis: (process.env.MOCK_SOCIAL_APIS ?? "true").toLowerCase() === "true",
  supabaseProjectRef: process.env.SUPABASE_PROJECT_REF ?? "nechxnubbxudesyjuxnb"
};

export function hasSupabaseEnv() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasServiceRole() {
  return hasSupabaseEnv() && Boolean(env.supabaseServiceRoleKey);
}

export function hasEncryptionKey() {
  return Boolean(env.encryptionKey);
}

export function requireSupabaseEnv() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "As variaveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam estar configuradas."
    );
  }

  return env;
}

export function requireServiceRoleEnv() {
  if (!hasServiceRole()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY precisa estar configurada para esta operacao.");
  }

  return env;
}

export { env };
