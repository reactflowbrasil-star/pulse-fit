import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import QRCode from "qrcode";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidUser,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";

// ─── Config ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const AUTH_DIR = "./auth_info";

// ─── Estado do bot ─────────────────────────────────────────────────────
let sock = null;
let qrCode = null;
let pairingCode = null;
let connectionState = "disconnected"; // disconnected | connecting | open
let lastDisconnectReason = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 10;

// ─── Express ───────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: "2mb" }));

const corsOrigins = process.env.CORS_ORIGINS || "*";
app.use(
  cors({
    origin: corsOrigins === "*" ? true : corsOrigins.split(",").map((s) => s.trim()),
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-bot-token"],
    credentials: true,
  })
);

// ─── Helpers ───────────────────────────────────────────────────────────
function authBot(req) {
  if (!BOT_TOKEN) return true; // sem token configurado = aberto (dev)
  const auth = req.headers.authorization || "";
  const token = req.headers["x-bot-token"] || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  return bearer === BOT_TOKEN || token === BOT_TOKEN;
}

function json(res, data, status = 200) {
  return res.status(status).json(data);
}

async function supabaseQuery(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: options.prefer || "return=representation",
  };
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[supabase] ${options.method || "GET"} ${path} => ${res.status}: ${text}`);
    return null;
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return null;
}

// ─── Rotas públicas (sem auth) ────────────────────────────────────────

// Root
app.get("/", (_req, res) => {
  res.type("text/plain").send("Pulse Fit bot online");
});

// Health check
app.get("/health", (_req, res) => {
  json(res, {
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    connectionState,
    version: "1.0.0",
  });
});

// ─── Rotas protegidas (requerem token) ─────────────────────────────────

// Status da conexão WhatsApp
app.get("/status", (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);

  json(res, {
    ok: true,
    connectionState,
    qrAvailable: !!qrCode,
    pairingAvailable: !!pairingCode,
    lastDisconnectReason,
    reconnectAttempts,
    uptime: process.uptime(),
    phone: sock?.user?.id?.split(":")[0] || null,
    name: sock?.user?.name || null,
  });
});

// Obter QR Code (retorna imagem base64)
app.get("/qr", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);

  if (connectionState === "open") {
    return json(res, { ok: false, error: "already_connected", message: "Bot já está conectado" });
  }
  if (!qrCode) {
    return json(res, { ok: false, error: "no_qr", message: "QR code não disponível. Tente /connect primeiro." });
  }

  try {
    const dataUrl = await QRCode.toDataURL(qrCode, { width: 300, margin: 2 });
    json(res, { ok: true, qr: dataUrl, raw: qrCode });
  } catch (err) {
    json(res, { ok: false, error: "qr_generation_failed", message: err.message }, 500);
  }
});

// Obter código de pareamento (para pareamento numérico)
app.get("/pair", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);

  if (connectionState === "open") {
    return json(res, { ok: false, error: "already_connected" });
  }

  const phone = req.query.phone;
  if (!phone || !/^\d{10,15}$/.test(phone)) {
    return json(res, { ok: false, error: "invalid_phone", message: "Informe ?phone=55XXXXXXXXXXX" }, 400);
  }

  try {
    if (sock?.requestPairingCode) {
      const code = await sock.requestPairingCode(phone);
      pairingCode = code;
      json(res, { ok: true, code, message: "Use este código no WhatsApp > Dispositivos conectados > Vincular dispositivo" });
    } else {
      json(res, { ok: false, error: "pairing_not_supported", message: "Pairing code não suportado nesta versão" }, 501);
    }
  } catch (err) {
    json(res, { ok: false, error: "pairing_failed", message: err.message }, 500);
  }
});

// Conectar / reconectar
app.post("/connect", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);

  if (connectionState === "open") {
    return json(res, { ok: true, message: "Já conectado" });
  }

  startBot();
  json(res, { ok: true, message: "Conexão iniciada. Aguarde e consulte /status ou /qr." });
});

// Desconectar
app.post("/disconnect", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);

  try {
    if (sock) {
      await sock.logout();
      sock.end(undefined);
      sock = null;
    }
    connectionState = "disconnected";
    qrCode = null;
    pairingCode = null;
    reconnectAttempts = 0;
    json(res, { ok: true, message: "Desconectado" });
  } catch (err) {
    json(res, { ok: false, error: err.message }, 500);
  }
});

// Enviar código de verificação
app.post("/enviar-codigo", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);

  const { whatsapp, codigo } = req.body || {};
  if (!whatsapp || !codigo) {
    return json(res, { ok: false, error: "missing_fields", message: "Envie whatsapp e codigo" }, 400);
  }

  if (connectionState !== "open") {
    return json(res, { ok: false, error: "bot_not_connected", message: "Bot não está conectado ao WhatsApp" }, 503);
  }

  const jid = normalizeJid(whatsapp);

  try {
    await sock.sendMessage(jid, {
      text: `🔐 *Código de verificação Pulse Fit*\n\nSeu código é: *${codigo}*\n\nEste código expira em 10 minutos.\nNão compartilhe com ninguém.`,
    });

    // Log no Supabase
    await supabaseQuery("whatsapp_messages", {
      method: "POST",
      body: JSON.stringify({
        direction: "outbound",
        remote_jid: jid,
        content: `Código de verificação enviado`,
        template_name: "verification_code",
        status: "sent",
      }),
    });

    json(res, { ok: true, message: "Código enviado" });
  } catch (err) {
    console.error("[enviar-codigo] falha:", err.message);
    json(res, { ok: false, error: "send_failed", message: `Falha ao enviar: ${err.message}` }, 500);
  }
});

// Enviar mensagem genérica
app.post("/send", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);

  const { number, text } = req.body || {};
  if (!number || !text) {
    return json(res, { ok: false, error: "missing_fields", message: "Envie number e text" }, 400);
  }

  if (connectionState !== "open") {
    return json(res, { ok: false, error: "bot_not_connected" }, 503);
  }

  const jid = normalizeJid(number);

  try {
    const result = await sock.sendMessage(jid, { text });
    json(res, { ok: true, messageId: result?.key?.id || null });
  } catch (err) {
    json(res, { ok: false, error: err.message }, 500);
  }
});

// Webhook receptor (recebe eventos de outros serviços)
app.post("/webhook", async (req, res) => {
  console.log("[webhook] evento recebido:", JSON.stringify(req.body).slice(0, 500));

  // Armazena mensagem no Supabase se for mensagem recebida
  const payload = req.body;
  if (payload?.event === "messages.upsert" && payload?.data) {
    const key = payload.data.key;
    if (key && !key.fromMe) {
      const text = extractText(payload.data.message) || null;
      await supabaseQuery("whatsapp_messages", {
        method: "POST",
        body: JSON.stringify({
          direction: "inbound",
          remote_jid: key.remoteJid || "unknown",
          message_id: key.id || null,
          content: text,
          status: "received",
          raw: payload.data,
        }),
      });
    }
  }

  json(res, { ok: true });
});

// Listar mensagens (proxy Supabase)
app.get("/messages", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);

  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const jid = req.query.jid;

  let path = `whatsapp_messages?order=created_at.desc&limit=${limit}`;
  if (jid) path += `&remote_jid=eq.${encodeURIComponent(jid)}`;

  const data = await supabaseQuery(path);
  json(res, { ok: true, messages: data || [] });
});

// ─── Bot logic ─────────────────────────────────────────────────────────

function normalizeJid(phone) {
  if (phone.includes("@")) return phone;
  let digits = phone.replace(/\D+/g, "").replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  return `${digits}@s.whatsapp.net`;
}

function extractText(msg) {
  if (!msg) return null;
  if (typeof msg.conversation === "string") return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  if (msg.buttonsResponseMessage?.selectedButtonId) return msg.buttonsResponseMessage.selectedButtonId;
  if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) return msg.listResponseMessage.singleSelectReply.selectedRowId;
  return null;
}

async function handleIncomingMessage(msg) {
  const jid = msg.key?.remoteJid;
  if (!jid || !isJidUser(jid) || msg.key?.fromMe) return;

  const text = extractText(msg.message);
  if (!text) return;

  console.log(`[msg] ${jid}: ${text}`);

  // Log no Supabase
  await supabaseQuery("whatsapp_messages", {
    method: "POST",
    body: JSON.stringify({
      direction: "inbound",
      remote_jid: jid,
      message_id: msg.key?.id || null,
      content: text,
      status: "received",
      raw: msg,
    }),
  });

  // Bot auto-reply básico
  const t = text.trim().toLowerCase();
  if (["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"].includes(t)) {
    try {
      await sock.sendMessage(jid, {
        text: "Oi! 👋 Bem-vindo ao *Pulse Fit*.\n\nDigite *menu* para ver as opções.",
      });
    } catch (err) {
      console.error("[bot] falha reply:", err.message);
    }
  }

  if (t === "menu" || t === "ajuda" || t === "help") {
    try {
      await sock.sendMessage(jid, {
        text: [
          "🏋️ *Pulse Fit — Assistente*",
          "",
          "Escolha uma opção (envie o número ou a palavra):",
          "1️⃣ *resumo* — seu dia de hoje",
          "2️⃣ *passos* — meta de passos",
          "3️⃣ *agua* — hidratação",
          "4️⃣ *treinos* — treinos recentes",
          "5️⃣ *ajuda* — ver este menu",
        ].join("\n"),
      });
    } catch (err) {
      console.error("[bot] falha menu:", err.message);
    }
  }
}

// ─── Conexão WhatsApp (Baileys) ────────────────────────────────────────

async function startBot() {
  if (connectionState === "connecting") return;

  connectionState = "connecting";
  qrCode = null;
  pairingCode = null;

  const logger = pino({ level: "silent" });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: true,
    browser: ["Pulse Fit Bot", "Chrome", "4.0.0"],
    generateHighQualityLinkPreview: false,
  });

  // Salvar credenciais ao atualizar
  sock.ev.on("creds.update", saveCreds);

  // QR Code
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCode = qr;
      pairingCode = null;
      console.log("[bot] QR code disponível — consulte GET /qr");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      lastDisconnectReason = reason;
      connectionState = "disconnected";
      qrCode = null;

      console.log(`[bot] Conexão fechada. Razão: ${reason}`);

      if (reason !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT) {
        reconnectAttempts++;
        const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
        console.log(`[bot] Reconectando em ${delay}ms (tentativa ${reconnectAttempts}/${MAX_RECONNECT})`);
        setTimeout(startBot, delay);
      } else if (reason === DisconnectReason.loggedOut) {
        console.log("[bot] Deslogado. Limpe auth_info e reconecte.");
        reconnectAttempts = 0;
      } else {
        console.log("[bot] Máximo de reconexões atingido.");
      }
    }

    if (connection === "open") {
      connectionState = "open";
      qrCode = null;
      pairingCode = null;
      reconnectAttempts = 0;
      console.log(`[bot] ✅ Conectado como ${sock.user?.id}`);
    }
  });

  // Mensagens recebidas
  sock.ev.on("messages.upsert", async (upsert) => {
    if (upsert.type !== "notify") return;
    for (const msg of upsert.messages) {
      await handleIncomingMessage(msg);
    }
  });

  // Status de entrega
  sock.ev.on("messages.update", async (updates) => {
    for (const update of updates) {
      const messageId = update.key?.id;
      const status = update.update?.status;
      if (!messageId || status === undefined) continue;

      let mappedStatus = null;
      if (status >= 4) mappedStatus = "read";
      else if (status === 3) mappedStatus = "delivered";
      else if (status === 2) mappedStatus = "sent";

      if (mappedStatus) {
        await supabaseQuery(`whatsapp_messages?message_id=eq.${messageId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: mappedStatus }),
        });
      }
    }
  });
}

// ─── Iniciar ───────────────────────────────────────────────────────────

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`\n🚀 Pulse Fit Bot Server rodando na porta ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Status: http://localhost:${PORT}/status`);
  console.log(`   QR:     http://localhost:${PORT}/qr`);
  console.log(`   Connect: POST http://localhost:${PORT}/connect\n`);

  // Auto-connect se houver sessão salva
  startBot().catch((err) => {
    console.error("[bot] falha ao iniciar:", err.message);
  });
});
