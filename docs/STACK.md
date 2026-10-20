# Stack do Patrocino

Versões fixadas para o MVP:

- **Runtime e workspace:** Node.js `22.14.0`, pnpm `10.33.4`, Turborepo `2.11.8`.
- **Web (`apps/web`):** Next.js `16.4.2` (App Router), React/React DOM `19.3.0`, TypeScript `5.9.3`, Tailwind CSS `4.3.3`, shadcn/ui `4.22.0`, Lucide React `1.58.0` e Auth.js/NextAuth `5.0.0-beta.32`.
- **API (`apps/api`):** NestJS `11.2.7`, Swagger/OpenAPI `11.4.7` e Zod `4.6.7`; REST versionada em `/v1`.
- **Dados (`packages/db`):** Prisma/Prisma Client `6.19.3` e PostgreSQL `16` via Docker Compose. O web usa dados mock locais quando API ou banco estiverem indisponíveis.
- **UI compartilhada (`packages/ui`):** componentes React e tokens em TypeScript/JSON nas cores `#FAF8F5`, `#F0E8DE`, `#E9A15E`, `#E9B0A7` e `#202027`.
- **Config (`packages/config`):** presets compartilhados de TypeScript, ESLint e Tailwind.

## Rodar

Requer Node.js 22 LTS e pnpm 10:

```bash
pnpm install
pnpm dev
```

O web abre em `http://localhost:3333` imediatamente com mocks. PostgreSQL e API são opcionais para esse primeiro fluxo visual.
