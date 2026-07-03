"use server";

import { revalidatePath } from "next/cache";

import { encryptValue } from "@/lib/crypto";
import { env, hasEncryptionKey } from "@/lib/env";
import { requireUser } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";
import { networkSchema } from "@/lib/validation";
import { getSocialService } from "@/services/social";

export async function connectNetworkAction(networkValue: string) {
  const parsed = networkSchema.safeParse(networkValue);
  if (!parsed.success) {
    return { error: "Rede social invalida." };
  }

  if (!env.mockSocialApis) {
    return { error: "Neste MVP, MOCK_SOCIAL_APIS precisa estar ativo." };
  }

  const user = await requireUser();
  const network = parsed.data;
  const supabase = await createClient();
  const service = getSocialService(network);
  const connection = await service.connect(user.id);

  await supabase.from("connected_accounts").upsert(
    {
      user_id: user.id,
      network,
      account_name: connection.accountName,
      status: "connected",
      mock_access_token: connection.mockAccessToken,
      encrypted_access_token: hasEncryptionKey() ? encryptValue(connection.mockAccessToken) : null,
      encrypted_refresh_token: hasEncryptionKey() ? encryptValue(`${connection.mockAccessToken}_refresh`) : null,
      connected_at: new Date().toISOString()
    },
    { onConflict: "user_id,network" }
  );

  revalidatePath("/app/redes-conectadas");
  revalidatePath("/app");

  return { success: `${network} conectada com sucesso em modo mock.` };
}

export async function disconnectNetworkAction(networkValue: string) {
  const parsed = networkSchema.safeParse(networkValue);
  if (!parsed.success) {
    return { error: "Rede social invalida." };
  }

  const user = await requireUser();
  const supabase = await createClient();
  const service = getSocialService(parsed.data);
  await service.disconnect(user.id);

  await supabase
    .from("connected_accounts")
    .update({
      status: "disconnected",
      mock_access_token: null,
      encrypted_access_token: null,
      encrypted_refresh_token: null
    })
    .eq("user_id", user.id)
    .eq("network", parsed.data);

  revalidatePath("/app/redes-conectadas");
  revalidatePath("/app");

  return { success: `${parsed.data} desconectada com sucesso.` };
}
