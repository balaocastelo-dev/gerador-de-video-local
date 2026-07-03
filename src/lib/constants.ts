import type { NetworkSummary, PostObjective, PostTone, SocialNetwork } from "@/types/app";

export const APP_NAME = "Balão Social Manager";
export const APP_TAGLINE = "Gestao, adaptacao e publicacao multicanal com foco comercial.";
export const APP_TIMEZONE = "America/Sao_Paulo";
export const MEDIA_BUCKET = "social-media-assets";
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime"
];

export const SOCIAL_NETWORKS: NetworkSummary[] = [
  {
    network: "instagram",
    label: "Instagram",
    description: "Legenda visual com CTA forte e hashtags.",
    statusText: "Ideal para imagem, carrossel e reels.",
    recommendedMedia: "Imagem, carrossel ou reels",
    icon: "IG"
  },
  {
    network: "facebook",
    label: "Facebook Pagina",
    description: "Texto comercial para conversao e contato.",
    statusText: "Bom para campanhas locais e ofertas.",
    recommendedMedia: "Imagem ou video curto",
    icon: "FB"
  },
  {
    network: "threads",
    label: "Threads",
    description: "Tom natural e conversacional.",
    statusText: "Bom para aproximacao com audiencia.",
    recommendedMedia: "Imagem leve ou texto",
    icon: "TH"
  },
  {
    network: "linkedin",
    label: "LinkedIn",
    description: "Credibilidade, contexto e posicionamento.",
    statusText: "Ideal para institucional e autoridade.",
    recommendedMedia: "Imagem profissional ou video institucional",
    icon: "LI"
  },
  {
    network: "tiktok",
    label: "TikTok",
    description: "Gancho forte com dinamica de video curto.",
    statusText: "Alta energia e linguagem direta.",
    recommendedMedia: "Video curto vertical",
    icon: "TT"
  },
  {
    network: "youtube",
    label: "YouTube",
    description: "Titulo, descricao e tags.",
    statusText: "Funciona melhor com video e thumbnail forte.",
    recommendedMedia: "Video e thumbnail",
    icon: "YT"
  },
  {
    network: "x",
    label: "X / Twitter",
    description: "Mensagem objetiva e curta.",
    statusText: "Prioriza rapidez e concisao.",
    recommendedMedia: "Texto ou imagem pontual",
    icon: "X"
  },
  {
    network: "pinterest",
    label: "Pinterest",
    description: "Foco em busca visual e palavras-chave.",
    statusText: "Ideal para conteudo evergreen.",
    recommendedMedia: "Imagem vertical ou video curto",
    icon: "PI"
  }
];

export const POST_OBJECTIVES: { value: PostObjective; label: string }[] = [
  { value: "venda", label: "Venda" },
  { value: "promocao", label: "Promocao" },
  { value: "institucional", label: "Institucional" },
  { value: "aviso", label: "Aviso" },
  { value: "conteudo_educativo", label: "Conteudo educativo" },
  { value: "lancamento", label: "Lancamento" }
];

export const POST_TONES: { value: PostTone; label: string }[] = [
  { value: "profissional", label: "Profissional" },
  { value: "direto", label: "Direto" },
  { value: "descontraido", label: "Descontraido" },
  { value: "persuasivo", label: "Persuasivo" },
  { value: "premium", label: "Premium" }
];

export const POST_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "failed",
  "partially_published",
  "processing"
] as const;

export const NETWORK_LABEL_MAP = Object.fromEntries(
  SOCIAL_NETWORKS.map((item) => [item.network, item.label])
) as Record<SocialNetwork, string>;
