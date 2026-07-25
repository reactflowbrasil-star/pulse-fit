/**
 * Bot Pulse Fit — resolve mensagens recebidas no WhatsApp e monta respostas.
 * Roda apenas server-side (importado pelo webhook).
 */

type SupabaseAdmin = typeof import("@/integrations/supabase/client.server")["supabaseAdmin"];

const bar = (pct: number) => {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const n = Math.round(clamped / 10);
  return "▰".repeat(n) + "▱".repeat(10 - n) + ` ${clamped}%`;
};

type Resumo = {
  usuario: string;
  passos: { atual: number; meta: number; pct: number };
  calorias: { atual: number; meta: number; pct: number };
  agua: { atual: number; meta: number; pct: number };
  ativo: { atual: number; meta: number; pct: number };
  distancia: { atual: number; meta: number; pct: number };
};

type Treino = { nome: string; distancia: number; quando: string };

function mockResumo(nome: string): Resumo {
  return {
    usuario: nome,
    passos: { atual: 11000, meta: 16000, pct: 69 },
    calorias: { atual: 440, meta: 680, pct: 65 },
    agua: { atual: 1.8, meta: 2.5, pct: 70 },
    ativo: { atual: 42, meta: 60, pct: 79 },
    distancia: { atual: 6.3, meta: 8, pct: 79 },
  };
}

async function fetchContexto(db: SupabaseAdmin, remoteJid: string): Promise<{ nome: string; treinos: Treino[]; resumo: Resumo }> {
  const phone = remoteJid.split("@")[0];
  let nome = "Atleta";
  let treinos: Treino[] = [];

  const { data: user } = await db
    .from("app_users")
    .select("user_id, full_name")
    .eq("whatsapp_number", phone)
    .maybeSingle();

  if (user?.full_name) nome = user.full_name.split(" ")[0];

  if (user?.user_id) {
    const { data: sessions } = await db
      .from("workout_sessions")
      .select("plan, duration_seconds, ended_at, created_at")
      .eq("user_id", user.user_id)
      .order("created_at", { ascending: false })
      .limit(3);
    if (sessions?.length) {
      treinos = sessions.map((s) => {
        const min = Math.round(((s.duration_seconds ?? 0) as number) / 60);
        const ts = (s.ended_at ?? s.created_at) as string | null;
        const quando = ts ? relTime(new Date(ts)) : "Recente";
        const plan = s.plan as { focus?: string; title?: string } | null;
        return {
          nome: plan?.focus ?? plan?.title ?? "Treino",
          distancia: Number((min / 10).toFixed(2)),
          quando,
        };
      });
    }
  }

  if (treinos.length === 0) {
    treinos = [
      { nome: "Caminhada Indoor", distancia: 2.44, quando: "Hoje" },
      { nome: "Corrida Matinal", distancia: 3.88, quando: "Hoje" },
    ];
  }

  return { nome, treinos, resumo: mockResumo(nome) };
}

function relTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Agora";
  if (h < 24) return `${h}h atrás`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Ontem";
  if (days < 7) return `${days}d atrás`;
  return d.toLocaleDateString("pt-BR");
}

function menu() {
  return [
    "🏋️ *Pulse Fit — Assistente*",
    "",
    "Escolha uma opção (envie o número ou a palavra):",
    "1️⃣ *resumo* — seu dia de hoje",
    "2️⃣ *passos* — meta de passos",
    "3️⃣ *agua* — hidratação",
    "4️⃣ *treinos* — treinos recentes",
    "5️⃣ *ajuda* — ver este menu",
  ].join("\n");
}

function resumoMsg(r: Resumo) {
  return [
    `📊 *Resumo de hoje — ${r.usuario}*`,
    "",
    `👟 Passos: ${r.passos.atual.toLocaleString("pt-BR")}/${r.passos.meta.toLocaleString("pt-BR")}`,
    bar(r.passos.pct),
    `🔥 Calorias: ${r.calorias.atual}/${r.calorias.meta} kcal`,
    bar(r.calorias.pct),
    `💧 Água: ${r.agua.atual}/${r.agua.meta} L`,
    bar(r.agua.pct),
    `⏱️ Ativo: ${r.ativo.atual}/${r.ativo.meta} min`,
    bar(r.ativo.pct),
  ].join("\n");
}

function passosMsg(r: Resumo) {
  const faltam = r.passos.meta - r.passos.atual;
  return `👟 Você fez *${r.passos.atual.toLocaleString("pt-BR")}* passos.\n${bar(r.passos.pct)}\nFaltam *${faltam.toLocaleString("pt-BR")}* para a meta! 💪`;
}

function aguaMsg(r: Resumo) {
  const faltam = (r.agua.meta - r.agua.atual).toFixed(1);
  return `💧 Hidratação: *${r.agua.atual}L* de ${r.agua.meta}L.\n${bar(r.agua.pct)}\nFaltam *${faltam}L*. Beba um copo agora! 🥤`;
}

function treinosMsg(list: Treino[]) {
  const linhas = list.map((x) => `• *${x.nome}* — ${x.distancia} km · ${x.quando}`);
  return ["🏃 *Treinos recentes*", "", ...linhas].join("\n");
}

export async function resolverBot(db: SupabaseAdmin, remoteJid: string, textoBruto: string | null): Promise<string> {
  const t = (textoBruto || "").trim().toLowerCase();
  const ctx = await fetchContexto(db, remoteJid);

  if (["1", "resumo", "hoje", "dia"].includes(t)) return resumoMsg(ctx.resumo);
  if (["2", "passos", "passo"].includes(t)) return passosMsg(ctx.resumo);
  if (["3", "agua", "água", "hidratacao", "hidratação"].includes(t)) return aguaMsg(ctx.resumo);
  if (["4", "treinos", "treino"].includes(t)) return treinosMsg(ctx.treinos);
  if (["5", "ajuda", "menu", "oi", "olá", "ola", "start", "bom dia", "boa tarde", "boa noite"].includes(t)) return menu();
  return `Não entendi 🤔\n\n${menu()}`;
}

/** Envia texto pela Evolution e registra no banco. */
export async function botReply(db: SupabaseAdmin, remoteJid: string, text: string) {
  const { readEvolutionEnv, evolutionFetch } = await import("./evolution.server");
  const env = await readEvolutionEnv();
  if (!env) {
    console.warn("[wa-bot] Evolution não configurada; resposta suprimida");
    return;
  }
  const { data: logRow } = await db
    .from("whatsapp_messages")
    .insert({
      direction: "outbound",
      remote_jid: remoteJid,
      content: text,
      status: "pending",
      template_name: "bot_auto_reply",
    })
    .select("id")
    .maybeSingle();

  try {
    const result = (await evolutionFetch(env, `/message/sendText/${encodeURIComponent(env.instance)}`, {
      method: "POST",
      body: JSON.stringify({ number: remoteJid, text }),
    })) as { key?: { id?: string }; messageId?: string } | null;

    const messageId =
      (result && typeof result === "object" && "key" in result && result.key?.id) ||
      (result as { messageId?: string })?.messageId ||
      null;

    if (logRow?.id) {
      await db
        .from("whatsapp_messages")
        .update({ status: "sent", message_id: messageId, raw: result as never })
        .eq("id", logRow.id);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erro";
    if (logRow?.id) {
      await db.from("whatsapp_messages").update({ status: "failed", error: msg }).eq("id", logRow.id);
    }
    console.error("[wa-bot] falha ao responder:", msg);
  }
}
