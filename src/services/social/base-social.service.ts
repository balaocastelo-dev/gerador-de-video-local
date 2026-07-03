import { NETWORK_LABEL_MAP } from "@/lib/constants";
import type { PostPreview, SocialNetwork } from "@/types/app";

import type { PublishPayload, PublishResult, SocialConnectionResult, SocialService } from "./social-service.types";

function hashString(value: string) {
  return [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000, 7);
}

export class BaseSocialService implements SocialService {
  constructor(public network: SocialNetwork) {}

  async connect(userId: string): Promise<SocialConnectionResult> {
    const suffix = hashString(`${userId}:${this.network}`);

    return {
      accountName: `${NETWORK_LABEL_MAP[this.network]} Oficial ${suffix}`,
      mockAccessToken: `mock_${this.network}_${userId.slice(0, 8)}_${suffix}`,
      integrationStatus: "Conexao mock ativa e pronta para futura API oficial."
    };
  }

  async disconnect(_userId: string) {
    return { success: true };
  }

  async validateContent(preview: PostPreview) {
    if (preview.status === "needs_adjustment") {
      return { valid: false, warning: preview.warning ?? "Conteudo precisa de ajuste." };
    }

    return { valid: true };
  }

  async formatContent(preview: PostPreview) {
    return preview;
  }

  async publishPost(input: PublishPayload): Promise<PublishResult> {
    return this.simulatePublish(input, false);
  }

  async schedulePost(input: PublishPayload): Promise<PublishResult> {
    return this.simulatePublish(input, true);
  }

  async getAccountInfo(userId: string) {
    return {
      userId,
      network: this.network
    };
  }

  async getPostStatus(externalPostId: string) {
    const score = hashString(externalPostId);
    if (score % 9 === 0) {
      return { status: "failed" as const };
    }

    if (score % 5 === 0) {
      return { status: "processing" as const };
    }

    return { status: "published" as const };
  }

  protected async simulatePublish(input: PublishPayload, scheduled: boolean): Promise<PublishResult> {
    const score = hashString(`${input.postId}:${this.network}:${input.preview.adaptedText}`);
    const success = score % 7 !== 0;
    const externalPostId = success ? `${this.network}_${score}_${Date.now()}` : null;

    return {
      success,
      externalPostId,
      message: success
        ? scheduled
          ? "Agendamento registrado e processado em ambiente mock."
          : "Publicacao enviada com sucesso em ambiente mock."
        : "Falha simulada pela camada mock da rede social.",
      payload: {
        network: this.network,
        scheduled,
        score,
        preview: input.preview
      }
    };
  }
}
