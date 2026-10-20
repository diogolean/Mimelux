# Patrocino design tokens

V0.3 replaces the original warm orange/beige prototype palette with an
original violet-and-mint system. The direction combines a restrained light
surface hierarchy with a deep, high-contrast dark canvas; it does not reuse
Fanvue, OnlyFans, or Privacy brand colors.

The canonical cross-platform values live in
`packages/ui/src/tokens.json`. The TypeScript export in
`packages/ui/src/tokens.ts` is consumable by React Native, while
`apps/web/app/globals.css` maps the same values to Tailwind v4 semantic tokens.

## Light theme

| Token | Value | Intended use |
|---|---:|---|
| `background` | `#F7F7FB` | App canvas |
| `surface` | `#ECECF5` | Secondary sections |
| `elevated` | `#FFFFFF` | Cards and overlays |
| `primary` | `#A996FF` | Filled actions and highlights |
| `primaryStrong` | `#5437D1` | Links and text accents |
| `accent` | `#62D4C8` | Supporting highlight |
| `accentStrong` | `#08766F` | Accent text |
| `text` | `#181725` | Main copy |
| `muted` | `#625F73` | Secondary copy |

## Dark theme

| Token | Value | Intended use |
|---|---:|---|
| `background` | `#0C0D14` | App canvas |
| `surface` | `#171925` | Secondary sections |
| `elevated` | `#202331` | Cards and overlays |
| `primary` | `#A996FF` | Filled actions and highlights |
| `primaryStrong` | `#C0B5FF` | Links and text accents |
| `accent` | `#62D4C8` | Supporting highlight |
| `accentStrong` | `#7EE6DC` | Accent text |
| `text` | `#F6F4FF` | Main copy |
| `muted` | `#AAA7B8` | Secondary copy |

## WCAG contrast checks

Ratios were calculated from relative luminance during the V0.3 verification.
All listed text combinations exceed WCAG AA for normal text (4.5:1).

| Pair | Ratio |
|---|---:|
| Light text / background | 16.54:1 |
| Light muted / background | 5.77:1 |
| Light primary strong / background | 6.91:1 |
| Light accent strong / background | 5.13:1 |
| Dark text / background | 17.82:1 |
| Dark muted / background | 8.24:1 |
| Dark primary strong / background | 10.43:1 |
| Dark accent strong / background | 13.14:1 |
| Button ink / primary | 7.15:1 |

Themes use `next-themes`: the first visit follows `prefers-color-scheme`, a
manual toggle persists the user's choice, and the same CSS variables apply to
public, authentication, and signed-in routes.
