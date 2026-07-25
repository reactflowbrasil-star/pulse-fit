# Pulse Fit Bot Server

Servidor Express que gerencia a conexão WhatsApp via Baileys.

## Rotas

| Rota | Método | Descrição |
|------|--------|-----------|
| `/` | GET | Status raiz ("Pulse Fit bot online") |
| `/health` | GET | Health check (sem auth) |
| `/status` | GET | Estado da conexão WhatsApp |
| `/qr` | GET | QR Code para conexão (retorna base64) |
| `/pair?phone=55XXX` | GET | Código de pareamento numérico |
| `/connect` | POST | Iniciar conexão |
| `/disconnect` | POST | Desconectar |
| `/enviar-codigo` | POST | Enviar código de verificação |
| `/send` | POST | Enviar mensagem |
| `/webhook` | POST | Receber eventos |
| `/messages` | GET | Listar mensagens |

## Setup

```bash
cp .env.example .env
# Edite .env com seu BOT_TOKEN e SUPABASE_SERVICE_ROLE_KEY
npm install
npm start
```

## Deploy (Cloud Run, Railway, etc)

```bash
docker build -t pulse-fit-bot .
docker run -p 3000:3000 --env-file .env pulse-fit-bot
```
