import { AuthForm } from "@/components/auth/auth-form";
import { SetupNotice } from "@/components/setup-notice";
import { hasSupabaseEnv } from "@/lib/env";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-6xl flex-col items-center gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex flex-1 items-center justify-center">
          <AuthForm mode="login" />
        </div>
        {!hasSupabaseEnv() ? (
          <div className="flex flex-1 items-center justify-center">
            <SetupNotice />
          </div>
        ) : null}
      </div>
    </main>
  );
}
