import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-lg text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-white">Pagina nao encontrada</h1>
          <p className="text-sm text-zinc-400">Verifique a rota ou volte para o dashboard.</p>
          <Link href="/app">
            <Button>Ir para o dashboard</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
