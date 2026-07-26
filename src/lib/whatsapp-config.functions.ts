import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Gerenciamento seguro de credenciais WhatsApp (Evolution API).
 * Tudo roda server-side, chaves nunca chegam ao frontend.
 *
 * Armazena em whatsapp_config usando webhook_token como campo JSON
 * que guarda { api_key, webhook_token } de forma segura.
 * Quando a coluna api_key existir, migra automaticamente.
 */

type ConfigRow = {
  id: string;
  api_url: string | null;
  instance_name: string | null;
  webhook_token: string | null;
  updated_at: string | null;
};

// ── Helpers ──

function parseSecrets(raw: string | null): { apiKey: string; webhookToken: string } {
  if (!raw) return { apiKey: "", webhookToken: "" };
  try {
    const parsed = JSON.parse(raw);
    return { apiKey: parsed.api_key || "", webhookToken: parsed.webhook_token || "" };
  } catch {
    // Legacy: era só o webhook token puro
    return { apiKey: "", webhookToken: raw };
  }
}

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}${u.port ? ":" + u.port : ""}/**`;
  } catch {
    return url.slice(0, 30) + "...";
  }
}

// ── Ler config (retorna status, nunca as chaves) ──
export const getWhatsAppConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return { ok: false as const, error: "Sem permissão" };

    const { data, error } = await supabase
      .from("whatsapp_config")
      .select("id, api_url, instance_name, webhook_token, updated_at")
      .eq("singleton", true)
      .maybeSingle();

    if (error) return { ok: false as const, error: error.message };

    const secrets = parseSecrets(data?.webhook_token ?? null);

    return {
      ok: true as const,
      configured: Boolean(data?.api_url && data?.instance_name),
      apiUrl: data?.api_url ? maskUrl(data.api_url) : null,
      instanceName: data?.instance_name || null,
      apiKeySet: Boolean(secrets.apiKey),
      webhookTokenSet: Boolean(secrets.webhookToken),
      updatedAt: data?.updated_at || null,
    };
  });

// ── Salvar config ──
const configSchema = z.object({
  apiUrl: z.string().optional().or(z.literal("")),
  apiKey: z.string().optional().or(z.literal("")),
  instanceName: z.string().optional().or(z.literal("")),
  webhookToken: z.string().optional().or(z.literal("")),
});

export const saveWhatsAppConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => configSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return { ok: false as const, error: "Sem permissão" };

    // Lê config atual para merge
    const { data: existing } = await supabase
      .from("whatsapp_config")
      .select("id, api_url, instance_name, webhook_token")
      .eq("singleton", true)
      .maybeSingle();

    const currentSecrets = parseSecrets(existing?.webhook_token ?? null);

    // Merge dos novos dados com os existentes
    const newApiKey = data.apiKey !== undefined && data.apiKey !== "" ? data.apiKey : currentSecrets.apiKey;
    const newWebhookToken = data.webhookToken !== undefined && data.webhookToken !== "" ? data.webhookToken : currentSecrets.webhookToken;

    const update: Record<string, string | null> = {};
    if (data.apiUrl !== undefined) update.api_url = data.apiUrl || null;
    if (data.instanceName !== undefined) update.instance_name = data.instanceName || null;

    // Armazena secrets como JSON no webhook_token (campo existente, seguro via RLS)
    if (data.apiKey !== undefined || data.webhookToken !== undefined) {
      update.webhook_token = JSON.stringify({
        api_key: newApiKey,
        webhook_token: newWebhookToken,
      });
    }

    if (Object.keys(update).length === 0) {
      return { ok: false as const, error: "Nada para salvar" };
    }

    if (existing?.id) {
      const { error } = await supabase
        .from("whatsapp_config")
        .update(update)
        .eq("id", existing.id);
      if (error) return { ok: false as const, error: error.message };
    } else {
      const { error } = await supabase
        .from("whatsapp_config")
        .insert({ ...update, singleton: true });
      if (error) return { ok: false as const, error: error.message };
    }

    return { ok: true as const, message: "Configuração salva" };
  });

// ── Testar conexão ──
export const testWhatsAppConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return { ok: false as const, error: "Sem permissão" };

    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("api_url, instance_name, webhook_token")
      .eq("singleton", true)
      .maybeSingle();

    const secrets = parseSecrets(config?.webhook_token ?? null);

    // Tenta usar api_key da coluna direta, senão usa do JSON
    const apiKey = (config as Record<string, unknown>)?.api_key as string | undefined || secrets.apiKey;
    const apiUrl = config?.api_url;
    const instanceName = config?.instance_name;

    if (!apiUrl || !apiKey || !instanceName) {
      return {
        ok: false as const,
        step: "config",
        error: !apiUrl
          ? "API URL não configurada."
          : !apiKey
            ? "API Key não configurada."
            : "Nome da instância não configurado.",
      };
    }

    const baseUrl = apiUrl.replace(/\/+$/, "");

    try {
      const res = await fetch(
        `${baseUrl}/instance/connectionState/${encodeURIComponent(instanceName)}`,
        {
          method: "GET",
          headers: { apikey: apiKey },
          signal: AbortSignal.timeout(10000),
        }
      );
      const text = await res.text();
      let json: Record<string, unknown> = {};
      try { json = text ? JSON.parse(text) : {}; } catch { /* not json */ }

      if (res.ok) {
        const state = (json as { instance?: { state?: string } })?.instance?.state ?? "unknown";
        return {
          ok: true as const,
          step: "connection",
          connectionState: state,
          instanceName,
          error: null,
        };
      }

      if (res.status === 401) {
        return {
          ok: false as const,
          step: "auth",
          error: "API Key inválida (HTTP 401). Verifique a chave no painel da Evolution API.",
          status: res.status,
        };
      }

      return {
        ok: false as const,
        step: "connection",
        error: `Evolution API retornou HTTP ${res.status}: ${text.slice(0, 200)}`,
        status: res.status,
      };
    } catch (err) {
      return {
        ok: false as const,
        step: "network",
        error: `Falha de rede: ${err instanceof Error ? err.message : "timeout ou DNS"}`,
      };
    }
  });

// ══════════════════════════════════════════════════════════════
// Webhook em tempo real (Evolution API  ->  app Pulse Fit)
// ══════════════════════════════════════════════════════════════

const EVOLUTION_WEBHOOK_EVENTS = [
  "MESSAGES_UPSERT",
  "MESSAGES_UPDATE",
  "CONNECTION_UPDATE",
];

const WEBHOOK_PATH = "/api/public/whatsapp/webhook";

function maskToken(url: string): string {
  return url.replace(/token=[^&]+/i, "token=***");
}

// ── Consultar o webhook atual da instancia ──
export const getEvolutionWebhook = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return { ok: false as const, error: "Sem permissao" };

    const { readEvolutionEnv, evolutionFetch } = await import("./evolution.server");
    const env = await readEvolutionEnv();
    if (!env) return { ok: false as const, error: "Evolution API nao configurada." };

    try {
      const info = (await evolutionFetch(
        env,
        `/webhook/find/${encodeURIComponent(env.instance)}`,
        { method: "GET" },
      )) as Record<string, unknown> | null;

      const raw = ((info?.webhook as Record<string, unknown>) ?? info ?? {}) as Record<string, unknown>;
      const url = typeof raw.url === "string" ? raw.url : "";
      const enabled = Boolean(raw.enabled ?? raw.webhook_enabled ?? url);
      const events = Array.isArray(raw.events) ? (raw.events as string[]) : [];

      return {
        ok: true as const,
        instance: env.instance,
        enabled,
        url: url ? maskToken(url) : null,
        events,
      };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao consultar o webhook",
      };
    }
  });

// ── Registrar o webhook do app na Evolution API ──
export const setEvolutionWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { origin: string }) =>
    z.object({ origin: z.string().url() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return { ok: false as const, error: "Sem permissao" };

    const { readEvolutionEnv, readWebhookToken, evolutionFetch } = await import("./evolution.server");
    const env = await readEvolutionEnv();
    if (!env) return { ok: false as const, error: "Evolution API nao configurada." };

    const token = await readWebhookToken();
    if (!token) {
      return {
        ok: false as const,
        error: "Webhook Token ausente. Salve um Webhook Token no formulario acima e tente de novo.",
      };
    }

    const origin = data.origin.replace(/\/+$/, "");
    const url = `${origin}${WEBHOOK_PATH}?token=${encodeURIComponent(token)}`;
    const path = `/webhook/set/${encodeURIComponent(env.instance)}`;

    const payloadV2 = {
      webhook: {
        enabled: true,
        url,
        headers: { "Content-Type": "application/json", "x-evolution-token": token },
        byEvents: false,
        base64: false,
        events: EVOLUTION_WEBHOOK_EVENTS,
      },
    };

    const payloadV1 = {
      enabled: true,
      url,
      webhook_by_events: false,
      webhook_base64: false,
      events: EVOLUTION_WEBHOOK_EVENTS,
    };

    try {
      await evolutionFetch(env, path, { method: "POST", body: JSON.stringify(payloadV2) });
      return { ok: true as const, url: maskToken(url), events: EVOLUTION_WEBHOOK_EVENTS };
    } catch (errV2) {
      try {
        await evolutionFetch(env, path, { method: "POST", body: JSON.stringify(payloadV1) });
        return { ok: true as const, url: maskToken(url), events: EVOLUTION_WEBHOOK_EVENTS };
      } catch (errV1) {
        const m2 = errV2 instanceof Error ? errV2.message : "erro";
        const m1 = errV1 instanceof Error ? errV1.message : "erro";
        return { ok: false as const, error: `Falha ao configurar o webhook. v2: ${m2} | v1: ${m1}` };
      }
    }
  });
