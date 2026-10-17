export type MonetizationKind =
  | "subscription"
  | "ppv"
  | "pack"
  | "special_request";

export type PromotionRule = {
  discountPercent: number;
  startsAt: Date;
  endsAt: Date;
  subscriberCap?: number;
  redeemedCount: number;
  active: boolean;
};

export function calculateBundlePrice(
  monthlyPriceCents: number,
  months: number,
  discountPercent: number,
) {
  if (!Number.isInteger(monthlyPriceCents) || monthlyPriceCents < 0) {
    throw new Error("Monthly price must be a non-negative integer.");
  }
  if (!Number.isInteger(months) || months < 1 || months > 24) {
    throw new Error("Bundle duration must be between 1 and 24 months.");
  }
  if (discountPercent < 0 || discountPercent > 95) {
    throw new Error("Discount must be between 0 and 95 percent.");
  }
  return Math.round(monthlyPriceCents * months * (1 - discountPercent / 100));
}

export function applyPromotion(
  basePriceCents: number,
  promotion: PromotionRule | null,
  now = new Date(),
) {
  if (
    !promotion ||
    !promotion.active ||
    now < promotion.startsAt ||
    now > promotion.endsAt ||
    (promotion.subscriberCap !== undefined &&
      promotion.redeemedCount >= promotion.subscriberCap)
  ) {
    return {
      priceCents: basePriceCents,
      discountPercent: 0,
      applied: false,
    };
  }
  return {
    priceCents: Math.max(
      0,
      Math.round(basePriceCents * (1 - promotion.discountPercent / 100)),
    ),
    discountPercent: promotion.discountPercent,
    applied: true,
  };
}

export type CommissionConfig = {
  rateBps: number;
  subscription: boolean;
  ppv: boolean;
  pack: boolean;
  specialRequest: boolean;
};

export function calculateCommission(
  amountCents: number,
  kind: MonetizationKind,
  config: CommissionConfig,
) {
  const enabled =
    kind === "subscription"
      ? config.subscription
      : kind === "ppv"
        ? config.ppv
        : kind === "pack"
          ? config.pack
          : config.specialRequest;
  if (!enabled) return 0;
  if (config.rateBps < 0 || config.rateBps > 10_000) {
    throw new Error("Commission rate must be valid basis points.");
  }
  return Math.round((amountCents * config.rateBps) / 10_000);
}

export type LedgerDraft = {
  direction: "DEBIT" | "CREDIT";
  account: "platform_cash" | "creator_payable" | "affiliate_payable";
  amountCents: number;
};

export function createDoubleEntryLedger(
  amountCents: number,
  affiliateCommissionCents: number,
): LedgerDraft[] {
  if (amountCents <= 0 || affiliateCommissionCents < 0) {
    throw new Error("Ledger amounts must be valid.");
  }
  if (affiliateCommissionCents > amountCents) {
    throw new Error("Commission cannot exceed payment.");
  }
  const entries: LedgerDraft[] = [
    { direction: "DEBIT", account: "platform_cash", amountCents },
    {
      direction: "CREDIT",
      account: "creator_payable",
      amountCents: amountCents - affiliateCommissionCents,
    },
  ];
  if (affiliateCommissionCents > 0) {
    entries.push({
      direction: "CREDIT",
      account: "affiliate_payable",
      amountCents: affiliateCommissionCents,
    });
  }
  return entries;
}

export function ledgerBalances(entries: LedgerDraft[]) {
  return entries.reduce(
    (sum, entry) =>
      sum + (entry.direction === "DEBIT" ? entry.amountCents : -entry.amountCents),
    0,
  );
}

export type SpecialRequestStatus =
  | "requested"
  | "quoted"
  | "accepted"
  | "paid"
  | "delivered"
  | "declined"
  | "refunded";

const specialRequestTransitions: Record<SpecialRequestStatus, SpecialRequestStatus[]> = {
  requested: ["quoted", "declined"],
  quoted: ["accepted", "declined"],
  accepted: ["paid", "declined"],
  paid: ["delivered", "refunded"],
  delivered: [],
  declined: [],
  refunded: [],
};

export function canTransitionSpecialRequest(
  from: SpecialRequestStatus,
  to: SpecialRequestStatus,
) {
  return specialRequestTransitions[from].includes(to);
}
