/**
 * Cliente da Evolution API (WhatsApp) — usado apenas em código server-side.
 * Faz chamadas HTTP à instância configurada com tratamento de erro e retries simples.
 */

export type EvolutionEnv = {
  apiUrl: string;
  apiKey: string;
  instance: string;
};

export function readEvolutionEnv(): EvolutionEnv | null {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  if (!apiUrl || !apiKey || !instance) return null;
  return { apiUrl: apiUrl.replace(/\/+$/, ""), apiKey, instance };
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
        // Só faz retry em 5xx / rede
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

/** Normaliza um número BR para o JID esperado pela Evolution. */
export function toJid(phone: string): string {
  if (phone.includes("@")) return phone;
  const digits = phone.replace(/\D+/g, "");
  return `${digits}@s.whatsapp.net`;
}
