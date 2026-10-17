# FanMimo V0.2 status

Last updated: 2026-10-16.

## Delivered

- Fan, creator, and affiliate role selection, with separate creator and affiliate areas.
- Demo affiliate `afiliado@mimelux.com.br` / `mimelux123`, public code `nara`.
- Promotion landing `/r/{code}/{slug}` with locale and channel sub-ID.
- Server click endpoint, 30-day httpOnly attribution cookie, signup binding, and commission after simulated payment confirmation.
- Affiliate dashboard with clicks, signups, sales, conversion, EPC, commission states, per-creator/sub-ID breakdown, copy link, link QR, promo kit, and mocked Pix/Stripe/crypto payout settings.
- Creator control for affiliate approval and commission percentage.
- next-intl message catalogs for `pt-BR`, `en`, `de`, and `fr`.
- Browser-language detection plus a manual language switcher.
- Login monetize section, featured creators, unconfirmed weekly payout forecast, and legal placeholder links.
- `PaymentGateway` abstraction. The mock records Pix, Stripe, and crypto actions without charges.

## Commands actually run

| Command | Result |
|---|---|
| `pnpm lint` | Passed, with `DATABASE_URL` present for Prisma validation |
| `pnpm typecheck` | Passed |
| `pnpm build` | Passed. Web routes are dynamic because locale detection reads the request |
| `pnpm test:e2e` | Passed: 11/11 |

The new Playwright coverage passed for role selection, affiliate click → signup → simulated subscription → commission, manual and browser locale selection, and the monetize section at 360, 390, 768, 1024, and 1440 px. The existing V0.1 flows also passed in the same run.

## Still simulated

- Authentication, social login, email verification, and age confirmation.
- Click storage is acknowledged by the server and mirrored in browser demo state; it is not written to PostgreSQL.
- Subscription, commission, payout, creator revenue, and upload actions.
- Affiliate totals include fictitious seed history.
- Weekly payouts are configurable and explicitly unconfirmed.

Geo-IP locale detection, real PSP webhooks, HttpOnly cookie binding inside real registration, and ledger posting remain future work. See `docs/AFFILIATES.md`.
