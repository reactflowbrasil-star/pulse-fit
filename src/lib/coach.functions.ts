import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";

import type {
  ExerciseCatalogItem,
  WorkoutContext,
  WorkoutPlan,
} from "./exercise-catalog";

const ContextSchema = z.object({
  objective: z.enum(["emagrecer", "ganhar_massa", "condicionamento", "manter"]),
  level: z.enum(["iniciante", "intermediario", "avancado"]),
  minutes: z.number().int().min(5).max(90),
  location: z.enum(["casa", "academia", "ar_livre"]),
  equipment: z.array(z.string()).default([]),
  clientSessionId: z.string().min(4),
});

const PlanSchema = z.object({
  title: z.string(),
  objective: z.string(),
  difficulty: z.enum(["iniciante", "intermediario", "avancado"]),
  estimatedMinutes: z.number(),
  intro: z.string(),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      sets: z.number(),
      reps: z.string(),
      durationSeconds: z.number().nullable(),
      restSeconds: z.number(),
      voiceInstruction: z.string(),
      personalNote: z.string(),
    }),
  ),
});

async function loadCatalog(): Promise<ExerciseCatalogItem[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("exercise_catalog")
    .select("*")
    .order("id");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ExerciseCatalogItem[];
}

function fallbackPlan(
  ctx: z.infer<typeof ContextSchema>,
  catalog: ExerciseCatalogItem[],
): WorkoutPlan {
  const picks = catalog
    .filter((e) => (ctx.level === "iniciante" ? e.level !== "avancado" : true))
    .slice(0, Math.min(6, Math.max(3, Math.floor(ctx.minutes / 5))));
  return {
    title: "Treino Rápido",
    objective: ctx.objective,
    difficulty: ctx.level,
    estimatedMinutes: ctx.minutes,
    intro:
      "Vamos com um treino direto e seguro. Foque na execução antes da intensidade.",
    exercises: picks.map((e) => ({
      exerciseId: e.id,
      sets: e.default_sets,
      reps: e.default_reps,
      durationSeconds: e.default_duration_s,
      restSeconds: e.default_rest_s,
      voiceInstruction:
        e.default_voice_instruction ?? "Foco na execução. Respire bem.",
      personalNote: "",
    })),
  };
}

export const listCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<ExerciseCatalogItem[]> => loadCatalog(),
);

export const generateWorkoutPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ContextSchema.parse(input))
  .handler(async ({ data }): Promise<{ plan: WorkoutPlan; source: "ai" | "fallback" }> => {
    const catalog = await loadCatalog();
    const allowedIds = catalog.map((e) => e.id);

    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return { plan: fallbackPlan(data, catalog), source: "fallback" };
    }

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key, { structuredOutputs: true });
    const model = gateway("openai/gpt-5.5");

    const catalogSummary = catalog
      .map(
        (e) =>
          `- ${e.id} (${e.name}) — grupo: ${e.muscle_group}, nível: ${e.level}, séries padrão: ${e.default_sets}x${e.default_reps}, descanso: ${e.default_rest_s}s`,
      )
      .join("\n");

    const prompt = `Você é um personal trainer que monta treinos personalizados em português do Brasil.

CATÁLOGO VALIDADO (use APENAS estes exerciseId):
${catalogSummary}

CONTEXTO DO USUÁRIO:
- Objetivo: ${data.objective}
- Nível: ${data.level}
- Tempo disponível: ${data.minutes} minutos
- Local: ${data.location}
- Equipamentos: ${data.equipment.length ? data.equipment.join(", ") : "nenhum"}

REGRAS OBRIGATÓRIAS:
1. exerciseId DEVE ser um dos ids listados acima. Não invente exercícios.
2. Ajuste séries, reps e descanso ao nível e ao tempo disponível.
3. voiceInstruction: 1 frase curta motivadora em pt-BR (máx 15 palavras).
4. personalNote: 1 frase curta explicando por que este exercício está aqui (máx 20 palavras).
5. Comece com aquecimento leve (polichinelo ou similar) se cardio disponível.
6. Se equipamento indisponível, escolha apenas exercícios sem equipamento.
7. Some estimatedMinutes coerente com o tempo pedido.`;

    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: PlanSchema }),
        prompt,
      });

      // Validation layer — reject any exercise not in the catalog.
      const validExercises = output.exercises.filter((ex) =>
        allowedIds.includes(ex.exerciseId),
      );
      if (validExercises.length < 2) {
        return { plan: fallbackPlan(data, catalog), source: "fallback" };
      }

      return {
        plan: {
          ...output,
          exercises: validExercises,
        } as WorkoutPlan,
        source: "ai",
      };
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        return { plan: fallbackPlan(data, catalog), source: "fallback" };
      }
      console.error("[coach] generateWorkoutPlan error", err);
      return { plan: fallbackPlan(data, catalog), source: "fallback" };
    }
  });

const SaveSessionSchema = z.object({
  clientSessionId: z.string(),
  userId: z.string().uuid().optional(),
  context: z.record(z.string(), z.any()),
  plan: z.record(z.string(), z.any()),
});

export const startWorkoutSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SaveSessionSchema.parse(input))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("workout_sessions")
      .insert({
        client_session_id: data.clientSessionId,
        user_id: data.userId ?? null,
        context: data.context,
        plan: data.plan,
        status: "in_progress",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

const FinishSchema = z.object({
  sessionId: z.string().uuid(),
  durationSeconds: z.number().int().min(0),
  caloriesEstimate: z.number().int().min(0),
  effortLevel: z.number().int().min(1).max(5).optional(),
  feedback: z.record(z.string(), z.any()).default({}),
});

export const finishWorkoutSession = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => FinishSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("workout_sessions")
      .update({
        status: "completed",
        duration_seconds: data.durationSeconds,
        calories_estimate: data.caloriesEstimate,
        effort_level: data.effortLevel ?? null,
        feedback: data.feedback,
        ended_at: new Date().toISOString(),
      })
      .eq("id", data.sessionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const GetSessionSchema = z.object({ sessionId: z.string().uuid() });

export const getWorkoutSession = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => GetSessionSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("workout_sessions")
      .select("*")
      .eq("id", data.sessionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
