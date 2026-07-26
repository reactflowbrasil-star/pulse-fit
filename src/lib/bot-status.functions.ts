import { createServerFn } from "@tanstack/react-start";

/**
 * Consulta o status do bot via Evolution API (server-side).
 */
export const getBotStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { readEvolutionEnv, evolutionFetch } = await import("./evolution.server");
    const env = await readEvolutionEnv();

    if (!env) {
      return {
        ok: false as const,
        configured: false,
        connectionState: "unknown",
        error: "Evolution API não configurada",
        phone: null,
        name: null,
      };
    }

    const info = (await evolutionFetch(env, `/instance/connectionState/${encodeURIComponent(env.instance)}`, {
      method: "GET",
    })) as { instance?: { state?: string; owner?: string } } | null;

    return {
      ok: true as const,
      configured: true,
      connectionState: info?.instance?.state ?? "unknown",
      phone: info?.instance?.owner?.split(":")[0] || null,
      name: null,
      qrAvailable: false,
      uptime: 0,
      error: null,
    };
  } catch (err) {
    return {
      ok: false as const,
      configured: true,
      connectionState: "error",
      phone: null,
      name: null,
      error: err instanceof Error ? err.message : "Erro ao consultar status",
    };
  }
});

/**
 * Envia comando para o bot server externo (connect, disconnect, etc.)
 * Usado apenas quando o bot externo está configurado.
 */
export const sendBotCommand = createServerFn({ method: "POST" })
  .validator((input: { command: string; payload?: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const BOT_URL = process.env.BOT_URL;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!BOT_URL) {
      return { ok: false as const, error: "BOT_URL não configurado. Comando indisponível." };
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (BOT_TOKEN) headers["x-bot-token"] = BOT_TOKEN;

    try {
      const res = await fetch(`${BOT_URL.replace(/\/$/, "")}/${data.command}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data.payload || {}),
        signal: AbortSignal.timeout(10000),
      });
      const result = await res.json();
      return { ok: true as const, result };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao comunicar com o bot",
      };
    }
  });

/**
 * Obtém QR code do bot externo
 */
export const getBotQr = createServerFn({ method: "GET" }).handler(async () => {
  const BOT_URL = process.env.BOT_URL;
  const BOT_TOKEN = process.env.BOT_TOKEN;

  if (!BOT_URL) return { ok: false as const, error: "BOT_URL não configurado" };

  const headers: Record<string, string> = {};
  if (BOT_TOKEN) headers["x-bot-token"] = BOT_TOKEN;

  try {
    const res = await fetch(`${BOT_URL.replace(/\/$/, "")}/qr`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10000),
    });
    return await res.json();
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Falha ao obter QR" };
  }
});
