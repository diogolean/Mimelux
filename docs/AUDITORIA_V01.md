# FanMimo V0.1 — implementation audit

Audit date: 2026-10-16. This document describes the repository as inspected; it does not treat planned architecture as implemented.

## Executive status

The repository has a coherent pnpm/Turborepo foundation and a substantial mock-first Next.js UI in progress. The current web package does **not** pass TypeScript checking yet, the required PostCSS integration is missing, the NestJS application and Prisma package are not implemented, and no browser or production build verification has run for the new screens. These are blocking issues for V0.1 completion.

## Inspected configuration

- Root `package.json`: pnpm `10.33.4`, Turborepo `2.11.8`, TypeScript `5.9.3`; workspace scripts exist.
- `pnpm-workspace.yaml`: includes `apps/*` and `packages/*`.
- `turbo.json`: `dev`, `build`, `lint`, and `typecheck` tasks are defined.
- `apps/web/package.json`: Next.js `16.4.2`, React `19.3.0`, Tailwind CSS `4.3.3`, Lucide `1.58.0`, Next Themes, Sonner, Base UI, and shared workspace packages are installed.
- `pnpm-lock.yaml`: resolves the declared workspace and web dependencies.
- `apps/web/app/layout.tsx`: pt-BR document language, Poppins, metadata, theme and toast provider.
- `apps/web/app/globals.css`: Tailwind v4 syntax with `@import "tailwindcss"` and `@source "../../../packages/ui/src"`.
- `postcss.config.*`: **missing**.
- `apps/api`: **missing**.
- `packages/db`: folder exists but has no package or schema.
- `packages/config`: shared TypeScript/ESLint/Tailwind files exist.
- `packages/core`: Zod contracts, content mode, demo account values, and token-pair type exist.
- `packages/ui`: brand tokens plus `Logo`, `Button`, and `Pill` exist.

## Actually installed dependency issues

1. `@tailwindcss/postcss` and `postcss` are not declared or installed in `apps/web`.
2. The web currently uses `@tailwindcss/turbopack`; the master brief requires standard Tailwind v4 PostCSS processing.
3. The shared UI package export was corrected locally from `index.ts` to `index.tsx`, but that correction is not committed at audit time.
4. NestJS, Swagger, Prisma, PostgreSQL client dependencies, and Playwright are not installed in their intended workspaces.
5. Generated shadcn/Base UI components remain in `apps/web/components/ui`; only a small subset is currently reused.

## Working or substantially implemented screens

The following routes have source implementations. “Implemented” here means code exists, not that it has passed runtime QA.

| Route | Current implementation |
|---|---|
| `/` | Server redirect to `/auth?route=sign-in`. |
| `/auth?route=sign-in` | Responsive two-column login, demo credentials, password visibility, social demo spinner, cookie notice. |
| `/auth?route=sign-up` | Registration variant, role selection, routes to verification. |
| `/verificacao` | Mock code `224488`, configurable age confirmation, routes to onboarding. |
| `/onboarding` | Four full-screen steps with back/next/skip and local demo completion. |
| `/topcreators` | Ranking, Top Creators/Destaques tabs, two coach marks, discovery sections. |
| `/feed` | Story row and free/subscriber/PPV post cards with local lock state. |
| `/busca` | Local text search, category tabs, result and empty states. |
| `/creator/[username]` | Cover/profile header, stats, plan CTA, post/media-like grid and locked content. |
| `/checkout` | Explicitly simulated subscription/content/message checkout with fake visual code and local unlock persistence. |
| `/chat` | Conversation list with unread and online indicators. |
| `/chat/[id]` | Demo conversation, PPV message, local send action. |

## Missing or incomplete screens and states

- `/painel`: creator dashboard is not implemented.
- Dedicated 404 design is not implemented.
- Feed comments do not yet open or persist.
- Feed likes and saves work only in component memory, not the centralized demo adapter.
- Creator profile lacks the complete required plan cards, promotion treatment, and `Todos/Fotos/Vídeos/Pagos` filters.
- Search does not yet have a loading skeleton or gateway error state.
- Chat search is visual only; it does not filter.
- Dashboard upload is not implemented.
- Several buttons remain informational or inert.
- Skeleton, empty, and error states are not consistently available through shared components.

## Reusable components found

### Shared package (`packages/ui`)

- `Logo`
- `Button`
- `Pill`
- color/radius/motion tokens in TypeScript and JSON

### Web-local components

- `AppShell` with desktop sidebar, mobile bottom navigation, theme toggle, and logout.
- `PostCard` with lock-state rendering, like/save state, and checkout links.
- `CreatorProfile` with profile metadata, stats, CTA, and media grid.
- `Providers` for theme and toasts.
- Generated shadcn/Base UI primitives in `apps/web/components/ui`.

The master brief requires extracting and typing more shared components: `BottomNavigation`, `DesktopNavigation`, `PageHeader`, `PrimaryButton`, `CreatorCard`, `CreatorAvatar`, `CreatorProfileHeader`, `SubscriptionPlanCard`, `LockedMediaPlaceholder`, `MediaGrid`, `ChatPreview`, `SearchInput`, `CategoryTabs`, `SkeletonCard`, `EmptyState`, `ErrorState`, `OnboardingStep`, and `PremiumModal`.

## Current compile errors

Command run:

```text
pnpm --filter @mimelux/web typecheck
```

Result: failed with TypeScript errors.

- `creator` may be `undefined` in `chat/[id]/page.tsx`.
- `creator` may be `undefined` in `checkout/page.tsx`.
- `current` onboarding step may be `undefined` in `onboarding/page.tsx`.

No lint, full monorepo typecheck, production build, browser navigation, Playwright, keyboard, refresh, 404, or visual-width tests have passed as of this audit.

## Tailwind v4 audit

### Correct

- CSS uses `@import "tailwindcss"`.
- Shared source detection uses `@source "../../../packages/ui/src"`.
- No Tailwind v3 `tailwind.config.js` is present.
- Custom theme values map CSS variables to semantic Tailwind colors.
- Dark-mode custom variant is present.
- Responsive prefixes and interactive states are widely used.

### Must fix now

1. Add `postcss` and `@tailwindcss/postcss` to the web package.
2. Add `apps/web/postcss.config.mjs` using `@tailwindcss/postcss`.
3. Remove the custom Turbopack CSS loader once PostCSS is in place.
4. Replace page-level raw brand hex values with semantic classes generated from shared tokens.
5. Consolidate duplicated focus, input, card, and icon-button styles into shared UI components.
6. Validate uncertain utility values (`h-13`, `h-18`, `size-13`, `border-black/8`) through an actual build; replace with explicit arbitrary values or documented tokens if generation fails.
7. Add visible `focus-visible` treatment globally and to custom buttons/links.
8. Verify that generated shadcn styles do not depend on removed shadcn variables; currently global CSS no longer defines the full generated variable set.
9. Check specificity between shared component literal colors, dark variants, and semantic CSS variables.

## Fixtures and gateway audit

- Fixtures are centralized in `apps/web/lib/mock-data.ts`.
- Current fixture volume is 8 creators, 6 posts, and 4 conversations: below the required 12–20 creators and 30–50 posts.
- Images are local SFW Unsplash downloads, but provenance/license documentation is missing.
- Demo persistence is centralized in `apps/web/lib/demo-store.ts`.
- There is no `MockGateway`/`ApiGateway` interface yet; pages import fixture arrays directly.
- Subscription and unlock persistence uses localStorage and stores no sensitive data.
- Mock state should be expanded to likes, saves, comments, sent messages, notifications, dashboard metrics, and uploads.

## Architecture decisions to fix in V0.1

1. Introduce typed gateway contracts in `packages/core` and implement `MockGateway` in the web package.
2. Keep all fixture access behind that gateway and avoid new direct imports from page components.
3. Expand `packages/ui` tokens and components; remove raw brand colors from pages.
4. Implement the compiling NestJS `/v1` shell without making the web dependent on it.
5. Implement the required 14-table PostgreSQL Prisma schema and Docker Compose without deepening financial logic.
6. Keep authentication demo-only in the web; define future access/refresh token contracts once in core and avoid duplicate auth logic.
7. Keep checkout unambiguously simulated. The current QR-like graphic must be changed to a less payment-realistic demo visual per the master brief.
8. Add a content mode flag without presenting adult content in fixtures.

## Demo-only flows

- Credential and social login.
- Email verification and age confirmation.
- Onboarding and coach-mark completion.
- Subscriptions, content purchases, Pix-like checkout, and unlocks.
- Conversation send action and PPV chat unlock.
- Likes and saves.
- All creator, post, metrics, ranking, pricing, and online-state data.

No current flow performs real authentication, charges, uploads, ledger writes, notifications, or network messaging.

## Items explicitly deferred to V0.2

- Real Auth.js/Nest authentication, OIDC/PKCE, MFA, passkeys, device sessions.
- Real PSP, Pix/card/recurring/split, idempotent webhooks, and production ledger.
- Private object storage, signed CDN URLs, HLS transcoding, and watermarking.
- WebSocket chat and push notifications.
- Production creator analytics and payout processing.
- KYC/age-verification provider integration.
- Moderation automation and administration console.
- Oracle Cloud deployment, CI/CD, observability, load hardening, and disaster recovery.

## Immediate staged plan

1. Fix Tailwind/PostCSS and compile errors; make the web boot.
2. Expand tokens and shared components; migrate raw brand styles.
3. Complete required screens and centralized `MockGateway` interactions.
4. Add NestJS `/v1` shell, Prisma schema, and Docker Compose.
5. Run lint, typecheck, build, dev/browser QA, Playwright flows, responsive visual checks, keyboard/refresh/404 tests.
6. Record exact outcomes in `STATUS_V01.md`; do not convert an unrun check into a pass.
