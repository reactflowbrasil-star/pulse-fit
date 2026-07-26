/**
 * Trainer Chat — server functions for AI conversation with personal trainers.
 * Uses Vercel AI SDK with Lovable AI Gateway (Gemini Flash for speed).
 */
import { createServerFn } from "@tanstack/react-start";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { getTrainerSystemPrompt } from "@/data/trainers";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const ChatRequestSchema = z.object({
  trainerId: z.string().min(1),
  messages: z.array(ChatMessageSchema),
  userProfile: z
    .object({
      name: z.string().optional(),
      level: z.string().optional(),
      goal: z.string().optional(),
      equipment: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * POST /api/trainer-chat — streams a response from the trainer AI.
 */
export const trainerChat = createServerFn({ method: "POST" })
  .validator((input: unknown) => ChatRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return new Response("LOVABLE_API_KEY não configurada", { status: 500 });
    }

    const systemPrompt = getTrainerSystemPrompt(data.trainerId, data.userProfile);

    const gateway = createLovableAiGatewayProvider(key);

    const messages = data.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system: systemPrompt,
      messages: convertToModelMessages(
        messages.map((m) => ({
          id: crypto.randomUUID(),
          role: m.role,
          content: m.content,
        })) as UIMessage[],
      ),
    });

    return result.toDataStreamResponse();
  });

/**
 * POST /api/trainer-workout — generates a workout plan via the trainer AI.
 */
const WorkoutRequestSchema = z.object({
  trainerId: z.string().min(1),
  objective: z.enum(["emagrecer", "ganhar_massa", "condicionamento", "manter"]),
  level: z.enum(["iniciante", "intermediario", "avancado"]),
  minutes: z.number().int().min(5).max(90),
  location: z.enum(["casa", "academia", "ar_livre"]),
  equipment: z.array(z.string()).default([]),
});

export const generateTrainerWorkout = createServerFn({ method: "POST" })
  .validator((input: unknown) => WorkoutRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return { plan: null, source: "fallback" as const, error: "LOVABLE_API_KEY não configurada" };
    }

    const { getTrainerById } = await import("@/data/trainers");
    const trainer = getTrainerById(data.trainerId);
    if (!trainer) {
      return { plan: null, source: "fallback" as const, error: "Treinador não encontrado" };
    }

    const gateway = createLovableAiGatewayProvider(key, { structuredOutputs: true });

    const { generateWorkoutPlan } = await import("./coach.functions");
    const result = await generateWorkoutPlan({
      data: {
        objective: data.objective,
        level: data.level,
        minutes: data.minutes,
        location: data.location,
        equipment: data.equipment,
        clientSessionId: crypto.randomUUID(),
      },
    });

    return { plan: result.plan, source: result.source, trainerName: trainer.name };
  });

/**
 * POST /api/trainer-greeting — returns personalized greeting from the trainer.
 */
const GreetingRequestSchema = z.object({
  trainerId: z.string().min(1),
  userName: z.string().optional(),
  lastWorkout: z
    .object({
      date: z.string().optional(),
      title: z.string().optional(),
      minutes: z.number().optional(),
    })
    .optional(),
  streak: z.number().optional(),
});

export const getTrainerGreeting = createServerFn({ method: "POST" })
  .validator((input: unknown) => GreetingRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { getTrainerById } = await import("@/data/trainers");
    const trainer = getTrainerById(data.trainerId);
    if (!trainer) return { greeting: "Olá! Vamos treinar!" };

    const name = data.userName ?? "Atleta";
    const h = new Date().getHours();
    const timeGreeting = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";

    let greeting = `${trainer.style.emoji} ${timeGreeting}, ${name}! ${trainer.style.greeting}`;

    if (data.streak && data.streak > 1) {
      greeting += ` ${data.streak} dias seguidos — impressionante!`;
    }

    if (data.lastWorkout?.date) {
      const daysAgo = Math.floor(
        (Date.now() - new Date(data.lastWorkout.date).getTime()) / 86400000,
      );
      if (daysAgo === 0) {
        greeting += ` Vi que você treinou hoje — ${data.lastWorkout.title ?? "bom treino"}!`;
      } else if (daysAgo === 1) {
        greeting += ` Último treino foi ontem — bora manter a sequência!`;
      } else if (daysAgo > 3) {
        greeting += ` Faz ${daysAgo} dias que não treinamos — mas nunca é tarde pra recomeçar!`;
      }
    }

    return { greeting, catchphrase: trainer.style.catchphrase };
  });
