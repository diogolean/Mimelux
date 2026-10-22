"use client";

import { useEffect, useState } from "react";
import { MediaManager } from "@/components/media-manager";

type CreatorOption = { id: string; name: string; username: string };

export function AdminMedia() {
  const [creators, setCreators] = useState<CreatorOption[]>([]);
  const [creatorId, setCreatorId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetch("/api/admin/creators", { cache: "no-store" })
        .then((response) => response.json())
        .then((data: { creators?: Array<CreatorOption & Record<string, unknown>> }) => {
          setCreators((data.creators ?? []).map(({ id, name, username }) => ({ id, name, username })));
        })
        .catch(() => setError("Não foi possível listar os criadores."));
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <section data-testid="admin-media" className="mx-auto mt-2 w-full max-w-6xl px-4 sm:px-8">
      <h2 className="text-lg font-extrabold tracking-[-.03em]">Mídia</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Escolha um criador para enviar e organizar a mídia da mesma forma que no painel, inclusive vídeos bloqueados.
      </p>
      <label className="mt-4 block max-w-md text-xs font-bold uppercase tracking-wide text-muted">
        Criador
        <select
          data-testid="admin-media-creator"
          value={creatorId}
          onChange={(event) => setCreatorId(event.target.value)}
          className="mt-2 h-11 w-full rounded-full border border-border bg-background px-4 text-sm font-semibold normal-case tracking-normal text-foreground outline-none focus:border-primary"
        >
          <option value="">Escolha um criador</option>
          {creators.map((creator) => (
            <option key={creator.id} value={creator.id}>
              {creator.name || creator.username} (@{creator.username})
            </option>
          ))}
        </select>
      </label>
      {error && <p className="mt-3 text-sm text-muted">{error}</p>}
      {creatorId ? (
        <div className="mt-4">
          <MediaManager creatorId={creatorId} />
        </div>
      ) : null}
    </section>
  );
}
