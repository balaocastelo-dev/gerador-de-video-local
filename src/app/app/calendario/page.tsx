import Link from "next/link";
import { format } from "date-fns";

import { ProcessSchedulesButton } from "@/components/process-schedules-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPostTargets, getPublishJobs } from "@/lib/app-data";
import { NETWORK_LABEL_MAP } from "@/lib/constants";

export default async function CalendarPage() {
  const [jobs, targets] = await Promise.all([getPublishJobs(), getPostTargets()]);

  const grouped = jobs.reduce<Record<string, typeof jobs>>((acc, job) => {
    const key = format(new Date(job.run_at), "yyyy-MM-dd");
    acc[key] = [...(acc[key] ?? []), job];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="border-brand-500/20 bg-brand-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Calendario editorial</p>
            <h2 className="text-3xl font-semibold text-white">Visualize e processe agendamentos</h2>
            <p className="max-w-3xl text-sm text-zinc-300">
              O MVP usa processamento manual para executar jobs vencidos e registrar o resultado nos logs.
            </p>
          </div>
          <ProcessSchedulesButton />
        </div>
      </Card>

      <div className="grid gap-4">
        {Object.keys(grouped).length ? (
          Object.entries(grouped).map(([date, items]) => (
            <Card key={date}>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-medium text-white">{format(new Date(date), "dd/MM/yyyy")}</p>
                    <p className="text-sm text-zinc-400">{items.length} publicacao(oes) agendada(s)</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  {items.map((job) => {
                    const networks = targets.filter((target) => target.post_id === job.post_id).map((target) => target.network);

                    return (
                      <Link key={job.id} href={`/app/publicacoes/${job.post_id}`}>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-brand-500/50">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-white">
                                Execucao prevista para {format(new Date(job.run_at), "HH:mm")}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Redes: {networks.map((network) => NETWORK_LABEL_MAP[network]).join(", ") || "-"}
                              </p>
                            </div>
                            <Badge tone={job.status === "scheduled" ? "warning" : "success"}>{job.status}</Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm text-zinc-400">Nenhum agendamento encontrado.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
