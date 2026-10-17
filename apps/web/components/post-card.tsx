"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
import type { Creator, Post } from "@/lib/gateway";
import { brl, seedComments } from "@/lib/gateway";
import { readDemo, writeDemo } from "@/lib/demo-store";

export function PostCard({ post, creator }: { post: Post; creator: Creator }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [state, setState] = useState(() => ({
    subscriptions: [] as string[],
    unlocks: [] as string[],
  }));

  useEffect(() => {
    const sync = () => {
      const current = readDemo();
      setState({ subscriptions: current.subscriptions, unlocks: current.unlocks });
      setLiked(current.likes.includes(post.id));
      setSaved(current.saves.includes(post.id));
      setComments(current.comments[post.id] ?? []);
    };
    sync();
    window.addEventListener("mimelux:state", sync);
    return () => window.removeEventListener("mimelux:state", sync);
  }, [post.id]);

  function toggleList(kind: "likes" | "saves", active: boolean) {
    const current = readDemo();
    const next = active
      ? current[kind].filter((id) => id !== post.id)
      : [...current[kind], post.id];
    writeDemo({ [kind]: next });
  }

  function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = String(new FormData(form).get("comment") || "").trim();
    if (!body) return;
    const current = readDemo();
    writeDemo({
      comments: {
        ...current.comments,
        [post.id]: [...(current.comments[post.id] ?? []), body],
      },
    });
    form.reset();
  }

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
    <article className="overflow-visible rounded-[30px] border border-border bg-elevated shadow-sm">
      <header className="relative z-20 flex items-center gap-4 px-5 pb-1 pt-5">
        <Link href={`/creator/${creator.username}`} className="relative z-20 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-testid="feed-avatar" src={creator.avatar} alt={creator.name} className="size-20 translate-y-8 rounded-full border-4 border-elevated bg-elevated object-cover shadow-[0_14px_30px_rgba(12,13,20,.22)] sm:size-24 sm:translate-y-10" />
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

      <div className="relative z-0 mx-2 overflow-hidden rounded-[20px] bg-surface" style={{ aspectRatio: "4 / 4.35" }}>
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
          <button onClick={() => toggleList("likes", liked)} className="grid size-9 place-items-center rounded-full hover:bg-black/5" aria-label="Curtir">
            <Heart className={`size-[19px] ${liked ? "fill-accent text-accent-strong" : ""}`} />
          </button>
          <button onClick={() => setCommentOpen((value) => !value)} className="grid size-9 place-items-center rounded-full hover:bg-black/5" aria-label="Comentar"><MessageCircle className="size-[19px]" /></button>
          <button onClick={() => toggleList("saves", saved)} className="ml-auto grid size-9 place-items-center rounded-full hover:bg-black/5" aria-label="Salvar">
            <Bookmark className={`size-[19px] ${saved ? "fill-primary text-primary-strong" : ""}`} />
          </button>
        </div>
        <p data-testid="post-likes" className="mt-1 text-xs font-bold">{(post.likes + (liked ? 1 : 0)).toLocaleString("pt-BR")} curtidas</p>
        <p className="mt-2 text-xs leading-5">
          <b className="mr-1.5">{creator.name}</b>
          {post.caption}
        </p>
        {seedComments.filter((comment) => comment.postId === post.id).map((comment) => (
          <p key={comment.id} data-testid="post-comment" className="mt-2 text-xs leading-5">
            <b className="mr-1.5">{comment.authorName}</b>{comment.body}
          </p>
        ))}
        {comments.map((comment, index) => (
          <p key={`${comment}-${index}`} data-testid="post-comment" className="mt-2 text-xs leading-5">
            <b className="mr-1.5">você</b>{comment}
          </p>
        ))}
        {commentOpen && (
          <form onSubmit={addComment} className="mt-3 flex gap-2">
            <input name="comment" autoFocus placeholder="Escreva um comentário..." className="h-10 min-w-0 flex-1 rounded-full bg-surface/60 px-4 text-[10px] outline-none focus:ring-2 focus:ring-primary/30 dark:bg-white/5" />
            <Button type="submit" size="sm">Publicar</Button>
          </form>
        )}
      </div>
    </article>
  );
}
