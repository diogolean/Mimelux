"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button, Logo } from "@mimelux/ui";
import { getServerSessionSnapshot, getSessionSnapshot, subscribeSession } from "@/lib/session";
import { roleHome } from "@/lib/use-role-guard";

export function LandingHeader() {
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSessionSnapshot);
  const user = session.status === "ready" ? session.user : null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:px-8">
      <Logo compact />
      <div className="flex items-center gap-2">
        {user ? (
          <Link href={roleHome(user.role)}>
            <Button size="sm">Abrir meu espaço</Button>
          </Link>
        ) : (
          <>
            <Link href="/auth?route=sign-in">
              <Button size="sm" variant="outline">Entrar</Button>
            </Link>
            <Link href="/auth?route=sign-up">
              <Button size="sm">Cadastre-se</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
