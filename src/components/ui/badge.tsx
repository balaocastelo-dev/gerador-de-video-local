import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    neutral: "border-white/10 bg-white/5 text-zinc-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    danger: "border-red-500/30 bg-red-500/10 text-red-300"
  }[tone];

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", toneClass)}>
      {children}
    </span>
  );
}
