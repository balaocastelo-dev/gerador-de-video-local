import { SettingsForm } from "@/components/settings-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getUserProfile } from "@/lib/app-data";
import { env, hasEncryptionKey } from "@/lib/env";

export default async function SettingsPage() {
  const profile = await getUserProfile();

  return (
    <div className="space-y-6">
      <Card className="border-brand-500/20 bg-brand-950/20">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Configuracoes</p>
          <h2 className="text-3xl font-semibold text-white">Perfil, ambiente e preparacao de integracoes</h2>
          <p className="max-w-3xl text-sm text-zinc-300">
            Atualize o nome da conta e acompanhe o estado das configuracoes sensiveis deste ambiente SaaS.
          </p>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <h3 className="text-xl font-medium text-white">Perfil</h3>
          <div className="mt-6">
            <SettingsForm initialName={profile?.name ?? ""} email={profile?.email ?? ""} />
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-medium text-white">Estado do ambiente</h3>
          <div className="mt-6 grid gap-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <span>Project ref</span>
              <Badge tone="neutral">{env.supabaseProjectRef}</Badge>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <span>Mock social APIs</span>
              <Badge tone={env.mockSocialApis ? "success" : "warning"}>
                {env.mockSocialApis ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <span>ENCRYPTION_KEY</span>
              <Badge tone={hasEncryptionKey() ? "success" : "warning"}>
                {hasEncryptionKey() ? "Configurada" : "Pendente"}
              </Badge>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">Proximas integracoes</p>
              <p className="mt-2 text-zinc-400">
                META, LinkedIn, TikTok, YouTube, X e Pinterest ja possuem variaveis reservadas no `.env`.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
