import Link from "next/link";
import { ArrowRight, CalendarClock, Network, ShieldCheck } from "lucide-react";

import { SetupNotice } from "@/components/setup-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { hasSupabaseEnv } from "@/lib/env";

const highlights = [
  {
    title: "Publicacao unica, adaptacao multicanal",
    description: "Crie uma vez e gere versoes locais para Instagram, LinkedIn, TikTok, X e mais."
  },
  {
    title: "Operacao centralizada",
    description: "Acompanhe dashboard, logs, redes conectadas, midia e calendario editorial."
  },
  {
    title: "Arquitetura pronta para escalar",
    description: "Supabase Auth, Database, Storage, RLS e services preparados para APIs oficiais."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center gap-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-brand-300">Balão Social Manager</p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight">
                {APP_NAME} para gestao e publicacao profissional em redes sociais.
              </h1>
              <p className="max-w-2xl text-lg text-zinc-300">{APP_TAGLINE}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button className="gap-2">
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button variant="secondary">Criar conta</Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Network, label: "Redes conectadas mock" },
                { icon: CalendarClock, label: "Agendamento com processamento manual" },
                { icon: ShieldCheck, label: "RLS e rotas privadas" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.label} className="border-white/10 bg-white/5">
                    <div className="space-y-3">
                      <Icon className="h-5 w-5 text-brand-300" />
                      <p className="text-sm text-zinc-200">{item.label}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {!hasSupabaseEnv() ? <SetupNotice /> : null}
            {highlights.map((item) => (
              <Card key={item.title}>
                <div className="space-y-2">
                  <h2 className="text-xl font-medium text-white">{item.title}</h2>
                  <p className="text-sm text-zinc-400">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
