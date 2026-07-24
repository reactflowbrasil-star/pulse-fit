import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Retorna o perfil autenticado + papéis. */
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("app_users").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      userId,
      profile,
      roles: (roles ?? []).map((r) => r.role),
      isAdmin: (roles ?? []).some((r) => r.role === "admin"),
    };
  });

/** Gera código de 6 dígitos e envia via WhatsApp. */
export const requestWhatsappVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ phone: z.string().min(8).max(32) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const [{ readEvolutionEnv, evolutionFetch, toJid, friendlyEvolutionError }, { supabaseAdmin }] =
      await Promise.all([
        import("./evolution.server"),
        import("@/integrations/supabase/client.server"),
      ]);

    const env = readEvolutionEnv();
    if (!env) return { ok: false as const, error: "Configuração da Evolution API ausente." };

    const jid = toJid(data.phone);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

    const { error: upErr } = await supabaseAdmin
      .from("app_users")
      .update({
        whatsapp_number: jid,
        whatsapp_code: code,
        whatsapp_code_expires_at: expiresAt,
        whatsapp_verified: false,
      })
      .eq("user_id", userId);
    if (upErr) return { ok: false as const, error: upErr.message };

    try {
      await evolutionFetch(env, `/message/sendText/${encodeURIComponent(env.instance)}`, {
        method: "POST",
        body: JSON.stringify({
          number: jid,
          text: `🔐 Pulse Fit\nSeu código de confirmação é: *${code}*\nExpira em 10 minutos.`,
        }),
      });
      await supabaseAdmin.from("whatsapp_messages").insert({
        direction: "outbound",
        remote_jid: jid,
        content: `Código de verificação enviado (${code.slice(0, 2)}****)`,
        template_name: "verificacao",
        status: "sent",
      });
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: friendlyEvolutionError(err) };
    }
  });

/** Confirma o código e marca o WhatsApp como verificado; envia boas-vindas. */
export const confirmWhatsappVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ code: z.string().length(6) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const [{ readEvolutionEnv, evolutionFetch }, { supabaseAdmin }] = await Promise.all([
      import("./evolution.server"),
      import("@/integrations/supabase/client.server"),
    ]);

    const { data: row } = await supabaseAdmin
      .from("app_users")
      .select("whatsapp_code, whatsapp_code_expires_at, whatsapp_number, full_name")
      .eq("user_id", userId)
      .maybeSingle();
    if (!row?.whatsapp_code || !row.whatsapp_number) {
      return { ok: false as const, error: "Solicite um novo código." };
    }
    if (row.whatsapp_code_expires_at && new Date(row.whatsapp_code_expires_at) < new Date()) {
      return { ok: false as const, error: "Código expirado. Solicite um novo." };
    }
    if (row.whatsapp_code !== data.code) {
      return { ok: false as const, error: "Código inválido." };
    }

    await supabaseAdmin
      .from("app_users")
      .update({ whatsapp_verified: true, whatsapp_code: null, whatsapp_code_expires_at: null })
      .eq("user_id", userId);

    const env = readEvolutionEnv();
    if (env) {
      const nome = row.full_name?.split(" ")[0] ?? "aluno";
      try {
        await evolutionFetch(env, `/message/sendText/${encodeURIComponent(env.instance)}`, {
          method: "POST",
          body: JSON.stringify({
            number: row.whatsapp_number,
            text: `✅ Tudo certo, ${nome}!\nSeu WhatsApp foi verificado no Pulse Fit. A partir de agora vou te enviar lembretes de treino, dicas e motivação por aqui. 💪`,
          }),
        });
        await supabaseAdmin.from("whatsapp_messages").insert({
          direction: "outbound",
          remote_jid: row.whatsapp_number,
          content: "Boas-vindas pós-verificação",
          template_name: "boas-vindas",
          status: "sent",
        });
        await supabaseAdmin
          .from("whatsapp_sessions")
          .upsert(
            { remote_jid: row.whatsapp_number, display_name: row.full_name, last_message_at: new Date().toISOString() },
            { onConflict: "remote_jid" },
          );
      } catch {
        /* segue mesmo se envio falhar */
      }
    }
    return { ok: true as const };
  });

/* ============== ADMIN ============== */

async function assertAdmin(supabase: import("@supabase/supabase-js").SupabaseClient, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Acesso restrito a administradores.");
}

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: users }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("app_users")
        .select("user_id, email, full_name, avatar_url, whatsapp_number, whatsapp_verified, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    const rolesByUser = new Map<string, string[]>();
    (roles ?? []).forEach((r) => {
      const cur = rolesByUser.get(r.user_id) ?? [];
      cur.push(r.role);
      rolesByUser.set(r.user_id, cur);
    });
    return (users ?? []).map((u) => ({ ...u, roles: rolesByUser.get(u.user_id) ?? [] }));
  });

export const adminSendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), message: z.string().min(1).max(4000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [{ readEvolutionEnv, evolutionFetch, friendlyEvolutionError }, { supabaseAdmin }] =
      await Promise.all([
        import("./evolution.server"),
        import("@/integrations/supabase/client.server"),
      ]);
    const env = readEvolutionEnv();
    if (!env) return { ok: false as const, error: "Evolution API não configurada." };

    const { data: target } = await supabaseAdmin
      .from("app_users")
      .select("whatsapp_number, whatsapp_verified")
      .eq("user_id", data.userId)
      .maybeSingle();
    if (!target?.whatsapp_number || !target.whatsapp_verified) {
      return { ok: false as const, error: "Usuário sem WhatsApp verificado." };
    }
    try {
      await evolutionFetch(env, `/message/sendText/${encodeURIComponent(env.instance)}`, {
        method: "POST",
        body: JSON.stringify({ number: target.whatsapp_number, text: data.message }),
      });
      await supabaseAdmin.from("whatsapp_messages").insert({
        direction: "outbound",
        remote_jid: target.whatsapp_number,
        content: data.message,
        template_name: "admin-direct",
        status: "sent",
      });
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: friendlyEvolutionError(err) };
    }
  });

export const adminBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ message: z.string().min(1).max(4000) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [{ readEvolutionEnv, evolutionFetch }, { supabaseAdmin }] = await Promise.all([
      import("./evolution.server"),
      import("@/integrations/supabase/client.server"),
    ]);
    const env = readEvolutionEnv();
    if (!env) return { ok: false as const, error: "Evolution API não configurada.", sent: 0, failed: 0 };

    const { data: targets } = await supabaseAdmin
      .from("app_users")
      .select("whatsapp_number")
      .eq("whatsapp_verified", true);

    let sent = 0;
    let failed = 0;
    for (const t of targets ?? []) {
      if (!t.whatsapp_number) continue;
      try {
        await evolutionFetch(env, `/message/sendText/${encodeURIComponent(env.instance)}`, {
          method: "POST",
          body: JSON.stringify({ number: t.whatsapp_number, text: data.message }),
        });
        await supabaseAdmin.from("whatsapp_messages").insert({
          direction: "outbound",
          remote_jid: t.whatsapp_number,
          content: data.message,
          template_name: "broadcast",
          status: "sent",
        });
        sent++;
      } catch {
        failed++;
      }
    }
    return { ok: true as const, sent, failed };
  });
