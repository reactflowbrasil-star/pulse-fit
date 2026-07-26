import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Vinculação de WhatsApp — envio e verificação de código.
 * Usa Evolution API diretamente (sem dependência de bot externo).
 */

const whatsappSchema = z
  .string()
  .trim()
  .regex(/^\d{10,15}$/, "WhatsApp inválido. Use formato internacional, só dígitos (ex: 5562999999999).");

const codigoSchema = z.string().trim().regex(/^\d{6}$/, "Código deve ter 6 dígitos.");

function gerarCodigo(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// --------- enviar-codigo-whatsapp ---------
export const enviarCodigoWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { whatsapp: string }) =>
    z.object({ whatsapp: whatsappSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const codigo = gerarCodigo();
    const expiraEm = new Date(Date.now() + 10 * 60_000).toISOString();

    // 1. Salvar código no banco
    const { error: insErr } = await supabase.from("whatsapp_verifications").insert({
      user_id: userId,
      whatsapp: data.whatsapp,
      codigo,
      expira_em: expiraEm,
    });
    if (insErr) {
      console.error("[wa-link] insert falhou:", insErr.message);
      return { ok: false as const, error: "Falha ao registrar código. Tente novamente." };
    }

    // 2. Tentar enviar via Evolution API (prioridade)
    try {
      const { readEvolutionEnv, evolutionFetch, toJid } = await import("./evolution.server");
      const env = await readEvolutionEnv();
      if (env) {
        const jid = toJid(data.whatsapp);
        await evolutionFetch(env, `/message/sendText/${encodeURIComponent(env.instance)}`, {
          method: "POST",
          body: JSON.stringify({
            number: jid,
            text: `🔐 *Código de verificação Pulse Fit*\n\nSeu código é: *${codigo}*\n\nEste código expira em 10 minutos.\nNão compartilhe com ninguém.`,
          }),
        });

        // Log
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("whatsapp_messages").insert({
          direction: "outbound",
          remote_jid: jid,
          content: "Código de verificação enviado",
          template_name: "verification_code",
          status: "sent",
        });

        return { ok: true as const, expira_em: expiraEm };
      }
    } catch (evoErr) {
      console.warn("[wa-link] Evolution API falhou, tentando bot externo:", evoErr);
    }

    // 3. Fallback: bot externo
    const BOT_URL = process.env.BOT_URL;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!BOT_URL) {
      console.error("[wa-link] Sem Evolution API e sem BOT_URL");
      return { ok: false as const, error: "Serviço de envio indisponível. Contate o administrador." };
    }

    try {
      const url = BOT_URL.replace(/\/$/, "") + "/enviar-codigo";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BOT_TOKEN || ""}`,
        },
        body: JSON.stringify({ whatsapp: data.whatsapp, codigo }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("[wa-link] bot respondeu", res.status, body);
        return { ok: false as const, error: "Não foi possível enviar o código pelo WhatsApp." };
      }
    } catch (err) {
      console.error("[wa-link] fetch bot falhou:", err);
      return { ok: false as const, error: "Bot indisponível. Tente novamente em instantes." };
    }

    return { ok: true as const, expira_em: expiraEm };
  });

// --------- verificar-codigo-whatsapp ---------
export const verificarCodigoWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { whatsapp: string; codigo: string }) =>
    z.object({ whatsapp: whatsappSchema, codigo: codigoSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: rows, error } = await supabase
      .from("whatsapp_verifications")
      .select("id, codigo, expira_em, usado")
      .eq("user_id", userId)
      .eq("whatsapp", data.whatsapp)
      .eq("codigo", data.codigo)
      .eq("usado", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[wa-link] busca falhou:", error.message);
      return { ok: false as const, error: "Código inválido ou expirado" };
    }
    const row = rows?.[0];
    if (!row || new Date(row.expira_em).getTime() < Date.now()) {
      return { ok: false as const, error: "Código inválido ou expirado" };
    }

    const { error: upVerErr } = await supabase
      .from("whatsapp_verifications")
      .update({ usado: true })
      .eq("id", row.id);
    if (upVerErr) {
      console.error("[wa-link] update verif falhou:", upVerErr.message);
      return { ok: false as const, error: "Erro ao confirmar o código." };
    }

    // Atualiza app_users
    const { error: upAppUserErr } = await supabase
      .from("app_users")
      .update({ whatsapp_number: data.whatsapp, whatsapp_verified: true })
      .eq("user_id", userId);
    if (upAppUserErr) {
      console.error("[wa-link] update app_users falhou:", upAppUserErr.message);
      return { ok: false as const, error: "Não foi possível salvar o WhatsApp no perfil." };
    }

    // Compat: mantém profiles em sincronia
    await supabase
      .from("profiles")
      .update({ whatsapp: data.whatsapp, whatsapp_verificado: true })
      .eq("user_id", userId);

    return { ok: true as const };
  });
