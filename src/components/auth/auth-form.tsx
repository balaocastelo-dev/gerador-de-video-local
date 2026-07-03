"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { signInAction, signUpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="w-full max-w-md border-white/10 bg-black/50">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Balão Social Manager</p>
          <h1 className="text-3xl font-semibold text-white">
            {mode === "login" ? "Entrar na plataforma" : "Criar sua conta"}
          </h1>
          <p className="text-sm text-zinc-400">
            {mode === "login"
              ? "Acesse seu painel para publicar, agendar e acompanhar logs."
              : "Comece seu ambiente SaaS com autenticacao e dados isolados por usuario."}
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            const formData = new FormData(event.currentTarget);

            startTransition(async () => {
              const result =
                mode === "login" ? await signInAction(formData) : await signUpAction(formData);

              if (result?.error) {
                setError(result.error);
                return;
              }

              router.push("/app");
              router.refresh();
            });
          }}
        >
          {mode === "signup" ? <Input name="name" placeholder="Nome da conta" required /> : null}
          <Input name="email" type="email" placeholder="seu@email.com" required />
          <Input name="password" type="password" placeholder="Senha" required />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <p className="text-sm text-zinc-400">
          {mode === "login" ? "Ainda nao tem conta?" : "Ja possui conta?"}{" "}
          <Link
            href={mode === "login" ? "/cadastro" : "/login"}
            className="font-medium text-brand-300 hover:text-brand-200"
          >
            {mode === "login" ? "Criar agora" : "Entrar"}
          </Link>
        </p>
      </div>
    </Card>
  );
}
