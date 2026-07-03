"use server";

import { revalidatePath } from "next/cache";

import { MEDIA_BUCKET } from "@/lib/constants";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { validateMediaFile } from "@/lib/validation";
import type { MediaAsset } from "@/types/app";

export async function uploadMediaAction(formData: FormData) {
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!files.length) {
    return { error: "Selecione pelo menos um arquivo." };
  }

  const user = await requireUser();
  const supabase = await createClient();
  const createdAssets: MediaAsset[] = [];

  for (const file of files) {
    validateMediaFile(file);
    const safeName = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.name.split(".").pop()}`;
    const storagePath = `${user.id}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const fileUrl = `${env.supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${storagePath}`;
    const { data, error: insertError } = await supabase
      .from("media_assets")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: fileUrl,
        storage_path: storagePath,
        file_type: file.type,
        file_size: file.size
      })
      .select("*")
      .single();

    if (insertError) {
      return { error: insertError.message };
    }

    createdAssets.push(data as MediaAsset);
  }

  revalidatePath("/app/biblioteca-de-midia");
  revalidatePath("/app/nova-publicacao");

  return {
    success: `${createdAssets.length} arquivo(s) enviado(s) com sucesso.`,
    assets: createdAssets
  };
}

export async function deleteMediaAction(assetId: string, storagePath: string) {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("media_assets").delete().eq("id", assetId).eq("user_id", user.id);
  await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);

  revalidatePath("/app/biblioteca-de-midia");
  revalidatePath("/app/nova-publicacao");

  return { success: "Midia removida com sucesso." };
}
