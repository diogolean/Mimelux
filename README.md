# Mimelux V0.1

Premium, mobile-first creator subscription prototype for Brazil. It is a working mock-first demo: the web runs without PostgreSQL, NestJS, payment credentials, or external services. All people and metrics are fictitious; creator images are AI-generated and SFW.

## Stack

- pnpm 10 + Turborepo 2
- Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui and Lucide
- NestJS 11 REST shell under `/v1`, with Swagger
- Prisma 6 schema for PostgreSQL 16
- Shared contracts in `packages/core`, UI/tokens in `packages/ui`, config in `packages/config`

Exact versions are in [`docs/STACK.md`](docs/STACK.md).

## Quick start — web only

Requirements: Node.js 22 LTS and pnpm 10 (`corepack enable`).

macOS/Linux, Windows PowerShell, and Windows Terminal use the same commands:

```bash
pnpm install
pnpm dev:web
```

Open [http://localhost:3333](http://localhost:3333). `MockGateway` keeps the demo working if the API/database are unavailable.

## Full local workspace

Install Docker Desktop on Windows/macOS or Docker Engine with Compose on Linux.

```bash
copy .env.example .env
docker compose up -d db
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

On macOS/Linux, replace `copy` with `cp`.

- Web: [http://localhost:3333](http://localhost:3333)
- API: [http://localhost:3334/v1/health](http://localhost:3334/v1/health)
- Swagger: [http://localhost:3334/v1/docs](http://localhost:3334/v1/docs)

PostgreSQL is optional for V0.1. No real payment, authentication, upload, or payout occurs.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Fan | `fan@mimelux.com.br` | `mimelux123` |
| Creator | `criadora@mimelux.com.br` | `mimelux123` |

Registration uses mock verification code `224488`, then four onboarding steps. Completion, likes, saves, comments, messages, subscriptions, and unlocks persist only in `localStorage`.

## Main flows

1. `/` → login/registration.
2. Registration → mock verification → onboarding → coach marks → Em Alta.
3. Ranking/search → creator profile → plan → simulated checkout.
4. A creator's designated public post stays visible; all additional profile posts unlock after simulated subscription.
5. Feed interactions, chat, locked chat media, dashboard upload, and payout actions are local simulations.

## Commands

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm dev:web
pnpm --filter @mimelux/api dev
pnpm db:generate
pnpm generate:creator-images # optional, never needed for normal development
```

The image script reads `GEMINI_API_KEY` only when explicitly invoked. Supplied V2 media is committed under `apps/web/public/media/generated/`; normal setup never calls an image API.

## Architecture

```text
apps/web        Next.js UI and mock adapter
apps/api        NestJS versioned REST/OpenAPI shell
packages/ui     Shared components and design tokens
packages/core   Framework-neutral contracts and schemas
packages/db     PostgreSQL Prisma schema and seed
packages/config Shared TypeScript/ESLint/Tailwind config
```

V0.1 keeps presentation separate from `MockGateway`/`ApiGateway`. The target stack adds Redis + BullMQ, Auth.js with MFA/passkeys, Backblaze B2 private storage behind signed CDN URLs, HLS, WebSocket chat, and a formally approved Pix/card/recurring/split PSP on Oracle Cloud.

Content policy is configurable through `CONTENT_MODE=general|adult|hybrid`. Legal, age-verification, moderation, KYC, and PSP decisions must be resolved before production.

See:

- [`docs/AUDITORIA_V01.md`](docs/AUDITORIA_V01.md)
- [`docs/RELATORIO-TECNICO.md`](docs/RELATORIO-TECNICO.md)
- [`docs/STATUS_V01.md`](docs/STATUS_V01.md)
- [`docs/PROXIMOS_PASSOS.md`](docs/PROXIMOS_PASSOS.md)
- Original research report: [`uploads/relatorio-privacy-arquitetura_b5c7.md`](uploads/relatorio-privacy-arquitetura_b5c7.md)

## Tests and limitations

The repository checks lint, TypeScript, Prisma validation, NestJS compilation, and Next.js production build. Playwright critical-flow tests and k6 load tests remain planned; this demo is not production-ready.

## Safety

- No secrets are committed; copy `.env.example` to `.env`.
- No real charge, Pix code, receipt, private upload, or payout is generated.
- AI creator identities are marked `fictitious` and `aiGenerated`.
- Media is original generated demo material, not third-party creator content.
