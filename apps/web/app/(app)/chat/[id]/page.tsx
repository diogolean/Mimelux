"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  ImagePlus,
  LockKeyhole,
  MoreVertical,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@mimelux/ui";
import { brl, creators } from "@/lib/mock-data";
import { readDemo } from "@/lib/demo-store";

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const creator = creators.find((item) => item.id === params.id) || creators[0]!;
  const messageId = `message-${creator.id}`;
  const [unlocked, setUnlocked] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setUnlocked(readDemo().unlocks.includes(messageId));
    sync();
    window.addEventListener("mimelux:state", sync);
    return () => window.removeEventListener("mimelux:state", sync);
  }, [messageId]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("message") || "").trim();
    if (!body) return;
    setMessages((items) => [...items, body]);
    form.reset();
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-136px)] w-full max-w-4xl flex-col lg:h-[calc(100dvh-64px)]">
      <header className="flex h-18 shrink-0 items-center gap-3 border-b border-black/5 px-4 sm:px-6">
        <Link href="/chat" className="grid size-10 place-items-center rounded-full hover:bg-black/5"><ArrowLeft className="size-4" /></Link>
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={creator.avatar} alt={creator.name} className="size-11 rounded-full object-cover" />
          <i className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1"><h1 className="truncate text-xs font-extrabold">{creator.name}</h1>{creator.verified && <BadgeCheck className="size-3.5 fill-[#E9A15E] text-white" />}</div>
          <p className="text-[9px] text-emerald-600">online agora</p>
        </div>
        <Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button>
      </header>

      <section className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_30%_10%,rgba(233,176,167,.12),transparent_18rem)] px-4 py-6 sm:px-7">
        <p className="mx-auto mb-6 w-fit rounded-full bg-[#F0E8DE] px-3 py-1 text-[8px] font-semibold text-muted dark:bg-white/5">Hoje</p>
        <div className="max-w-[78%] rounded-[22px_22px_22px_6px] bg-white p-4 shadow-sm dark:bg-white/8">
          <p className="text-[11px] leading-5">Oi! Que bom ver você por aqui. Preparei um conteúdo especial dos bastidores de hoje ✨</p>
          <span className="mt-2 block text-right text-[8px] text-muted">15:12</span>
        </div>

        <div className="mt-3 max-w-[82%] overflow-hidden rounded-[24px_24px_24px_6px] bg-[#202027] text-white shadow-lg">
          <div className="relative h-52 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/posts/ppv-marina.jpg" alt="Conteúdo exclusivo" className={`h-full w-full object-cover ${unlocked ? "" : "scale-105 blur-xl opacity-65"}`} />
            {!unlocked && <div className="absolute inset-0 grid place-items-center"><span className="grid size-12 place-items-center rounded-full bg-black/35 backdrop-blur"><LockKeyhole className="size-5" /></span></div>}
          </div>
          <div className="p-4">
            <p className="text-xs font-extrabold">{unlocked ? "Agora é só aproveitar 💛" : "Bastidores: só pra você"}</p>
            <p className="mt-1 text-[9px] leading-4 text-white/60">{unlocked ? "Conteúdo desbloqueado neste navegador." : "Uma mensagem PPV simulada com acesso permanente."}</p>
            {!unlocked && (
              <Link href={`/checkout?kind=message&id=${messageId}&creator=${creator.id}&return=/chat/${creator.id}`}>
                <Button size="sm" className="mt-3 w-full"><Sparkles className="size-3.5" /> Desbloquear por {brl(1290)}</Button>
              </Link>
            )}
            <span className="mt-2 block text-right text-[8px] text-white/40">15:13</span>
          </div>
        </div>

        <div className="ml-auto mt-4 max-w-[78%] rounded-[22px_22px_6px_22px] bg-[#E9A15E] p-4 text-[#202027]">
          <p className="text-[11px] leading-5">Amei! Me conta mais sobre esse lugar?</p><span className="mt-2 block text-right text-[8px] text-black/45">15:15 ✓✓</span>
        </div>
        {messages.map((message, index) => (
          <div key={index} className="ml-auto mt-3 max-w-[78%] rounded-[22px_22px_6px_22px] bg-[#E9A15E] p-4 text-[#202027]">
            <p className="text-[11px] leading-5">{message}</p><span className="mt-2 block text-right text-[8px] text-black/45">agora ✓</span>
          </div>
        ))}
      </section>

      <form onSubmit={send} className="flex shrink-0 items-center gap-2 border-t border-black/5 bg-background p-3 sm:px-5">
        <button type="button" className="grid size-10 place-items-center rounded-full text-muted hover:bg-black/5"><ImagePlus className="size-5" /></button>
        <input name="message" placeholder="Escreva uma mensagem..." autoComplete="off" className="h-11 min-w-0 flex-1 rounded-full bg-[#F0E8DE]/65 px-4 text-xs outline-none focus:ring-2 focus:ring-[#E9A15E]/30 dark:bg-white/5" />
        <Button type="submit" size="icon" aria-label="Enviar"><Send className="size-4" /></Button>
      </form>
    </div>
  );
}
