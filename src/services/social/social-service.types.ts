import type { PostPreview, SocialNetwork } from "@/types/app";

export type SocialConnectionResult = {
  accountName: string;
  mockAccessToken: string;
  integrationStatus: string;
};

export type PublishPayload = {
  postId: string;
  preview: PostPreview;
  scheduledAt?: string | null;
};

export type PublishResult = {
  success: boolean;
  externalPostId: string | null;
  message: string;
  payload: Record<string, unknown>;
};

export interface SocialService {
  network: SocialNetwork;
  connect(userId: string): Promise<SocialConnectionResult>;
  disconnect(userId: string): Promise<{ success: boolean }>;
  validateContent(preview: PostPreview): Promise<{ valid: boolean; warning?: string }>;
  formatContent(preview: PostPreview): Promise<PostPreview>;
  publishPost(input: PublishPayload): Promise<PublishResult>;
  schedulePost(input: PublishPayload): Promise<PublishResult>;
  getAccountInfo(userId: string): Promise<{ userId: string; network: SocialNetwork }>;
  getPostStatus(externalPostId: string): Promise<{ status: "published" | "failed" | "processing" }>;
}
