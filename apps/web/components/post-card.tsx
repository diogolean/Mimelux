"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  Heart,
  LockKeyhole,
  MessageCircle,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { Button, Pill } from "@mimelux/ui";
import type { Creator, Post } from "@/lib/fixtures";
import { brl } from "@/lib/fixtures";
import { readDemo } from "@/lib/demo-store";

export function PostCard({ post, creator }: { post: Post; creator: Creator }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [state, setState] = useState(() => ({
    subscriptions: [] as string[],
    unlocks: [] as string[],
  }));

  useEffect(() => {
    const sync = () => {
      const current = readDemo();
      setState({ subscriptions: current.subscriptions, unlocks: current.unlocks });
    };
    sync();
    window.addEventListener("mimelux:state", sync);
    return () => window.removeEventListener("mimelux:state", sync);
  }, []);

  const locked =
    post.visibility === "subscriber"
      ? !state.subscriptions.includes(creator.id)
      : post.visibility === "ppv"
        ? !state.unlocks.includes(post.id)
        : false;
  const checkout =
    post.visibility === "subscriber"
      ? `/checkout?kind=subscription&id=${creator.id}&return=/feed`
      : `/checkout?kind=post&id=${post.id}&creator=${creator.id}&return=/feed`;

  return (
    <article className="overflow-hidden rounded-[26px] border border-black/5 bg-white/70 shadow-sm dark:bg-white/5">
      <header className="flex items-center gap-3 p-4">
        <Link href={`/creator/${creator.username}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={creator.avatar} alt={creator.name} className="size-11 rounded-full object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Link href={`/creator/${creator.username}`} className="truncate text-xs font-extrabold hover:underline">
              {creator.name}
            </Link>
            {creator.verified && <BadgeCheck className="size-3.5 fill-primary text-white" />}
          </div>
          <p className="text-[9px] text-muted">@{creator.username} · {post.time}</p>
        </div>
        <button aria-label="Mais opções" className="grid size-9 place-items-center rounded-full hover:bg-black/5"><MoreHorizontal className="size-4" /></button>
      </header>

      <div className="relative mx-2 overflow-hidden rounded-[20px] bg-surface" style={{ aspectRatio: "4 / 4.35" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.image} alt={post.caption} className={`h-full w-full object-cover transition duration-500 ${locked ? "scale-105 blur-[15px]" : ""}`} />
        {locked && (
          <div className="absolute inset-0 grid place-items-center bg-ink/30 px-6 text-center">
            <div className="max-w-xs rounded-[26px] border border-white/20 bg-ink/78 p-6 text-white shadow-2xl backdrop-blur-md">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/10">
                <LockKeyhole className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-extrabold">
                {post.visibility === "subscriber" ? "Só para assinantes" : "Conteúdo especial"}
              </h3>
              <p className="mt-2 text-[10px] leading-5 text-white/65">
                {post.visibility === "subscriber"
                  ? `Assine ${creator.name} para desbloquear este e outros conteúdos.`
                  : "Uma experiência exclusiva disponível com compra única."}
              </p>
              <Link href={checkout}>
                <Button size="sm" className="mt-4 w-full">
                  <Sparkles className="size-3.5" />
                  {post.visibility === "subscriber" ? `Assinar por ${brl(creator.price)}` : `Desbloquear por ${brl(post.price || 0)}`}
                </Button>
              </Link>
            </div>
          </div>
        )}
        {!locked && post.visibility !== "free" && (
          <Pill className="absolute left-3 top-3 bg-ink/75 text-white backdrop-blur">
            <LockKeyhole className="mr-1 size-3" /> Desbloqueado
          </Pill>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1">
          <button onClick={() => setLiked((value) => !value)} className="grid size-9 place-items-center rounded-full hover:bg-black/5" aria-label="Curtir">
            <Heart className={`size-[19px] ${liked ? "fill-accent text-accent-strong" : ""}`} />
          </button>
          <button className="grid size-9 place-items-center rounded-full hover:bg-black/5" aria-label="Comentar"><MessageCircle className="size-[19px]" /></button>
          <button onClick={() => setSaved((value) => !value)} className="ml-auto grid size-9 place-items-center rounded-full hover:bg-black/5" aria-label="Salvar">
            <Bookmark className={`size-[19px] ${saved ? "fill-primary text-primary-strong" : ""}`} />
          </button>
        </div>
        <p className="mt-1 text-[10px] font-bold">{(post.likes + (liked ? 1 : 0)).toLocaleString("pt-BR")} curtidas</p>
        <p className="mt-2 text-xs leading-5">
          <b className="mr-1.5">{creator.name}</b>
          {post.caption}
        </p>
      </div>
    </article>
  );
}
