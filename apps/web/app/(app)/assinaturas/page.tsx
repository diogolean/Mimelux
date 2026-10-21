"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@mimelux/ui";
import { brl } from "@/lib/gateway";

type SubscriptionItem = {
  id: string;
  creatorName: string;
  creatorUsername: string;
  planName: string;
  amountCents: number;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  access: boolean;
  simulation: boolean;
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Ativa",
  PENDING: "Pendente",
  PAST_DUE: "Pagamento pendente",
  CANCELED: "Cancelada",
  EXPIRED: "Encerrada",
};

export default function SubscriptionsPage() {
  const [items, setItems] = useState<SubscriptionItem[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    const response = await fetch("/api/subscriptions/me", { cache: "no-store" });
    const data = (await response.json().catch(() => ({}))) as { items?: SubscriptionItem[]; message?: string };
    if (response.status === 401) {
      setError("Entre para ver suas assinaturas.");
      setItems([]);
      return;
    }
    if (!response.ok) {
      setError(data.message || "Não foi possível carregar as assinaturas.");
      setItems([]);
      return;
    }
    setItems(data.items ?? []);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load().catch(() => {
        setError("Não foi possível carregar as assinaturas.");
        setItems([]);
      });
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  async function cancel(id: string) {
    setBusy(id);
    setError("");
    try {
      const response = await fetch(`/api/subscriptions/${id}/cancel`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(data.message || "Não foi possível cancelar.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível cancelar.");
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-primary-strong">Sua conta</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-.04em]">Minhas assinaturas</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        O acesso fica ativo até o fim do período já pago. Cancelar não cobra de novo e não corta o período atual.
      </p>
      {error && <p className="mt-4 rounded-2xl bg-accent/25 px-4 py-3 text-sm">{error}</p>}
      {items === null && <p className="mt-8 text-sm text-muted">Carregando assinaturas…</p>}
      {items?.length === 0 && !error && (
        <p className="mt-8 text-sm text-muted">Você ainda não assina nenhum criador.</p>
      )}
      <div className="mt-6 space-y-3">
        {items?.map((item) => (
          <article key={item.id} data-testid="subscription-card" className="rounded-3xl border border-border bg-elevated p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">{item.creatorName || item.creatorUsername}</h2>
                <p className="mt-1 text-sm text-muted">{item.planName || "Assinatura"} · {brl(item.amountCents)}</p>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary-strong">{statusLabel[item.status] ?? item.status}</p>
            </div>
            <p className="mt-3 text-xs text-muted">
              {item.access ? "Acesso liberado" : "Sem acesso agora"}
              {item.currentPeriodEnd ? ` · até ${new Date(item.currentPeriodEnd).toLocaleDateString("pt-BR")}` : ""}
              {item.simulation ? " · simulação local" : ""}
              {item.cancelAtPeriodEnd ? " · cancela ao fim do período" : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.creatorUsername && (
                <Link href={`/creator/${item.creatorUsername}`} className="inline-flex h-9 items-center rounded-full border border-border px-4 text-xs font-bold">
                  Ver perfil
                </Link>
              )}
              {item.status === "ACTIVE" && !item.cancelAtPeriodEnd && (
                <Button data-testid="subscription-cancel" size="sm" variant="outline" disabled={busy === item.id} onClick={() => void cancel(item.id)}>
                  {busy === item.id ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  Cancelar
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
