import { NetworkConnectCard } from "@/components/network-connect-card";
import { Card } from "@/components/ui/card";
import { getConnectedAccounts } from "@/lib/app-data";
import { SOCIAL_NETWORKS } from "@/lib/constants";

export default async function ConnectedNetworksPage() {
  const accounts = await getConnectedAccounts();

  return (
    <div className="space-y-6">
      <Card className="border-brand-500/20 bg-brand-950/20">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Redes conectadas</p>
          <h2 className="text-3xl font-semibold text-white">Integracoes mock preparadas para APIs oficiais</h2>
          <p className="max-w-3xl text-sm text-zinc-300">
            Conecte e desconecte contas sociais em modo mock. Os registros ficam salvos no Supabase e a
            estrutura ja esta pronta para migrar para OAuth e APIs reais no futuro.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SOCIAL_NETWORKS.map((summary) => (
          <NetworkConnectCard
            key={summary.network}
            summary={summary}
            account={accounts.find((item) => item.network === summary.network)}
          />
        ))}
      </div>
    </div>
  );
}
