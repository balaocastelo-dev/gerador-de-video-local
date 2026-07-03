"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-500 focus-visible:ring-brand-400 shadow-glow disabled:bg-brand-900/60",
  secondary:
    "border border-white/10 bg-white/5 text-white hover:bg-white/10 focus-visible:ring-white/30",
  ghost: "bg-transparent text-zinc-300 hover:bg-white/5 focus-visible:ring-white/30",
  danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
