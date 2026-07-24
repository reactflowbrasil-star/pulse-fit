import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Vinculação de WhatsApp via bot externo.
 * Secrets (server-only): BOT_URL, BOT_TOKEN.
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
    const BOT_URL = process.env.BOT_URL;
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_URL || !BOT_TOKEN) {
      console.error("[wa-link] BOT_URL/BOT_TOKEN ausentes");
      return { ok: false as const, error: "Bot não configurado. Contate o administrador." };
    }

    const { supabase, userId } = context;
    const codigo = gerarCodigo();
    const expiraEm = new Date(Date.now() + 10 * 60_000).toISOString();

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

    try {
      const url = BOT_URL.replace(/\/$/, "") + "/enviar-codigo";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BOT_TOKEN}`,
        },
        body: JSON.stringify({ whatsapp: data.whatsapp, codigo }),
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

    // NUNCA devolver o código ao cliente.
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

    // Atualiza profiles (schema oficial da spec).
    const { error: upProfileErr } = await supabase
      .from("profiles")
      .update({ whatsapp: data.whatsapp, whatsapp_verificado: true })
      .eq("id", userId);
    if (upProfileErr) {
      console.error("[wa-link] update profiles falhou:", upProfileErr.message);
      return { ok: false as const, error: "Não foi possível salvar o WhatsApp no perfil." };
    }

    // Compat: mantém app_users em sincronia (usado em várias telas do app).
    await supabase
      .from("app_users")
      .update({ whatsapp_number: data.whatsapp, whatsapp_verified: true })
      .eq("user_id", userId);

    return { ok: true as const };
  });
