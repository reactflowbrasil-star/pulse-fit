import { createFileRoute } from "@tanstack/react-router";

type Body = { text?: string; voice?: string };

export const Route = createFileRoute("/api/coach/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("LOVABLE_API_KEY não configurada", { status: 500 });
        }
        const body = (await request.json().catch(() => ({}))) as Body;
        const text = (body.text ?? "").trim();
        if (!text) return new Response("text é obrigatório", { status: 400 });
        const voice = body.voice ?? "alloy";

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text.slice(0, 1200),
            voice,
            stream_format: "sse",
            response_format: "pcm",
            instructions:
              "Fale em português do Brasil com voz calma, clara e motivadora, como um personal trainer profissional. Ritmo moderado.",
          }),
          signal: request.signal,
        });

        if (!upstream.ok) {
          const err = await upstream.text().catch(() => "");
          return new Response(`TTS falhou: ${upstream.status} ${err}`, {
            status: upstream.status,
          });
        }
        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream" },
        });
      },
    },
  },
});
