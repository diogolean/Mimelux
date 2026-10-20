ALTER TABLE "users" ADD COLUMN "emailVerificationTokenHash" TEXT;
ALTER TABLE "users" ADD COLUMN "emailVerificationExpiresAt" TIMESTAMP(3);
