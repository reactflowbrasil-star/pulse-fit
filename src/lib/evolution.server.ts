/**
 * Cliente da Evolution API (WhatsApp) — usado apenas em código server-side.
 *
 * Leitura de credenciais (ordem de prioridade):
 *  1. Variáveis de ambiente (EVOLUTION_API_URL, etc.)
 *  2. Banco de dados (whatsapp_config table)
 */

export type EvolutionEnv = {
  apiUrl: string;
  apiKey: string;
  instance: string;
};

let _cachedConfig: EvolutionEnv | null = null;
let _cacheTs = 0;
const CACHE_TTL = 30_000;

function isReal(v: string | undefined): boolean {
  return Boolean(v && v !== "undefined" && v !== "null" && v.trim() !== "");
}

export async function readEvolutionEnv(): Promise<EvolutionEnv | null> {
  // 1. Variáveis de ambiente (prioridade)
  const envUrl = process.env.EVOLUTION_API_URL;
  const envKey = process.env.EVOLUTION_API_KEY;
  const envInstance = process.env.EVOLUTION_INSTANCE;
  if (isReal(envUrl) && isReal(envKey) && isReal(envInstance)) {
    return { apiUrl: envUrl!.replace(/\/+$/, ""), apiKey: envKey!, instance: envInstance! };
  }

  // 2. Cache
  if (_cachedConfig && Date.now() - _cacheTs < CACHE_TTL) {
    return _cachedConfig;
  }

  // 3. Banco de dados
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("whatsapp_config")
      .select("api_url, instance_name, webhook_token")
      .eq("singleton", true)
      .maybeSingle();

    if (data?.api_url && data?.instance_name) {
      const secrets = parseSecrets(data.webhook_token);
      if (secrets.apiKey) {
        const config: EvolutionEnv = {
          apiUrl: data.api_url.replace(/\/+$/, ""),
          apiKey: secrets.apiKey,
          instance: data.instance_name,
        };
        _cachedConfig = config;
        _cacheTs = Date.now();
        return config;
      }
    }
  } catch (err) {
    console.error("[evolution] falha ao ler config do banco:", err);
  }

  return null;
}

export async function evolutionFetch(
  env: EvolutionEnv,
  path: string,
  init: RequestInit = {},
  retries = 2,
) {
  const url = `${env.apiUrl}${path}`;
  const headers = new Headers(init.headers);
  headers.set("apikey", env.apiKey);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers });
      const text = await res.text();
      let json: unknown = null;
      try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
      if (!res.ok) {
        if (res.status >= 500 && attempt < retries) {
          await sleep(200 * (attempt + 1));
          continue;
        }
        throw new EvolutionError(
          `Evolution API ${res.status}: ${typeof json === "object" ? JSON.stringify(json) : text}`,
          res.status,
          json,
        );
      }
      return json;
    } catch (err) {
      lastError = err;
      if (err instanceof EvolutionError) throw err;
      if (attempt < retries) {
        await sleep(200 * (attempt + 1));
        continue;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Erro desconhecido na Evolution API");
}

export class EvolutionError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function toJid(phone: string): string {
  if (phone.includes("@")) return phone;
  let digits = phone.replace(/\D+/g, "");
  digits = digits.replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  return `${digits}@s.whatsapp.net`;
}

function parseSecrets(raw: string | null): { apiKey: string; webhookToken: string } {
  if (!raw) return { apiKey: "", webhookToken: "" };
  try {
    const parsed = JSON.parse(raw);
    return { apiKey: parsed.api_key || "", webhookToken: parsed.webhook_token || "" };
  } catch {
    return { apiKey: "", webhookToken: raw };
  }
}

export function friendlyEvolutionError(err: unknown): string {
  if (!(err instanceof EvolutionError)) {
    return err instanceof Error ? err.message : "Falha desconhecida";
  }
  const payload = err.payload as
    | { response?: { message?: Array<{ exists?: boolean; number?: string; jid?: string }> | string } }
    | null;
  const msg = payload?.response?.message;
  if (Array.isArray(msg)) {
    const notFound = msg.find((m) => m && m.exists === false);
    if (notFound) {
      const num = (notFound.number || notFound.jid || "").split("@")[0];
      return `O número ${num || "informado"} não possui WhatsApp ativo.`;
    }
    return msg.map((m) => (typeof m === "string" ? m : JSON.stringify(m))).join("; ");
  }
  if (typeof msg === "string") return msg;
  return err.message;
}

/**
 * Token compartilhado usado para autenticar o webhook publico da Evolution.
 * Ordem: 1) env WHATSAPP_WEBHOOK_TOKEN  2) whatsapp_config (painel admin)
 */
export async function readWebhookToken(): Promise<string | null> {
  const envToken = process.env.WHATSAPP_WEBHOOK_TOKEN;
  if (isReal(envToken)) return envToken!.trim();
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("whatsapp_config")
      .select("webhook_token")
      .eq("singleton", true)
      .maybeSingle();
    const secrets = parseSecrets(data?.webhook_token ?? null);
    return secrets.webhookToken || null;
  } catch (err) {
    console.error("[evolution] falha ao ler webhook token:", err);
    return null;
  }
}

/** Limpa o cache de credenciais (usar apos salvar no painel admin). */
export function clearEvolutionCache(): void {
  _cachedConfig = null;
  _cacheTs = 0;
}
