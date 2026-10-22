ALTER TABLE "posts" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "posts" ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "media" ADD COLUMN "posterKey" TEXT;
ALTER TABLE "media" ADD COLUMN "previewKey" TEXT;
ALTER TABLE "media" ADD COLUMN "byteSize" INTEGER;
ALTER TABLE "media" ADD COLUMN "private" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "media_uploads" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "chunkSize" INTEGER NOT NULL,
    "totalChunks" INTEGER NOT NULL,
    "tempDir" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_uploads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "media_uploads_creatorId_status_idx" ON "media_uploads"("creatorId", "status");
