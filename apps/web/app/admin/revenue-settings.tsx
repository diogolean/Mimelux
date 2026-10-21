"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@mimelux/ui";

type CreatorRow = {
  id: string;
  name: string;
  username: string;
  ownership: "HOUSE" | "INDEPENDENT";
  creatorSharePercent: number | null;
  affiliateCommissionPercent: number | null;
};

export function RevenueSettings() {
  const [creatorShare, setCreatorShare] = useState("80");
  const [affiliateShare, setAffiliateShare] = useState("10");
  const [query, setQuery] = useState("");
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [selected, setSelected] = useState<CreatorRow | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function loadCreators(nextQuery: string) {
    const response = await fetch(`/api/admin/creators?q=${encodeURIComponent(nextQuery)}`, { cache: "no-store" });
    const data = (await response.json()) as { creators?: CreatorRow[] };
    setCreators(data.creators ?? []);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetch("/api/admin/settings", { cache: "no-store" })
        .then((response) => response.json())
        .then((data: { creatorSharePercent?: number; affiliateCommissionPercent?: number }) => {
          if (typeof data.creatorSharePercent === "number") setCreatorShare(String(data.creatorSharePercent));
          if (typeof data.affiliateCommissionPercent === "number") setAffiliateShare(String(data.affiliateCommissionPercent));
        })
        .catch(() => setError("Não foi possível carregar o repasse."));
      void loadCreators("");
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  async function saveDefaults(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    setError("");
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        creatorSharePercent: Number(creatorShare),
        affiliateCommissionPercent: Number(affiliateShare),
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) {
      setError(data.message || "Não foi possível salvar o repasse.");
      return;
    }
    setNotice("Repasse padrão salvo.");
  }

  async function saveCreator(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setNotice("");
    setError("");
    const response = await fetch(`/api/admin/creators/${selected.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ownership: selected.ownership,
        creatorSharePercent: selected.creatorSharePercent,
        affiliateCommissionPercent: selected.affiliateCommissionPercent,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string; creator?: CreatorRow };
    if (!response.ok || !data.creator) {
      setError(data.message || "Não foi possível salvar o criador.");
      return;
    }
    setSelected(data.creator);
    setCreators((current) => current.map((creator) => (creator.id === data.creator?.id ? data.creator : creator)));
    setNotice("Criador atualizado.");
  }

  return (
    <section className="mx-auto mt-6 w-full max-w-6xl space-y-4 px-4 sm:px-8">
      <form onSubmit={saveDefaults} className="rounded-3xl border border-border bg-elevated/70 p-4 sm:p-5">
        <h2 className="text-lg font-extrabold">Repasse</h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Casa (WinApp) fica com 100%. Independente usa a participação do criador; a comissão do afiliado sai dessa parte. O restante é da plataforma.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wide text-muted">
            Participação do criador independente (%)
            <input data-testid="admin-creator-share" value={creatorShare} onChange={(event) => setCreatorShare(event.target.value)} inputMode="numeric" className="mt-2 h-11 w-full rounded-full border border-border bg-background px-4 text-sm font-semibold normal-case tracking-normal" />
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-muted">
            Comissão do afiliado (%)
            <input data-testid="admin-affiliate-share" value={affiliateShare} onChange={(event) => setAffiliateShare(event.target.value)} inputMode="numeric" className="mt-2 h-11 w-full rounded-full border border-border bg-background px-4 text-sm font-semibold normal-case tracking-normal" />
          </label>
        </div>
        <Button data-testid="admin-split-save" type="submit" className="mt-4">Salvar repasse</Button>
      </form>
      <form onSubmit={saveCreator} className="rounded-3xl border border-border bg-elevated/70 p-4 sm:p-5">
        <h2 className="text-lg font-extrabold">Criadores</h2>
        <input data-testid="admin-creator-search" value={query} onChange={(event) => { setQuery(event.target.value); void loadCreators(event.target.value); }} placeholder="Buscar criador" aria-label="Buscar criador" className="mt-3 h-11 w-full rounded-full border border-border bg-background px-4 text-sm" />
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {creators.slice(0, 8).map((creator) => (
            <button key={creator.id} type="button" data-testid="admin-creator" data-username={creator.username} onClick={() => setSelected(creator)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${selected?.id === creator.id ? "border-primary bg-primary/15" : "border-border"}`}>
              {creator.name}
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-bold uppercase tracking-wide text-muted">
              Tipo
              <select data-testid="admin-ownership" value={selected.ownership} onChange={(event) => setSelected({ ...selected, ownership: event.target.value as CreatorRow["ownership"] })} className="mt-2 h-11 w-full rounded-full border border-border bg-background px-4 text-sm font-semibold normal-case">
                <option value="HOUSE">Casa</option>
                <option value="INDEPENDENT">Independente</option>
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">
              Participação própria (%)
              <input data-testid="admin-creator-override" value={selected.creatorSharePercent ?? ""} placeholder="Padrão" onChange={(event) => setSelected({ ...selected, creatorSharePercent: event.target.value === "" ? null : Number(event.target.value) })} className="mt-2 h-11 w-full rounded-full border border-border bg-background px-4 text-sm normal-case" />
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">
              Comissão própria (%)
              <input data-testid="admin-affiliate-override" value={selected.affiliateCommissionPercent ?? ""} placeholder="Padrão" onChange={(event) => setSelected({ ...selected, affiliateCommissionPercent: event.target.value === "" ? null : Number(event.target.value) })} className="mt-2 h-11 w-full rounded-full border border-border bg-background px-4 text-sm normal-case" />
            </label>
          </div>
        )}
        {selected && <Button data-testid="admin-creator-save" type="submit" className="mt-4">Salvar criador</Button>}
        {notice && <p className="mt-3 text-sm font-semibold text-primary-strong">{notice}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </form>
    </section>
  );
}
