import {
  attributionWindowDays,
  commissionHoldDays,
  renewalCommissionMonths,
} from "@mimelux/core";
import type { DemoAttribution, DemoClick, DemoCommission, DemoState } from "./demo-store";
import { creators } from "./fixtures";

export const demoAffiliate = {
  name: "Nara Costa",
  email: "afiliado@mimelux.com.br",
  code: "nara",
  fictitious: true as const,
};

const day = 24 * 60 * 60 * 1000;

function iso(date: Date) {
  return date.toISOString();
}

export function affiliateLink(username: string, subId = "direct", locale = "pt-BR") {
  const params = new URLSearchParams({ lang: locale, sub: subId });
  return `/r/${demoAffiliate.code}/${username}?${params.toString()}`;
}

export function buildAffiliateSeed(): Pick<DemoState, "clicks" | "commissions" | "attributions"> {
  const now = Date.now();
  const picks = creators.slice(0, 6);
  const subs = ["tiktok", "instagram", "youtube", "direct"];
  const clicks: DemoClick[] = picks.flatMap((creator, creatorIndex) =>
    subs.map((subId, subIndex) => ({
      id: `seed-click-${creator.id}-${subId}`,
      code: demoAffiliate.code,
      creatorId: creator.id,
      creatorSlug: creator.username,
      subId,
      locale: "pt-BR",
      suspicious: subId === "direct" && creatorIndex === 5,
      createdAt: iso(new Date(now - (creatorIndex * 4 + subIndex + 2) * day)),
    })),
  );
  clicks.push({
    id: "seed-click-bot",
    code: demoAffiliate.code,
    creatorId: picks[0]!.id,
    creatorSlug: picks[0]!.username,
    subId: "bot",
    locale: "en",
    suspicious: true,
    createdAt: iso(new Date(now - day)),
  });

  const commissions: DemoCommission[] = [
    commission("seed-paid", picks[0]!, "tiktok", 2990, "paid", "first_sale", now - 40 * day),
    commission("seed-approved", picks[1]!, "instagram", 2490, "approved", "first_sale", now - 20 * day),
    commission("seed-approved-renewal", picks[1]!, "instagram", 2490, "approved", "renewal", now - 18 * day),
    commission("seed-pending", picks[3]!, "youtube", 1990, "pending", "first_sale", now - 3 * day),
    commission("seed-rejected", picks[4]!, "bot", 2790, "rejected", "first_sale", now - 2 * day),
  ];

  return {
    clicks,
    commissions,
    attributions: commissions
      .filter((item) => item.status !== "rejected")
      .map((item) => ({
        id: `seed-att-${item.id}`,
        code: demoAffiliate.code,
        creatorId: item.creatorId,
        creatorSlug: creators.find((creator) => creator.id === item.creatorId)?.username ?? "",
        subId: item.subId,
        clickId: `seed-click-${item.id}`,
        clickedAt: item.createdAt,
        fanEmail: `demo.${item.subId}@example.test`,
      })),
  };
}

function commission(
  id: string,
  creator: { id: string; name: string },
  subId: string,
  saleCents: number,
  status: DemoCommission["status"],
  kind: DemoCommission["kind"],
  createdAt: number,
): DemoCommission {
  return {
    id,
    affiliateCode: demoAffiliate.code,
    creatorId: creator.id,
    creatorName: creator.name,
    subId,
    saleCents,
    amountCents: Math.round(saleCents * 0.2),
    rateBps: 2000,
    status,
    kind,
    holdUntil: iso(new Date(createdAt + commissionHoldDays * day)),
    renewalUntil: iso(new Date(createdAt + renewalCommissionMonths * 30 * day)),
    createdAt: iso(new Date(createdAt)),
  };
}

export function isSuspiciousClick(subId: string, userAgent: string | null) {
  return !userAgent || /bot|spider|crawler|spam/i.test(subId) || /bot|crawler/i.test(userAgent);
}

export function recordClick(
  state: DemoState,
  input: { creatorId: string; creatorSlug: string; subId: string; locale: string; suspicious: boolean },
): Partial<DemoState> {
  const click: DemoClick = {
    id: `clk_${Date.now()}`,
    code: demoAffiliate.code,
    creatorId: input.creatorId,
    creatorSlug: input.creatorSlug,
    subId: input.subId || "direct",
    locale: input.locale,
    suspicious: input.suspicious,
    createdAt: new Date().toISOString(),
  };
  const attribution: DemoAttribution = {
    id: `att_${click.id}`,
    code: demoAffiliate.code,
    creatorId: input.creatorId,
    creatorSlug: input.creatorSlug,
    subId: click.subId,
    clickId: click.id,
    clickedAt: click.createdAt,
    blockedReason: input.suspicious ? "suspicious" : undefined,
  };
  return {
    clicks: [click, ...state.clicks],
    pendingAttribution: attribution,
  };
}

export function bindAttribution(state: DemoState, email: string): Partial<DemoState> {
  const pending = state.pendingAttribution;
  if (!pending) return {};
  if (email.trim().toLowerCase() === demoAffiliate.email) {
    return {
      pendingAttribution: null,
      attributionBlocked: "self_referral",
    };
  }
  const attribution = { ...pending, fanEmail: email.trim().toLowerCase() };
  return {
    pendingAttribution: null,
    activeAttribution: attribution,
    attributions: [attribution, ...state.attributions],
  };
}

export function commissionForSale(
  state: DemoState,
  sale: {
    creatorId: string;
    creatorName: string;
    amountCents: number;
    kind?: DemoCommission["kind"];
    transactionKind?: DemoCommission["transactionKind"];
    reference?: string;
  },
): Partial<DemoState> {
  const attribution = state.activeAttribution;
  if (!attribution || attribution.creatorId !== sale.creatorId || attribution.blockedReason) return {};
  if (!state.creatorProgram.acceptsAffiliates) return {};
  const clickedAt = new Date(attribution.clickedAt).getTime();
  if (Date.now() - clickedAt > attributionWindowDays * day) return {};
  const kind = sale.kind ?? "first_sale";
  const transactionKind = sale.transactionKind ?? "subscription";
  if (transactionKind === "ppv" && !state.creatorMonetization.commissionOnPpv) return {};
  if (transactionKind === "pack" && !state.creatorMonetization.commissionOnPacks) return {};
  if (transactionKind === "special_request" && !state.creatorMonetization.commissionOnRequests) return {};
  if (kind === "renewal" && Date.now() > new Date(clickedAt + renewalCommissionMonths * 30 * day).getTime()) {
    return {};
  }
  const duplicate = state.commissions.some(
    (item) =>
      item.creatorId === sale.creatorId &&
      item.subId === attribution.subId &&
      item.id === `live-${attribution.clickId}-${transactionKind}-${sale.reference ?? kind}`,
  );
  if (duplicate) return {};
  const rateBps = state.creatorProgram.commissionBps;
  const createdAt = new Date();
  const next: DemoCommission = {
    id: `live-${attribution.clickId}-${transactionKind}-${sale.reference ?? kind}`,
    affiliateCode: attribution.code,
    creatorId: sale.creatorId,
    creatorName: sale.creatorName,
    subId: attribution.subId,
    saleCents: sale.amountCents,
    amountCents: Math.round((sale.amountCents * rateBps) / 10_000),
    rateBps,
    status: attribution.blockedReason ? "rejected" : "pending",
    kind,
    transactionKind,
    holdUntil: new Date(createdAt.getTime() + commissionHoldDays * day).toISOString(),
    renewalUntil: new Date(clickedAt + renewalCommissionMonths * 30 * day).toISOString(),
    createdAt: createdAt.toISOString(),
  };
  return { commissions: [next, ...state.commissions] };
}

export function affiliateSummary(state: DemoState) {
  const clicks = state.clicks.length;
  const signups = state.attributions.length;
  const sales = state.commissions.filter((item) => item.status !== "rejected");
  const commissionTotal = (status: DemoCommission["status"]) =>
    state.commissions.filter((item) => item.status === status).reduce((sum, item) => sum + item.amountCents, 0);
  return {
    clicks,
    signups,
    sales: sales.length,
    conversionRate: clicks ? sales.length / clicks : 0,
    earningsPerClickCents: clicks
      ? Math.round(state.commissions.reduce((sum, item) => sum + item.amountCents, 0) / clicks)
      : 0,
    pendingCents: commissionTotal("pending"),
    approvedCents: commissionTotal("approved"),
    paidCents: commissionTotal("paid"),
  };
}
