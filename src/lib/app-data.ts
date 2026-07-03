import { cache } from "react";

import { SOCIAL_NETWORKS } from "@/lib/constants";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type {
  ConnectedAccount,
  MediaAsset,
  PostRecord,
  PostTargetRecord,
  PublishJob,
  PublishLog
} from "@/types/app";

export const getCurrentUser = cache(async () => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuario nao autenticado.");
  }

  return user;
}

export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return data as { id: string; name: string | null; email: string | null } | null;
}

export async function getConnectedAccounts() {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("connected_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as ConnectedAccount[];
}

export async function getMediaAssets() {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as MediaAsset[];
}

export async function getPosts(status?: string) {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv()) return [];

  const supabase = await createClient();
  let query = supabase.from("posts").select("*").order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data } = await query;

  return (data ?? []) as PostRecord[];
}

export async function getPostTargets(postId?: string) {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv()) return [];

  const supabase = await createClient();
  let query = supabase.from("post_targets").select("*").order("created_at", { ascending: false });

  if (postId) {
    query = query.eq("post_id", postId);
  }

  const { data } = await query;
  return (data ?? []) as PostTargetRecord[];
}

export async function getPublishLogs(limit = 50) {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("publish_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as PublishLog[];
}

export async function getPublishJobs() {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("publish_jobs")
    .select("*")
    .order("run_at", { ascending: true });

  return (data ?? []) as PublishJob[];
}

export async function getPostDetails(postId: string) {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const [{ data: post }, { data: targets }, { data: logs }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", postId).single(),
    supabase.from("post_targets").select("*").eq("post_id", postId).order("created_at"),
    supabase.from("publish_logs").select("*").eq("post_id", postId).order("created_at", { ascending: false })
  ]);

  if (!post) return null;

  return {
    post: post as PostRecord,
    targets: (targets ?? []) as PostTargetRecord[],
    logs: (logs ?? []) as PublishLog[]
  };
}

export async function getDashboardData() {
  const [accounts, posts, logs] = await Promise.all([
    getConnectedAccounts(),
    getPosts(),
    getPublishLogs(10)
  ]);

  const connectedCount = accounts.filter((item) => item.status === "connected").length;
  const stats = {
    connectedAccounts: connectedCount,
    totalPosts: posts.length,
    scheduledPosts: posts.filter((item) => item.status === "scheduled").length,
    publishedPosts: posts.filter((item) => item.status === "published").length,
    failedPosts: posts.filter((item) => item.status === "failed").length,
    partialPosts: posts.filter((item) => item.status === "partially_published").length
  };

  const networkStatuses = SOCIAL_NETWORKS.map((network) => {
    const account = accounts.find((item) => item.network === network.network);
    return {
      ...network,
      status: account?.status ?? "disconnected",
      accountName: account?.account_name ?? "Conta nao conectada",
      lastPublishedAt: account?.last_published_at ?? null
    };
  });

  return {
    stats,
    latestPosts: posts.slice(0, 6),
    networkStatuses,
    recentLogs: logs
  };
}
