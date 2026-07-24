import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

import coachHero from "@/assets/coach-hero.jpg";


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

export const Route = createFileRoute("/coach/")({
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
        <section className="grain-noise relative overflow-hidden rounded-[32px] p-6 text-primary-foreground shadow-neon">
          <img
            src={coachHero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-primary-dark/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 via-transparent to-transparent" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-foreground/20 text-primary-foreground backdrop-blur">
              <Sparkles className="h-7 w-7" strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                Coach IA
              </p>
              <p className="truncate font-display text-2xl uppercase tracking-wide">
                Monte seu treino
              </p>
            </div>
          </div>
          <p className="relative mt-3 text-sm opacity-90">
            Responda 4 perguntas rápidas. A IA escolhe exercícios validados e um
            treinador demonstra em vídeo fotorreal, com voz.
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

        <section className="rounded-[24px] bg-surface p-5 ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
              Tempo disponível
            </p>
            <span className="font-display text-2xl uppercase tracking-wide text-primary tabular-nums">
              {ctx.minutes}<span className="text-sm">min</span>
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={ctx.minutes}
            onChange={(e) => setCtx({ ...ctx, minutes: Number(e.target.value) })}
            className="mt-4 w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-[10px] font-semibold text-text-tertiary">
            <span>10min</span>
            <span>60min</span>
          </div>
        </section>

        <button
          disabled={mut.isPending || !sessionId}
          onClick={() => mut.mutate()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-display text-lg uppercase tracking-wider text-primary-foreground shadow-glow transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {mut.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Montando seu treino…
            </>
          ) : (
            "Começar treino"
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
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={`rounded-full px-4 py-2.5 font-display text-sm uppercase tracking-wider transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-surface text-text-secondary ring-1 ring-white/5"
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

