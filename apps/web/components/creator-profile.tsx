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
import { Button, Pill, PremiumModal } from "@mimelux/ui";
import type { Creator, Post } from "@/lib/gateway";
import { brl, compact, plans } from "@/lib/gateway";
import { readDemo, writeDemo, type DemoSpecialRequest } from "@/lib/demo-store";
import { toast } from "sonner";

export function CreatorProfile({ creator, posts }: { creator: Creator; posts: Post[] }) {
  const [subscribed, setSubscribed] = useState(false);
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [tab, setTab] = useState<"posts" | "media">("posts");
  const [filter, setFilter] = useState<"all" | "photos" | "videos" | "paid">("all");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestDescription, setRequestDescription] = useState("");
  const [requestBudget, setRequestBudget] = useState("");
  const [monetization, setMonetization] = useState(() => readDemo().creatorMonetization);
  const [requests, setRequests] = useState<DemoSpecialRequest[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const sync = () => {
      const state = readDemo();
      setSubscribed(state.subscriptions.includes(creator.id));
      setUnlocks(state.unlocks);
      setMonetization(state.creatorMonetization);
      setRequests(state.specialRequests.filter((request) => request.creatorId === creator.id));
    };
    sync();
    window.addEventListener("mimelux:state", sync);
    return () => window.removeEventListener("mimelux:state", sync);
  }, [creator.id]);

  const promotion = monetization.promotion;
  const promotionActive =
    promotion.active &&
    now >= new Date(promotion.startsAt).getTime() &&
    now <= new Date(promotion.endsAt).getTime() &&
    (!promotion.subscriberCap || promotion.redeemedCount < promotion.subscriberCap);

  function submitSpecialRequest() {
    if (requestDescription.trim().length < 10) {
      toast.error("Conte um pouco mais sobre o seu pedido.");
      return;
    }
    const state = readDemo();
    writeDemo({
      specialRequests: [
        ...state.specialRequests,
        {
          id: `request-${Date.now()}`,
          creatorId: creator.id,
          description: requestDescription.trim(),
          budgetCents: requestBudget ? Math.round(Number(requestBudget) * 100) : undefined,
          status: "requested",
          messages: [{ sender: "fan", body: requestDescription.trim(), createdAt: new Date().toISOString() }],
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setRequestOpen(false);
    setRequestDescription("");
    setRequestBudget("");
    toast.success("Pedido especial enviado em modo demo.");
  }

  const filteredPosts = posts.filter((post) => {
    if (filter === "photos") return post.mediaType === "image";
    if (filter === "videos") return post.mediaType === "video";
    if (filter === "paid") return post.visibility !== "free";
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-5xl pb-12">
      <div className="relative h-56 overflow-hidden sm:h-80 sm:rounded-b-[38px] lg:mt-6 lg:rounded-[38px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={creator.cover} alt={`Capa de ${creator.name}`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-black/10" />
        <div className="absolute right-4 top-4 flex gap-2">
          <Button variant="outline" size="icon" aria-label="Compartilhar perfil" className="border-white/20 bg-black/20 text-white backdrop-blur hover:bg-black/35"><Share2 className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Favoritar perfil" className="border-white/20 bg-black/20 text-white backdrop-blur hover:bg-black/35"><Heart className="size-4" /></Button>
        </div>
      </div>

      <section className="px-4 sm:px-7">
        <div className="relative z-10 flex items-end justify-between gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={creator.avatar}
            alt={creator.name}
            className="-mt-16 size-40 rounded-full border-[7px] border-background object-cover shadow-[0_20px_50px_rgba(24,23,37,.24)] sm:-mt-20 sm:size-44"
          />
          <div className="flex gap-2 pb-1">
            <Button variant="outline" onClick={() => setRequestOpen(true)}>
              <Sparkles className="size-4" /> Pedido especial
            </Button>
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
          {creator.verified && <BadgeCheck className="size-5 fill-primary text-white" />}
        </div>
        <p className="mt-1 text-xs text-muted">@{creator.username}</p>
        <p className="mt-4 max-w-2xl text-sm leading-6">{creator.bio}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted">
          <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {creator.city}</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /> No Mimelux desde 2025</span>
          <Pill>{creator.category}</Pill>
          <Pill>Perfil fictício · imagem gerada por IA</Pill>
        </div>

        <div className="mt-7 grid grid-cols-3 rounded-[24px] bg-surface/65 p-4 text-center dark:bg-white/5">
          <div><b className="block text-sm">{compact(creator.subscribers)}</b><span className="text-[9px] text-muted">membros</span></div>
          <div className="border-x border-black/8"><b className="block text-sm">{creator.posts}</b><span className="text-[9px] text-muted">publicações</span></div>
          <div><b className="block text-sm">4,9</b><span className="text-[9px] text-muted">avaliação</span></div>
        </div>

        {!subscribed && (
          <div className="mt-6">
            {promotionActive && (
              <div data-testid="promotion-banner" className="mb-4 flex flex-col gap-3 rounded-[24px] bg-gradient-to-r from-primary/20 to-accent/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-primary-strong">Oferta por tempo limitado</p>
                  <p className="mt-1 text-sm font-extrabold">{promotion.discountPercent}% OFF no primeiro período</p>
                  <p className="mt-1 text-[9px] text-muted">Termina em 31/12/2027 · {promotion.subscriberCap! - promotion.redeemedCount} vagas demo</p>
                </div>
                <Pill active>Oferta fictícia</Pill>
              </div>
            )}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-primary-strong">Escolha seu acesso</p>
                <h2 className="mt-1 text-lg font-extrabold">Planos de assinatura demo</h2>
              </div>
              <Pill>Oferta fictícia</Pill>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {plans.map((plan, index) => {
                const total = creator.free
                  ? 0
                  : Math.round(
                      monetization.monthlyPriceCents *
                        plan.months *
                        (1 - (monetization.bundleDiscounts[String(plan.months) as "1" | "3" | "6" | "12"] ?? plan.discount) / 100) *
                        (promotionActive ? 1 - promotion.discountPercent / 100 : 1),
                    );
                return (
                  <article key={plan.id} className={`rounded-[22px] border p-4 ${index === 1 ? "border-primary/35 bg-primary/10" : "border-black/5 bg-white/55 dark:bg-white/5"}`}>
                    {index === 1 && <Pill active>Mais escolhido</Pill>}
                    <p className="mt-3 text-xs font-extrabold">{plan.name}</p>
                    <p className="mt-1 text-lg font-extrabold">{creator.free ? "Grátis" : brl(total)}</p>
                    <p className="mt-1 text-[8px] text-muted">{plan.discount ? `${plan.discount}% no pacote${promotionActive ? ` + ${promotion.discountPercent}% promocional` : ""}` : "Acesso por 30 dias"}</p>
                    <Link href={`/checkout?kind=subscription&id=${creator.id}&plan=${plan.id}&return=/creator/${creator.username}`}>
                      <Button variant={index === 1 ? "primary" : "outline"} size="sm" className="mt-4 w-full">Escolher</Button>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        <section className="mt-7 rounded-[28px] border border-black/5 bg-white/60 p-5 dark:bg-white/5">
          <div className="flex items-end justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-primary-strong">Coleção premium</p><h2 className="mt-1 text-lg font-extrabold">Pacote Bastidores de Verão</h2></div>
            <p className="text-base font-black">{brl(4_990)}</p>
          </div>
          <p className="mt-2 text-[10px] leading-5 text-muted">6 fotos e 2 vídeos fictícios para desbloquear de uma vez.</p>
          <Link href={`/checkout?kind=pack&id=summer-pack&creator=${creator.id}&return=/creator/${creator.username}`}>
            <Button variant="outline" className="mt-4">Desbloquear pacote</Button>
          </Link>
        </section>

        {requests.length > 0 && (
          <section className="mt-5 rounded-[28px] border border-black/5 bg-white/60 p-5 dark:bg-white/5">
            <h2 className="text-sm font-extrabold">Seus pedidos especiais</h2>
            <div className="mt-4 space-y-3">
              {requests.map((request) => (
                <article key={request.id} className="rounded-[20px] bg-surface/60 p-4 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3"><p className="line-clamp-2 text-[10px] font-bold">{request.description}</p><Pill>{request.status}</Pill></div>
                  {request.status === "quoted" && request.quotedPriceCents && (
                    <div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs font-extrabold">Contraproposta: {brl(request.quotedPriceCents)}</p><Link href={`/checkout?kind=special_request&id=${request.id}&creator=${creator.id}&amount=${request.quotedPriceCents}&return=/creator/${creator.username}`}><Button size="sm">Aceitar e simular pagamento</Button></Link></div>
                  )}
                  {request.status === "delivered" && <p className="mt-2 text-[9px] text-emerald-600">Conteúdo fictício entregue no thread do pedido.</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center gap-6 border-b border-black/8">
          <button onClick={() => setTab("posts")} className={`flex items-center gap-2 px-1 pb-3 text-xs ${tab === "posts" ? "border-b-2 border-primary font-bold" : "font-semibold text-muted"}`}><Grid3X3 className="size-4" /> Postagens</button>
          <button onClick={() => setTab("media")} className={`flex items-center gap-2 px-1 pb-3 text-xs ${tab === "media" ? "border-b-2 border-primary font-bold" : "font-semibold text-muted"}`}><ImageIcon className="size-4" /> Mídias</button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {[
            ["all", "Todos"],
            ["photos", "Fotos"],
            ["videos", "Vídeos"],
            ["paid", "Pagos"],
          ].map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value as typeof filter)}>
              <Pill active={filter === value}>{label}</Pill>
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {filteredPosts.map((post) => {
            const locked = post.visibility === "subscriber" ? !subscribed : post.visibility === "ppv" ? !unlocks.includes(post.id) : false;
            return (
              <div key={post.id} data-testid="profile-post" data-locked={locked} className="group relative aspect-[4/5] overflow-hidden rounded-[18px] bg-surface sm:rounded-[24px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image} alt={post.caption} className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${locked ? "scale-105 blur-[10px]" : ""}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                {locked ? (
                  <div className="absolute inset-0 grid place-items-center p-3 text-center text-white">
                    <div>
                      <span className="mx-auto grid size-10 place-items-center rounded-full bg-black/35 backdrop-blur"><LockKeyhole className="size-4" /></span>
                      <p className="mt-2 text-[9px] font-bold">{post.visibility === "subscriber" ? "Para assinantes" : brl(post.price || 0)}</p>
                      <Link href={post.visibility === "subscriber" ? `/checkout?kind=subscription&id=${creator.id}&return=/creator/${creator.username}` : `/checkout?kind=post&id=${post.id}&creator=${creator.id}&return=/creator/${creator.username}`}>
                        <span className="mt-2 inline-block rounded-full bg-primary px-3 py-1.5 text-[8px] font-black text-ink">{post.visibility === "subscriber" ? "Assine para desbloquear" : "Desbloquear conteúdo"}</span>
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
        {filteredPosts.length === 0 && (
          <div className="mt-4 rounded-[24px] bg-surface/50 px-6 py-12 text-center">
            <ImageIcon className="mx-auto size-7 text-muted" />
            <p className="mt-3 text-xs font-extrabold">Nenhuma mídia nesta categoria</p>
            <p className="mt-1 text-[9px] text-muted">Escolha outro filtro para continuar.</p>
          </div>
        )}
      </section>
      <PremiumModal open={requestOpen} onClose={() => setRequestOpen(false)} title="Pedido especial" description="Descreva sua ideia. A criadora poderá aceitar, recusar ou enviar uma contraproposta. Tudo aqui é simulado.">
        <label className="block text-[10px] font-bold text-muted">Descrição
          <textarea value={requestDescription} onChange={(event) => setRequestDescription(event.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-black/10 bg-surface/60 p-3 text-xs outline-none focus:ring-2 focus:ring-primary" placeholder="Conte o que você gostaria de receber..." />
        </label>
        <label className="mt-4 block text-[10px] font-bold text-muted">Orçamento opcional (R$)
          <input value={requestBudget} onChange={(event) => setRequestBudget(event.target.value)} type="number" min="1" className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-surface/60 px-3 text-xs outline-none focus:ring-2 focus:ring-primary" placeholder="150,00" />
        </label>
        <Button className="mt-5 w-full" onClick={submitSpecialRequest}>Enviar pedido demo</Button>
      </PremiumModal>
    </div>
  );
}
