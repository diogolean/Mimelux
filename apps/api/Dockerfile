FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @mimelux/core build \
  && pnpm --filter @mimelux/db build \
  && pnpm --filter @mimelux/api exec tsc -p tsconfig.json

ENV PORT=3334
ENV MEDIA_ROOT=/opt/patrocino/media
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
