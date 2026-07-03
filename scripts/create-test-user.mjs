import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    env[key.trim()] = rest.join("=").trim();
  }

  return env;
}

const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const env = loadEnvFile(resolve(projectRoot, ".env"));

const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const email = "teste@balaosocialmanager.local";
const password = "Balao@123456";
const name = "Usuario Teste";

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  throw new Error("Variaveis obrigatorias do Supabase nao encontradas no .env.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const publicClient = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const { data: listed, error: listError } = await admin.auth.admin.listUsers();
if (listError) throw listError;

const existing = listed.users.find((user) => user.email === email);

let userId;

if (existing) {
  const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (error) throw error;
  userId = data.user.id;
  console.log("RESULT=updated");
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (error) throw error;
  userId = data.user.id;
  console.log("RESULT=created");
}

await admin.from("profiles").upsert({
  id: userId,
  name,
  email
});

const { data: loginData, error: loginError } = await publicClient.auth.signInWithPassword({
  email,
  password
});

if (loginError) throw loginError;

console.log(`EMAIL=${email}`);
console.log(`PASSWORD=${password}`);
console.log(`USER_ID=${userId}`);
console.log(`LOGIN_OK=${Boolean(loginData.session?.access_token)}`);
