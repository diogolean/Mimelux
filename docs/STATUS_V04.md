# Mimelux V4

Gender-neutral creator wording across pt-BR, en, de, and fr. The demo creator login remains `criadora@mimelux.com.br`, with `creator@mimelux.com.br` as an alias.

The logged-out page adds an original creator-attraction block under the login: a large headline, an illustrated payout stat, short quality-content points, and a full-bleed editorial with a call to action. It uses the existing light and dark palette and generated placeholders.

Affiliates get a separate skippable tutorial and then a mosaic where they enable creators. Per-creator links with sub-IDs are generated only for that selection and stay in the demo store.

Fans land on Em alta. The feed remains in navigation.

Em alta and creator profiles use a one-to-two step type increase. Posts show like counts. Each creator has a total like count, subscriber reviews, and post comments. Demo data is seeded in Postgres (`isDemo: true`) and mirrored in fixtures for offline demo mode. Real mode hides demo rows.
