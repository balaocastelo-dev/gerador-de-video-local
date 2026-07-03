"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { adaptPostAction, publishPostNowAction, schedulePostAction } from "@/actions/posts";
import { uploadMediaAction } from "@/actions/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NETWORK_LABEL_MAP, POST_OBJECTIVES, POST_TONES } from "@/lib/constants";
import type { ConnectedAccount, MediaAsset, PostPreview } from "@/types/app";

export function NewPostWorkspace({
  connectedAccounts,
  initialAssets
}: {
  connectedAccounts: ConnectedAccount[];
  initialAssets: MediaAsset[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [assets, setAssets] = useState(initialAssets);
  const [message, setMessage] = useState<string | null>(null);
  const [previews, setPreviews] = useState<PostPreview[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>(
    connectedAccounts.filter((item) => item.status === "connected").slice(0, 2).map((item) => item.network)
  );
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [originalText, setOriginalText] = useState("");
  const [objective, setObjective] = useState("venda");
  const [tone, setTone] = useState("profissional");
  const [scheduledAt, setScheduledAt] = useState("");

  const connectedOnly = useMemo(
    () => connectedAccounts.filter((item) => item.status === "connected"),
    [connectedAccounts]
  );

  function basePayload() {
    return {
      originalText,
      objective,
      tone,
      networks: selectedNetworks,
      mediaAssetIds: selectedAssetIds
    };
  }

  function toggleNetwork(network: string) {
    setSelectedNetworks((current) =>
      current.includes(network) ? current.filter((item) => item !== network) : [...current, network]
    );
  }

  function toggleAsset(assetId: string) {
    setSelectedAssetIds((current) =>
      current.includes(assetId) ? current.filter((item) => item !== assetId) : [...current, assetId]
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-brand-500/20 bg-brand-950/20">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Nova publicacao</p>
          <h2 className="text-3xl font-semibold text-white">Crie uma vez, adapte para cada rede e publique</h2>
          <p className="max-w-3xl text-sm text-zinc-300">
            Selecione objetivo, tom, redes conectadas e midias para gerar previas especificas por canal sem
            depender de IA paga neste MVP.
          </p>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-white">Conteudo base</h3>
                <p className="text-sm text-zinc-400">Texto principal que sera adaptado para cada rede.</p>
              </div>
              <Textarea
                placeholder="Descreva sua campanha, oferta, aviso ou conteudo educativo..."
                value={originalText}
                onChange={(event) => setOriginalText(event.target.value)}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-zinc-300">
                  Objetivo
                  <select
                    value={objective}
                    onChange={(event) => setObjective(event.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                  >
                    {POST_OBJECTIVES.map((item) => (
                      <option key={item.value} value={item.value} className="bg-black">
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-zinc-300">
                  Tom
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                  >
                    {POST_TONES.map((item) => (
                      <option key={item.value} value={item.value} className="bg-black">
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-white">Redes conectadas</h3>
                <p className="text-sm text-zinc-400">
                  Selecione onde este conteudo deve ser adaptado e enviado.
                </p>
              </div>

              {connectedOnly.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {connectedOnly.map((account) => (
                    <label
                      key={account.id}
                      className={`rounded-2xl border p-4 text-sm transition ${
                        selectedNetworks.includes(account.network)
                          ? "border-brand-500 bg-brand-600/10 text-white"
                          : "border-white/10 bg-white/5 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedNetworks.includes(account.network)}
                          onChange={() => toggleNetwork(account.network)}
                        />
                        <div>
                          <p>{NETWORK_LABEL_MAP[account.network]}</p>
                          <p className="text-xs text-zinc-500">{account.account_name}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">
                  Nenhuma rede conectada ainda. Conecte uma conta antes de publicar.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-white">Midias da publicacao</h3>
                <p className="text-sm text-zinc-400">
                  Envie arquivos agora ou selecione itens ja existentes na biblioteca.
                </p>
              </div>

              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setMessage(null);
                  const form = event.currentTarget;
                  const formData = new FormData(form);

                  startTransition(async () => {
                    const result = await uploadMediaAction(formData);
                    if (result.error) {
                      setMessage(result.error);
                      return;
                    }

                    const uploaded = result.assets ?? [];
                    setAssets((current) => [...uploaded, ...current]);
                    setSelectedAssetIds((current) => [...uploaded.map((asset) => asset.id), ...current]);
                    setMessage(result.success ?? "Upload concluido.");
                    form.reset();
                  });
                }}
              >
                <input
                  type="file"
                  name="files"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.mov"
                  className="block w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-sm text-zinc-300"
                />
                <Button type="submit" variant="secondary" disabled={pending}>
                  Enviar midias
                </Button>
              </form>

              <div className="grid gap-3">
                {assets.length ? (
                  assets.map((asset) => (
                    <label
                      key={asset.id}
                      className={`rounded-2xl border p-4 text-sm transition ${
                        selectedAssetIds.includes(asset.id)
                          ? "border-brand-500 bg-brand-600/10 text-white"
                          : "border-white/10 bg-white/5 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAssetIds.includes(asset.id)}
                          onChange={() => toggleAsset(asset.id)}
                        />
                        <div>
                          <p>{asset.file_name}</p>
                          <p className="text-xs text-zinc-500">{asset.file_type}</p>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400">Nenhuma midia disponivel ainda.</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await adaptPostAction(basePayload());
                      if (result.error) {
                        setMessage(result.error);
                        return;
                      }

                      setPreviews(result.previews ?? []);
                      setMessage(result.success ?? "Previas atualizadas.");
                    })
                  }
                >
                  Ajustar para cada rede
                </Button>

                <Button
                  variant="secondary"
                  disabled={pending || !previews.length}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await publishPostNowAction({
                        ...basePayload(),
                        previews
                      });

                      if (result.error) {
                        setMessage(result.error);
                        return;
                      }

                      setMessage(result.success ?? "Publicacao concluida.");
                      router.push("/app/publicacoes");
                      router.refresh();
                    })
                  }
                >
                  Publicar agora
                </Button>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                />
                <Button
                  variant="secondary"
                  disabled={pending || !previews.length || !scheduledAt}
                  onClick={() =>
                    startTransition(async () => {
                      const iso = new Date(scheduledAt).toISOString();
                      const result = await schedulePostAction({
                        ...basePayload(),
                        previews,
                        scheduledAt: iso
                      });

                      if (result.error) {
                        setMessage(result.error);
                        return;
                      }

                      setMessage(result.success ?? "Agendamento criado.");
                      router.push("/app/calendario");
                      router.refresh();
                    })
                  }
                >
                  Agendar
                </Button>
              </div>

              <p className="text-xs text-zinc-500">Timezone alvo: America/Sao_Paulo</p>
              {message ? <p className="text-sm text-brand-300">{message}</p> : null}
            </div>
          </Card>

          <div className="space-y-4">
            {previews.length ? (
              previews.map((preview, index) => (
                <Card key={preview.network}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-medium text-white">{NETWORK_LABEL_MAP[preview.network]}</p>
                        <p className="text-sm text-zinc-400">{preview.recommendedMediaFormat}</p>
                      </div>
                      <Badge tone={preview.status === "ready" ? "success" : "warning"}>
                        {preview.status === "ready" ? "Pronto" : "Precisa ajustar"}
                      </Badge>
                    </div>

                    <label className="block space-y-2 text-sm text-zinc-300">
                      Texto adaptado
                      <Textarea
                        value={preview.adaptedText}
                        onChange={(event) =>
                          setPreviews((current) =>
                            current.map((item, currentIndex) =>
                              currentIndex === index ? { ...item, adaptedText: event.target.value } : item
                            )
                          )
                        }
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block space-y-2 text-sm text-zinc-300">
                        Titulo
                        <Input
                          value={preview.title}
                          onChange={(event) =>
                            setPreviews((current) =>
                              current.map((item, currentIndex) =>
                                currentIndex === index ? { ...item, title: event.target.value } : item
                              )
                            )
                          }
                        />
                      </label>

                      <label className="block space-y-2 text-sm text-zinc-300">
                        Descricao
                        <Input
                          value={preview.description}
                          onChange={(event) =>
                            setPreviews((current) =>
                              current.map((item, currentIndex) =>
                                currentIndex === index ? { ...item, description: event.target.value } : item
                              )
                            )
                          }
                        />
                      </label>
                    </div>

                    <label className="block space-y-2 text-sm text-zinc-300">
                      Hashtags
                      <Input
                        value={preview.hashtags.join(", ")}
                        onChange={(event) =>
                          setPreviews((current) =>
                            current.map((item, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...item,
                                    hashtags: event.target.value
                                      .split(",")
                                      .map((tag) => tag.trim())
                                      .filter(Boolean)
                                  }
                                : item
                            )
                          )
                        }
                      />
                    </label>

                    {preview.warning ? (
                      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                        {preview.warning}
                      </div>
                    ) : null}
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-sm text-zinc-400">
                  Gere a adaptacao para visualizar a previa por rede e editar manualmente cada versao.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
