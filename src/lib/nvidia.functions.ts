import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Tabelas nvidia_* não existem nos types gerados do Supabase.
const asDb = (client: unknown) => client as SupabaseClient;

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";

// ─── API Key Management ────────────────────────────────────

export const listNvidiaApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = asDb(context.supabase);
    const { data, error } = await supabase
      .from("nvidia_api_keys")
      .select("id, name, is_active, last_validated_at, last_validation_ok, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const createNvidiaApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().min(1), api_key: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = asDb(context.supabase);
    const { data: row, error } = await supabase
      .from("nvidia_api_keys")
      .insert({ name: data.name, api_key: data.api_key })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteNvidiaApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = asDb(context.supabase);
    const { error } = await supabase.from("nvidia_api_keys").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const toggleNvidiaApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = asDb(context.supabase);
    const { error } = await supabase
      .from("nvidia_api_keys")
      .update({ is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ─── API Validation ────────────────────────────────────────

export const validateNvidiaApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = asDb(context.supabase);
    const { data: key } = await supabase
      .from("nvidia_api_keys")
      .select("api_key")
      .eq("id", data.id)
      .single();
    if (!key) throw new Error("Key not found");

    try {
      const res = await fetch(`${NVIDIA_BASE}/models`, {
        headers: { Authorization: `Bearer ${key.api_key}` },
      });
      const ok = res.ok;
      await supabase
        .from("nvidia_api_keys")
        .update({ last_validated_at: new Date().toISOString(), last_validation_ok: ok })
        .eq("id", data.id);
      return { ok, status: res.status };
    } catch {
      await supabase
        .from("nvidia_api_keys")
        .update({ last_validated_at: new Date().toISOString(), last_validation_ok: false })
        .eq("id", data.id);
      return { ok: false, status: 0 };
    }
  });

// ─── Models ────────────────────────────────────────────────

export const listNvidiaModels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = asDb(context.supabase);
    const { data, error } = await supabase
      .from("nvidia_models")
      .select("*")
      .order("category")
      .order("display_name");
    if (error) throw error;
    return data;
  });

export const toggleNvidiaModel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), is_enabled: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = asDb(context.supabase);
    const { error } = await supabase
      .from("nvidia_models")
      .update({ is_enabled: data.is_enabled })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const fetchNvidiaRemoteModels = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = asDb(context.supabase);
    const { data: keys } = await supabase
      .from("nvidia_api_keys")
      .select("api_key")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!keys?.length) throw new Error("No active API key");

    const res = await fetch(`${NVIDIA_BASE}/models`, {
      headers: { Authorization: `Bearer ${keys[0].api_key}` },
    });
    if (!res.ok) throw new Error(`NVIDIA API error: ${res.status}`);
    const body = await res.json();
    return body.data ?? [];
  });

// ─── Settings ──────────────────────────────────────────────

export const getNvidiaSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = asDb(context.supabase);
    const { data, error } = await supabase.from("nvidia_settings").select("*");
    if (error) throw error;
    const settings: Record<string, string> = {};
    for (const row of data ?? []) settings[row.key] = row.value;
    return settings;
  });

export const updateNvidiaSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ key: z.string(), value: z.any() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabase = asDb(context.supabase);
    const { error } = await supabase
      .from("nvidia_settings")
      .upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  });

// ─── Chat Completion ───────────────────────────────────────

export const nvidiaChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        model: z.string().optional(),
        messages: z.array(z.object({ role: z.string(), content: z.string() })),
        max_tokens: z.number().optional(),
        temperature: z.number().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = asDb(context.supabase);

    const [keysRes, settingsRes] = await Promise.all([
      supabase
        .from("nvidia_api_keys")
        .select("api_key")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase.from("nvidia_settings").select("*"),
    ]);

    const key = keysRes.data?.[0]?.api_key;
    if (!key) throw new Error("No active NVIDIA API key configured");

    const settings: Record<string, string> = {};
    for (const row of settingsRes.data ?? []) settings[row.key] = row.value;

    const model =
      data.model ?? (settings.default_model as string) ?? "nvidia/llama-3.1-nemotron-70b-instruct";
    const maxTokens = data.max_tokens ?? (settings.max_tokens_default as number) ?? 4096;
    const temperature = data.temperature ?? (settings.temperature_default as number) ?? 0.7;

    const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: data.messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`NVIDIA API error ${res.status}: ${err}`);
    }

    return res.json();
  });
