import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Gerenciamento seguro de credenciais WhatsApp (Evolution API).
 * Tudo roda server-side, chaves nunca chegam ao frontend.
 */

// ── Ler config (retorna status, nunca as chaves) ──
export const getWhatsAppConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Verifica se é admin
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return { ok: false as const, error: "Sem permissão" };

    const { data, error } = await supabase
      .from("whatsapp_config")
      .select("api_url, instance_name, webhook_token, updated_at")
      .eq("singleton", true)
      .maybeSingle();

    if (error) return { ok: false as const, error: error.message };

    return {
      ok: true as const,
      configured: Boolean(data?.api_url && data?.instance_name),
      apiUrl: data?.api_url ? maskUrl(data.api_url) : null,
      instanceName: data?.instance_name || null,
      webhookTokenSet: Boolean(data?.webhook_token),
      updatedAt: data?.updated_at || null,
    };
  });

// ── Salvar config ──
const configSchema = z.object({
  apiUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  apiKey: z.string().min(1, "API Key obrigatória").optional().or(z.literal("")),
  instanceName: z.string().min(1, "Nome da instância obrigatório").optional().or(z.literal("")),
  webhookToken: z.string().optional().or(z.literal("")),
});

export const saveWhatsAppConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => configSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verifica admin
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return { ok: false as const, error: "Sem permissão" };

    // Monta update só com campos preenchidos
    const update: Record<string, string | null> = {};
    if (data.apiUrl !== undefined) update.api_url = data.apiUrl || null;
    if (data.apiKey !== undefined) update.api_key = data.apiKey || null;
    if (data.instanceName !== undefined) update.instance_name = data.instanceName || null;
    if (data.webhookToken !== undefined) update.webhook_token = data.webhookToken || null;

    if (Object.keys(update).length === 0) {
      return { ok: false as const, error: "Nada para salvar" };
    }

    // Verifica se já existe registro singleton
    const { data: existing } = await supabase
      .from("whatsapp_config")
      .select("id")
      .eq("singleton", true)
      .maybeSingle();

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

    // Verifica admin
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return { ok: false as const, error: "Sem permissão" };

    // Lê credenciais (com api_key)
    const { data: config, error: cfgErr } = await supabase
      .from("whatsapp_config")
      .select("api_url, api_key, instance_name")
      .eq("singleton", true)
      .maybeSingle();

    if (cfgErr || !config?.api_url || !config?.api_key || !config?.instance_name) {
      return {
        ok: false as const,
        step: "config",
        error: "Credenciais não configuradas. Preencha URL, API Key e Instância.",
      };
    }

    const baseUrl = config.api_url.replace(/\/+$/, "");

    // Teste 1: Fetch connection state
    try {
      const res = await fetch(
        `${baseUrl}/instance/connectionState/${encodeURIComponent(config.instance_name)}`,
        {
          method: "GET",
          headers: { apikey: config.api_key },
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
          instanceName: config.instance_name,
          apiVersion: res.headers.get("x-powered-by") || null,
        };
      }

      // Se 401, a API key está errada
      if (res.status === 401) {
        return {
          ok: false as const,
          step: "auth",
          error: `API Key inválida (HTTP 401). Verifique a chave no painel da Evolution API.`,
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

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}${u.port ? ":" + u.port : ""}/**`;
  } catch {
    return url.slice(0, 30) + "...";
  }
}
