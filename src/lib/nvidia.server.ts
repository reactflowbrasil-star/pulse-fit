import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * NVIDIA NIM provider factory.
 * Le a chave ativa em nvidia_api_keys e os defaults em nvidia_settings
 * (base_url, default_model, max_tokens_default, temperature_default).
 * Nunca expor no browser.
 */

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

export type NvidiaOptions = { structuredOutputs?: boolean };

/** Aceita "0.7" e "0,7"; usa o fallback quando o valor nao e numerico. */
function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim().replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export async function getNvidiaConfig(): Promise<NvidiaConfig | null> {
  // As tabelas nvidia_* nao existem nos types gerados do Supabase.
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
  for (const row of settingsRes.data ?? []) {
    settings[(row as { key: string }).key] = (row as { value: unknown }).value;
  }

  return {
    apiKey: activeKey,
    baseURL: (settings.base_url as string) || FALLBACK_BASE_URL,
    model: (settings.default_model as string) || FALLBACK_MODEL,
    maxTokens: Math.trunc(toNumber(settings.max_tokens_default, FALLBACK_MAX_TOKENS)),
    temperature: toNumber(settings.temperature_default, FALLBACK_TEMPERATURE),
  };
}

export function createNvidiaProvider(
  config: NvidiaConfig,
  options?: NvidiaOptions,
) {
  return createOpenAICompatible({
    name: "nvidia",
    baseURL: config.baseURL,
    supportsStructuredOutputs: options?.structuredOutputs ?? false,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });
}

/**
 * Resolve o modelo de chat usado pelas respostas da IA.
 * A NVIDIA configurada no admin e a fonte primaria; o Lovable AI Gateway
 * fica apenas como fallback quando nenhuma chave NVIDIA esta ativa.
 */
export async function resolveChatModel(options?: NvidiaOptions) {
  const config = await getNvidiaConfig();
  if (config) {
    const provider = createNvidiaProvider(config, options);
    return {
      provider: "nvidia" as const,
      model: provider(config.model),
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    };
  }

  const lovableKey = process.env.LOVABLE_API_KEY;
  if (lovableKey) {
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    return {
      provider: "lovable" as const,
      model: createLovableAiGatewayProvider(lovableKey, options)(
        "google/gemini-3.6-flash",
      ),
      temperature: FALLBACK_TEMPERATURE,
      maxTokens: FALLBACK_MAX_TOKENS,
    };
  }

  return null;
}
