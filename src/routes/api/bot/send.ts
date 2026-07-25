import { createFileRoute } from "@tanstack/react-router";

/**
 * Rota para enviar mensagem via WhatsApp.
 * POST /api/bot/send
 * Body: { number: string, text: string }
 */
export const Route = createFileRoute("/api/bot/send")({
  server: {
    handlers: {
      OPTIONS: async () => corsResponse(null, 204),
      POST: async ({ request }) => {
        const BOT_TOKEN = process.env.BOT_TOKEN;
        if (BOT_TOKEN) {
          const auth = request.headers.get("authorization") || "";
          const xToken = request.headers.get("x-bot-token") || "";
          const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
          if (bearer !== BOT_TOKEN && xToken !== BOT_TOKEN) {
            return corsResponse({ ok: false, error: "unauthorized" }, 401);
          }
        }

        let body: { number?: string; text?: string } = {};
        try {
          body = await request.json();
        } catch {
          return corsResponse({ ok: false, error: "invalid_json" }, 400);
        }

        const { number, text } = body;
        if (!number || !text) {
          return corsResponse({ ok: false, error: "missing_fields", message: "Envie number e text" }, 400);
        }

        try {
          const { readEvolutionEnv, evolutionFetch, toJid } = await import("@/lib/evolution.server");
          const env = readEvolutionEnv();

          if (!env) {
            return corsResponse({ ok: false, error: "evolution_not_configured" }, 503);
          }

          const jid = toJid(number);
          const result = (await evolutionFetch(env, `/message/sendText/${encodeURIComponent(env.instance)}`, {
            method: "POST",
            body: JSON.stringify({ number: jid, text }),
          })) as { key?: { id?: string } } | null;

          return corsResponse({ ok: true, messageId: result?.key?.id || null });
        } catch (err) {
          return corsResponse({ ok: false, error: err instanceof Error ? err.message : "Falha ao enviar" }, 500);
        }
      },
    },
  },
});

function corsResponse(data: unknown, status = 200) {
  return new Response(data === null ? null : JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-bot-token",
    },
  });
}
