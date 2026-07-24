import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ChevronLeft,
  Pause,
  Play,
  SkipForward,
  Camera,
  HeartPulse,
  Replace,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";

import { VoiceController } from "@/components/VoiceController";
import { TrainerCoach } from "@/components/TrainerCoach";
import {
  finishWorkoutSession,
  getWorkoutSession,
  listCatalog,
} from "@/lib/coach.functions";
import type {
  AnimationId,
  CameraAngle,
  ExerciseCatalogItem,
  WorkoutPlan,
} from "@/lib/exercise-catalog";


export const Route = createFileRoute("/coach/session/$sessionId")({
  head: () => ({
    meta: [
      { title: "Sessão de treino — Pulse Fit" },
      { name: "description", content: "Treino guiado pelo Coach IA." },
    ],
  }),
  component: SessionPage,
});

function SessionPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const getSession = useServerFn(getWorkoutSession);
  const getCatalog = useServerFn(listCatalog);
  const finish = useServerFn(finishWorkoutSession);

  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession({ data: { sessionId } }),
  });
  const catalogQuery = useQuery({
    queryKey: ["catalog"],
    queryFn: () => getCatalog(),
  });

  const serverPlan = sessionQuery.data?.plan as WorkoutPlan | undefined;
  const catalog: ExerciseCatalogItem[] = catalogQuery.data ?? [];

  const [idx, setIdx] = useState(0);
  const [angle, setAngle] = useState<CameraAngle>("frontal");
  const [paused, setPaused] = useState(false);
  const [pain, setPain] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt] = useState(() => Date.now());
  // Override local para substituição de exercícios sem persistir no servidor.
  const [planOverride, setPlanOverride] = useState<WorkoutPlan | null>(null);
  const plan = planOverride ?? serverPlan;

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const current = plan?.exercises[idx];
  const catalogItem = useMemo(
    () => catalog.find((c) => c.id === current?.exerciseId),
    [catalog, current],
  );

  const finishMut = useMutation({
    mutationFn: async (opts: { effort?: number }) => {
      const duration = Math.round((Date.now() - startedAt) / 1000);
      await finish({
        data: {
          sessionId,
          durationSeconds: duration,
          caloriesEstimate: Math.round((duration / 60) * 7),
          effortLevel: opts.effort,
          feedback: {},
        },
      });
    },
    onSuccess: () => {
      navigate({ to: "/coach/summary/$sessionId", params: { sessionId } });
    },
  });

  if (sessionQuery.isLoading || catalogQuery.isLoading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background-deep text-text-tertiary">
        Carregando seu treino…
      </div>
    );
  }

  if (!plan || !current || !catalogItem) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background-deep px-6 text-center">
        <div>
          <p className="text-lg font-bold">Treino não encontrado.</p>
          <button
            onClick={() => navigate({ to: "/coach" })}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            Montar novo
          </button>
        </div>
      </div>
    );
  }

  const totalSteps = plan.exercises.length;
  const pct = Math.round(((idx + 1) / totalSteps) * 100);

  const advance = () => {
    if (idx + 1 >= totalSteps) {
      finishMut.mutate({});
    } else {
      setIdx(idx + 1);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-[480px] flex-col bg-background-deep">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <button
          onClick={() => navigate({ to: "/coach" })}
          aria-label="Voltar"
          className="grid h-11 w-11 place-items-center rounded-2xl bg-surface ring-1 ring-white/5"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
            Exercício {idx + 1} / {totalSteps}
          </p>
          <p className="font-display text-base uppercase tracking-wide">
            {plan.title}
          </p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 font-display text-xs tabular-nums tracking-wider text-primary">
          {formatTime(elapsed)}
        </div>
      </header>

      {/* Progress */}
      <div className="mx-4 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-primary shadow-glow transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Trainer stage — photorealistic video → GLB → procedural 3D */}
      <div className="relative mx-4 mt-3 aspect-square overflow-hidden rounded-3xl bg-surface-dark ring-1 ring-white/5">
        <Suspense
          fallback={
            <div className="grid h-full w-full place-items-center text-text-tertiary">
              Carregando treinador…
            </div>
          }
        >
          <TrainerCoach
            animationId={catalogItem.animation_id as AnimationId}
            cameraAngle={angle}
            paused={paused}
          />
        </Suspense>


        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {(["frontal", "lateral", "angulo_45"] as CameraAngle[]).map((a) => (
            <button
              key={a}
              onClick={() => setAngle(a)}
              className={`grid h-9 w-9 place-items-center rounded-full text-[10px] font-black ring-1 ring-white/10 backdrop-blur ${
                angle === a
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-surface/80 text-foreground"
              }`}
              aria-label={`Câmera ${a}`}
            >
              <Camera className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Info panel */}
      <section className="mt-3 flex-1 rounded-t-[32px] bg-surface px-5 pt-5 pb-4 ring-1 ring-white/5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {catalogItem.muscle_group}
            </p>
            <h1 className="mt-1 truncate font-display text-3xl uppercase tracking-wide">
              {catalogItem.name}
            </h1>
            <p className="mt-1 text-sm font-semibold text-text-secondary">
              <span className="font-display text-base text-foreground">
                {current.sets}×{current.reps}
              </span>
              {current.durationSeconds ? ` · ${current.durationSeconds}s` : ""} ·
              descanso {current.restSeconds}s
            </p>
          </div>
          <VoiceController text={current.voiceInstruction} />
        </div>

        <ul className="mt-4 space-y-1.5 text-sm text-text-secondary">
          {catalogItem.execution_steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 font-display text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ul>

        {catalogItem.breathing ? (
          <p className="mt-3 rounded-2xl bg-surface-elevated p-3 text-xs text-text-tertiary">
            <strong className="font-display text-sm uppercase tracking-wide text-foreground">
              Respiração:
            </strong>{" "}
            {catalogItem.breathing}
          </p>
        ) : null}

        {/* Controls */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={() => setPain(true)}
            className="flex flex-col items-center gap-1 rounded-2xl bg-surface-elevated p-3 font-display text-xs uppercase tracking-wider text-destructive ring-1 ring-destructive/20 active:scale-95"
          >
            <HeartPulse className="h-5 w-5" />
            Dor
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            className="flex flex-col items-center gap-1 rounded-2xl bg-primary p-3 font-display text-xs uppercase tracking-wider text-primary-foreground shadow-glow active:scale-95"
          >
            {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            {paused ? "Continuar" : "Pausar"}
          </button>
          <button
            onClick={advance}
            className="flex flex-col items-center gap-1 rounded-2xl bg-surface-elevated p-3 font-display text-xs uppercase tracking-wider ring-1 ring-white/5 active:scale-95"
          >
            <SkipForward className="h-5 w-5" />
            Próximo
          </button>
        </div>


        {catalogItem.substitute_exercise_ids.length > 0 ? (
          <button
            onClick={() => {
              // Rotaciona pelos substitutos definidos no catálogo.
              const subs = catalogItem.substitute_exercise_ids;
              if (subs.length === 0 || !plan) return;
              const currentSubIdx = subs.indexOf(current.exerciseId);
              const nextSubId = subs[(currentSubIdx + 1) % subs.length] ?? subs[0];
              const sub = catalog.find((c) => c.id === nextSubId);
              if (!sub) return;
              setPlanOverride({
                ...plan,
                exercises: plan.exercises.map((ex, i) =>
                  i === idx ? { ...ex, exerciseId: sub.id } : ex,
                ),
              });
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-surface-elevated py-3 text-sm font-semibold active:scale-[0.98]"
          >
            <Replace className="h-4 w-4" />
            Substituir exercício
          </button>
        ) : null}
      </section>

      {pain ? (
        <PainModal
          onClose={() => setPain(false)}
          onEnd={() => finishMut.mutate({ effort: 1 })}
        />
      ) : null}
    </div>
  );
}

function PainModal({
  onClose,
  onEnd,
}: {
  onClose: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-6 animate-[modal-in_260ms_ease-out]">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-destructive/15 text-destructive">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-black">Treino pausado</p>
            <p className="text-xs text-text-tertiary">
              Segurança em primeiro lugar.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-text-secondary">
          Se sentir dor persistente, encerre o treino e procure avaliação
          profissional. O app não substitui um médico.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="rounded-full bg-surface-elevated py-3 text-sm font-bold"
          >
            Voltar
          </button>
          <button
            onClick={onEnd}
            className="rounded-full bg-destructive py-3 text-sm font-bold text-destructive-foreground"
          >
            Encerrar treino
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}
