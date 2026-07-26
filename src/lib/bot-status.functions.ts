import { createServerFn } from "@tanstack/react-start";

const BOT_TIMEOUT = 8000;

function botHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  const token = process.env.BOT_TOKEN;
  if (token) h["x-bot-token"] = token;
  return h;
}

/**
 * Consulta status do bot server (bot.cloudhost.run.place) via /status.
 * Se bot server indisponível, fallback para Evolution API direta.
 */
export const getBotStatus = createServerFn({ method: "GET" }).handler(async () => {
  const BOT_URL = process.env.BOT_URL;

  // 1. Tentar bot server
  if (BOT_URL) {
    try {
      const res = await fetch(`${BOT_URL.replace(/\/$/, "")}/status`, {
        headers: botHeaders(),
        signal: AbortSignal.timeout(BOT_TIMEOUT),
      });
      const data = await res.json();
      return { ok: true as const, source: "bot" as const, ...data };
    } catch (err) {
      // 2. Fallback: Evolution API direta
    }
  }

  // 2. Fallback: Evolution API direta
  try {
    const { readEvolutionEnv, evolutionFetch } = await import("./evolution.server");
    const env = await readEvolutionEnv();
    if (!env)
      return {
        ok: false as const,
        source: "none" as const,
        configured: false,
        connectionState: "unknown" as const,
        error: "Evolution API não configurada",
        phone: null,
        name: null,
      };
    const info = (await evolutionFetch(
      env,
      `/instance/connectionState/${encodeURIComponent(env.instance)}`,
      { method: "GET" },
    )) as { instance?: { state?: string; owner?: string } } | null;
    return {
      ok: true as const,
      source: "evolution" as const,
      configured: true as const,
      connectionState: info?.instance?.state ?? ("unknown" as string),
      phone: info?.instance?.owner?.split(":")[0] || null,
      name: null,
      error: null,
    };
  } catch (err) {
    return {
      ok: false as const,
      source: "error" as const,
      configured: false as const,
      connectionState: "error" as const,
      phone: null,
      name: null,
      error: err instanceof Error ? err.message : "Erro",
    };
  }
});

/**
 * Envia comando para bot server (connect, disconnect, etc.)
 */
export const sendBotCommand = createServerFn({ method: "POST" })
  .validator((input: { command: string; payload?: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const BOT_URL = process.env.BOT_URL;
    if (!BOT_URL) return { ok: false as const, error: "BOT_URL não configurado" };
    try {
      const res = await fetch(`${BOT_URL.replace(/\/$/, "")}/${data.command}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...botHeaders() },
        body: JSON.stringify(data.payload || {}),
        signal: AbortSignal.timeout(15000),
      });
      return { ok: true as const, result: await res.json() };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Falha" };
    }
  });

/**
 * Obtém QR code do bot server
 */
export const getBotQr = createServerFn({ method: "GET" }).handler(async () => {
  const BOT_URL = process.env.BOT_URL;
  if (!BOT_URL) return { ok: false as const, error: "BOT_URL não configurado" };
  try {
    const res = await fetch(`${BOT_URL.replace(/\/$/, "")}/qr`, {
      headers: botHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    return await res.json();
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Falha ao obter QR" };
  }
});
