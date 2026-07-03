 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarDays,
  FileClock,
  Gauge,
  Library,
  LogOut,
  Network,
  PenSquare,
  Settings,
  TableProperties
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/constants";

const menu = [
  { href: "/app", label: "Dashboard", icon: Gauge },
  { href: "/app/nova-publicacao", label: "Nova publicacao", icon: PenSquare },
  { href: "/app/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/app/publicacoes", label: "Publicacoes", icon: TableProperties },
  { href: "/app/redes-conectadas", label: "Redes conectadas", icon: Network },
  { href: "/app/biblioteca-de-midia", label: "Biblioteca de midia", icon: Library },
  { href: "/app/logs", label: "Logs", icon: FileClock },
  { href: "/app/configuracoes", label: "Configuracoes", icon: Settings }
];

export function AppShell({
  children,
  profile
}: {
  children: ReactNode;
  profile: { name: string | null; email: string | null } | null;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px,1fr]">
        <aside className="border-b border-white/10 bg-black/50 p-6 lg:border-b-0 lg:border-r">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-semibold text-white shadow-glow">
                BS
              </div>
              <div>
                <p className="text-lg font-semibold">{APP_NAME}</p>
                <p className="text-sm text-zinc-400">SaaS de gestao e publicacao social</p>
              </div>
              <Badge tone="warning">Mock APIs ativas</Badge>
            </div>

            <nav className="space-y-2">
              {menu.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                      active ? "bg-brand-600 text-white shadow-glow" : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{profile?.name ?? "Conta SaaS"}</p>
              <p className="mt-1 text-sm text-zinc-400">{profile?.email ?? "Sem e-mail identificado"}</p>
              <div className="mt-4 flex items-center gap-3 text-zinc-400">
                <LogOut className="h-4 w-4" />
                <LogoutButton />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 bg-hero-grid">
          <header className="border-b border-white/10 bg-black/30 px-6 py-4 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Balão Social Manager</p>
                <h1 className="text-2xl font-semibold text-white">Operacao multicanal com identidade propria</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="neutral">Supabase Auth + Database + Storage</Badge>
                <Badge tone="success">RLS preparado</Badge>
              </div>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
