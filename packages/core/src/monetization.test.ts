import { describe, expect, it } from "vitest";
import {
  applyPromotion,
  calculateBundlePrice,
  calculateCommission,
  canTransitionSpecialRequest,
  createDoubleEntryLedger,
  ledgerBalances,
} from "./monetization";

const commissionConfig = {
  rateBps: 2_000,
  subscription: true,
  ppv: true,
  pack: true,
  specialRequest: true,
};

describe("monetization rules", () => {
  it("prices subscription bundles with a discount", () => {
    expect(calculateBundlePrice(3_000, 6, 20)).toBe(14_400);
  });

  it("applies only active, available promotions", () => {
    const now = new Date("2026-10-17T12:00:00Z");
    const active = {
      discountPercent: 50,
      startsAt: new Date("2026-10-16"),
      endsAt: new Date("2026-10-20"),
      subscriberCap: 10,
      redeemedCount: 3,
      active: true,
    };
    expect(applyPromotion(3_000, active, now)).toEqual({
      priceCents: 1_500,
      discountPercent: 50,
      applied: true,
    });
    expect(
      applyPromotion(3_000, { ...active, redeemedCount: 10 }, now).applied,
    ).toBe(false);
    expect(
      applyPromotion(
        3_000,
        { ...active, endsAt: new Date("2026-10-16") },
        now,
      ).applied,
    ).toBe(false);
  });

  it.each(["subscription", "ppv", "pack", "special_request"] as const)(
    "calculates affiliate commission for %s",
    (kind) => {
      expect(calculateCommission(10_000, kind, commissionConfig)).toBe(2_000);
    },
  );

  it("creates a balanced double-entry ledger", () => {
    const entries = createDoubleEntryLedger(10_000, 2_000);
    expect(ledgerBalances(entries)).toBe(0);
    expect(entries).toHaveLength(3);
  });

  it("enforces the special request lifecycle", () => {
    expect(canTransitionSpecialRequest("requested", "quoted")).toBe(true);
    expect(canTransitionSpecialRequest("quoted", "delivered")).toBe(false);
    expect(canTransitionSpecialRequest("paid", "delivered")).toBe(true);
  });
});
