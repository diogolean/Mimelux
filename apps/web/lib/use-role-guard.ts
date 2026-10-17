"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { AccountRole } from "@mimelux/core";
import { readDemo } from "./demo-store";

function subscribe(callback: () => void) {
  window.addEventListener("mimelux:state", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("mimelux:state", callback);
    window.removeEventListener("storage", callback);
  };
}

export function roleHome(role: AccountRole) {
  if (role === "creator") return "/painel";
  if (role === "affiliate") return "/afiliados";
  return "/feed";
}

export function useRoleGuard(required: AccountRole) {
  const router = useRouter();
  const role = useSyncExternalStore(
    subscribe,
    () => readDemo().role,
    () => "fan" as AccountRole,
  );

  useEffect(() => {
    if (role !== required) router.replace(roleHome(role));
  }, [required, role, router]);

  return role === required;
}
