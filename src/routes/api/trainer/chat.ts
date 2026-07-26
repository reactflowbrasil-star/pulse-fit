/**
 * POST /api/trainer/chat — streams AI response from the selected trainer.
 * O modelo e a chave vem da configuracao NVIDIA do painel admin.
 */
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { resolveChatModel } from "@/lib/nvidia.server";
import { getTrainerSystemPrompt } from "@/data/trainers";

type Body = {
  trainerId?: string;
  messages?: unknown;
  userProfile?: {
    name?: string;
    level?: string;
    goal?: string;
    equipment?: string[];
  };
};

export const Route = createFileRoute("/api/trainer/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Body;
        const { trainerId, messages, userProfile } = body;

        if (!trainerId || !Array.isArray(messages)) {
          return new Response("trainerId and messages required", { status: 400 });
        }

        const ai = await resolveChatModel();
        if (!ai) {
          return new Response("Nenhuma chave NVIDIA ativa no painel admin", { status: 503 });
        }

        const systemPrompt = getTrainerSystemPrompt(trainerId, userProfile);

        const result = streamText({
          model: ai.model,
          system: systemPrompt,
          temperature: ai.temperature,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
