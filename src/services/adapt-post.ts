import { NETWORK_LABEL_MAP } from "@/lib/constants";
import type { MediaAsset, PostObjective, PostPreview, PostTone, SocialNetwork } from "@/types/app";

type AdaptInput = {
  originalText: string;
  objective: PostObjective;
  tone: PostTone;
  network: SocialNetwork;
  mediaAssets: MediaAsset[];
};

const tonePrefixMap: Record<PostTone, string> = {
  profissional: "Com abordagem profissional,",
  direto: "De forma direta,",
  descontraido: "Em um tom leve,",
  persuasivo: "Com foco em conversao,",
  premium: "Com percepcao premium,"
};

const objectiveCtaMap: Record<PostObjective, string> = {
  venda: "fale com nossa equipe e aproveite a oportunidade.",
  promocao: "confira a condicao especial antes de acabar.",
  institucional: "conheca melhor o trabalho da marca.",
  aviso: "acompanhe as atualizacoes e evite perder informacoes importantes.",
  conteudo_educativo: "salve este conteudo e compartilhe com sua equipe.",
  lancamento: "descubra a novidade em primeira mao."
};

function extractKeywords(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .slice(0, 4)
    )
  );
}

function buildHashtags(text: string, objective: PostObjective, network: SocialNetwork) {
  const keywords = extractKeywords(text);
  const base = [`#${network}`, `#marketingdigital`, `#conteudo`];
  const objectiveTag =
    objective === "conteudo_educativo"
      ? "#aprendizado"
      : objective === "institucional"
        ? "#marca"
        : "#resultados";

  return [...base, objectiveTag, ...keywords.map((word) => `#${word}`)].slice(0, 6);
}

function characterWarning(text: string, network: SocialNetwork) {
  const limitMap: Record<SocialNetwork, number> = {
    instagram: 2200,
    facebook: 63206,
    threads: 500,
    linkedin: 3000,
    tiktok: 300,
    youtube: 5000,
    x: 280,
    pinterest: 500
  };

  const limit = limitMap[network];
  if (text.length <= limit) return null;

  return `Conteudo com ${text.length} caracteres. Limite recomendado para ${NETWORK_LABEL_MAP[network]}: ${limit}.`;
}

export function adaptPostForNetwork({
  originalText,
  objective,
  tone,
  network,
  mediaAssets
}: AdaptInput): PostPreview {
  const sanitized = originalText.replace(/\s+/g, " ").trim();
  const intro = `${tonePrefixMap[tone]} ${sanitized}`;
  const cta = objectiveCtaMap[objective];
  const hasVideo = mediaAssets.some((asset) => asset.file_type.startsWith("video/"));
  const hasImage = mediaAssets.some((asset) => asset.file_type.startsWith("image/"));
  const hashtags = buildHashtags(sanitized, objective, network);

  const templates: Record<SocialNetwork, Omit<PostPreview, "network" | "hashtags" | "warning" | "status">> = {
    instagram: {
      adaptedText: `${intro}\n\nDestaque visual, beneficio claro e chamada para acao.\n${cta}`,
      title: "",
      description: "",
      recommendedMediaFormat: hasVideo ? "Reels ou video curto vertical" : "Imagem forte ou carrossel"
    },
    facebook: {
      adaptedText: `${intro}\n\nEntre em contato agora e fale com nossa equipe no WhatsApp. ${cta}`,
      title: "",
      description: "",
      recommendedMediaFormat: hasImage ? "Imagem promocional" : "Video curto com oferta"
    },
    threads: {
      adaptedText: `${sanitized}\n\nO que voce acha disso? Vamos conversar por aqui.`,
      title: "",
      description: "",
      recommendedMediaFormat: hasImage ? "Imagem leve de apoio" : "Texto com conversa"
    },
    linkedin: {
      adaptedText: `${intro}\n\nContexto, credibilidade e impacto para o negocio.\n${cta}`,
      title: "",
      description: "",
      recommendedMediaFormat: hasVideo ? "Video institucional" : "Imagem profissional"
    },
    tiktok: {
      adaptedText: `${sanitized.slice(0, 180)}\nGancho forte. Resultado rapido. ${cta}`,
      title: "",
      description: "",
      recommendedMediaFormat: "Video curto vertical com edicao dinamica"
    },
    youtube: {
      adaptedText: sanitized,
      title: `YouTube | ${sanitized.slice(0, 70)}`,
      description: `${intro}\n\nPontos principais:\n- valor gerado\n- beneficio claro\n- chamada para acao\n\n${cta}`,
      recommendedMediaFormat: "Video horizontal com thumbnail destacada"
    },
    x: {
      adaptedText: `${sanitized.slice(0, 220)} ${cta}`.slice(0, 280),
      title: "",
      description: "",
      recommendedMediaFormat: "Texto curto com imagem de apoio"
    },
    pinterest: {
      adaptedText: sanitized,
      title: `${sanitized.slice(0, 60)} | Inspire sua audiencia`,
      description: `${intro} ${cta}`,
      recommendedMediaFormat: "Imagem vertical ou video curto com apelo visual"
    }
  };

  const draft = templates[network];
  const warning = characterWarning(draft.adaptedText, network);

  return {
    network,
    adaptedText: draft.adaptedText,
    title: draft.title,
    description: draft.description,
    hashtags,
    warning,
    recommendedMediaFormat: draft.recommendedMediaFormat,
    status: warning ? "needs_adjustment" : "ready"
  };
}
