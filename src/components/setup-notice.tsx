import Link from "next/link";

import { Card } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

export function SetupNotice() {
  return (
    <Card className="max-w-3xl border-brand-500/30 bg-brand-950/20">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Configuracao pendente</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">{APP_NAME}</h1>
          <p className="max-w-2xl text-sm text-zinc-300">
            O projeto ja esta estruturado, mas precisa das variaveis do Supabase no arquivo `.env.local`
            para ativar login, banco, storage e dados reais.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
          NEXT_PUBLIC_SUPABASE_URL
          <br />
          NEXT_PUBLIC_SUPABASE_ANON_KEY
          <br />
          SUPABASE_SERVICE_ROLE_KEY
          <br />
          ENCRYPTION_KEY
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white"
          >
            Abrir login
          </Link>
          <Link
            href="https://supabase.com/dashboard/project/nechxnubbxudesyjuxnb"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-medium text-white"
          >
            Abrir Supabase
          </Link>
        </div>
      </div>
    </Card>
  );
}
