import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPosts, getPostTargets } from "@/lib/app-data";
import { truncateText } from "@/lib/utils";

const filters = [
  { value: "all", label: "Todas" },
  { value: "draft", label: "Rascunhos" },
  { value: "scheduled", label: "Agendadas" },
  { value: "published", label: "Publicadas" },
  { value: "failed", label: "Com erro" },
  { value: "partially_published", label: "Parcialmente publicadas" }
];

export default async function PublicationsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const selectedStatus = params.status ?? "all";
  const [posts, targets] = await Promise.all([getPosts(selectedStatus), getPostTargets()]);

  return (
    <div className="space-y-6">
      <Card className="border-brand-500/20 bg-brand-950/20">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Publicacoes</p>
            <h2 className="text-3xl font-semibold text-white">Historico completo de criacao, envio e status</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Link
                key={filter.value}
                href={`/app/publicacoes?status=${filter.value}`}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedStatus === filter.value
                    ? "bg-brand-600 text-white"
                    : "border border-white/10 bg-white/5 text-zinc-300"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {posts.length ? (
          posts.map((post) => {
            const postNetworks = targets.filter((target) => target.post_id === post.id).map((target) => target.network);

            return (
              <Card key={post.id}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="space-y-3">
                    <p className="text-base font-medium text-white">{truncateText(post.original_text, 160)}</p>
                    <div className="flex flex-wrap gap-2">
                      {postNetworks.length ? (
                        postNetworks.map((network) => (
                          <Badge key={`${post.id}-${network}`} tone="neutral">
                            {network}
                          </Badge>
                        ))
                      ) : (
                        <Badge tone="warning">Sem redes</Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">
                      {format(new Date(post.created_at), "dd/MM/yyyy HH:mm")}
                      {post.scheduled_at ? ` • Agendado para ${format(new Date(post.scheduled_at), "dd/MM/yyyy HH:mm")}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
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
                    <Link href={`/app/publicacoes/${post.id}`} className="text-sm font-medium text-brand-300">
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <p className="text-sm text-zinc-400">Nenhuma publicacao encontrada para este filtro.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
