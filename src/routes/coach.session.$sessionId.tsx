import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Clock,
  Flame,
  Check,
  Volume2,
  VolumeX,
  ArrowRight,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoiceController } from "@/components/VoiceController";

export const Route = createFileRoute("/coach/session/$sessionId")({
  head: () => ({ meta: [{ title: "Sessão de Treino — Pulse Fit" }] }),
  component: CoachSessionPage,
});

function CoachSessionPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const exercises = [
    { name: "Aquecimento", duration: 60, type: "warmup" },
    { name: "Flexões", sets: 3, reps: "12", duration: 45, rest: 15, type: "strength" },
    { name: "Agachamentos", sets: 3, reps: "15", duration: 45, rest: 15, type: "strength" },
    { name: "Prancha", duration: 30, type: "core" },
    { name: "Burpees", sets: 2, reps: "10", duration: 40, rest: 20, type: "cardio" },
    { name: "Alongamento", duration: 60, type: "cooldown" },
  ];

  const exercise = exercises[currentExercise];

  useEffect(() => {
    if (isPaused || isComplete) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentExercise < exercises.length - 1) {
            setCurrentExercise((c) => c + 1);
            return exercises[currentExercise + 1]?.duration ?? 30;
          } else {
            setIsComplete(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, isComplete, currentExercise, exercises.length]);

  if (isComplete) {
    return (
      <MobileFrame>
        <PageTransition>
          <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-success/10 text-success"
            >
              <Check className="h-12 w-12" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold">Treino Concluído!</h2>
            <p className="mt-2 text-sm text-text-tertiary">
              Parabéns! Você completou todos os exercícios.
            </p>
            <div className="mt-4 flex items-center gap-6 text-sm text-text-tertiary">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {exercises.length * 1} min
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4" /> ~200 kcal
              </span>
            </div>
            <div className="mt-8 space-y-3 w-full max-w-[300px]">
              <Button className="w-full" onClick={() => navigate({ to: "/" })}>
                Voltar ao início
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => navigate({ to: "/coach" })}>
                <Sparkles className="h-4 w-4" /> Falar com Coach
              </Button>
            </div>
          </main>
        </PageTransition>
      </MobileFrame>
    );
  }

  const progress = ((currentExercise + (1 - timeLeft / (exercise.duration ?? 30))) / exercises.length) * 100;

  return (
    <MobileFrame>
      <div className="min-h-screen bg-background-deep">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-border"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <div className="text-center">
              <p className="text-xs text-text-tertiary">Exercício {currentExercise + 1}/{exercises.length}</p>
              <p className="text-sm font-semibold">{exercise.name}</p>
            </div>
            <button
              onClick={() => navigate({ to: "/coach" })}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-border text-xs font-bold"
            >
              Sair
            </button>
          </div>

          {/* Timer */}
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <motion.div
              key={currentExercise}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              {/* Circular progress */}
              <svg className="h-56 w-56 -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-surface-elevated"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="text-primary"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - (timeLeft / (exercise.duration ?? 30)))}`}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-foreground">
                  {timeLeft.toString().padStart(2, "0")}
                </span>
                <span className="text-xs text-text-tertiary mt-1">
                  {exercise.type === "strength" ? `${exercise.sets}x${exercise.reps}` : exercise.type}
                </span>
              </div>
            </motion.div>

            {/* Voice instruction */}
            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                {exercise.type === "warmup"
                  ? "Prepare o corpo para o treino!"
                  : exercise.type === "cooldown"
                    ? "Respire fundo e relaxe os músculos."
                    : "Foque na execução. Respire bem."}
              </p>
            </div>

            {/* Navigation */}
            <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-[280px]">
              <button
                onClick={() => {
                  if (currentExercise > 0) {
                    setCurrentExercise((c) => c - 1);
                    setTimeLeft(exercises[currentExercise - 1]?.duration ?? 30);
                  }
                }}
                disabled={currentExercise === 0}
                className="flex items-center justify-center gap-2 rounded-full bg-surface-elevated py-4 text-sm font-bold text-primary transition-transform active:scale-[0.98] disabled:opacity-40"
              >
                <SkipBack className="h-4 w-4" /> Anterior
              </button>
              <button
                onClick={() => {
                  if (currentExercise < exercises.length - 1) {
                    setCurrentExercise((c) => c + 1);
                    setTimeLeft(exercises[currentExercise + 1]?.duration ?? 30);
                  } else {
                    setIsComplete(true);
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98]"
              >
                Pular <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-6 pt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
