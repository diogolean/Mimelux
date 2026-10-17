"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Heart,
  ImageIcon,
  LockKeyhole,
  MessageCircle,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Pill, PremiumModal } from "@mimelux/ui";
import type { Creator, Post } from "@/lib/gateway";
import { brl, compact, plans, reviewsFor } from "@/lib/gateway";
import { readDemo, writeDemo, type DemoReview, type DemoSpecialRequest } from "@/lib/demo-store";
import { toast } from "sonner";

export function CreatorProfile({ creator, posts }: { creator: Creator; posts: Post[] }) {
  const t = useTranslations("profile");
  const [subscribed, setSubscribed] = useState(false);
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [tab, setTab] = useState<"posts" | "media">("posts");
  const [bioOpen, setBioOpen] = useState(false);
  const [promosOpen, setPromosOpen] = useState(true);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestDescription, setRequestDescription] = useState("");
  const [requestBudget, setRequestBudget] = useState("");
  const [monetization, setMonetization] = useState(() => readDemo().creatorMonetization);
  const [requests, setRequests] = useState<DemoSpecialRequest[]>([]);
  const [extraReviews, setExtraReviews] = useState<DemoReview[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const sync = () => {
      const state = readDemo();
      setSubscribed(state.subscriptions.includes(creator.id));
      setUnlocks(state.unlocks);
      setMonetization(state.creatorMonetization);
      setRequests(state.specialRequests.filter((request) => request.creatorId === creator.id));
      setExtraReviews(state.reviews.filter((review) => review.creatorId === creator.id));
      setLikedIds(state.likes);
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

  function submitReview() {
    if (!subscribed || reviewBody.trim().length < 4) {
      toast.error("Escreva um comentário curto sobre a experiência.");
      return;
    }
    const state = readDemo();
    writeDemo({
      reviews: [
        ...state.reviews,
        {
          id: `review-local-${Date.now()}`,
          creatorId: creator.id,
          authorName: "você",
          rating: reviewRating,
          body: reviewBody.trim(),
        },
      ],
    });
    setReviewBody("");
    toast.success("Avaliação salva neste navegador.");
  }

  const visibleReviews = [...reviewsFor(creator.id), ...extraReviews];
  const averageRating = visibleReviews.length
    ? visibleReviews.reduce((total, review) => total + review.rating, 0) / visibleReviews.length
    : 0;
  const likeTotal =
    posts.reduce((total, post) => total + post.likes, 0) +
    likedIds.filter((id) => posts.some((post) => post.id === id)).length;

  const photoCount = posts.filter((post) => post.mediaType === "image").length;
  const videoCount = posts.filter((post) => post.mediaType === "video").length;
  const lockedCount = posts.filter((post) => post.visibility !== "free").length;
  const visiblePosts = tab === "media" ? posts.filter((post) => post.mediaType === "image" || post.mediaType === "video") : posts;

  function planTotal(months: 1 | 3 | 6 | 12) {
    const plan = plans.find((item) => item.months === months);
    if (!plan || creator.free) return 0;
    return Math.round(
      monetization.monthlyPriceCents *
        plan.months *
        (1 - (monetization.bundleDiscounts[String(plan.months) as "1" | "3" | "6" | "12"] ?? plan.discount) / 100) *
        (promotionActive ? 1 - promotion.discountPercent / 100 : 1),
    );
  }

  function planHref(months: number) {
    const plan = plans.find((item) => item.months === months);
    return `/checkout?kind=subscription&id=${creator.id}&plan=${plan?.id ?? "monthly"}&return=/creator/${creator.username}`;
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 sm:px-6">
      <div className="relative">
        <div className="relative h-28 overflow-hidden rounded-[28px] sm:h-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={creator.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-ink/70 via-ink/20 to-transparent" />
          <div data-testid="profile-cover-stats" className="absolute right-3 top-3 grid max-w-[78%] grid-cols-4 gap-2 text-right text-white sm:right-4 sm:top-4">
            {(
              [
                { value: photoCount, label: t("photos"), Icon: ImageIcon },
                { value: videoCount, label: t("videos"), Icon: Video },
                { value: lockedCount, label: t("locked"), Icon: LockKeyhole },
                { value: compact(likeTotal), label: t("likes"), Icon: Heart, testId: "profile-likes" },
              ] as const
            ).map(({ value, label, Icon, ...rest }) => (
              <div key={label} className="min-w-0">
                <Icon className="ml-auto size-3.5 opacity-80" />
                <b data-testid={"testId" in rest ? rest.testId : undefined} className="mt-1 block text-sm font-semibold leading-none">{value}</b>
                <span className="mt-1 block text-[9px] uppercase tracking-wide text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-testid="profile-avatar"
          src={creator.avatar}
          alt={creator.name}
          className="absolute -bottom-8 left-4 z-20 size-20 rounded-full border-4 border-background bg-background object-cover shadow-[0_16px_40px_rgba(12,13,20,.28)] sm:size-24"
        />
      </div>

      <div className="mt-12">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-semibold tracking-[-.04em] sm:text-3xl">{creator.name}</h1>
          {creator.verified && <BadgeCheck className="size-5 fill-primary text-white" />}
        </div>
        <p className="mt-1 text-sm text-muted">@{creator.username}</p>
        <p className={`mt-3 max-w-xl text-sm leading-6 ${bioOpen ? "" : "line-clamp-1"}`}>{creator.bio}</p>
        <button type="button" className="mt-1 text-sm font-semibold text-primary-strong" onClick={() => setBioOpen((value) => !value)}>
          {bioOpen ? t("readLess") : t("readMore")}
        </button>
        <div className="mt-4 flex items-center gap-2">
          {[
            ["instagram", t("socialInstagram")],
            ["x", t("socialX")],
            ["tiktok", t("socialTikTok")],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              onClick={() => toast.info(label)}
              className="grid size-9 place-items-center rounded-full border border-border bg-elevated text-xs font-bold"
            >
              {id === "instagram" ? "IG" : id === "x" ? "X" : "♪"}
            </button>
          ))}
          <Link href={`/chat/${creator.id}`} aria-label={t("chat")} className="grid size-9 place-items-center rounded-full border border-border bg-elevated">
            <MessageCircle className="size-4" />
          </Link>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{t("subscriptions")}</h2>
        <div className="mt-3 space-y-3">
          {subscribed ? (
            <Button variant="dark" className="h-14 w-full rounded-full"><BadgeCheck className="size-4" /> {t("active")}</Button>
          ) : (
            <Link href={planHref(1)} className="flex h-14 w-full items-center justify-between rounded-full bg-primary px-6 text-base font-semibold text-ink shadow-sm">
              <span>1 {t("month")}</span>
              <span>{creator.free ? t("free") : brl(planTotal(1))}</span>
            </Link>
          )}
          <button type="button" aria-expanded={promosOpen} onClick={() => setPromosOpen((value) => !value)} className="flex w-full items-center justify-between py-1 text-sm font-semibold">
            {t("promotions")}
            <ChevronDown className={`size-4 transition ${promosOpen ? "rotate-180" : ""}`} />
          </button>
          {promosOpen && (
            <div className="space-y-3">
              {promotionActive && (
                <div data-testid="promotion-banner" className="rounded-[22px] bg-gradient-to-r from-primary/25 to-accent/25 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-primary-strong">{t("promoLabel")}</p>
                  <p className="mt-1 text-sm font-semibold">{t("promoBody", { percent: promotion.discountPercent })}</p>
                  <p className="mt-1 text-xs text-muted">{t("promoMeta", { spots: (promotion.subscriberCap ?? 0) - promotion.redeemedCount })}</p>
                </div>
              )}
              {([3, 6, 12] as const).map((months) => (
                <Link key={months} href={planHref(months)} className="flex h-14 w-full items-center justify-between rounded-full border border-primary/40 bg-primary/15 px-6 text-base font-semibold">
                  <span>{months} {t("months")}</span>
                  <span>{creator.free ? t("free") : brl(planTotal(months))}</span>
                </Link>
              ))}
              <Link href={`/checkout?kind=pack&id=summer-pack&creator=${creator.id}&return=/creator/${creator.username}`} className="flex h-14 w-full items-center justify-between rounded-full border border-border bg-elevated px-6 text-sm font-semibold">
                <span>Pacote Bastidores</span>
                <span>{brl(4_990)}</span>
              </Link>
            </div>
          )}
        </div>
        <Button variant="outline" className="mt-4 h-12 w-full rounded-full" onClick={() => setRequestOpen(true)}>
          <Sparkles className="size-4" /> {t("special")}
        </Button>
      </section>

      {requests.length > 0 && (
        <section className="mt-5 rounded-[28px] border border-border bg-elevated p-5">
          <h2 className="text-sm font-semibold">Seus pedidos especiais</h2>
          <div className="mt-4 space-y-3">
            {requests.map((request) => (
              <article key={request.id} className="rounded-[20px] bg-surface/70 p-4">
                <div className="flex items-start justify-between gap-3"><p className="line-clamp-2 text-xs font-semibold">{request.description}</p><Pill>{request.status}</Pill></div>
                {request.status === "quoted" && request.quotedPriceCents && (
                  <div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs font-semibold">Contraproposta: {brl(request.quotedPriceCents)}</p><Link href={`/checkout?kind=special_request&id=${request.id}&creator=${creator.id}&amount=${request.quotedPriceCents}&return=/creator/${creator.username}`}><Button size="sm">Aceitar e simular pagamento</Button></Link></div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid grid-cols-2 rounded-[22px] bg-surface/70 p-1">
        <button type="button" onClick={() => setTab("posts")} className={`flex h-12 items-center justify-center gap-2 rounded-[18px] text-sm ${tab === "posts" ? "bg-elevated font-semibold shadow-sm" : "text-muted"}`}>
          <ImageIcon className="size-4" /> {posts.length} {t("posts")}
        </button>
        <button type="button" onClick={() => setTab("media")} className={`flex h-12 items-center justify-center gap-2 rounded-[18px] text-sm ${tab === "media" ? "bg-elevated font-semibold shadow-sm" : "text-muted"}`}>
          <Video className="size-4" /> {photoCount + videoCount} {t("media")}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {visiblePosts.map((post) => {
          const locked = post.visibility === "subscriber" ? !subscribed : post.visibility === "ppv" ? !unlocks.includes(post.id) : false;
          return (
            <div key={post.id} data-testid="profile-post" data-locked={locked} className="group relative aspect-[3/4] overflow-hidden rounded-[16px] bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt={post.caption} className={`h-full w-full object-cover ${locked ? "scale-105 blur-[10px]" : ""}`} />
              {locked && (
                <div className="absolute inset-0 grid place-items-center bg-ink/25 p-2 text-center text-white">
                  <div>
                    <span className="mx-auto grid size-8 place-items-center rounded-full bg-black/40"><LockKeyhole className="size-3.5" /></span>
                    <Link href={post.visibility === "subscriber" ? planHref(1) : `/checkout?kind=post&id=${post.id}&creator=${creator.id}&return=/creator/${creator.username}`}>
                      <span className="mt-2 inline-block text-[10px] font-semibold">{post.visibility === "subscriber" ? "Assine para desbloquear" : "Desbloquear conteúdo"}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <section data-testid="profile-reviews" className="mt-8 rounded-[28px] border border-border bg-elevated p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary-strong">{t("reviews")}</p>
            <h2 className="mt-1 text-lg font-semibold">{t("reviewers")}</h2>
          </div>
          <p data-testid="profile-rating" className="text-sm font-semibold">{averageRating.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</p>
        </div>
        <div className="mt-4 space-y-3">
          {visibleReviews.map((review) => (
            <article key={review.id} data-testid="review-card" className="rounded-[20px] bg-surface/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{review.authorName}</p>
                <p className="text-sm font-semibold text-primary-strong" aria-label={`${review.rating} de 5`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
              </div>
              <p className="mt-2 text-sm leading-6">{review.body}</p>
            </article>
          ))}
        </div>
        {subscribed ? (
          <form data-testid="review-form" className="mt-4" onSubmit={(event) => { event.preventDefault(); submitReview(); }}>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" aria-label={`Nota ${value}`} onClick={() => setReviewRating(value)}>
                  <Star className={`size-5 ${value <= reviewRating ? "fill-primary text-primary-strong" : "text-muted"}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewBody} onChange={(event) => setReviewBody(event.target.value)} className="mt-3 min-h-24 w-full rounded-2xl border border-border bg-surface/60 p-3 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder={t("reviewPlaceholder")} />
            <Button type="submit" className="mt-3">{t("reviewPublish")}</Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted">{t("reviewGate")}</p>
        )}
      </section>

      <PremiumModal open={requestOpen} onClose={() => setRequestOpen(false)} title={t("special")} description="Descreva sua ideia. O criador poderá aceitar, recusar ou enviar uma contraproposta. Tudo aqui é simulado.">
        <label className="block text-[10px] font-bold text-muted">Descrição
          <textarea value={requestDescription} onChange={(event) => setRequestDescription(event.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-border bg-surface/60 p-3 text-xs outline-none focus:ring-2 focus:ring-primary" placeholder="Conte o que você gostaria de receber..." />
        </label>
        <label className="mt-4 block text-[10px] font-bold text-muted">Orçamento opcional (R$)
          <input value={requestBudget} onChange={(event) => setRequestBudget(event.target.value)} type="number" min="1" className="mt-2 h-11 w-full rounded-2xl border border-border bg-surface/60 px-3 text-xs outline-none focus:ring-2 focus:ring-primary" placeholder="150,00" />
        </label>
        <Button className="mt-5 w-full" onClick={submitSpecialRequest}>Enviar pedido demo</Button>
      </PremiumModal>
    </div>
  );
}
