import Stripe from "stripe";

export type PaymentCheckout = {
  purchaseId: string;
  amountCents: number;
  currency: "brl";
  description: string;
};

export interface PaymentProviderGateway {
  createCheckout(input: PaymentCheckout): Promise<{
    provider: "stripe" | "pix" | "crypto";
    externalId: string;
    clientSecret?: string | null;
    simulated: boolean;
  }>;
}

export class StripeTestGateway implements PaymentProviderGateway {
  async createCheckout(input: PaymentCheckout) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key?.startsWith("sk_test_")) {
      throw new Error("Stripe requires an sk_test_ key. Live keys are rejected.");
    }
    const stripe = new Stripe(key);
    const intent = await stripe.paymentIntents.create(
      {
        amount: input.amountCents,
        currency: input.currency,
        description: input.description,
        metadata: { purchaseId: input.purchaseId },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: input.purchaseId },
    );
    return {
      provider: "stripe" as const,
      externalId: intent.id,
      clientSecret: intent.client_secret,
      simulated: false,
    };
  }
}

export class StubPaymentGateway implements PaymentProviderGateway {
  constructor(private readonly provider: "pix" | "crypto") {}

  async createCheckout(input: PaymentCheckout) {
    return {
      provider: this.provider,
      externalId: `${this.provider}_demo_${input.purchaseId}`,
      simulated: true,
    };
  }
}

export function paymentProvider(provider: "stripe" | "pix" | "crypto") {
  return provider === "stripe"
    ? new StripeTestGateway()
    : new StubPaymentGateway(provider);
}
