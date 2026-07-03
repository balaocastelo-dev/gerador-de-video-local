export type AppStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "failed"
  | "partially_published"
  | "processing"
  | "connected"
  | "disconnected"
  | "ready"
  | "needs_adjustment";

export type SocialNetwork =
  | "instagram"
  | "facebook"
  | "threads"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "x"
  | "pinterest";

export type PostObjective =
  | "venda"
  | "promocao"
  | "institucional"
  | "aviso"
  | "conteudo_educativo"
  | "lancamento";

export type PostTone =
  | "profissional"
  | "direto"
  | "descontraido"
  | "persuasivo"
  | "premium";

export type MediaAsset = {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

export type ConnectedAccount = {
  id: string;
  user_id: string;
  network: SocialNetwork;
  account_name: string | null;
  status: "connected" | "disconnected";
  mock_access_token: string | null;
  encrypted_access_token: string | null;
  encrypted_refresh_token: string | null;
  connected_at: string | null;
  last_published_at: string | null;
  created_at: string;
};

export type PostRecord = {
  id: string;
  user_id: string;
  original_text: string;
  objective: PostObjective;
  tone: PostTone;
  status: AppStatus;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostTargetRecord = {
  id: string;
  post_id: string;
  user_id: string;
  network: SocialNetwork;
  adapted_text: string | null;
  title: string | null;
  description: string | null;
  hashtags: string[] | null;
  status: AppStatus;
  character_limit_warning: string | null;
  external_post_id: string | null;
  published_at: string | null;
  error_message: string | null;
  created_at: string;
};

export type PublishJob = {
  id: string;
  user_id: string;
  post_id: string;
  status: AppStatus;
  run_at: string;
  created_at: string;
  processed_at: string | null;
};

export type PublishLog = {
  id: string;
  user_id: string;
  post_id: string | null;
  post_target_id: string | null;
  network: SocialNetwork | null;
  status: AppStatus;
  message: string;
  response_payload: Record<string, unknown> | null;
  created_at: string;
};

export type PostPreview = {
  network: SocialNetwork;
  adaptedText: string;
  title: string;
  description: string;
  hashtags: string[];
  warning: string | null;
  recommendedMediaFormat: string;
  status: "ready" | "needs_adjustment";
};

export type NetworkSummary = {
  network: SocialNetwork;
  label: string;
  description: string;
  statusText: string;
  recommendedMedia: string;
  icon: string;
};
