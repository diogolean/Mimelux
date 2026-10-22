"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getServerSessionSnapshot, getSessionSnapshot, refreshSession, subscribeSession } from "./session";

export function useSignedIn() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSessionSnapshot);

  useEffect(() => {
    if (session.status === "loading") void refreshSession();
  }, [session.status]);

  useEffect(() => {
    if (session.status !== "ready") return;
    if (!session.user) router.replace("/auth?route=sign-in");
  }, [router, session]);

  return session.status === "ready" && Boolean(session.user);
}
