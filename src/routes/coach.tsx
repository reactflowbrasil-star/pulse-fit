import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

import { BottomNav } from "@/components/BottomNav";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBar } from "@/components/StatusBar";
import { useSessionId } from "@/hooks/useSessionId";
import {
  generateWorkoutPlan,
  startWorkoutSession,
} from "@/lib/coach.functions";
import type { WorkoutContext } from "@/lib/exercise-catalog";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Treino com IA — Pulse Fit" },
      {
        name: "description",
        content:
          "Um personal trainer com IA que monta seu treino em segundos, com voz e demonstração 3D.",
      },
      { property: "og:title", content: "Treino com IA — Pulse Fit" },
      {
        property: "og:description",
        content: "Personal trainer 3D com IA, voz e feedback em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachOnboardingPage,
});

const objectives = [
  { id: "emagrecer", label: "Emagrecer" },
  { id: "ganhar_massa", label: "Ganhar massa" },
  { id: "condicionamento", label: "Condicionamento" },
  { id: "manter", label: "Manter forma" },
] as const;

const levels = [
  { id: "iniciante", label: "Iniciante" },
  { id: "intermediario", label: "Intermediário" },
  { id: "avancado", label: "Avançado" },
] as const;

const locations = [
  { id: "casa", label: "Em casa" },
  { id: "academia", label: "Academia" },
  { id: "ar_livre", label: "Ao ar livre" },
] as const;

function CoachOnboardingPage() {
  const navigate = useNavigate();
  const sessionId = useSessionId();
  const [ctx, setCtx] = useState<WorkoutContext>({
    objective: "condicionamento",
    level: "iniciante",
    minutes: 20,
    location: "casa",
    equipment: [],
  });

  const gen = useServerFn(generateWorkoutPlan);
  const start = useServerFn(startWorkoutSession);

  const mut = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("sessão indisponível");
      const { plan } = await gen({
        data: { ...ctx, clientSessionId: sessionId },
      });
      const { id } = await start({
        data: { clientSessionId: sessionId, context: ctx, plan },
      });
      return id;
    },
    onSuccess: (id) => {
      navigate({ to: "/coach/session/$sessionId", params: { sessionId: id } });
    },
  });

  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Treino com IA" />

      <main className="flex-1 space-y-5 px-5 pb-6">
        <section className="rounded-[28px] bg-gradient-to-br from-primary/25 via-surface to-surface p-5 ring-1 ring-primary/20">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">Coach IA</p>
              <p className="truncate text-lg font-black">Monte seu treino agora</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            Responda 4 perguntas rápidas. A IA escolhe exercícios do catálogo
            validado e um treinador 3D demonstra em vídeo, com voz.
          </p>
        </section>

        <ChipGroup
          label="Objetivo"
          options={objectives}
          value={ctx.objective}
          onChange={(v) => setCtx({ ...ctx, objective: v })}
        />
        <ChipGroup
          label="Nível"
          options={levels}
          value={ctx.level}
          onChange={(v) => setCtx({ ...ctx, level: v })}
        />
        <ChipGroup
          label="Local"
          options={locations}
          value={ctx.location}
          onChange={(v) => setCtx({ ...ctx, location: v })}
        />

        <section className="rounded-2xl bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Tempo disponível
            </p>
            <span className="text-sm font-black text-primary">{ctx.minutes} min</span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={ctx.minutes}
            onChange={(e) => setCtx({ ...ctx, minutes: Number(e.target.value) })}
            className="mt-3 w-full accent-primary"
          />
        </section>

        <button
          disabled={mut.isPending || !sessionId}
          onClick={() => mut.mutate()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-black text-primary-foreground shadow-glow transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {mut.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Montando seu treino…
            </>
          ) : (
            "Começar treino guiado"
          )}
        </button>

        {mut.isError ? (
          <p className="text-center text-sm text-destructive">
            Não deu para gerar agora. Tente de novo em instantes.
          </p>
        ) : null}
      </main>

      <BottomNav />
    </MobileFrame>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <section>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-text-secondary"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
