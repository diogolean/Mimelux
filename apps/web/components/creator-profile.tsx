"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Grid3X3,
  Heart,
  ImageIcon,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button, Pill } from "@mimelux/ui";
import type { Creator, Post } from "@/lib/mock-data";
import { brl, compact } from "@/lib/mock-data";
import { readDemo } from "@/lib/demo-store";

export function CreatorProfile({ creator, posts }: { creator: Creator; posts: Post[] }) {
  const [subscribed, setSubscribed] = useState(false);
  const [unlocks, setUnlocks] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      const state = readDemo();
      setSubscribed(state.subscriptions.includes(creator.id));
      setUnlocks(state.unlocks);
    };
    sync();
    window.addEventListener("mimelux:state", sync);
    return () => window.removeEventListener("mimelux:state", sync);
  }, [creator.id]);

  return (
    <div className="mx-auto w-full max-w-5xl pb-12">
      <div className="relative h-48 overflow-hidden sm:h-72 sm:rounded-b-[34px] lg:mt-6 lg:rounded-[34px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={creator.cover} alt={`Capa de ${creator.name}`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#202027]/60 via-transparent to-black/10" />
        <div className="absolute right-4 top-4 flex gap-2">
          <Button variant="outline" size="icon" aria-label="Compartilhar perfil" className="border-white/20 bg-black/20 text-white backdrop-blur hover:bg-black/35"><Share2 className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Favoritar perfil" className="border-white/20 bg-black/20 text-white backdrop-blur hover:bg-black/35"><Heart className="size-4" /></Button>
        </div>
      </div>

      <section className="px-4 sm:px-7">
        <div className="flex items-end justify-between gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={creator.avatar} alt={creator.name} className="-mt-14 size-28 rounded-full border-[5px] border-background object-cover shadow-xl sm:-mt-16 sm:size-32" />
          <div className="flex gap-2 pb-1">
            <Link href={`/chat/${creator.id}`}>
              <Button variant="outline" size="icon" aria-label="Conversar"><MessageCircle className="size-4" /></Button>
            </Link>
            {subscribed ? (
              <Button variant="dark"><BadgeCheck className="size-4" /> Assinatura ativa</Button>
            ) : (
              <Link href={`/checkout?kind=subscription&id=${creator.id}&return=/creator/${creator.username}`}>
                <Button><Sparkles className="size-4" /> {creator.free ? "Assinar grátis" : `Assinar · ${brl(creator.price)}`}</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-[-.04em]">{creator.name}</h1>
          {creator.verified && <BadgeCheck className="size-5 fill-[#E9A15E] text-white" />}
        </div>
        <p className="mt-1 text-xs text-muted">@{creator.username}</p>
        <p className="mt-4 max-w-2xl text-sm leading-6">{creator.bio}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted">
          <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {creator.city}</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /> No Mimelux desde 2025</span>
          <Pill>{creator.category}</Pill>
        </div>

        <div className="mt-7 grid grid-cols-3 rounded-[24px] bg-[#F0E8DE]/65 p-4 text-center dark:bg-white/5">
          <div><b className="block text-sm">{compact(creator.subscribers)}</b><span className="text-[9px] text-muted">membros</span></div>
          <div className="border-x border-black/8"><b className="block text-sm">{creator.posts}</b><span className="text-[9px] text-muted">publicações</span></div>
          <div><b className="block text-sm">4,9</b><span className="text-[9px] text-muted">avaliação</span></div>
        </div>

        {!subscribed && (
          <div className="mt-6 rounded-[26px] border border-[#E9A15E]/25 bg-gradient-to-br from-[#E9A15E]/16 to-[#E9B0A7]/16 p-5 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#B16E35]">Plano Essencial</p>
              <h2 className="mt-1 text-lg font-extrabold">{creator.free ? "Comece sem custo" : `${brl(creator.price)} por mês`}</h2>
              <p className="mt-2 text-[10px] text-muted">Feed exclusivo · Chat · Cancele quando quiser</p>
            </div>
            <Link href={`/checkout?kind=subscription&id=${creator.id}&return=/creator/${creator.username}`}>
              <Button className="mt-4 w-full sm:mt-0 sm:w-auto">Quero fazer parte</Button>
            </Link>
          </div>
        )}

        <div className="mt-8 flex items-center gap-6 border-b border-black/8">
          <button className="flex items-center gap-2 border-b-2 border-[#E9A15E] px-1 pb-3 text-xs font-bold"><Grid3X3 className="size-4" /> Conteúdos</button>
          <button className="flex items-center gap-2 px-1 pb-3 text-xs font-semibold text-muted"><ImageIcon className="size-4" /> Mídias</button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {posts.map((post) => {
            const locked = post.visibility === "subscriber" ? !subscribed : post.visibility === "ppv" ? !unlocks.includes(post.id) : false;
            return (
              <div key={post.id} className="group relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#F0E8DE] sm:rounded-[24px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image} alt={post.caption} className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${locked ? "scale-105 blur-[10px]" : ""}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                {locked ? (
                  <div className="absolute inset-0 grid place-items-center p-3 text-center text-white">
                    <div>
                      <span className="mx-auto grid size-10 place-items-center rounded-full bg-black/35 backdrop-blur"><LockKeyhole className="size-4" /></span>
                      <p className="mt-2 text-[9px] font-bold">{post.visibility === "subscriber" ? "Para assinantes" : brl(post.price || 0)}</p>
                      <Link href={post.visibility === "subscriber" ? `/checkout?kind=subscription&id=${creator.id}&return=/creator/${creator.username}` : `/checkout?kind=post&id=${post.id}&creator=${creator.id}&return=/creator/${creator.username}`}>
                        <span className="mt-2 inline-block rounded-full bg-[#E9A15E] px-3 py-1.5 text-[8px] font-black text-[#202027]">Desbloquear</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="absolute inset-x-3 bottom-3 line-clamp-2 text-[9px] font-semibold leading-4 text-white">{post.caption}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
