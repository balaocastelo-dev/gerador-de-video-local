"use client";

import { useState, useTransition } from "react";

import { updateProfileAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsForm({
  initialName,
  email
}: {
  initialName: string;
  email: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          const result = await updateProfileAction(formData);
          setMessage(result.error ?? result.success ?? null);
        });
      }}
    >
      <label className="block space-y-2 text-sm text-zinc-300">
        Nome da conta
        <Input name="name" defaultValue={initialName} />
      </label>
      <label className="block space-y-2 text-sm text-zinc-300">
        E-mail
        <Input value={email} disabled />
      </label>
      {message ? <p className="text-sm text-brand-300">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configuracoes"}
      </Button>
    </form>
  );
}
