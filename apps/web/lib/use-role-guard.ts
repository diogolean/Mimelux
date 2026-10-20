"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { AccountRole, SessionRole } from "@mimelux/core";
import { getServerSessionSnapshot, getSessionSnapshot, refreshSession, subscribeSession } from "./session";

export function roleHome(role: SessionRole) {
  if (role === "admin") return "/admin";
  if (role === "creator") return "/painel";
  if (role === "affiliate") return "/afiliados";
  return "/topcreators?tab=top-creators";
}

export function useRoleGuard(required: AccountRole) {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSessionSnapshot);

  useEffect(() => {
    if (session.status === "loading") void refreshSession();
  }, [session.status]);

  useEffect(() => {
    if (session.status !== "ready") return;
    if (!session.user) {
      router.replace("/auth?route=sign-in");
      return;
    }
    if (session.user.role !== required) router.replace(roleHome(session.user.role));
  }, [required, router, session]);

  return session.status === "ready" && session.user?.role === required;
}
