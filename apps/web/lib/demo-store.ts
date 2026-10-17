"use client";

import type { AccountRole, PaymentProviderId } from "@mimelux/core";
import { buildAffiliateSeed } from "./affiliates";

const key = "mimelux-demo";
const affiliateSeed = buildAffiliateSeed();

export type DemoAttribution = {
  id: string;
  code: string;
  creatorId: string;
  creatorSlug: string;
  subId: string;
  clickId: string;
  clickedAt: string;
  fanEmail?: string;
  blockedReason?: "self_referral" | "suspicious";
};

export type DemoClick = {
  id: string;
  code: string;
  creatorId: string;
  creatorSlug: string;
  subId: string;
  locale: string;
  suspicious: boolean;
  createdAt: string;
};

export type DemoCommission = {
  id: string;
  affiliateCode: string;
  creatorId: string;
  creatorName: string;
  subId: string;
  saleCents: number;
  amountCents: number;
  rateBps: number;
  status: "pending" | "approved" | "paid" | "rejected";
  kind: "first_sale" | "renewal";
  transactionKind?: "subscription" | "ppv" | "pack" | "special_request";
  holdUntil: string;
  renewalUntil: string;
  createdAt: string;
};

export type DemoSpecialRequest = {
  id: string;
  creatorId: string;
  description: string;
  budgetCents?: number;
  quotedPriceCents?: number;
  status:
    | "requested"
    | "quoted"
    | "accepted"
    | "paid"
    | "delivered"
    | "declined"
    | "refunded";
  messages: { sender: "fan" | "creator"; body: string; createdAt: string }[];
  createdAt: string;
};

export type CreatorMonetizationSettings = {
  monthlyPriceCents: number;
  bundleDiscounts: Record<"1" | "3" | "6" | "12", number>;
  promotion: {
    active: boolean;
    discountPercent: number;
    startsAt: string;
    endsAt: string;
    subscriberCap?: number;
    redeemedCount: number;
  };
  commissionOnPpv: boolean;
  commissionOnPacks: boolean;
  commissionOnRequests: boolean;
};

export type DemoReview = {
  id: string;
  creatorId: string;
  authorName: string;
  rating: number;
  body: string;
};

export type DemoState = {
  signedIn: boolean;
  role: AccountRole;
  verified: boolean;
  onboarding: boolean;
  coachSeen: boolean;
  subscriptions: string[];
  unlocks: string[];
  likes: string[];
  saves: string[];
  comments: Record<string, string[]>;
  reviews: DemoReview[];
  enabledCreatorIds: string[];
  sentMessages: Record<string, string[]>;
  cookieAccepted: boolean;
  clicks: DemoClick[];
  attributions: DemoAttribution[];
  commissions: DemoCommission[];
  pendingAttribution: DemoAttribution | null;
  activeAttribution: DemoAttribution | null;
  attributionBlocked: DemoAttribution["blockedReason"] | null;
  creatorProgram: { acceptsAffiliates: boolean; commissionBps: number };
  payoutSettings: { method: PaymentProviderId; destination: string };
  specialRequests: DemoSpecialRequest[];
  creatorMonetization: CreatorMonetizationSettings;
  demoMode: boolean;
};

const defaults: DemoState = {
  signedIn: false,
  role: "fan",
  verified: false,
  onboarding: false,
  coachSeen: false,
  subscriptions: ["nina-valenca"],
  unlocks: [],
  likes: [],
  saves: [],
  comments: {},
  reviews: [],
  enabledCreatorIds: [],
  sentMessages: {},
  cookieAccepted: false,
  clicks: affiliateSeed.clicks,
  attributions: affiliateSeed.attributions,
  commissions: affiliateSeed.commissions,
  pendingAttribution: null,
  activeAttribution: null,
  attributionBlocked: null,
  creatorProgram: { acceptsAffiliates: true, commissionBps: 2000 },
  payoutSettings: { method: "pix", destination: "demo-chave-pix" },
  specialRequests: [],
  creatorMonetization: {
    monthlyPriceCents: 2_990,
    bundleDiscounts: { "1": 0, "3": 10, "6": 20, "12": 30 },
    promotion: {
      active: true,
      discountPercent: 50,
      startsAt: "2026-01-01T00:00:00.000Z",
      endsAt: "2027-12-31T23:59:59.000Z",
      subscriberCap: 100,
      redeemedCount: 28,
    },
    commissionOnPpv: true,
    commissionOnPacks: true,
    commissionOnRequests: true,
  },
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
};

export function readDemo(): DemoState {
  if (typeof window === "undefined") return defaults;
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return defaults;
  }
}

export function writeDemo(patch: Partial<DemoState>) {
  const next = { ...readDemo(), ...patch };
  localStorage.setItem(key, JSON.stringify(next));
  window.dispatchEvent(new Event("mimelux:state"));
  return next;
}

export function resetDemo() {
  localStorage.removeItem(key);
  window.dispatchEvent(new Event("mimelux:state"));
}

export function mockDelay(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
