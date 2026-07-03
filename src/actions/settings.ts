"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/validation";

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = sanitizeText(String(formData.get("name") ?? ""));

  if (name.length < 2) {
    return { error: "Informe um nome valido." };
  }

  const supabase = await createClient();
  await supabase.from("profiles").update({ name }).eq("id", user.id);

  revalidatePath("/app/configuracoes");
  revalidatePath("/app");

  return { success: "Perfil atualizado com sucesso." };
}
