import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/app-data";
import { NETWORK_LABEL_MAP } from "@/lib/constants";
import { truncateText } from "@/lib/utils";

export default async function DashboardPage() {
  const { stats, latestPosts, networkStatuses, recentLogs } = await getDashboardData();

  const statCards = [
    { label: "Redes conectadas", value: stats.connectedAccounts },
    { label: "Publicacoes criadas", value: stats.totalPosts },
    { label: "Agendadas", value: stats.scheduledPosts },
    { label: "Publicadas", value: stats.publishedPosts },
    { label: "Com erro", value: stats.failedPosts }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-brand-500/20 bg-brand-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Dashboard</p>
            <h2 className="text-3xl font-semibold text-white">Visao geral da operacao social</h2>
            <p className="max-w-2xl text-sm text-zinc-300">
              Monitore redes conectadas, publicacoes criadas, status de entrega e os ultimos eventos
              do motor mock.
            </p>
          </div>
          <Link href="/app/nova-publicacao">
            <Button>Criar nova publicacao</Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-zinc-400">{item.label}</p>
            <p className="mt-4 text-4xl font-semibold text-white">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Ultimas publicacoes</h3>
            <Link href="/app/publicacoes" className="text-sm text-brand-300">
              Ver todas
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {latestPosts.length ? (
              latestPosts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-2xl text-sm text-zinc-200">{truncateText(post.original_text, 110)}</p>
                    <Badge
                      tone={
                        post.status === "published"
                          ? "success"
                          : post.status === "failed"
                            ? "danger"
                            : post.status === "scheduled"
                              ? "warning"
                              : "neutral"
                      }
                    >
                      {post.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">
                    Criado em {format(new Date(post.created_at), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">Nenhuma publicacao criada ate o momento.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Status das redes</h3>
            <Link href="/app/redes-conectadas" className="text-sm text-brand-300">
              Gerenciar
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {networkStatuses.map((network) => (
              <div key={network.network} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{network.label}</p>
                    <p className="text-xs text-zinc-500">{network.accountName}</p>
                  </div>
                  <Badge tone={network.status === "connected" ? "success" : "danger"}>
                    {network.status === "connected" ? "Conectada" : "Desconectada"}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-zinc-400">
                  {network.lastPublishedAt
                    ? `Ultima publicacao: ${format(new Date(network.lastPublishedAt), "dd/MM/yyyy HH:mm")}`
                    : `Nenhuma publicacao enviada para ${NETWORK_LABEL_MAP[network.network]}.`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Eventos recentes</h3>
          <Link href="/app/logs" className="text-sm text-brand-300">
            Abrir logs
          </Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="pb-3">Data</th>
                <th className="pb-3">Rede</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Mensagem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentLogs.length ? (
                recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 text-zinc-400">{format(new Date(log.created_at), "dd/MM HH:mm")}</td>
                    <td className="py-3 text-zinc-200">{log.network ? NETWORK_LABEL_MAP[log.network] : "-"}</td>
                    <td className="py-3 text-zinc-200">{log.status}</td>
                    <td className="py-3 text-zinc-400">{truncateText(log.message, 90)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-zinc-500">
                    Os logs serao exibidos aqui apos conexoes, publicacoes ou processamentos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
