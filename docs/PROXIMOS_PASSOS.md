# Mimelux — next steps

## V0.1 completion

1. Finish browser assertions and save mobile/desktop artifacts.
2. Add Playwright critical-flow tests for entry, search, profile subscription, chat send, dashboard upload, persistence, refresh, and 404.
3. Add visual checks at 360, 390, 768, 1024, and 1440 widths.
4. Complete keyboard navigation and screen-reader labels audit.
5. Replace remaining raw `<img>` use with a shared optimized media component where it does not interfere with generated local assets.
6. Translate older pre-brief technical documents to English for consistency.

## V0.2 product

1. Confirm `general`, `adult`, or `hybrid` positioning.
2. Validate the entry flow and coach marks against the evolving product decision.
3. Define ranking signals and anti-manipulation rules.
4. Add creator notification and profile-editing experiences.
5. Define moderation, reporting, co-creator release, and appeal workflows.

## V0.2 platform

1. Implement NestJS repositories against PostgreSQL.
2. Add Redis + BullMQ for media and event processing.
3. Implement access/rotating-refresh token sessions and device revocation.
4. Add OIDC Authorization Code + PKCE, creator MFA, and passkeys.
5. Add private Backblaze B2 upload and Cloudflare signed delivery.
6. Add ffmpeg HLS packaging, thumbnails, and watermark strategy.
7. Add WebSocket chat with reconnect, delivery, and unread semantics.

## Payments and compliance

1. Obtain written PSP approval for the final content model.
2. Design idempotent webhooks and transactional double-entry ledger.
3. Define Pix/card/recurring/split/refund/chargeback behavior.
4. Select KYC and age-assurance vendors.
5. Complete LGPD data map, retention, deletion/export, DPIA, and incident plan.
6. Obtain legal review for content, ECA Digital, consumer, tax, and card-network obligations.

## Quality and delivery

1. Add Vitest unit/contract suites.
2. Add Playwright E2E and screenshot baselines.
3. Add k6 API/load scenarios.
4. Configure CI for install, lint, typecheck, build, Prisma validation, and tests.
5. Add OpenTelemetry, structured logs, request IDs, error tracking, and product analytics.
6. Define Oracle Cloud environments, deployment, secrets, backups, rollback, and disaster recovery.

## Explicit non-goals until approved

- No real payments.
- No production ledger.
- No public/private user upload service.
- No costly managed media/live infrastructure.
- No microservice split.
- No release of adult/hybrid content without policy, legal, PSP, age-assurance, and moderation approval.
