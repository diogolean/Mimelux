"use client";

import type { AccountRole } from "@mimelux/core";
import type { SessionUser } from "./api-auth";

export type { SessionUser };

type SessionSnapshot = {
  status: "loading" | "ready";
  user: SessionUser | null;
};

const serverSnapshot: SessionSnapshot = { status: "loading", user: null };
let snapshot: SessionSnapshot = serverSnapshot;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") window.dispatchEvent(new Event("mimelux:state"));
}

export function subscribeSession(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getSessionSnapshot() {
  return snapshot;
}

export function getServerSessionSnapshot() {
  return serverSnapshot;
}

function setSnapshot(next: SessionSnapshot) {
  snapshot = next;
  emit();
}

async function readUser(response: Response) {
  const data = (await response.json().catch(() => ({}))) as { user?: SessionUser | null; message?: string };
  if (!response.ok) throw new Error(data.message || "Não foi possível entrar.");
  setSnapshot({ status: "ready", user: data.user ?? null });
  return data.user ?? null;
}

let refreshInflight: Promise<SessionUser | null> | null = null;

export async function refreshSession() {
  if (refreshInflight) return refreshInflight;
  refreshInflight = (async () => {
    try {
      const response = await fetch("/api/session", { cache: "no-store" });
      return await readUser(response);
    } catch {
      setSnapshot({ status: "ready", user: snapshot.user });
      return snapshot.user;
    } finally {
      refreshInflight = null;
    }
  })();
  return refreshInflight;
}

export async function loginAccount(email: string, password: string) {
  const response = await fetch("/api/session/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const user = await readUser(response);
  if (!user) throw new Error("Não foi possível entrar.");
  return user;
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  role: AccountRole;
  acceptTerms: true;
  acceptCreatorTerms?: boolean;
}) {
  const response = await fetch("/api/session/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const user = await readUser(response);
  if (!user) throw new Error("Não foi possível criar a conta.");
  return user;
}

export async function socialAccount(
  provider: string,
  role: AccountRole,
  acceptance: { acceptTerms: true; acceptCreatorTerms?: boolean },
) {
  const response = await fetch("/api/session/social", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider, role, ...acceptance }),
  });
  const user = await readUser(response);
  if (!user) throw new Error("Não foi possível entrar.");
  return user;
}

export async function logoutAccount() {
  await fetch("/api/session/logout", { method: "POST" });
  setSnapshot({ status: "ready", user: null });
}
