# FanMimo affiliate program

V0.2 implements the affiliate domain in the PostgreSQL schema and runs the fan-facing flow on the mock web adapter. No commission, click, or payout is financially real.

## Actors

- A fan subscribes to a creator.
- A creator can approve affiliates and set a commission rate in basis points.
- An affiliate can promote many creators. Each creator has a distinct link.
- The demo affiliate is Nara Costa (`afiliado@mimelux.com.br`, code `nara`).

## Link and sub-IDs

```text
/r/{affiliateCode}/{creatorSlug}?lang={locale}&sub={channel}
```

Example: `/r/nara/lunaferraz?lang=de&sub=tiktok`

`lang` selects the stored message catalog. `sub` is a channel identifier supplied by the affiliate. It is stored with the click, attribution, and commission so reporting can group by creator and channel.

## Production tracking design

The mock follows the same sequence the API should keep:

1. The landing route calls `POST /api/affiliate/clicks`.
2. The server validates the code, creator, sub-ID, locale, and user agent.
3. The server writes a `clicks` row. Missing or bot-like user agents and sub-IDs containing `bot`, `spider`, `crawler`, or `spam` are stored with `suspicious = true`.
4. The response sets the first-party `mimelux_attr` cookie for 30 days, `HttpOnly`, `SameSite=Lax`, and scoped to `/`.
5. Account registration reads that attribution on the server and writes an `attributions` row bound to the new fan. The browser demo mirrors this in local state because registration is still mocked.
6. A payment webhook, not the browser, creates the `conversions` and `commissions` rows. The mock checkout calls `PaymentGateway.recordConfirmedPayment` and then applies the same rule locally.
7. Commission status moves `pending -> approved -> paid`. Pending lasts 7–14 days; the demo uses 10 days so refunds and chargebacks can cancel it.
8. The first confirmed sale and later renewals both qualify. Renewals qualify for 12 months after the original click.
9. A payout batches approved commissions above the R$ 50.00 minimum through Pix, Stripe, or crypto. The payout schedule defaults to weekly and is configurable. That weekly claim is not confirmed by the product owner.

## Fraud controls in this version

- Self-referral: the affiliate email cannot receive attribution or commission.
- Suspicious clicks are flagged and do not become a payable attribution.
- Duplicate live commissions for the same creator, sub-ID, and sale kind are ignored.
- Attribution expires 30 days after the click.
- Creator participation can be turned off, which stops new commissions.

Production should add hashed IP velocity checks, device fingerprinting only where legally allowed, payment-webhook idempotency, and manual review for flagged clusters. The cookie must be written by the API, not by page JavaScript.

## Schema

Mapped tables added for this program:

- `affiliates`
- `affiliate_links`
- `clicks`
- `attributions`
- `conversions`
- `commissions`
- `payouts`

`creators.acceptsAffiliates` and `creators.commissionBps` store the creator's approval and rate. `users.role` includes `AFFILIATE`.

## Mock boundaries

Dashboard totals, historical clicks, and seeded commissions are fictitious. The QR code encodes the promotion URL; it is not a payment code. Copy actions and withdrawal requests stay in the browser.
