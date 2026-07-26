import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { resolveChatModel } from "@/lib/nvidia.server";

type Body = {
  messages?: unknown;
  telemetry?: {
    exercise?: string;
    elapsedSec?: number;
    heartRate?: number;
    cadence?: number;
    fatigue?: number;
    zone?: string;
  };
};

export const Route = createFileRoute("/api/live-coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, telemetry } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const ai = await resolveChatModel();
        if (!ai) {
          return new Response("Nenhuma chave NVIDIA ativa no painel admin", { status: 503 });
        }

        const t = telemetry ?? {};
        const system = `Você é o "Pulse Coach", um personal trainer virtual conversando AO VIVO em português do Brasil durante a sessão de treino do usuário.

TELEMETRIA EM TEMPO REAL (atualizada a cada request):
- Exercício atual: ${t.exercise ?? "—"}
- Tempo decorrido: ${t.elapsedSec ?? 0}s
- Frequência cardíaca: ${t.heartRate ?? "—"} bpm
- Cadência: ${t.cadence ?? "—"} rpm
- Fadiga percebida (0-100): ${t.fatigue ?? 0}
- Zona: ${t.zone ?? "—"}

REGRAS:
- Respostas CURTAS (1-3 frases), diretas, energéticas.
- Reaja à telemetria: se HR > 170, sugira reduzir; se fadiga > 75, ofereça descanso ativo.
- Use markdown leve (negrito para comandos-chave).
- Se o usuário reclamar de dor, pare imediatamente e sugira alternativa segura.
- Fale como um treinador humano — nada de disclaimers médicos longos.`;

        const result = streamText({
          model: ai.model,
          temperature: ai.temperature,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
