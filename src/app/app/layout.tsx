import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { Card } from "@/components/ui/card";
import { getCurrentUser, getUserProfile } from "@/lib/app-data";
import { hasSupabaseEnv } from "@/lib/env";

export default async function PrivateLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  if (!hasSupabaseEnv()) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <SetupNotice />
          <Card>
            <p className="text-sm text-zinc-300">
              Assim que o `.env.local` estiver configurado, o painel privado sera liberado com Auth,
              banco, storage e fluxo completo do MVP.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();

  return <AppShell profile={profile}>{children}</AppShell>;
}
