import type { CheckoutRequest, PaymentGateway, PayoutRequest, SimulatedPayment } from "@mimelux/core";

function result(provider: SimulatedPayment["provider"]): SimulatedPayment {
  return {
    id: `sim_${provider}_${Date.now()}`,
    provider,
    status: "simulated",
    simulated: true,
  };
}

export class MockPaymentGateway implements PaymentGateway {
  async createCheckout(input: CheckoutRequest) {
    return result(input.provider);
  }

  async recordConfirmedPayment(input: CheckoutRequest) {
    return result(input.provider);
  }

  async requestPayout(input: PayoutRequest) {
    return result(input.provider);
  }
}

export const paymentGateway = new MockPaymentGateway();
