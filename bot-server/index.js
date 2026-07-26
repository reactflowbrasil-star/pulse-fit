import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";

// ─── Config ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Evolution API config — via env ou Supabase
const EVO_URL = process.env.EVOLUTION_API_URL || "";
const EVO_KEY = process.env.EVOLUTION_API_KEY || "";
const EVO_INSTANCE = process.env.EVOLUTION_INSTANCE || "";

// ─── Estado do bot ─────────────────────────────────────────────────────
let evoConfig = null; // { apiUrl, apiKey, instance }
let connectionState = "unknown";

// ─── Express ───────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cors({ origin: true, methods: ["GET", "POST", "OPTIONS"], credentials: true }));

// ─── Helpers ───────────────────────────────────────────────────────────
function authBot(req) {
  if (!BOT_TOKEN) return true;
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
  try {
    const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    return null;
  } catch { return null; }
}

async function loadEvoConfig() {
  if (EVO_URL && EVO_KEY && EVO_INSTANCE) {
    evoConfig = { apiUrl: EVO_URL, apiKey: EVO_KEY, instance: EVO_INSTANCE };
    return;
  }
  // Ler do Supabase
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    const data = await supabaseQuery("whatsapp_config?select=api_url,instance_name,webhook_token&singleton=eq.true&limit=1");
    const row = data?.[0];
    if (row?.api_url && row?.instance_name) {
      let apiKey = "";
      try { const s = JSON.parse(row.webhook_token || "{}"); apiKey = s.api_key || ""; } catch { apiKey = row.webhook_token || ""; }
      if (apiKey) evoConfig = { apiUrl: row.api_url, apiKey, instance: row.instance_name };
    }
  } catch (e) { console.error("[bot] loadEvoConfig:", e.message); }
}

async function evoFetch(path, init = {}) {
  if (!evoConfig) throw new Error("Evolution API não configurada");
  const url = `${evoConfig.apiUrl}${path}`;
  const headers = { apikey: evoConfig.apiKey, "Content-Type": "application/json", ...init.headers };
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) throw new Error(`Evolution ${res.status}: ${text.slice(0, 200)}`);
  return json;
}

function normalizeJid(phone) {
  if (phone.includes("@")) return phone;
  let d = phone.replace(/\D+/g, "").replace(/^0+/, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return d + "@s.whatsapp.net";
}

// ─── Rotas públicas ───────────────────────────────────────────────────
app.get("/", (_req, res) => res.type("text/plain").send("Pulse Fit bot online"));

app.get("/health", (_req, res) => {
  json(res, { ok: true, uptime: process.uptime(), timestamp: new Date().toISOString(), version: "2.0.0", evoConfigured: !!evoConfig });
});

// ─── Rotas protegidas ─────────────────────────────────────────────────

// Status
app.get("/status", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);
  if (!evoConfig) await loadEvoConfig();
  if (!evoConfig) return json(res, { ok: false, configured: false, connectionState: "unknown", error: "Evolution não configurada" });
  try {
    const info = await evoFetch(`/instance/connectionState/${encodeURIComponent(evoConfig.instance)}`);
    const state = info?.instance?.state || "unknown";
    connectionState = state;
    return json(res, { ok: true, configured: true, connectionState: state, instance: evoConfig.instance, phone: info?.instance?.owner?.split(":")[0] || null });
  } catch (err) {
    return json(res, { ok: false, configured: true, connectionState: "error", error: err.message });
  }
});

// QR Code — pega da Evolution API
app.get("/qr", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);
  if (!evoConfig) await loadEvoConfig();
  if (!evoConfig) return json(res, { ok: false, error: "Evolution não configurada" });
  try {
    // Tenta buscar QR via connect
    const info = await evoFetch(`/instance/connect/${encodeURIComponent(evoConfig.instance)}`);
    if (info?.base64) return json(res, { ok: true, qr: info.base64, code: info.code || null });
    return json(res, { ok: false, error: "QR não disponível. Instance pode já estar conectada." });
  } catch (err) {
    return json(res, { ok: false, error: err.message });
  }
});

// Connect
app.post("/connect", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);
  if (!evoConfig) await loadEvoConfig();
  if (!evoConfig) return json(res, { ok: false, error: "Evolution não configurada" });
  try {
    const info = await evoFetch(`/instance/connect/${encodeURIComponent(evoConfig.instance)}`);
    return json(res, { ok: true, state: info?.instance?.state || "connecting", qr: info?.base64 || null });
  } catch (err) {
    return json(res, { ok: false, error: err.message });
  }
});

// Disconnect
app.post("/disconnect", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);
  if (!evoConfig) await loadEvoConfig();
  if (!evoConfig) return json(res, { ok: false, error: "Evolution não configurada" });
  try {
    await evoFetch(`/instance/logout/${encodeURIComponent(evoConfig.instance)}`, { method: "DELETE" });
    return json(res, { ok: true, message: "Desconectado" });
  } catch (err) {
    return json(res, { ok: false, error: err.message });
  }
});

// Pair (código numérico)
app.get("/pair", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);
  const phone = req.query.phone;
  if (!phone || !/^\d{10,15}$/.test(phone)) return json(res, { ok: false, error: "Informe ?phone=55XXXXXXXXXXX" }, 400);
  if (!evoConfig) await loadEvoConfig();
  if (!evoConfig) return json(res, { ok: false, error: "Evolution não configurada" });
  try {
    const info = await evoFetch(`/instance/connect/${encodeURIComponent(evoConfig.instance)}?number=${phone}`);
    return json(res, { ok: true, code: info?.code || null, pairingCode: info?.pairingCode || null });
  } catch (err) {
    return json(res, { ok: false, error: err.message });
  }
});

// Enviar código de verificação
app.post("/enviar-codigo", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);
  const { whatsapp, codigo } = req.body || {};
  if (!whatsapp || !codigo) return json(res, { ok: false, error: "missing_fields" }, 400);
  if (!evoConfig) await loadEvoConfig();
  if (!evoConfig) return json(res, { ok: false, error: "Evolution não configurada" }, 503);
  const jid = normalizeJid(whatsapp);
  try {
    await evoFetch(`/message/sendText/${encodeURIComponent(evoConfig.instance)}`, {
      method: "POST",
      body: JSON.stringify({ number: jid, text: `🔐 *Código de verificação Pulse Fit*\n\nSeu código é: *${codigo}*\n\nExpira em 10 minutos.\nNão compartilhe.` }),
    });
    await supabaseQuery("whatsapp_messages", { method: "POST", body: JSON.stringify({ direction: "outbound", remote_jid: jid, content: "Código de verificação enviado", template_name: "verification_code", status: "sent" }) });
    return json(res, { ok: true, message: "Código enviado" });
  } catch (err) {
    return json(res, { ok: false, error: err.message }, 500);
  }
});

// Enviar mensagem genérica
app.post("/send", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);
  const { number, text } = req.body || {};
  if (!number || !text) return json(res, { ok: false, error: "missing_fields" }, 400);
  if (!evoConfig) await loadEvoConfig();
  if (!evoConfig) return json(res, { ok: false, error: "Evolution não configurada" }, 503);
  const jid = normalizeJid(number);
  try {
    const result = await evoFetch(`/message/sendText/${encodeURIComponent(evoConfig.instance)}`, {
      method: "POST",
      body: JSON.stringify({ number: jid, text }),
    });
    return json(res, { ok: true, messageId: result?.key?.id || null });
  } catch (err) {
    return json(res, { ok: false, error: err.message }, 500);
  }
});

// Webhook receptor
app.post("/webhook", async (req, res) => {
  console.log("[webhook]", req.body?.event || "unknown");
  const payload = req.body;
  if (payload?.event === "MESSAGES_UPSERT" && payload?.data) {
    const key = payload.data.key;
    if (key && !key.fromMe) {
      const text = extractText(payload.data.message) || null;
      const jid = key.remoteJid || "unknown";
      await supabaseQuery("whatsapp_messages", { method: "POST", body: JSON.stringify({ direction: "inbound", remote_jid: jid, message_id: key.id || null, content: text, status: "received", raw: payload.data }) });
      // Bot auto-reply básico
      if (text) {
        const t = text.trim().toLowerCase();
        if (["oi", "olá", "ola"].includes(t)) {
          try { await evoFetch(`/message/sendText/${encodeURIComponent(evoConfig?.instance || "")}`, { method: "POST", body: JSON.stringify({ number: jid, text: "Oi! 👋 Bem-vindo ao *Pulse Fit*. Digite *menu* para ver opções." }) }); } catch {}
        }
        if (t === "menu" || t === "ajuda") {
          try { await evoFetch(`/message/sendText/${encodeURIComponent(evoConfig?.instance || "")}`, { method: "POST", body: JSON.stringify({ number: jid, text: "🏋️ *Pulse Fit*\n\n1️⃣ resumo\n2️⃣ passos\n3️⃣ água\n4️⃣ treinos\n5️⃣ ajuda" }) }); } catch {}
        }
      }
    }
  }
  json(res, { ok: true });
});

// Listar mensagens
app.get("/messages", async (req, res) => {
  if (!authBot(req)) return json(res, { ok: false, error: "unauthorized" }, 401);
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const data = await supabaseQuery(`whatsapp_messages?order=created_at.desc&limit=${limit}`);
  json(res, { ok: true, messages: data || [] });
});

function extractText(msg) {
  if (!msg) return null;
  if (typeof msg.conversation === "string") return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  return null;
}

// ─── Start ─────────────────────────────────────────────────────────────
const server = createServer(app);
server.listen(PORT, async () => {
  console.log(`🚀 Pulse Fit Bot v2.0 na porta ${PORT}`);
  await loadEvoConfig();
  if (evoConfig) {
    console.log(`   Evolution: ${evoConfig.apiUrl} (${evoConfig.instance})`);
    try {
      const info = await evoFetch(`/instance/connectionState/${encodeURIComponent(evoConfig.instance)}`);
      connectionState = info?.instance?.state || "unknown";
      console.log(`   Estado: ${connectionState}`);
    } catch { console.log("   Estado: erro ao consultar"); }
  } else {
    console.log("   Evolution: não configurada (adicione BOT_URL ao .env do app)");
  }
});
