# Mimo — Engenharia reversa do Privacy.com.br e proposta de arquitetura
_Data: 16/10/2026. Fontes: só web pública. Legenda: **[F]** = fato com fonte · **[I]** = inferência._

## 1. Stack inferida do Privacy
| Camada | Evidência | Status |
|---|---|---|
| CDN/WAF | `server: cloudflare`, cookie `__cf_bm` (Bot Management), HSTS preload, `x-frame-options: SAMEORIGIN` — via `curl -I https://privacy.com.br` | [F] (headers coletados 16/10/2026) |
| Anti-bot | A home devolve **HTTP 403** pra curl (challenge do Cloudflare) | [F] |
| Frontend | Não deu pra baixar os bundles JS (403). Tem cara de SPA/PWA com menu inferior fixo ("menu inicial no canto inferior central" — help) | [I] |
| Central de ajuda | `help.privacy.com.br/hc/pt-br/articles/...`: o padrão de URL é do **Zendesk Guide**, e também tem uma central própria em `/help/pt/articles/` | [I] forte |
| Pagamentos | Pix, cartão (nacional e internacional) e boleto citados nos Termos. O PSP não é público | [F] métodos / [I] PSP |
| Anti-fraude/KYC | "Taxa de validação", validação manual do 1º saque em até 24h úteis | [F] processo / fornecedor desconhecido |

Pendência: rodar Wappalyzer/BuiltWith num navegador real (o challenge bloqueia curl) pra confirmar o framework e os scripts de terceiros.

## 2. Funcionalidades
**Fã:** assinatura mensal do criador, mídias pagas (PPV), vendas no chat, "Mimos" (gorjetas), Lives pagas, "Desafio Privacy" (só Pix). [F] https://privacy.com.br/help/pt/articles/dd1b770c-c483-4095-8a02-82279902c5eb, https://help.privacy.com.br/hc/pt-br/articles/33540053699223-Termos-de-uso-da-Privacy
Também tem feed, perfil, busca, favoritos e promoções/planos de vários meses [I, padrão do setor].
**Criador:** fica com 80% e a plataforma com 20%, em todas as modalidades [F, link 1 acima]. Saque por Pix só pra conta no mesmo CPF/CNPJ, mínimo de R$30, 1 saque grátis por dia e R$3,50 por saque extra [F] https://privacy.com.br/help/pt/articles/65f5d907-8d12-4c31-a2bb-2e50741f66b2. Metas e bônus (os Termos citam metas de "dois mil reais") [F] https://privacy.com.br/termos. Afiliados/indicação: não confirmado [I].

## 3. Fluxo de assinatura e pagamento
1. O fã escolhe o plano e paga com Pix (QR dinâmico), cartão ou boleto.
2. Liberação do saldo pro criador: Pix na hora (vai pra "Saldo PIX a Liberar"); cartão em D+15; boleto em até 2 dias úteis depois da liquidação; Live em até 72h, e só depois de aprovada pela moderação [F, Termos/help].
3. A taxa do PSP sai do bruto antes do split [F, /termos].
4. KYC: o 1º saque passa por análise. Tem taxa de validação de conta. Imposto é responsabilidade do criador [F]. Pra verificar idade, o padrão do setor é documento + selfie/liveness [I].

## 4. LGPD e compliance
- Nudez/sexo é **dado sensível** (vida sexual, art. 11 da LGPD), e biometria do KYC também. Precisa de base legal, DPO, RIPD e retenção mínima.
- Comprovar que todo mundo que aparece no conteúdo é maior de 18 (ECA, art. 240/241) e ter um processo de denúncia/remoção (canal SaferNet).
- **ECA Digital (Lei 15.211/2025)**: exige verificação de idade confiável pra conteúdo adulto, e autodeclaração não basta [F] https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm. Revisar com advogado.
- Bandeiras (Visa/Mastercard) têm regras pra adulto: monitoramento de conteúdo, consentimento documentado e MCC 5967 de alto risco.

## 5. Arquitetura proposta para o Mimo (reaproveitando a infra do Diogo)
**Princípio:** custo baixo, Oracle SP + Backblaze B2 + Cloudflare (Bandwidth Alliance: egress do B2 pro Cloudflare sai de graça).

| Camada | Escolha |
|---|---|
| App | **PWA mobile-first em Next.js (React) + Tailwind + shadcn/ui**. Depois, Expo/React Native (as lojas restringem adulto, então o caminho principal é PWA) |
| API | **Node.js + NestJS (TypeScript)** ou Fastify. Monorepo no GitHub `diogolean/mimo` com PRs via Cursor cloud agents |
| DB | PostgreSQL 16 (ledger em tabela de dupla entrada, valores em centavos) + Redis (filas BullMQ, rate limit) |
| Hosting | **Oracle Cloud SP**: VM Ampere A1 (dá pra começar no Always Free, 4 OCPU/24GB) com Docker Compose (api, worker, postgres, redis, ffmpeg) e backup do PG no B2 |
| Borda | Cloudflare (DNS de eokviral.com ou domínio novo, WAF, Turnstile, Workers pra assinar URL) |
| Mídia | **Backblaze B2 em bucket privado** → Cloudflare Worker valida o token (JWT curto, assinatura do usuário) e faz o proxy. Vídeo: ffmpeg em **HLS** com segmentos AES-128 e chave entregue só com autorização. Thumbs borradas pra quem não assinou |
| Proteção | Marca d'água dinâmica (@usuario + id no overlay do player, e watermark gravada no ffmpeg na 1ª entrega do PPV), sem botão de download, URLs expirando em 5 min, detecção de compartilhamento de sessão |
| Lives | Fase 2: Cloudflare Stream Live ou LiveKit self-hosted na Oracle |
| Auth | E-mail+senha (argon2id), magic link, **OAuth Google/Apple**, **2FA TOTP obrigatório pra criador**, passkeys depois. Sessão em cookie httpOnly |
| Chat | WebSocket (Socket.IO) + PPV no chat |
| Namecheap | Usar só pra registrar domínio/e-mail. A hospedagem compartilhada não serve pra isso |

### Pagamentos (Pix + cartão + split)
Quem aceita adulto não é público e muda com frequência. **Confirmar por escrito antes.**
- **Pix + split/subconta:** Asaas, Iugu, Pagar.me (Stone), Efí (Gerencianet), Woovi/OpenPix. Vários vetam adulto nos termos (o Asaas, por exemplo, lista "conteúdo adulto" como atividade proibida) [I, checar].
- **Cartão adulto:** adquirentes high-risk (CCBill e Segpay pro internacional, Epoch). No Brasil, intermediários como **PagSeguro/PagBank** ou gateways especializados costumam pedir análise [I].
- **Recomendação:** Pix como método principal (barato e com liquidação imediata), com conta marketplace/subcontas e KYC dos criadores pelo próprio PSP. Isso tira o Mimo da custódia de dinheiro, o que evita virar instituição de pagamento no BC. Cartão fica pra fase 2 com adquirente high-risk.
- Ledger interno, webhooks idempotentes, retenção de D+15 no cartão pra cobrir chargeback.

### KYC e verificação de idade
unico (IDCloud/Check), idwall, CAF (Combate à Fraude), Serpro DataValid (CPF + biometria); internacional: Veriff, Yoti. Criador: documento + liveness + CPF ativo e maior de 18 + co-autores com release assinado. Fã: estimativa de idade ou checagem de CPF, como pede o ECA Digital.

## 6. Escopo
**MVP (8–10 semanas):** cadastro/2FA, perfil do criador, feed, assinatura mensal (Pix recorrente/Pix Automático, ou cobrança mensal com lembrete), PPV, gorjetas, chat simples, upload com HLS + watermark, KYC do criador, saldo/saque Pix, painel admin de moderação, LGPD (exportar/excluir dados).
**Fase 2:** cartão, lives, promoções/planos de vários meses, afiliados, push, app nativo, analytics do criador, moderação por IA (detecção de nudez infantil, PhotoDNA).

## 7. UI premium mobile-first
Dark mode como padrão, acento em uma cor só (ex.: coral/magenta), bottom nav (Feed, Buscar, Criar, Mensagens, Perfil), cards full-bleed, blur com cadeado + CTA "Assinar por R$X", checkout Pix com QR + copia-e-cola num bottom sheet, microanimações (Framer Motion), skeletons, um polegar só.

## 8. Custo mensal estimado (MVP, até ~1–5k usuários) [I]
| Item | US$/mês |
|---|---|
| Oracle A1 (Always Free) ou 1 VM paga extra | 0–30 |
| Backblaze B2 (1 TB, egress grátis via CF) | ~6 |
| Cloudflare Free/Pro + Workers Paid | 0–25 |
| E-mail transacional (Resend/SES) | 0–20 |
| KYC (~R$2–5 por verificação) | variável, ~50 |
| Domínio | ~1 |
| **Total** | **~US$60–130 + taxas do PSP (Pix ~0,5–1%, cartão high-risk 6–15%)** |

## 9. Decisões em aberto
Domínio/marca (eokviral.com ou domínio novo do Mimo); qual PSP aceita adulto (formalizar); CNPJ/estrutura jurídica e advogado; comissão (20% igual ao Privacy, ou menor pra atrair criador); PWA-only no MVP; cartão no MVP ou só Pix; fornecedor de KYC.
