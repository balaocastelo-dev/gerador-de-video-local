"use client";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button variant="secondary" type="submit" className="w-full">
        Sair
      </Button>
    </form>
  );
}
