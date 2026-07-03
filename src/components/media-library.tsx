"use client";

import { useMemo, useState, useTransition } from "react";

import { deleteMediaAction, uploadMediaAction } from "@/actions/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import type { MediaAsset } from "@/types/app";

export function MediaLibrary({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      images: assets.filter((asset) => asset.file_type.startsWith("image/")).length,
      videos: assets.filter((asset) => asset.file_type.startsWith("video/")).length
    }),
    [assets]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-400">Arquivos totais</p>
          <p className="mt-3 text-3xl font-semibold text-white">{assets.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Imagens</p>
          <p className="mt-3 text-3xl font-semibold text-white">{counts.images}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Videos</p>
          <p className="mt-3 text-3xl font-semibold text-white">{counts.videos}</p>
        </Card>
      </div>

      <Card>
        <form
          className="space-y-4"
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

              setAssets((current) => [...(result.assets ?? []), ...current]);
              setMessage(result.success ?? "Upload concluido.");
              form.reset();
            });
          }}
        >
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-white">Enviar nova midia</h3>
            <p className="text-sm text-zinc-400">
              Formatos aceitos: JPG, JPEG, PNG, WEBP, MP4 e MOV. Limite maximo de 50 MB por arquivo.
            </p>
          </div>
          <input
            type="file"
            name="files"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.mp4,.mov"
            className="block w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-sm text-zinc-300"
          />
          {message ? <p className="text-sm text-brand-300">{message}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Enviando..." : "Enviar arquivos"}
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {assets.length ? (
          assets.map((asset) => (
            <Card key={asset.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-medium text-white">{asset.file_name}</p>
                    <p className="text-sm text-zinc-400">{asset.storage_path}</p>
                  </div>
                  <Badge tone={asset.file_type.startsWith("video/") ? "warning" : "success"}>
                    {asset.file_type.startsWith("video/") ? "Video" : "Imagem"}
                  </Badge>
                </div>
                <div className="grid gap-2 text-sm text-zinc-300">
                  <p>Tipo: {asset.file_type}</p>
                  <p>Tamanho: {formatBytes(asset.file_size)}</p>
                  <p>URL: {asset.file_url}</p>
                </div>
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteMediaAction(asset.id, asset.storage_path);
                      setMessage(result.success ?? null);
                      setAssets((current) => current.filter((item) => item.id !== asset.id));
                    })
                  }
                >
                  Excluir
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="xl:col-span-2">
            <p className="text-sm text-zinc-400">
              Nenhum arquivo enviado ainda. Use o upload acima para popular sua biblioteca.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
