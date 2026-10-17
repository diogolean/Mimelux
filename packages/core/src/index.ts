import { z } from "zod";

export * from "./contracts";
export * from "./monetization";

export const contentModes = ["general", "adult", "hybrid"] as const;
export type ContentMode = (typeof contentModes)[number];

export const contentMode: ContentMode = (() => {
  const value =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_CONTENT_MODE
      : undefined;
  return contentModes.includes(value as ContentMode)
    ? (value as ContentMode)
    : "hybrid";
})();

export const loginSchema = z.object({
  identifier: z.string().min(3).max(120),
  password: z.string().min(6).max(120),
});

export const accountRoles = ["fan", "creator", "affiliate"] as const;
export type AccountRole = (typeof accountRoles)[number];

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.email(),
  password: z.string().min(6).max(120),
  role: z.enum(accountRoles),
});

export const checkoutSchema = z.object({
  kind: z.enum(["subscription", "post", "message", "pack", "special_request"]),
  itemId: z.string().min(1),
  amountCents: z.coerce.number().int().positive(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type TokenPair = {
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
};

export const DEMO_ACCOUNTS = {
  fan: { email: "fan@mimelux.com.br", password: "mimelux123" },
  creator: {
    email: "criadora@mimelux.com.br",
    alias: "creator@mimelux.com.br",
    password: "mimelux123",
  },
  affiliate: { email: "afiliado@mimelux.com.br", password: "mimelux123" },
} as const;

export function isDemoCreatorEmail(email: string) {
  const value = email.trim().toLowerCase();
  return (
    value === DEMO_ACCOUNTS.creator.email || value === DEMO_ACCOUNTS.creator.alias
  );
}

export function canonicalDemoEmail(email: string) {
  return isDemoCreatorEmail(email)
    ? DEMO_ACCOUNTS.creator.email
    : email.trim().toLowerCase();
}

export const paymentProviders = ["pix", "stripe", "crypto"] as const;
export type PaymentProviderId = (typeof paymentProviders)[number];

export const payoutSchedules = ["weekly", "biweekly", "monthly"] as const;
export type PayoutSchedule = (typeof payoutSchedules)[number];

export const payoutSchedule: PayoutSchedule = payoutSchedules.includes(
  process.env.NEXT_PUBLIC_PAYOUT_SCHEDULE as PayoutSchedule,
)
  ? (process.env.NEXT_PUBLIC_PAYOUT_SCHEDULE as PayoutSchedule)
  : "weekly";

/** The displayed schedule is configurable and not yet confirmed by the owner. */
export const payoutScheduleConfirmed = false;

export const minimumPayoutCents = 5_000;
export const attributionWindowDays = 30;
export const commissionHoldDays = 10;
export const renewalCommissionMonths = 12;

export type CheckoutRequest = {
  provider: PaymentProviderId;
  amountCents: number;
  currency: "BRL";
  description: string;
  idempotencyKey: string;
};

export type PayoutRequest = {
  provider: PaymentProviderId;
  amountCents: number;
  destinationLabel: string;
};

export type SimulatedPayment = {
  id: string;
  provider: PaymentProviderId;
  status: "simulated";
  simulated: true;
};

export interface PaymentGateway {
  createCheckout(input: CheckoutRequest): Promise<SimulatedPayment>;
  recordConfirmedPayment(input: CheckoutRequest): Promise<SimulatedPayment>;
  requestPayout(input: PayoutRequest): Promise<SimulatedPayment>;
}
