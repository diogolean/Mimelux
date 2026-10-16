"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  LoaderCircle,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button, Logo, Pill } from "@mimelux/ui";
import { brl, creators, posts } from "@/lib/fixtures";
import { mockDelay, readDemo, writeDemo } from "@/lib/demo-store";
import { toast } from "sonner";

function FakeQr({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let hash = 0;
    for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return Array.from({ length: 225 }, (_, index) => {
      const x = index % 15;
      const y = Math.floor(index / 15);
      const marker =
        (x < 4 && y < 4) ||
        (x > 10 && y < 4) ||
        (x < 4 && y > 10);
      const bit = ((hash >> (index % 24)) ^ (index * 13 + y * 7)) & 1;
      return marker || bit === 1;
    });
  }, [seed]);

  return (
    <div className="grid size-48 grid-cols-[repeat(15,1fr)] gap-[2px] rounded-[22px] bg-white p-4 shadow-inner">
      {cells.map((active, index) => <i key={index} className={active ? "rounded-[1px] bg-ink" : ""} />)}
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const search = useSearchParams();
  const kind = search.get("kind") || "subscription";
  const id = search.get("id") || "luna-ferraz";
  const creatorId = kind === "subscription" ? id : search.get("creator") || "luna-ferraz";
  const creator = creators.find((item) => item.id === creatorId) || creators[0]!;
  const post = posts.find((item) => item.id === id);
  const message = kind === "message";
  const amount = kind === "subscription" ? creator.price : message ? 1290 : post?.price || 990;
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const returnPath = search.get("return")?.startsWith("/") ? search.get("return")! : `/creator/${creator.username}`;

  async function simulate() {
    setPaying(true);
    await mockDelay(900);
    const state = readDemo();
    if (kind === "subscription") {
      writeDemo({ subscriptions: Array.from(new Set([...state.subscriptions, creator.id])) });
    } else {
      writeDemo({ unlocks: Array.from(new Set([...state.unlocks, id])) });
    }
    setPaying(false);
    setPaid(true);
    toast.success(kind === "subscription" ? "Assinatura ativada!" : "Conteúdo desbloqueado!");
  }

  if (paid) {
    return (
      <div className="grid min-h-[calc(100dvh-64px)] place-items-center px-5">
        <div className="w-full max-w-md rounded-[32px] border border-black/5 bg-white/70 p-8 text-center shadow-2xl dark:bg-white/5">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-600"><Check className="size-9" strokeWidth={3} /></span>
          <p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-emerald-600">Pagamento simulado</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-.04em]">{kind === "subscription" ? "Você faz parte!" : "Conteúdo liberado"}</h1>
          <p className="mt-3 text-xs leading-5 text-muted">{kind === "subscription" ? `Sua assinatura de ${creator.name} está ativa neste navegador.` : "A experiência já está disponível para você neste navegador."}</p>
          <Button size="lg" className="mt-7 w-full" onClick={() => router.push(returnPath)}>Ver agora <Sparkles className="size-4" /></Button>
          <p className="mt-4 text-[9px] text-muted">Nenhuma cobrança real foi realizada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-64px)] w-full max-w-5xl gap-8 px-4 py-7 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
      <section>
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground"><ArrowLeft className="size-4" /> Voltar</button>
        <Logo compact />
        <p className="mt-10 text-[10px] font-black uppercase tracking-[.2em] text-primary-strong">Checkout protegido</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-.05em]">{kind === "subscription" ? "Falta pouco para fazer parte." : "Uma experiência só sua."}</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted">Finalize com Pix. Este é um ambiente de demonstração: o QR é fictício e o botão apenas simula a confirmação.</p>

        <div className="mt-7 flex items-center gap-4 rounded-[24px] border border-black/5 bg-white/60 p-4 dark:bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={creator.avatar} alt={creator.name} className="size-16 rounded-[20px] object-cover" />
          <div className="min-w-0 flex-1"><p className="text-xs font-extrabold">{kind === "subscription" ? `Assinatura de ${creator.name}` : `Conteúdo de ${creator.name}`}</p><p className="mt-1 text-[9px] text-muted">{kind === "subscription" ? "Plano mensal · renovação simulada" : message ? "Mensagem exclusiva · acesso permanente" : "Post exclusivo · acesso permanente"}</p></div>
          <p className="text-sm font-black">{brl(amount)}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Pill><ShieldCheck className="mr-1 size-3" /> Ambiente demo</Pill>
          <Pill><LockKeyhole className="mr-1 size-3" /> Sem cobrança real</Pill>
        </div>
      </section>

      <section className="overflow-hidden rounded-[34px] border border-black/5 bg-white/75 shadow-[0_30px_90px_rgba(32,32,39,.12)] dark:bg-white/5">
        <div className="flex items-center justify-between border-b border-black/5 p-5 sm:px-7">
          <div><p className="text-xs font-extrabold">Pague com Pix</p><p className="mt-1 text-[9px] text-muted">Confirmação instantânea no ambiente real</p></div>
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/20"><QrCode className="size-5 text-primary-strong" /></span>
        </div>
        <div className="grid place-items-center p-6 sm:p-8">
          <FakeQr seed={`${kind}-${id}-${amount}`} />
          <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold text-muted"><Clock3 className="size-3.5" /> QR válido por 14:52</div>
          <button onClick={() => toast.success("Código Pix copiado")} className="mt-5 flex w-full max-w-sm items-center gap-3 rounded-2xl bg-surface/65 p-3 text-left dark:bg-white/5">
            <span className="min-w-0 flex-1 truncate text-[9px] text-muted">00020126580014BR.GOV.BCB.PIX...MIMELUXDEMO</span><Copy className="size-4 shrink-0" />
          </button>
          <Button size="lg" className="mt-5 w-full max-w-sm" onClick={simulate} disabled={paying}>
            {paying ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
            {paying ? "Confirmando..." : "Simular pagamento"}
          </Button>
          <p className="mt-4 max-w-xs text-center text-[9px] leading-4 text-muted">Ao continuar, você confirma que entende que este checkout é apenas uma simulação de produto.</p>
        </div>
      </section>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div className="m-8 h-[75vh] rounded-[34px] skeleton" />}><CheckoutContent /></Suspense>;
}
