import { z } from "zod";

import { MAX_UPLOAD_SIZE } from "@/lib/constants";

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres.")
});

export const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Informe seu nome.")
});

export const networkSchema = z.enum([
  "instagram",
  "facebook",
  "threads",
  "linkedin",
  "tiktok",
  "youtube",
  "x",
  "pinterest"
]);

export const postPayloadSchema = z.object({
  originalText: z.string().min(10, "Escreva pelo menos 10 caracteres."),
  objective: z.enum([
    "venda",
    "promocao",
    "institucional",
    "aviso",
    "conteudo_educativo",
    "lancamento"
  ]),
  tone: z.enum(["profissional", "direto", "descontraido", "persuasivo", "premium"]),
  networks: z.array(networkSchema).min(1, "Selecione ao menos uma rede."),
  mediaAssetIds: z.array(z.string().uuid()).default([])
});

export const scheduleSchema = postPayloadSchema.extend({
  scheduledAt: z.string().min(1, "Informe a data e hora do agendamento.")
});

export const targetPreviewSchema = z.object({
  network: networkSchema,
  adaptedText: z.string().min(1),
  title: z.string(),
  description: z.string(),
  hashtags: z.array(z.string()),
  warning: z.string().nullable(),
  recommendedMediaFormat: z.string(),
  status: z.enum(["ready", "needs_adjustment"])
});

export function validateMediaFile(file: File) {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Arquivo excede o limite de 50 MB.");
  }

  if (!["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"].includes(file.type)) {
    throw new Error("Formato invalido. Envie JPG, JPEG, PNG, WEBP, MP4 ou MOV.");
  }
}

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}
