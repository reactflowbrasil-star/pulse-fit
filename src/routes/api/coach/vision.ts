/**
 * POST /api/coach/vision — analisa um frame da câmera e devolve correção de forma.
 * Usa modelo multimodal via Lovable AI Gateway.
 */
import { createFileRoute } from "@tanstack/react-router";

type Body = {
  image?: string;
  exercise?: string;
  reps?: number;
  angle?: number;
  phase?: string;
};

export const Route = createFileRoute("/api/coach/vision")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("LOVABLE_API_KEY não configurada", { status: 500 });

        const body = (await request.json().catch(() => ({}))) as Body;
        const image = body.image;
        if (!image?.startsWith("data:image/")) {
          return new Response("image (data URL) é obrigatório", { status: 400 });
        }

        const system = `Você é um personal trainer profissional brasileiro analisando o aluno pela câmera AO VIVO.
Contexto: exercício "${body.exercise ?? "—"}", fase "${body.phase ?? "—"}", ângulo articular ${body.angle ?? "—"}°, ${body.reps ?? 0} repetições feitas.
Responda SEMPRE em português do Brasil, em NO MÁXIMO 2 frases curtas (até 160 caracteres no total), como uma instrução falada em voz alta.
Priorize: segurança, alinhamento de coluna, joelhos, quadril e amplitude. Se a execução estiver boa, elogie e dê 1 ajuste fino.
Nunca use listas, markdown, emojis ou disclaimers médicos.`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Lovable-API-Key": key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [
              { role: "system", content: system },
              {
                role: "user",
                content: [
                  { type: "text", text: "Analise minha execução neste instante." },
                  { type: "image_url", image_url: { url: image } },
                ],
              },
            ],
          }),
          signal: request.signal,
        });

        if (!upstream.ok) {
          const err = await upstream.text().catch(() => "");
          return new Response(`Análise falhou: ${upstream.status} ${err}`, {
            status: upstream.status,
          });
        }

        const json = (await upstream.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const feedback = json.choices?.[0]?.message?.content?.trim() ?? "";
        return Response.json({ feedback });
      },
    },
  },
});