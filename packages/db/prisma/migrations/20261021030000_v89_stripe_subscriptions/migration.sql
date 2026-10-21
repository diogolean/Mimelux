-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PAST_DUE';

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('HOUSE', 'INDEPENDENT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "creators" ADD COLUMN "ownership" "OwnershipType" NOT NULL DEFAULT 'HOUSE';
ALTER TABLE "creators" ADD COLUMN "creatorShareBps" INTEGER;
ALTER TABLE "creators" ADD COLUMN "affiliateCommissionBps" INTEGER;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN "stripeProductId" TEXT;
ALTER TABLE "plans" ADD COLUMN "stripePriceId" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);
ALTER TABLE "subscriptions" ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN "stripeSubscriptionId" TEXT;

UPDATE "subscriptions" SET "currentPeriodEnd" = "endsAt" WHERE "currentPeriodEnd" IS NULL AND "endsAt" IS NOT NULL;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN "subscriptionId" TEXT;
ALTER TABLE "purchases" ADD COLUMN "providerRef" TEXT;

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "creatorShareBps" INTEGER NOT NULL DEFAULT 8000,
    "affiliateCommissionBps" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "platform_settings" ("id", "creatorShareBps", "affiliateCommissionBps", "updatedAt")
VALUES ('default', 8000, 1000, CURRENT_TIMESTAMP);

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "purchases_subscriptionId_idx" ON "purchases"("subscriptionId");

-- CreateIndex
CREATE INDEX "purchases_providerRef_idx" ON "purchases"("providerRef");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
