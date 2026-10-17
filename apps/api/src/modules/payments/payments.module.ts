import { Body, Controller, Headers, HttpCode, Module, Param, Post, RawBodyRequest, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { database } from "@mimelux/db";
import Stripe from "stripe";
import type { Request } from "express";
import { createDoubleEntryLedger, calculateCommission } from "@mimelux/core";
import { paymentProvider } from "./payment-gateways";

const demoPurchaseSchema = z.object({ mode: z.literal("demo") });
const checkoutSchema = z.object({
  provider: z.enum(["stripe", "pix", "crypto"]),
  purchaseId: z.string().min(1),
  amountCents: z.number().int().positive(),
  description: z.string().min(1).max(240),
});

@ApiTags("payments")
@Controller()
class PaymentsController {
  @Post("payments/checkout")
  @ApiOperation({ summary: "Create a test checkout through the provider abstraction" })
  async createCheckout(@Body() body: unknown) {
    const input = checkoutSchema.parse(body);
    return paymentProvider(input.provider).createCheckout({
      purchaseId: input.purchaseId,
      amountCents: input.amountCents,
      currency: "brl",
      description: input.description,
    });
  }

  @Post("purchases/:contentId/checkout")
  @HttpCode(202)
  @ApiOperation({ summary: "Accept a demo content purchase simulation" })
  checkout(@Param("contentId") contentId: string, @Body() body: unknown) {
    return {
      accepted: true,
      simulation: true,
      contentId,
      input: demoPurchaseSchema.parse(body),
    };
  }

  @Post("payments/webhooks/:provider")
  @HttpCode(200)
  async webhook(
    @Param("provider") provider: string,
    @Headers("stripe-signature") signature: string | undefined,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (provider !== "stripe") return { accepted: false, reason: "provider_stubbed" };
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!secret || !signature || !request.rawBody || !key?.startsWith("sk_test_")) {
      return { accepted: false, reason: "stripe_test_webhook_not_configured" };
    }
    const stripe = new Stripe(key);
    const event = stripe.webhooks.constructEvent(request.rawBody, signature, secret);
    const existing = await database.paymentEvent.findUnique({
      where: { provider_providerId: { provider: "stripe", providerId: event.id } },
    });
    if (existing) return { accepted: true, duplicate: true };

    if (event.type !== "payment_intent.succeeded") {
      await database.paymentEvent.create({
        data: { provider: "stripe", providerId: event.id, eventType: event.type, payload: event as object, processedAt: new Date() },
      });
      return { accepted: true, processed: false };
    }

    const intent = event.data.object;
    const purchaseId = intent.metadata.purchaseId;
    if (!purchaseId) return { accepted: false, reason: "missing_purchase_id" };
    await this.confirmPurchase(purchaseId, event);
    return { accepted: true, processed: true };
  }

  private async confirmPurchase(purchaseId: string, event: Stripe.Event) {
    await database.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUniqueOrThrow({
        where: { id: purchaseId },
        include: { creator: true },
      });
      const attribution = await tx.attribution.findFirst({
        where: {
          fanId: purchase.buyerId,
          expiresAt: { gt: new Date() },
          blockedReason: null,
          click: { link: { creatorId: purchase.creatorId } },
        },
        include: { click: { include: { link: { include: { affiliate: true } } } } },
      });
      const kind =
        purchase.kind === "SUBSCRIPTION"
          ? "subscription"
          : purchase.kind === "PACK"
            ? "pack"
            : purchase.kind === "SPECIAL_REQUEST"
              ? "special_request"
              : "ppv";
      const commissionCents = attribution
        ? calculateCommission(purchase.amountCents, kind, {
            rateBps: purchase.creator.commissionBps,
            subscription: true,
            ppv: purchase.creator.commissionOnPpv,
            pack: purchase.creator.commissionOnPacks,
            specialRequest: purchase.creator.commissionOnRequests,
          })
        : 0;
      const entries = createDoubleEntryLedger(purchase.amountCents, commissionCents);

      await tx.paymentEvent.create({
        data: {
          provider: "stripe",
          providerId: event.id,
          purchaseId,
          eventType: event.type,
          payload: event as object,
          processedAt: new Date(),
        },
      });
      await tx.purchase.update({ where: { id: purchaseId }, data: { status: "PAID" } });
      await tx.ledgerEntry.createMany({
        data: entries.map((entry) => ({
          purchaseId,
          creatorId: entry.account === "creator_payable" ? purchase.creatorId : null,
          userId:
            entry.account === "affiliate_payable" && attribution
              ? attribution.click.link.affiliate.userId
              : null,
          direction: entry.direction,
          account: entry.account,
          amountCents: entry.amountCents,
          currency: purchase.currency,
          reference: event.id,
        })),
      });
      if (attribution && commissionCents > 0) {
        const conversion = await tx.conversion.create({
          data: { attributionId: attribution.id, purchaseId, kind, amountCents: purchase.amountCents, currency: purchase.currency },
        });
        await tx.commission.create({
          data: {
            affiliateId: attribution.click.link.affiliateId,
            conversionId: conversion.id,
            rateBps: purchase.creator.commissionBps,
            amountCents: commissionCents,
            currency: purchase.currency,
            holdUntil: new Date(Date.now() + 10 * 86_400_000),
            renewalUntil: new Date(Date.now() + 365 * 86_400_000),
          },
        });
      }
    });
  }
}

@Module({ controllers: [PaymentsController] })
export class PaymentsModule {}
