import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Server functions do módulo WhatsApp / Evolution API.
 * Todas rodam no servidor (Cloudflare Worker) e usam service_role via supabaseAdmin.
 */

const sendSchema = z.object({
  phone: z.string().min(8, "Telefone inválido").max(32),
  message: z.string().min(1).max(4000),
  templateName: z.string().max(64).optional(),
});

export const sendWhatsappMessage = createServerFn({ method: "POST" })
  .inputValidator((input) => sendSchema.parse(input))
  .handler(async ({ data }) => {
    const [{ readEvolutionEnv, evolutionFetch, toJid, EvolutionError }, { supabaseAdmin }] =
      await Promise.all([
        import("./evolution.server"),
        import("@/integrations/supabase/client.server"),
      ]);

    const env = readEvolutionEnv();
    if (!env) {
      return {
        ok: false as const,
        error: "Configuração da Evolution API ausente. Defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE.",
      };
    }

    const jid = toJid(data.phone);

    const { data: logRow } = await supabaseAdmin
      .from("whatsapp_messages")
      .insert({
        direction: "outbound",
        remote_jid: jid,
        content: data.message,
        template_name: data.templateName ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    try {
      const result = (await evolutionFetch(env, `/message/sendText/${encodeURIComponent(env.instance)}`, {
        method: "POST",
        body: JSON.stringify({
          number: jid,
          text: data.message,
        }),
      })) as { key?: { id?: string }; messageId?: string } | null;

      const messageId =
        (result && typeof result === "object" && "key" in result && result.key?.id) ||
        (result as { messageId?: string })?.messageId ||
        null;

      if (logRow?.id) {
        await supabaseAdmin
          .from("whatsapp_messages")
          .update({ status: "sent", message_id: messageId, raw: result as never })
          .eq("id", logRow.id);
      }

      await supabaseAdmin
        .from("whatsapp_sessions")
        .upsert(
          { remote_jid: jid, last_message_at: new Date().toISOString() },
          { onConflict: "remote_jid" },
        );

      return { ok: true as const, messageId };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha desconhecida";
      const status = err instanceof EvolutionError ? err.status : 0;
      if (logRow?.id) {
        await supabaseAdmin
          .from("whatsapp_messages")
          .update({ status: "failed", error: `[${status}] ${message}` })
          .eq("id", logRow.id);
      }
      console.error("[whatsapp.send] falha:", message);
      return { ok: false as const, error: message };
    }
  });

export const listWhatsappMessages = createServerFn({ method: "GET" })
  .inputValidator((input: { jid?: string; limit?: number } = {}) =>
    z.object({ jid: z.string().optional(), limit: z.number().int().min(1).max(200).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("whatsapp_messages")
      .select("id, direction, remote_jid, content, media_type, status, error, template_name, message_id, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (data.jid) q = q.eq("remote_jid", data.jid);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listWhatsappSessions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("whatsapp_sessions")
    .select("id, remote_jid, display_name, context, last_message_at, updated_at")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getWhatsappStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { readEvolutionEnv, evolutionFetch } = await import("./evolution.server");
  const env = readEvolutionEnv();
  const webhookTokenSet = Boolean(process.env.WHATSAPP_WEBHOOK_TOKEN);
  if (!env) {
    return {
      configured: false as const,
      webhookTokenSet,
      instance: null,
      state: null,
      error: "Configuração ausente",
    };
  }
  try {
    const info = (await evolutionFetch(env, `/instance/connectionState/${encodeURIComponent(env.instance)}`, {
      method: "GET",
    })) as { instance?: { state?: string } } | null;
    return {
      configured: true as const,
      webhookTokenSet,
      instance: env.instance,
      state: info?.instance?.state ?? "unknown",
      error: null,
    };
  } catch (err) {
    return {
      configured: true as const,
      webhookTokenSet,
      instance: env.instance,
      state: null,
      error: err instanceof Error ? err.message : "Falha ao consultar instância",
    };
  }
});
