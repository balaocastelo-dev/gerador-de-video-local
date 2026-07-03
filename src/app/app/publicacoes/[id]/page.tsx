import { notFound } from "next/navigation";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPostDetails } from "@/lib/app-data";
import { NETWORK_LABEL_MAP } from "@/lib/constants";

export default async function PublicationDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const details = await getPostDetails(id);

  if (!details) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card className="border-brand-500/20 bg-brand-950/20">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Detalhes da publicacao</p>
          <h2 className="text-3xl font-semibold text-white">{details.post.status}</h2>
          <p className="text-sm text-zinc-300">{details.post.original_text}</p>
        </div>
      </Card>

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm text-zinc-400">Criada em</p>
            <p className="mt-2 text-white">{format(new Date(details.post.created_at), "dd/MM/yyyy HH:mm")}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Objetivo</p>
            <p className="mt-2 text-white">{details.post.objective}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Tom</p>
            <p className="mt-2 text-white">{details.post.tone}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Agendamento</p>
            <p className="mt-2 text-white">
              {details.post.scheduled_at
                ? format(new Date(details.post.scheduled_at), "dd/MM/yyyy HH:mm")
                : "Publicacao imediata"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
        <Card>
          <h3 className="text-xl font-medium text-white">Previas por rede</h3>
          <div className="mt-6 space-y-4">
            {details.targets.map((target) => (
              <div key={target.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-base font-medium text-white">{NETWORK_LABEL_MAP[target.network]}</p>
                  <Badge
                    tone={
                      target.status === "published"
                        ? "success"
                        : target.status === "failed"
                          ? "danger"
                          : target.status === "scheduled"
                            ? "warning"
                            : "neutral"
                    }
                  >
                    {target.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  {target.title ? <p>Titulo: {target.title}</p> : null}
                  {target.description ? <p>Descricao: {target.description}</p> : null}
                  <p>Texto: {target.adapted_text}</p>
                  {target.hashtags?.length ? <p>Hashtags: {target.hashtags.join(", ")}</p> : null}
                  {target.character_limit_warning ? (
                    <p className="text-amber-300">Alerta: {target.character_limit_warning}</p>
                  ) : null}
                  {target.error_message ? <p className="text-red-300">Erro: {target.error_message}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-medium text-white">Logs da publicacao</h3>
          <div className="mt-6 space-y-4">
            {details.logs.length ? (
              details.logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-white">
                      {log.network ? NETWORK_LABEL_MAP[log.network] : "Sistema"}
                    </p>
                    <Badge tone={log.status === "published" ? "success" : log.status === "failed" ? "danger" : "warning"}>
                      {log.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-zinc-300">{log.message}</p>
                  <p className="mt-2 text-xs text-zinc-500">{format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">Nenhum log registrado para esta publicacao.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
