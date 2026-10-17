# FanMimo V0.1 — technical report

## Purpose

FanMimo V0.1 is a premium, mobile-first creator subscription product demo for Brazil. It proves navigation, discovery, creator profiles, free versus subscriber content, simulated checkout, persistent demo unlocks, chat, and a creator dashboard without depending on production infrastructure.

The implementation is deliberately mock-first. It must not be interpreted as production authentication, payment, storage, moderation, or financial accounting.

## Stack

- pnpm workspaces and Turborepo
- Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/Base UI primitives, Lucide
- NestJS versioned REST shell and OpenAPI/Swagger
- PostgreSQL-ready Prisma schema
- Zod contracts and validation
- localStorage for non-sensitive demo persistence

## Architecture

```text
apps/web       Product UI, MockGateway and future ApiGateway adapter
apps/api       NestJS /v1 modular monolith API shell
packages/ui    Shared design tokens and typed UI components
packages/core  Framework-neutral DTOs, gateway contracts and Zod schemas
packages/db    Prisma schema/client/seed
packages/config Shared TypeScript, ESLint and Tailwind conventions
```

The modular monolith boundaries are `auth`, `creators`, `content`, `subscriptions`, `payments`, and `chat`. Trust/safety is represented by report and audit tables. Presentation does not contain production payment or authorization rules.

## Data model

The PostgreSQL Prisma schema contains exactly the requested 14 mapped tables:

1. `users`
2. `creators`
3. `profiles`
4. `subscriptions`
5. `plans`
6. `posts`
7. `media`
8. `purchases`
9. `conversations`
10. `messages`
11. `ledger_entries`
12. `payment_events`
13. `reports`
14. `audit_logs`

Financial tables are structural only. V0.1 does not implement a production ledger, webhook processing, or charges.

## Entry and screen flow

1. `/` redirects to `/auth?route=sign-in`.
2. Existing-account login goes to Em Alta.
3. Registration goes to mock email/age verification.
4. New users complete four full-screen onboarding steps.
5. Two coach marks introduce Top Creators and Destaques.
6. The authenticated shell exposes Feed, Em Alta, Chat, and Busca through mobile bottom navigation and desktop sidebar.

Implemented screens:

- Login and registration
- Mock verification
- Four-step onboarding
- Top Creators and Destaques
- Feed with free and locked posts
- Functional local search and category filters
- Creator profile, plans, media filters, public and locked posts
- Explicitly simulated subscription/content checkout
- Chat list and local conversation send
- Locked chat media
- Creator dashboard with fictitious analytics, local upload selection, and simulated payout

## Creator fixtures and media

- 16 invented creator identities intended for Brazilian and international audiences.
- Every creator has `fictitious: true` and `aiGenerated: true`.
- V2 media includes one avatar and cover per creator plus 12 post images.
- A manifest is stored with the public generated assets.
- The first 12 creators have one designated free post from the manifest.
- Other profile posts are subscriber-only and use blurred lock placeholders until the local demo subscription completes.
- No fixture represents a real creator or real platform activity.

## Demo subscription rule

The checkout writes only the selected creator ID to local demo state. On the profile:

- the designated public post remains visible before and after subscription;
- every `subscriber` post is blurred before subscription;
- successful simulation adds the creator ID to `subscriptions`;
- profile and feed authorization read the same centralized state;
- refresh preserves the state through localStorage.

No QR code that could be confused with a valid payment is displayed. The visual is watermarked `SIMULAÇÃO`, and no receipt is generated.

## Native-ready direction

`packages/core` defines API DTOs and a `MimeluxGateway` interface. The future native app can reuse these contracts and `packages/ui` token values.

The planned auth contract is:

- short-lived access token;
- rotating refresh token stored as a server-side hash;
- iOS Keychain/Android Keystore for native refresh tokens;
- OAuth/OIDC Authorization Code with PKCE;
- MFA for creators and future passkeys;
- per-device revocation and refresh-reuse detection.

V0.1 browser login is explicitly a mock and emits no token.

## Content mode

`CONTENT_MODE` and `NEXT_PUBLIC_CONTENT_MODE` support `general`, `adult`, or `hybrid`. The current fixtures are SFW regardless of flag. Product/legal decisions around age assurance, moderation, KYC, and app-store distribution remain open.

## Target production stack

The research-backed target remains:

- NestJS API
- PostgreSQL + Prisma
- Redis + BullMQ
- Auth.js/OIDC, MFA and passkeys
- Backblaze B2 private media with Cloudflare signed delivery
- HLS for video
- WebSocket chat
- formally approved PSP for Pix, card, recurring payments, split, and KYC
- Oracle Cloud hosting

See the original research in `uploads/relatorio-privacy-arquitetura_b5c7.md`.

## Risks

- Adult/hybrid positioning changes legal, age-verification, moderation, payment, and distribution obligations.
- PSP acceptance for the final content model is not confirmed.
- A localStorage demo must never evolve into a production authorization mechanism.
- Generated people require permanent disclosure and media provenance records.
- Real media requires private storage, signed URLs, transcoding, abuse controls, and consent workflows.
- Ledger and webhook logic require idempotent transactional implementation and independent financial review.

## Open decisions

1. General, 18+, or hybrid launch model.
2. Commission, payout timing, chargeback reserve, and minimum payout.
3. PSP and KYC/age-verification vendors.
4. PWA-first versus parallel Expo delivery.
5. Moderation policy, co-creator releases, and incident response.
6. Domain, Oracle account/region, data residency, and recovery objectives.
