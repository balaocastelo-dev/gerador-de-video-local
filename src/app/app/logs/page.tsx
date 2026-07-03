import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPublishLogs } from "@/lib/app-data";
import { NETWORK_LABEL_MAP } from "@/lib/constants";

export default async function LogsPage() {
  const logs = await getPublishLogs(100);

  return (
    <div className="space-y-6">
      <Card className="border-brand-500/20 bg-brand-950/20">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Logs</p>
          <h2 className="text-3xl font-semibold text-white">Auditoria das publicacoes e integracoes</h2>
          <p className="max-w-3xl text-sm text-zinc-300">
            Cada tentativa mock de envio registra data, rede, status, mensagem, payload e ID externo
            simulado.
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        {logs.length ? (
          logs.map((log) => {
            const payload = JSON.stringify(log.response_payload, null, 2);
            const externalPostId =
              typeof log.response_payload?.externalPostId === "string"
                ? log.response_payload.externalPostId
                : typeof log.response_payload?.preview === "object"
                  ? JSON.stringify(log.response_payload.preview).slice(0, 80)
                  : "-";

            return (
              <Card key={log.id}>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-medium text-white">
                        {log.network ? NETWORK_LABEL_MAP[log.network] : "Sistema"}
                      </p>
                      <p className="text-sm text-zinc-500">{format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}</p>
                    </div>
                    <Badge tone={log.status === "published" ? "success" : log.status === "failed" ? "danger" : "warning"}>
                      {log.status}
                    </Badge>
                  </div>

                  <div className="grid gap-4 text-sm text-zinc-300">
                    <p>Mensagem: {log.message}</p>
                    <p>ID simulado: {externalPostId}</p>
                    <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-300">
                      {payload}
                    </pre>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <p className="text-sm text-zinc-400">Nenhum log disponivel ainda.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
