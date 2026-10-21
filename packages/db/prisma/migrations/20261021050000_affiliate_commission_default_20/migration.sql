ALTER TABLE "platform_settings" ALTER COLUMN "affiliateCommissionBps" SET DEFAULT 2000;

UPDATE "platform_settings"
SET "affiliateCommissionBps" = 2000, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'default' AND "affiliateCommissionBps" = 1000;
