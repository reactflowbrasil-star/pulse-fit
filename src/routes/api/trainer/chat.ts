/**
 * POST /api/trainer/chat — streams AI response from the selected trainer.
 */
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
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

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("LOVABLE_API_KEY não configurada", { status: 500 });

        const systemPrompt = getTrainerSystemPrompt(trainerId, userProfile);
        const gateway = createLovableAiGatewayProvider(key);

        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system: systemPrompt,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
