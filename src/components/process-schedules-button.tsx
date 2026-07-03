"use client";

import { useState, useTransition } from "react";

import { processPendingJobsAction } from "@/actions/posts";
import { Button } from "@/components/ui/button";

export function ProcessSchedulesButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Button
        onClick={() =>
          startTransition(async () => {
            const result = await processPendingJobsAction();
            setMessage(result.error ?? result.success ?? null);
          })
        }
        disabled={pending}
      >
        {pending ? "Processando..." : "Processar agendamentos pendentes"}
      </Button>
      {message ? <p className="text-sm text-brand-300">{message}</p> : null}
    </div>
  );
}
