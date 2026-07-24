import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook público que recebe eventos da Evolution API.
 * URL: /api/public/whatsapp/webhook?token=<WHATSAPP_WEBHOOK_TOKEN>
 *
 * A Evolution não assina o payload por HMAC, então usamos um token compartilhado
 * (query string ou header `x-evolution-token`) validado em tempo constante.
 * Configure a URL completa (com ?token=...) no painel da Evolution.
 */
export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      GET: async () => new Response("ok"),
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN;
        if (!expectedToken) {
          console.error("[wa-webhook] WHATSAPP_WEBHOOK_TOKEN ausente");
          return json({ ok: false, error: "server_not_configured" }, 500);
        }
        const provided =
          url.searchParams.get("token") ??
          request.headers.get("x-evolution-token") ??
          "";
        if (!timingSafeEqual(provided, expectedToken)) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }

        let payload: unknown = null;
        try {
          payload = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await handleEvent(payload, supabaseAdmin);
          return json({ ok: true });
        } catch (err) {
          console.error("[wa-webhook] erro processando evento:", err);
          return json({ ok: false, error: "processing_error" }, 500);
        }
      },
    },
  },
});

type SupabaseAdmin = typeof import("@/integrations/supabase/client.server")["supabaseAdmin"];

async function handleEvent(payload: unknown, db: SupabaseAdmin) {
  if (!payload || typeof payload !== "object") return;
  const evt = payload as Record<string, unknown>;
  const eventName =
    (evt.event as string | undefined) ??
    (evt.type as string | undefined) ??
    "unknown";
  const data = (evt.data ?? evt) as Record<string, unknown>;

  // Log bruto sempre
  console.log("[wa-webhook] evento:", eventName);

  // MENSAGEM RECEBIDA
  if (eventName.includes("messages.upsert") || eventName.includes("message")) {
    const key = data.key as { id?: string; remoteJid?: string; fromMe?: boolean } | undefined;
    const messageContent = extractText(data.message ?? data);
    const remoteJid = key?.remoteJid ?? (data.remoteJid as string | undefined) ?? "unknown";
    const messageId = key?.id ?? (data.messageId as string | undefined) ?? null;
    const fromMe = Boolean(key?.fromMe);

    if (!fromMe) {
      await db.from("whatsapp_messages").insert({
        direction: "inbound",
        remote_jid: remoteJid,
        message_id: messageId,
        content: messageContent,
        status: "received",
        raw: evt as never,
      });

      await db
        .from("whatsapp_sessions")
        .upsert(
          {
            remote_jid: remoteJid,
            display_name: (data.pushName as string | undefined) ?? null,
            last_message_at: new Date().toISOString(),
          },
          { onConflict: "remote_jid" },
        );
    }
    return;
  }

  // STATUS DE ENTREGA / LEITURA
  if (eventName.includes("messages.update") || eventName.includes("status")) {
    const key = data.key as { id?: string } | undefined;
    const messageId = key?.id ?? (data.messageId as string | undefined);
    const rawStatus = (data.status as string | number | undefined) ?? (data.update as Record<string, unknown> | undefined)?.status;
    const status = mapStatus(rawStatus);
    if (messageId && status) {
      await db
        .from("whatsapp_messages")
        .update({ status, raw: evt as never })
        .eq("message_id", messageId);
    }
  }
}

function extractText(msg: unknown): string | null {
  if (!msg || typeof msg !== "object") return null;
  const m = msg as Record<string, unknown>;
  if (typeof m.conversation === "string") return m.conversation;
  const ext = m.extendedTextMessage as { text?: string } | undefined;
  if (ext?.text) return ext.text;
  const img = m.imageMessage as { caption?: string } | undefined;
  if (img?.caption) return img.caption;
  const vid = m.videoMessage as { caption?: string } | undefined;
  if (vid?.caption) return vid.caption;
  return null;
}

function mapStatus(v: unknown): "sent" | "delivered" | "read" | "failed" | null {
  if (typeof v === "number") {
    // Baileys: 1 pending, 2 server_ack (sent), 3 delivery_ack (delivered), 4 read, 5 played
    if (v >= 4) return "read";
    if (v === 3) return "delivered";
    if (v === 2) return "sent";
    return null;
  }
  if (typeof v !== "string") return null;
  const s = v.toUpperCase();
  if (s.includes("READ")) return "read";
  if (s.includes("DELIVER")) return "delivered";
  if (s.includes("SERVER") || s === "SENT") return "sent";
  if (s.includes("FAIL") || s.includes("ERROR")) return "failed";
  return null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
