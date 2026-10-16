"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@mimelux/ui";
import { brl, compact, creators } from "@/lib/mock-data";
import { readDemo, writeDemo } from "@/lib/demo-store";

function TopCreatorsContent() {
  const router = useRouter();
  const search = useSearchParams();
  const tab = search.get("tab") === "destaques" ? "destaques" : "top-creators";
  const [tour, setTour] = useState(0);

  useEffect(() => {
    const state = readDemo();
    if (search.get("tour") === "1" || !state.coachSeen) setTour(1);
  }, [search]);

  function setTab(next: "top-creators" | "destaques") {
    router.push(`/topcreators?tab=${next}`);
  }

  function finishTour() {
    setTour(0);
    writeDemo({ coachSeen: true });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:py-9">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#B16E35]">Descubra agora</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-.04em] sm:text-3xl">Em alta</h1>
          <p className="mt-2 text-xs text-muted">Pessoas e experiências que estão movimentando a comunidade.</p>
        </div>
        <div className="hidden items-center gap-1 rounded-full bg-[#F0E8DE] p-1 sm:flex dark:bg-white/5">
          <button onClick={() => setTab("top-creators")} className={`rounded-full px-5 py-2 text-xs font-bold transition ${tab === "top-creators" ? "bg-white shadow-sm dark:bg-white/10" : "text-muted"}`}>Top Creators</button>
          <button onClick={() => setTab("destaques")} className={`rounded-full px-5 py-2 text-xs font-bold transition ${tab === "destaques" ? "bg-white shadow-sm dark:bg-white/10" : "text-muted"}`}>Destaques</button>
        </div>
      </div>

      <div className="relative mt-7 grid grid-cols-2 rounded-2xl bg-[#F0E8DE]/60 p-1 sm:hidden dark:bg-white/5">
        <button onClick={() => setTab("top-creators")} className={`rounded-xl py-2.5 text-[11px] font-bold ${tab === "top-creators" ? "bg-white shadow-sm dark:bg-white/10" : "text-muted"}`}>Top Creators</button>
        <button onClick={() => setTab("destaques")} className={`rounded-xl py-2.5 text-[11px] font-bold ${tab === "destaques" ? "bg-white shadow-sm dark:bg-white/10" : "text-muted"}`}>Destaques</button>
      </div>

      {tab === "top-creators" ? (
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          {creators.map((creator, index) => (
            <Link key={creator.id} href={`/creator/${creator.username}`} className="group">
              <article className="card-lift relative min-h-48 overflow-hidden rounded-[26px] border border-black/5 bg-white/65 shadow-sm dark:bg-white/5">
                <div className="relative h-28 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  <span className="absolute right-4 top-3 text-3xl font-black tracking-[-.07em] text-white drop-shadow">#{index + 1}</span>
                  {index < 3 && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#E9A15E] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#202027]">
                      {index === 0 ? "subiu 3" : index === 1 ? "em ascensão" : "favorita"}
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-3 px-4 pb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.avatar} alt={creator.name} className="-mt-7 size-16 shrink-0 rounded-full border-4 border-white object-cover shadow-md dark:border-[#202027]" />
                  <div className="min-w-0 flex-1 pt-3">
                    <div className="flex items-center gap-1">
                      <h2 className="truncate text-sm font-extrabold">{creator.name}</h2>
                      {creator.verified && <BadgeCheck className="size-3.5 shrink-0 fill-[#E9A15E] text-white" />}
                    </div>
                    <p className="truncate text-[10px] text-muted">@{creator.username} · {creator.category}</p>
                  </div>
                  <div className="pb-0.5 text-right">
                    <p className="text-[10px] font-extrabold">{compact(creator.subscribers)}</p>
                    <p className="text-[8px] text-muted">membros</p>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      ) : (
        <Highlights />
      )}

      {tour > 0 && (
        <div className="fixed inset-0 z-50 bg-[#202027]/55 backdrop-blur-[2px]">
          <div className={`absolute left-4 right-4 rounded-[28px] bg-white p-5 shadow-2xl sm:left-auto sm:right-8 sm:w-[360px] dark:bg-[#202027] ${tour === 1 ? "top-36 sm:top-24" : "top-52 sm:top-24"}`}>
            <button onClick={finishTour} aria-label="Fechar dica" className="absolute right-4 top-4 text-muted"><X className="size-4" /></button>
            <span className="grid size-10 place-items-center rounded-2xl bg-[#E9A15E]/25 text-[#B16E35]">
              {tour === 1 ? <Sparkles className="size-5" /> : <ArrowRight className="size-5" />}
            </span>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.18em] text-[#B16E35]">{tour}/2</p>
            <h3 className="mt-1 text-xl font-extrabold tracking-[-.03em]">{tour === 1 ? "Quem tá em alta agora" : "Descubra de tudo um pouco"}</h3>
            <p className="mt-2 text-xs leading-5 text-muted">{tour === 1 ? "O ranking mostra criadores que estão conquistando a comunidade neste momento." : "Perfis gratuitos, ofertas e quem está bombando no chat ficam em Destaques."}</p>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-1">
                <i className={`h-1.5 rounded-full ${tour === 1 ? "w-5 bg-[#E9A15E]" : "w-1.5 bg-black/15"}`} />
                <i className={`h-1.5 rounded-full ${tour === 2 ? "w-5 bg-[#E9A15E]" : "w-1.5 bg-black/15"}`} />
              </div>
              <Button size="sm" onClick={() => tour === 1 ? (setTour(2), setTab("destaques")) : finishTour()}>
                {tour === 1 ? "Próxima" : "Entendi"} <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Highlights() {
  const free = creators.filter((creator) => creator.free);
  return (
    <div className="mt-7 space-y-10">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="text-base font-extrabold">Perfis gratuitos</h2><p className="text-[10px] text-muted">Entre, conheça e fique à vontade.</p></div>
          <button className="text-xs font-bold text-[#B16E35]">Ver todos</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {[...free, ...creators.slice(0, 4)].map((creator, index) => (
            <Link key={`${creator.id}-${index}`} href={`/creator/${creator.username}`} className="relative h-44 w-32 shrink-0 overflow-hidden rounded-[22px] sm:h-48 sm:w-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute inset-x-3 bottom-3 text-white"><p className="truncate text-xs font-extrabold">{creator.name}</p><p className="truncate text-[8px] text-white/70">@{creator.username}</p></div>
            </Link>
          ))}
          <button className="grid h-44 w-32 shrink-0 place-items-center rounded-[22px] bg-gradient-to-br from-[#E9A15E] to-[#E9B0A7] text-[#202027] sm:h-48 sm:w-36">
            <span><Plus className="mx-auto size-7" /><b className="mt-2 block text-xs">ver mais</b></span>
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4"><h2 className="text-base font-extrabold">Ofertas de assinatura</h2><p className="text-[10px] text-muted">Condições especiais por tempo limitado.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          {creators.slice(0, 3).map((creator, index) => (
            <Link key={creator.id} href={`/creator/${creator.username}`} className="card-lift flex items-center gap-3 rounded-[22px] border border-black/5 bg-white/60 p-3 dark:bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={creator.avatar} alt="" className="size-14 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold">{creator.name}</p><p className="text-[9px] text-muted"><s>{brl(creator.price + 1000)}</s> · <b className="text-[#B16E35]">{brl(creator.price)}</b></p></div>
              <span className="rounded-full bg-[#E9A15E]/20 px-2 py-1 text-[8px] font-black">-{20 + index * 5}%</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4"><h2 className="text-base font-extrabold">Bombando no chat</h2><p className="text-[10px] text-muted">Criadores respondendo agora.</p></div>
        <div className="grid gap-x-8 sm:grid-cols-2">
          {creators.slice(0, 6).map((creator) => (
            <div key={creator.id} className="flex items-center gap-3 border-b border-black/5 py-3">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.avatar} alt="" className="size-11 rounded-full object-cover" />
                <i className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold">{creator.name}</p><p className="truncate text-[9px] text-muted">@{creator.username}</p></div>
              <Link href={`/chat/${creator.id}`} className="rounded-full border border-black/10 px-3 py-2 text-[9px] font-bold"><MessageCircle className="mr-1 inline size-3" /> Conversar</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function TopCreatorsPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-8 h-[70vh] max-w-5xl rounded-[30px] skeleton" />}>
      <TopCreatorsContent />
    </Suspense>
  );
}
