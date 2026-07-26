/**
 * NVIDIA AI — resolve o modelo de respostas a partir da configuracao do painel admin.
 *
 * Le a chave ativa em `nvidia_api_keys` e os defaults em `nvidia_settings`
 * (base_url, default_model, max_tokens_default, temperature_default).
 * Server-only: usa a service role do Supabase, nunca importe isto no cliente.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { SupabaseClient } from "@supabase/supabase-js";

const FALLBACK_BASE_URL = "https://integrate.api.nvidia.com/v1";
const FALLBACK_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct";
const FALLBACK_MAX_TOKENS = 4096;
const FALLBACK_TEMPERATURE = 0.7;

export type NvidiaConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
};

/** Configuracao NVIDIA salva pelo admin. Retorna null se nao houver chave ativa. */
export async function getNvidiaConfig(): Promise<NvidiaConfig | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as SupabaseClient;

  const [keysRes, settingsRes] = await Promise.all([
    db
      .from("nvidia_api_keys")
      .select("api_key")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1),
    db.from("nvidia_settings").select("key, value"),
  ]);

  const activeKey = keysRes.data?.[0]?.api_key as string | undefined;
  if (!activeKey) return null;

  const settings: Record<string, unknown> = {};
  for (const row of settingsRes.data ?? []) settings[row.key as string] = row.value;

  return {
    apiKey: activeKey,
    baseURL: (settings.base_url as string) || FALLBACK_BASE_URL,
    model: (settings.default_model as string) || FALLBACK_MODEL,
    maxTokens: Number(settings.max_tokens_default ?? FALLBACK_MAX_TOKENS),
    temperature: Number(settings.temperature_default ?? FALLBACK_TEMPERATURE),
  };
}

/** Provider OpenAI-compatible apontando para a API da NVIDIA. */
export function createNvidiaProvider(config: NvidiaConfig) {
  return createOpenAICompatible({
    name: "nvidia",
    baseURL: config.baseURL,
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
}

/**
 * Modelo usado por todas as respostas de IA do app.
 * A NVIDIA configurada no admin e a fonte primaria; o Lovable AI Gateway
 * fica apenas como rede de seguranca quando nao existe chave NVIDIA ativa.
 */
export async function resolveChatModel() {
  const config = await getNvidiaConfig();
  if (config) {
    return {
      provider: "nvidia" as const,
      model: createNvidiaProvider(config)(config.model),
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    };
  }

  const lovableKey = process.env.LOVABLE_API_KEY;
  if (lovableKey) {
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    return {
      provider: "lovable" as const,
      model: createLovableAiGatewayProvider(lovableKey)("google/gemini-3.6-flash"),
      temperature: FALLBACK_TEMPERATURE,
      maxTokens: FALLBACK_MAX_TOKENS,
    };
  }

  return null;
}

