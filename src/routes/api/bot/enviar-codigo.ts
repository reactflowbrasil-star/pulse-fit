import { createFileRoute } from "@tanstack/react-router";

/**
 * Rota para enviar código de verificação via WhatsApp.
 * Chamada por wa-link.functions.ts (server-side).
 * POST /api/bot/enviar-codigo
 * Body: { whatsapp: string, codigo: string }
 */
export const Route = createFileRoute("/api/bot/enviar-codigo")({
  server: {
    handlers: {
      OPTIONS: async () => corsResponse(null, 204),
      POST: async ({ request }) => {
        // Auth check
        const BOT_TOKEN = process.env.BOT_TOKEN;
        if (BOT_TOKEN) {
          const auth = request.headers.get("authorization") || "";
          const xToken = request.headers.get("x-bot-token") || "";
          const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
          if (bearer !== BOT_TOKEN && xToken !== BOT_TOKEN) {
            return corsResponse({ ok: false, error: "unauthorized" }, 401);
          }
        }

        let body: { whatsapp?: string; codigo?: string } = {};
        try {
          body = await request.json();
        } catch {
          return corsResponse({ ok: false, error: "invalid_json" }, 400);
        }

        const { whatsapp, codigo } = body;
        if (!whatsapp || !codigo) {
          return corsResponse({ ok: false, error: "missing_fields", message: "Envie whatsapp e codigo" }, 400);
        }

        try {
          const { readEvolutionEnv, evolutionFetch, toJid } = await import("@/lib/evolution.server");
          const env = readEvolutionEnv();

          if (!env) {
            return corsResponse({
              ok: false,
              error: "evolution_not_configured",
              message: "Evolution API não configurada. Defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE.",
            }, 503);
          }

          const jid = toJid(whatsapp);

          // Enviar mensagem de verificação
          await evolutionFetch(env, `/message/sendText/${encodeURIComponent(env.instance)}`, {
            method: "POST",
            body: JSON.stringify({
              number: jid,
              text: `🔐 *Código de verificação Pulse Fit*\n\nSeu código é: *${codigo}*\n\nEste código expira em 10 minutos.\nNão compartilhe com ninguém.`,
            }),
          });

          // Log no Supabase
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin.from("whatsapp_messages").insert({
              direction: "outbound",
              remote_jid: jid,
              content: "Código de verificação enviado",
              template_name: "verification_code",
              status: "sent",
            });
          } catch (logErr) {
            console.error("[api/bot/enviar-codigo] falha ao logar:", logErr);
          }

          return corsResponse({ ok: true, message: "Código enviado" });
        } catch (err) {
          console.error("[api/bot/enviar-codigo] falha:", err);
          return corsResponse({
            ok: false,
            error: "send_failed",
            message: err instanceof Error ? err.message : "Falha ao enviar código",
          }, 500);
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
