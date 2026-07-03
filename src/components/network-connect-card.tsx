"use client";

import { useState, useTransition } from "react";

import { connectNetworkAction, disconnectNetworkAction } from "@/actions/networks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NETWORK_LABEL_MAP } from "@/lib/constants";
import type { ConnectedAccount, NetworkSummary } from "@/types/app";

export function NetworkConnectCard({
  summary,
  account
}: {
  summary: NetworkSummary;
  account?: ConnectedAccount;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const connected = account?.status === "connected";

  return (
    <Card className="h-full">
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600/20 text-sm font-semibold text-brand-200">
                {summary.icon}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{NETWORK_LABEL_MAP[summary.network]}</h3>
                <p className="text-sm text-zinc-400">{summary.description}</p>
              </div>
            </div>
            <Badge tone={connected ? "success" : "danger"}>{connected ? "Conectado" : "Desconectado"}</Badge>
          </div>

          <div className="space-y-2 text-sm text-zinc-300">
            <p>Conta: {account?.account_name ?? "Nenhuma conta conectada"}</p>
            <p>Integracao: {summary.statusText}</p>
            <p>Formato recomendado: {summary.recommendedMedia}</p>
            <p>Ultima publicacao: {account?.last_published_at ?? "Ainda nao houve envio"}</p>
          </div>

          {message ? <p className="text-sm text-brand-300">{message}</p> : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Button
            disabled={pending || connected}
            onClick={() =>
              startTransition(async () => {
                const result = await connectNetworkAction(summary.network);
                setMessage(result.error ?? result.success ?? null);
              })
            }
          >
            {pending ? "Processando..." : "Conectar"}
          </Button>
          <Button
            variant="secondary"
            disabled={pending || !connected}
            onClick={() =>
              startTransition(async () => {
                const result = await disconnectNetworkAction(summary.network);
                setMessage(result.error ?? result.success ?? null);
              })
            }
          >
            Desconectar
          </Button>
        </div>
      </div>
    </Card>
  );
}
