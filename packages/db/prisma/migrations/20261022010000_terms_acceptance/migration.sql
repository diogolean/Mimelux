ALTER TABLE "users" ADD COLUMN "acceptedTermsAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "termsVersion" TEXT;
ALTER TABLE "users" ADD COLUMN "acceptedTermsIp" TEXT;
