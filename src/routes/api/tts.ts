import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response("LOVABLE_API_KEY missing", { status: 500 });
        }

        let text = "";
        let voice = "alloy";
        try {
          const body = (await request.json()) as { text?: string; voice?: string };
          text = (body.text ?? "").toString().slice(0, 1000);
          if (body.voice) voice = body.voice;
        } catch {
          return new Response("Invalid body", { status: 400 });
        }
        if (!text.trim()) return new Response("Empty text", { status: 400 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice,
            response_format: "mp3",
          }),
        });

        if (!upstream.ok) {
          const err = await upstream.text().catch(() => "");
          console.error("[tts] upstream error", upstream.status, err);
          return new Response(err || "TTS failed", { status: upstream.status });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
