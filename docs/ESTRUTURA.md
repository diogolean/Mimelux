# Mimelux — estrutura do MVP

Documento de arquitetura para revisão externa. Estado: protótipo mock-first; decisões de produção estão explicitamente separadas.

## 1. Stack e versões

| Camada | Tecnologia |
|---|---|
| Runtime/workspace | Node.js `22.14.0`, pnpm `10.33.4`, Turborepo `2.11.8` |
| Web | Next.js `16.4.2` (App Router), React `19.3.0`, TypeScript `5.9.3` |
| UI | Tailwind CSS `4.3.3`, shadcn/ui `4.22.0`, Lucide React `1.58.0` |
| API | NestJS `11.2.7`, Swagger/OpenAPI `11.4.7`, Zod `4.6.7` |
| Auth web MVP | Auth.js/NextAuth `5.0.0-beta.32`; credenciais no demo |
| Dados | Prisma `6.19.3`, PostgreSQL `16` via Docker Compose |
| Testes planejados | unitários/integração, Playwright E2E e k6 para carga |

## 2. Monorepo

```text
mimelux/
├─ apps/
│  ├─ web/                         # Next.js, UI e BFF temporário
│  │  ├─ app/
│  │  │  ├─ (app)/                # shell autenticado, sidebar/bottom nav
│  │  │  ├─ api/                  # somente callbacks/BFF necessários
│  │  │  ├─ auth/
│  │  │  ├─ onboarding/
│  │  │  └─ verificacao/
│  │  ├─ components/
│  │  ├─ lib/                     # adapter mock/API e estado de demo
│  │  └─ public/media/            # mídia SFW fictícia do protótipo
│  └─ api/                         # NestJS; REST versionada em /v1
│     ├─ src/modules/
│     │  ├─ auth/
│     │  ├─ creators/
│     │  ├─ content/
│     │  ├─ subscriptions/
│     │  ├─ payments/
│     │  └─ chat/
│     └─ test/
├─ packages/
│  ├─ ui/                          # componentes e tokens compartilháveis
│  │  └─ src/
│  ├─ core/                        # regras puras, contratos, schemas Zod
│  ├─ db/                          # Prisma schema, client, seed
│  │  └─ prisma/
│  └─ config/                      # TypeScript, ESLint e Tailwind
├─ docs/
├─ docker-compose.yml
├─ pnpm-workspace.yaml
└─ turbo.json
```

`apps/web` e `apps/api` não concentram regras de domínio. Casos de uso e contratos ficam em `packages/core`; persistência fica em `packages/db`; páginas apenas orquestram UI. Isso permite reutilizar contratos e tokens em um futuro app Expo/React Native.

## 3. Limites dos módulos

- **auth:** cadastro, login, verificação, sessões/tokens, recuperação e futuro OAuth/OIDC.
- **creators:** perfil público, bio, ranking, categorias, descoberta e verificação.
- **content:** posts, mídia, visibilidade (`FREE`, `SUBSCRIBERS`, `PPV`), upload e moderação.
- **subscriptions:** planos, vínculo fã-criador, vigência e autorização de conteúdo.
- **payments:** checkout Pix/cartão, compra PPV, eventos idempotentes e ledger de dupla entrada. No MVP, tudo é simulado.
- **chat:** conversas, mensagens e PPV no chat; WebSocket entra depois.
- **trust/safety** (transversal): denúncias e auditoria persistidas em `reports` e `audit_logs`.

Dependências permitidas: módulos chamam contratos/casos de uso de `core`; `db` implementa repositórios; `api` compõe adapters. Pagamentos não alteram saldo diretamente sem `ledger_entries`.

## 4. Rotas e telas

### Fluxo de entrada confirmado

1. `/` redireciona para `/auth?route=sign-in`.
2. Login alterna com cadastro em `/auth?route=sign-up`.
3. Somente cadastro novo segue para `/verificacao`: código de e-mail mock e confirmação 18+ quando o `CONTENT_MODE` exigir.
4. `/onboarding`: quatro passos em tela cheia (“Você chegou!”, interesses, sugestões, recursos).
5. `/topcreators?tab=top-creators`: coach marks de duas etapas (“Top Creators” e “Destaques”).
6. Em alta abre no ranking; depois o shell completo fica disponível.

Login existente e social mock passam por spinner “Entrando...” e vão direto para Em alta. O fluxo poderá ser ajustado quando houver nova confirmação do produto de referência.

### Aplicação

- `/feed`: posts livres, para assinantes e PPV bloqueados.
- `/topcreators?tab=top-creators|destaques`: ranking e descoberta.
- `/busca`: busca por nome, usuário e categoria.
- `/creator/[username]`: capa, bio, planos e conteúdo.
- `/checkout`: assinatura/desbloqueio com Pix QR mock e simulação de pagamento.
- `/chat`: lista de conversas.
- `/chat/[id]`: conversa e mensagem PPV simulada.
- `/painel`: resumo mock do criador, upload local e saque Pix simulado.
- Navegação: bottom nav no mobile; sidebar no desktop.

## 5. API REST planejada

Base: `/v1`; JSON; Zod na borda; OpenAPI; erros com código estável e `requestId`.

```text
POST   /v1/auth/register
POST   /v1/auth/login
POST   /v1/auth/refresh
POST   /v1/auth/logout
POST   /v1/auth/verify-email
GET    /v1/auth/me

GET    /v1/creators
GET    /v1/creators/ranking
GET    /v1/creators/:username
PATCH  /v1/creators/me

GET    /v1/feed
POST   /v1/posts
GET    /v1/posts/:id
POST   /v1/media/presign

GET    /v1/creators/:id/plans
POST   /v1/subscriptions/checkout
GET    /v1/subscriptions/me
DELETE /v1/subscriptions/:id

POST   /v1/purchases/:contentId/checkout
POST   /v1/payments/webhooks/:provider
GET    /v1/payments/:id
POST   /v1/withdrawals

GET    /v1/conversations
POST   /v1/conversations
GET    /v1/conversations/:id/messages
POST   /v1/conversations/:id/messages

POST   /v1/reports
GET    /v1/health
```

Endpoints de escrita aceitam `Idempotency-Key` quando houver efeito financeiro. Paginação será cursor-based.

## 6. Prisma/PostgreSQL: 14 tabelas

| Tabela | Responsabilidade e relações-chave |
|---|---|
| `users` | identidade, e-mail, senha, papel; 1–1 com `profiles`, opcional 1–1 com `creators` |
| `creators` | estado e métricas do criador; pertence a `users` |
| `profiles` | nome, usuário, avatar, capa, bio e localização; pertence a `users` |
| `plans` | preço, duração e benefícios; N–1 com `creators` |
| `subscriptions` | fã (`users`) + `creator` + `plan`; única por fã/criador ativa |
| `posts` | autor `creator`, legenda, visibilidade e preço PPV |
| `media` | arquivos de um post ou mensagem; N–1 com `posts`, opcional com `messages` |
| `purchases` | compra de assinatura, post ou mensagem; comprador e beneficiário |
| `conversations` | agregado de chat; participantes serializados no MVP ou relação por mensagens |
| `messages` | conversa, remetente, corpo e preço PPV opcional |
| `ledger_entries` | lançamentos financeiros imutáveis, débito/crédito e referência de compra |
| `payment_events` | evento externo idempotente, provider/event id únicos, payload auditável |
| `reports` | denúncia de usuário/post/mensagem, razão, status e revisor |
| `audit_logs` | trilha imutável de ações sensíveis, ator, entidade, IP/metadados |

Relações de autorização relevantes: o fã acessa `SUBSCRIBERS` por `subscriptions` ativa e `PPV` por `purchases` paga. Um evento de pagamento confirmado cria a compra/assinatura e lançamentos no mesmo caso de uso transacional.

## 7. Autenticação nativa-ready

- Web MVP: credenciais com senha hasheada e sessão Auth.js em cookie `httpOnly`.
- Contrato da API: access token curto + refresh token rotativo, armazenado apenas como hash no servidor.
- Native: access token em memória e refresh token no Keychain/Keystore; nunca em AsyncStorage.
- OAuth/OIDC futuro com Authorization Code + PKCE; redirect/deep link específico por plataforma.
- MFA TOTP obrigatório para criadores e passkeys/WebAuthn planejados.
- Refresh reuse detection, revogação por dispositivo e escopos/roles entram antes de produção.
- O mock não emite token real nem deve ser usado como referência criptográfica.

## 8. Design tokens

```json
{
  "color.background": "#FAF8F5",
  "color.surface": "#F0E8DE",
  "color.primary": "#E9A15E",
  "color.accent": "#E9B0A7",
  "color.text": "#202027"
}
```

Os tokens existem em JSON e TypeScript em `packages/ui`, com equivalentes dark, tipografia, raios, sombras, spacing e motion. O web os expõe como CSS variables; um app React Native poderá importar os valores TypeScript sem depender de CSS.

## 9. Estratégia de mocks

- O web inicia e é totalmente navegável sem API/PostgreSQL.
- Catálogo, feed, chat e perfil usam fixtures SFW e identidades claramente fictícias.
- `localStorage` guarda onboarding, coach marks, assinaturas e desbloqueios apenas para demonstrar o fluxo.
- Checkout Pix gera QR visual falso e exige “Simular pagamento”; não há cobrança ou integração externa.
- Adapter único (`MockGateway`/futuro `ApiGateway`) evita dados mock espalhados por páginas.
- A API NestJS fornece `/v1/health` e endpoints mock documentados enquanto os repositórios Prisma são aprofundados.

## 10. Comandos

```bash
pnpm install
pnpm dev                 # web em :3333; API em :3334
pnpm dev:web             # web isolado, não exige DB/API
pnpm build
pnpm lint
pnpm typecheck
docker compose up -d db
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

No Windows, os comandos são os mesmos em PowerShell com Node.js 22 LTS, pnpm e Docker Desktop.

## 11. Questões em aberto

1. O produto será **geral**, **18+** ou **híbrido**? O flag `CONTENT_MODE=general|adult|hybrid` controla gate e linguagem, mas compliance muda materialmente.
2. Qual PSP aceita formalmente o modelo de conteúdo e oferece Pix, cartão, recorrência, split e KYC?
3. Comissão, prazo de liberação, chargeback e mínimo/taxa de saque.
4. Verificação de idade e KYC: fornecedor, retenção e base legal LGPD.
5. PWA somente no lançamento ou Expo/React Native em paralelo?
6. Política de moderação, releases de coautores, denúncia e resposta a incidentes.
7. Região/conta Oracle Cloud, domínio final e requisitos de residência de dados.
8. Provedor de e-mail/SMS e regras de entregabilidade.
9. Backblaze B2 + Cloudflare será validado como storage/CDN final? Definir assinatura, TTL, watermark e HLS.
10. Ranking: quais sinais, janela temporal e proteções anti-manipulação?
