# 📱 Guia de Configuração — WhatsApp Bot (Pulse Fit)

Guia completo para configurar o bot de WhatsApp do Pulse Fit, da Zero ao Funcionamento.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Obter a Service Role Key no Supabase](#2-obter-a-service-role-key-no-supabase)
3. [Configurar variáveis de ambiente](#3-configurar-variáveis-de-ambiente)
4. [Instalar e configurar a Evolution API](#4-instalar-e-configurar-a-evolution-api)
5. [Cadastrar credenciais no painel do app](#5-cadastrar-credenciais-no-painel-do-app)
6. [Configurar o webhook](#6-configurar-o-webhook)
7. [Subir o bot-server (opcional)](#7-subir-o-bot-server-opcional)
8. [Testar a integração](#8-testar-a-integração)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Pré-requisitos

- Conta no [Supabase](https://supabase.com) com o projeto `pulse-fit` ativo
- Uma instância da [Evolution API](https://github.com/EvolutionAPI/evolution-api) rodando (self-hosted ou SaaS)
- Acesso ao painel admin do Pulse Fit (email `studioreactfly@gmail.com`)
- Docker instalado (se for subir o bot-server)

---

## 2. Obter a Service Role Key no Supabase

> ⚠️ **ATENÇÃO**: A service role key tem acesso total ao banco. **NUNCA** exponha no frontend ou compartilhe publicamente.

1. Acesse o [painel do Supabase](https://supabase.com/dashboard)
2. Selecione o projeto **pulse-fit** (`uxitpubwbdmqwfugldsq`)
3. Vá em **Settings** > **API** (menu lateral esquerdo)
4. Na seção **Project API keys**, copie a chave **`service_role`**
   - Ela começa com `eyJ...` (formato JWT)
   - O nome aparece como "service_role" ou "service key"
5. **Cole esta chave no arquivo `.env`** do projeto:

```bash
SUPABASE_SERVICE_ROLE_KEY="cole_a_chave_aqui"
```

**Nunca commite o `.env` no git!** O `.gitignore` já deve protegê-lo.

---

## 3. Configurar variáveis de ambiente

Edite o arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# ══════════════════════════════════════════════
# SUPABASE (já deve estar configurado)
# ══════════════════════════════════════════════
SUPABASE_URL="https://uxitpubwbdmqwfugldsq.supabase.co"
SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="cole_a_service_role_key_aqui"  # ← OBRIGATÓRIO
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."

# ══════════════════════════════════════════════
# EVOLUTION API (obrigatório para WhatsApp)
# ══════════════════════════════════════════════
EVOLUTION_API_URL="https://sua-evolution-api.com.br"
EVOLUTION_API_KEY="sua_api_key_da_evolution"
EVOLUTION_INSTANCE="nome_da_instancia"
WHATSAPP_WEBHOOK_TOKEN="um_token_secreto_para_o_webhook"

# ══════════════════════════════════════════════
# BOT EXTERNO (opcional — fallback)
# ══════════════════════════════════════════════
BOT_URL="https://bot.cloudhost.run.place"
BOT_TOKEN="token_do_bot_externo"

# ══════════════════════════════════════════════
# GOOGLE OAUTH
# ══════════════════════════════════════════════
VITE_GOOGLE_CLIENT_ID="..."
VITE_GOOGLE_CLIENT_SECRET="..."
```

### Validação automática

Ao iniciar o servidor (`npm run dev`), o app valida as variáveis e mostra no terminal:

```
╔══════════════════════════════════════════════╗
║  🚀 Pulse Fit — Validação de Ambiente        ║
╚══════════════════════════════════════════════╝

✅ Todas as variáveis obrigatórias estão definidas.

⚠️  Variáveis opcionais não configuradas:
   • EVOLUTION_API_URL — URL da Evolution API
   • ...

📱 WhatsApp:
   Evolution API: ❌ Não configurada
   Bot externo:   ⚠️  Não configurado
   Webhook token: ⚠️  Não definido

💡 Para configurar, acesse /admin/whatsapp-integration
```

---

## 4. Instalar e configurar a Evolution API

### Opção A: Self-hosted (Docker)

```bash
# Clone e suba a Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
docker compose up -d
```

A API ficará disponível em `http://localhost:8080` (porta padrão).

### Opção B: SaaS (recomendado para produção)

Use um provedor como:
- [Evolution API Cloud](https://evo.cloud)
- [Evolution API Pro](https://evolutionapi.com.br)
- [Evo Api Host](https://evoapi.host)

Após criar a conta:
1. Crie uma nova **instância** (ex: nome `pulsefit`)
2. Copie a **API Key** em Settings > API Key
3. Anote a **URL base** da API

---

## 5. Cadastrar credenciais no painel do app

### Método 1: Via painel admin (recomendado)

1. Acesse o app e faça login com `studioreactfly@gmail.com`
2. Vá em **Admin** > **WhatsApp Integration**
3. Preencha:
   - **API URL**: URL base da Evolution API
   - **API Key**: Chave copiada no passo anterior
   - **Nome da Instância**: Nome da instância criada
   - **Webhook Token**: Um token secreto (para proteger o webhook)
4. Clique em **Salvar**
5. Clique em **Testar** para validar a conexão

### Método 2: Via variáveis de ambiente

Adicione no `.env`:

```bash
EVOLUTION_API_URL="https://sua-api.com"
EVOLUTION_API_KEY="sua_chave"
EVOLUTION_INSTANCE="pulsefit"
WHATSAPP_WEBHOOK_TOKEN="token_secreto"
```

---

## 6. Configurar o webhook

Na Evolution API, configure o webhook para apontar para o app:

1. Abra o painel da Evolution API
2. Vá em **Webhook** ou **Configurações**
3. Configure:
   - **URL**: `https://seu-app.com/api/public/whatsapp/webhook?token=SEU_TOKEN`
   - **Events**: `messages.upsert`, `messages.update`
4. Salve

> 📌 O token na URL deve ser o mesmo definido em `WHATSAPP_WEBHOOK_TOKEN`

---

## 7. Subir o bot-server (opcional)

O bot-server é um servidor Express independente para operações avançadas (QR code, pareamento, etc.).

### Com Docker

```bash
cd bot-server

# Copie e configure o .env
cp .env.example .env
# Edite o .env com BOT_TOKEN e SUPABASE_SERVICE_ROLE_KEY

# Build e rode
docker build -t pulse-fit-bot .
docker run -d \
  --name pulse-fit-bot \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  pulse-fit-bot
```

### Sem Docker

```bash
cd bot-server
cp .env.example .env
# Edite o .env
npm install
npm start
```

### Deploy em cloud

O bot-server pode ser deployado em:
- **Railway**: `railway init` > `railway up`
- **Render**: Criar Web Service > Docker > apontar para `bot-server/`
- **Fly.io**: `fly launch` na pasta `bot-server/`
- **Cloud Run**: `gcloud run deploy --source .`

---

## 8. Testar a integração

### Teste rápido via curl

```bash
# Health check
curl https://seu-app.com/api/bot/health

# Status (sem auth)
curl https://seu-app.com/api/bot/status

# Enviar código de verificação (com token)
curl -X POST https://seu-app.com/api/bot/enviar-codigo \
  -H "Content-Type: application/json" \
  -H "x-bot-token: SEU_BOT_TOKEN" \
  -d '{"whatsapp":"5511999999999","codigo":"123456"}'

# Webhook (com token)
curl -X POST "https://seu-app.com/api/public/whatsapp/webhook?token=SEU_WEBHOOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":{}}'
```

### Teste no app

1. Acesse `/whatsapp` — deve mostrar status "Configurado"
2. Acesse `/whatsapp-setup` — insira um número e solicite código
3. Verifique se o código chega no WhatsApp

---

## 9. Troubleshooting

### "Evolution API não configurada"

- Verifique se `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e `EVOLUTION_INSTANCE` estão no `.env`
- Ou cadastre via painel Admin > WhatsApp Integration

### "Falha ao enviar código" / HTTP 401

- A API Key da Evolution está incorreta
- Verifique em Evolution API > Settings > API Key
- Teste no painel Admin > WhatsApp Integration > Testar

### Webhook retorna 500

- `WHATSAPP_WEBHOOK_TOKEN` não está definido no `.env`
- Ou `SUPABASE_SERVICE_ROLE_KEY` está faltando

### Mensagens não chegam

- Verifique se o webhook está configurado na Evolution API
- A URL deve ser: `https://seu-app.com/api/public/whatsapp/webhook?token=SEU_TOKEN`
- Events: `messages.upsert`, `messages.update`

### Bot externo 404

- O bot-server em `bot.cloudhost.run.place` precisa ser redeployado com o código em `bot-server/`
- Execute: `cd bot-server && docker build -t pulse-fit-bot . && docker push...`

### "Código inválido ou expirado"

- O código expira em 10 minutos
- Verifique se o WhatsApp do usuário está ativo
- O número deve ter formato internacional: `55XXXXXXXXXXX`

---

## Arquitetura

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Pulse Fit App  │────▶│  Evolution API   │────▶│    WhatsApp      │
│  (TanStack Start)│     │   (messaging)    │     │   (Baileys)      │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                                                 │
        │  webhook                                        │
        │◀────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────┐
│    Supabase      │
│  (mensagens,     │
│   sessões,       │
│   verificações)  │
└──────────────────┘
```

---

**Dúvidas?** Acesse `/admin/whatsapp-integration` no app para diagnóstico em tempo real.
