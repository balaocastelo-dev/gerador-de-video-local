"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/app-data";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText, postPayloadSchema, scheduleSchema, targetPreviewSchema } from "@/lib/validation";
import { adaptPostForNetwork } from "@/services/adapt-post";
import { getSocialService } from "@/services/social";
import type { MediaAsset, PostPreview } from "@/types/app";

type PostInput = {
  originalText: string;
  objective: string;
  tone: string;
  networks: string[];
  mediaAssetIds: string[];
};

type PublishInput = PostInput & {
  previews: PostPreview[];
};

type ScheduleInput = PublishInput & {
  scheduledAt: string;
};

function getOverallStatus(statuses: string[]) {
  const successCount = statuses.filter((status) => status === "published").length;
  const failedCount = statuses.filter((status) => status === "failed").length;

  if (successCount && failedCount) return "partially_published";
  if (successCount === statuses.length) return "published";
  return "failed";
}

async function getSelectedMediaAssets(mediaAssetIds: string[]) {
  if (!mediaAssetIds.length) return [];

  const supabase = await createClient();
  const { data } = await supabase.from("media_assets").select("*").in("id", mediaAssetIds);
  return (data ?? []) as MediaAsset[];
}

export async function adaptPostAction(payload: PostInput) {
  const parsed = postPayloadSchema.safeParse({
    ...payload,
    originalText: sanitizeText(payload.originalText)
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulario invalido." };
  }

  await requireUser();
  const mediaAssets = await getSelectedMediaAssets(parsed.data.mediaAssetIds);
  const previews = parsed.data.networks.map((network) =>
    adaptPostForNetwork({
      originalText: parsed.data.originalText,
      objective: parsed.data.objective,
      tone: parsed.data.tone,
      network,
      mediaAssets
    })
  );

  return { success: "Previa gerada com sucesso.", previews };
}

async function executePublishing(postId: string, previews: PostPreview[]) {
  const user = await requireUser();
  const supabase = await createClient();
  const statuses: string[] = [];

  for (const preview of previews) {
    const service = getSocialService(preview.network);
    const validation = await service.validateContent(preview);

    if (!validation.valid) {
      const { data: target } = await supabase
        .from("post_targets")
        .insert({
          post_id: postId,
          user_id: user.id,
          network: preview.network,
          adapted_text: preview.adaptedText,
          title: preview.title,
          description: preview.description,
          hashtags: preview.hashtags,
          status: "failed",
          character_limit_warning: validation.warning ?? preview.warning,
          error_message: validation.warning ?? "Conteudo invalido para a rede."
        })
        .select("id")
        .single();

      await supabase.from("publish_logs").insert({
        user_id: user.id,
        post_id: postId,
        post_target_id: target?.id ?? null,
        network: preview.network,
        status: "failed",
        message: validation.warning ?? "Conteudo invalidado pelo adaptador.",
        response_payload: preview
      });

      statuses.push("failed");
      continue;
    }

    const formatted = await service.formatContent(preview);
    const result = await service.publishPost({ postId, preview: formatted });
    const targetStatus = result.success ? "published" : "failed";

    const { data: target } = await supabase
      .from("post_targets")
      .insert({
        post_id: postId,
        user_id: user.id,
        network: formatted.network,
        adapted_text: formatted.adaptedText,
        title: formatted.title,
        description: formatted.description,
        hashtags: formatted.hashtags,
        status: targetStatus,
        character_limit_warning: formatted.warning,
        external_post_id: result.externalPostId,
        published_at: result.success ? new Date().toISOString() : null,
        error_message: result.success ? null : result.message
      })
      .select("id")
      .single();

    await supabase.from("publish_logs").insert({
      user_id: user.id,
      post_id: postId,
      post_target_id: target?.id ?? null,
      network: formatted.network,
      status: targetStatus,
      message: result.message,
      response_payload: result.payload
    });

    if (result.success) {
      await supabase
        .from("connected_accounts")
        .update({ last_published_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("network", formatted.network);
    }

    statuses.push(targetStatus);
  }

  const overallStatus = getOverallStatus(statuses);
  await supabase.from("posts").update({ status: overallStatus }).eq("id", postId).eq("user_id", user.id);

  return overallStatus;
}

export async function publishPostNowAction(payload: PublishInput) {
  const parsed = postPayloadSchema.safeParse({
    ...payload,
    originalText: sanitizeText(payload.originalText)
  });
  const previewsParsed = targetPreviewSchema.array().safeParse(payload.previews);

  if (!parsed.success || !previewsParsed.success) {
    return { error: "Dados invalidos para publicar." };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      original_text: parsed.data.originalText,
      objective: parsed.data.objective,
      tone: parsed.data.tone,
      status: "processing"
    })
    .select("*")
    .single();

  if (error || !post) {
    return { error: error?.message ?? "Nao foi possivel criar a publicacao." };
  }

  const status = await executePublishing(post.id, previewsParsed.data);

  revalidatePath("/app");
  revalidatePath("/app/publicacoes");
  revalidatePath("/app/logs");
  revalidatePath("/app/calendario");

  return { success: `Publicacao processada com status ${status}.`, postId: post.id };
}

export async function schedulePostAction(payload: ScheduleInput) {
  const parsed = scheduleSchema.safeParse({
    ...payload,
    originalText: sanitizeText(payload.originalText)
  });
  const previewsParsed = targetPreviewSchema.array().safeParse(payload.previews);

  if (!parsed.success || !previewsParsed.success) {
    return { error: "Dados invalidos para agendamento." };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      original_text: parsed.data.originalText,
      objective: parsed.data.objective,
      tone: parsed.data.tone,
      status: "scheduled",
      scheduled_at: parsed.data.scheduledAt
    })
    .select("*")
    .single();

  if (error || !post) {
    return { error: error?.message ?? "Nao foi possivel criar o agendamento." };
  }

  await supabase.from("post_targets").insert(
    previewsParsed.data.map((preview) => ({
      post_id: post.id,
      user_id: user.id,
      network: preview.network,
      adapted_text: preview.adaptedText,
      title: preview.title,
      description: preview.description,
      hashtags: preview.hashtags,
      status: "scheduled",
      character_limit_warning: preview.warning
    }))
  );

  await supabase.from("publish_jobs").insert({
    user_id: user.id,
    post_id: post.id,
    status: "scheduled",
    run_at: parsed.data.scheduledAt
  });

  revalidatePath("/app/publicacoes");
  revalidatePath("/app/calendario");
  revalidatePath("/app");

  return { success: "Agendamento criado com sucesso.", postId: post.id };
}

export async function processPendingJobsAction() {
  const user = await requireUser();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: jobs } = await supabase
    .from("publish_jobs")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "scheduled")
    .lte("run_at", now)
    .order("run_at", { ascending: true });

  const processed: string[] = [];

  for (const job of jobs ?? []) {
    const { data: targets } = await supabase
      .from("post_targets")
      .select("*")
      .eq("post_id", job.post_id)
      .eq("user_id", user.id);

    const previews = (targets ?? []).map(
      (target) =>
        ({
          network: target.network,
          adaptedText: target.adapted_text ?? "",
          title: target.title ?? "",
          description: target.description ?? "",
          hashtags: target.hashtags ?? [],
          warning: target.character_limit_warning,
          recommendedMediaFormat: "Usar melhor formato recomendado pela rede.",
          status: target.character_limit_warning ? "needs_adjustment" : "ready"
        }) as PostPreview
    );

    await supabase.from("post_targets").delete().eq("post_id", job.post_id).eq("user_id", user.id);
    const finalStatus = await executePublishing(job.post_id, previews);

    await supabase
      .from("publish_jobs")
      .update({ status: finalStatus, processed_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("user_id", user.id);

    processed.push(job.post_id);
  }

  revalidatePath("/app");
  revalidatePath("/app/publicacoes");
  revalidatePath("/app/logs");
  revalidatePath("/app/calendario");

  return {
    success: processed.length
      ? `${processed.length} agendamento(s) processado(s).`
      : "Nenhum agendamento vencido encontrado."
  };
}
