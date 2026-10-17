# Mimelux V0.3 status

## Delivered

- Original violet/mint light and dark themes with shared web/React Native-ready
  tokens, persisted system-aware switching, and documented WCAG AA contrast.
- Reliable public login feature section with autoplay/swipe creator carousel.
- Larger creator cards and profile avatar/cover composition.
- Persisted desktop navigation rail collapse with scroll/navigation behavior.
- Role-aware fan, creator, and affiliate homes and route guards.
- Creator-controlled monthly pricing, 1/3/6/12-month bundles, discounts, demo
  promotion, PPV posts, content pack, and affiliate commission scope.
- Special request demo lifecycle: request, quote, simulated payment, delivery,
  decline, and status thread.
- Affiliate commission creation for attributed subscriptions, PPV, packs, and
  special requests, controlled by creator flags.
- PostgreSQL 16 Prisma migration and idempotent demo seed for 16 fictional,
  AI-generated creators, plans, public posts, fan, and affiliate accounts.
- NestJS `/v1` endpoints backed by PostgreSQL for creators and password/JWT test
  authentication. Access and refresh token formats are ready for native clients.
- API-first web adapter with transparent `MockGateway` fallback.
- Stripe test-only gateway and signed webhook processing. Live secret keys are
  rejected. Confirmed events are idempotent and create balanced ledger entries;
  Pix and crypto remain explicit stubs.
- Environment plus persisted admin demo/real switch. Real mode hides all local
  fixtures behind a designed empty state; API queries filter `isDemo`.

## Verification run

Run on October 17, 2026:

| Check | Result |
|---|---|
| `pnpm lint` | Passed (all workspaces) |
| `pnpm typecheck` | Passed (all workspaces) |
| `pnpm build` | Passed (Next.js and NestJS) |
| `pnpm test:unit` | 8 passed |
| `pnpm test:e2e` | 21 passed |
| Prisma schema validation | Passed |
| PostgreSQL migration + seed | Passed locally |
| API health | `200`, service `mimelux-api` |
| API creators | 16 records, source `postgres` |
| API demo login | `FAN`, Bearer access token returned |

Playwright covers role routing, theme persistence, the login feature section,
sidebar collapse, responsive overflow at 360/390/768/1024/1440, promotion
pricing, separate subscription and PPV unlocks, special requests, attributed
PPV commission, demo/real isolation, locale switching, chat persistence, media
loading, refresh on inner pages, and 404 handling.

## Deliberately simulated

- The Next.js UI continues to use local demo auth and local state so it remains
  runnable without Docker or the API.
- Stripe requires developer-owned test credentials and was not called during
  QA. The webhook path and idempotent database transaction compile and are
  documented, but no external Stripe event was sent.
- Pix, crypto, payouts, uploads, media delivery, and QR graphics do not move
  money or files.
- Dashboard metrics and all creator identities/content are fictional.

## Production gaps

- Replace local web auth with API/OIDC PKCE sessions, rotation/revocation,
  passkeys, MFA, rate limits, and recovery.
- Add Stripe integration tests using the Stripe CLI and test clocks before
  enabling any provider.
- Complete double-entry accounts for fees, tax, refunds, disputes, reserves,
  and payout reconciliation with financial review.
- Add private object storage, signed CDN delivery, HLS, moderation, KYC, legal
  policy, observability, backup/restore, CI/CD, k6, and broader accessibility QA.
- Decide and legally validate the `general`, `adult`, or `hybrid` content mode.
