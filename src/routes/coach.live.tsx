import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { VoiceController } from "@/components/VoiceController";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { EXERCISE_CONFIG, type ExerciseKey } from "@/lib/pose/rep-counter";

export const Route = createFileRoute("/coach/live")({
  head: () => ({
    meta: [
      { title: "Treino ao vivo com IA — Pulse Fit" },
      {
        name: "description",
        content:
          "Seu personal trainer de IA observa você pela câmera, conta repetições e corrige sua execução em tempo real.",
      },
      { property: "og:title", content: "Treino ao vivo com IA — Pulse Fit" },
      {
        property: "og:description",
        content: "Câmera ao vivo, contagem de repetições e correção de forma por inteligência artificial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachLivePage,
});

const EXERCISES = Object.keys(EXERCISE_CONFIG) as ExerciseKey[];
const ANALYSIS_INTERVAL_MS = 12000;

function CoachLivePage() {
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<ExerciseKey>("squat");
  const [active, setActive] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const lastSpokenRef = useRef("");

  const {
    videoRef,
    canvasRef,
    status,
    error,
    state,
    personDetected,
    start,
    stop,
    captureFrame,
    resetReps,
  } = usePoseDetection({ exercise, active });

  const config = EXERCISE_CONFIG[exercise];

  const analyze = useCallback(async () => {
    if (analyzing || status !== "running" || !personDetected) return;
    const image = captureFrame();
    if (!image) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/coach/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          exercise: config.label,
          reps: state.reps,
          angle: state.angle,
          phase: state.phase,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { feedback?: string };
        if (data.feedback) {
          setFeedback(data.feedback);
          lastSpokenRef.current = data.feedback;
        }
      }
    } catch {
      // silencioso — o treino continua
    }
    setAnalyzing(false);
  }, [analyzing, captureFrame, config.label, personDetected, state.angle, state.phase, state.reps, status]);

  useEffect(() => {
    if (status !== "running" || !active) return;
    const id = setInterval(() => void analyze(), ANALYSIS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [active, analyze, status]);

  const metrics = useMemo(
    () => [
      { label: config.isometric ? "Segundos" : "Reps", value: config.isometric ? state.holdSeconds : state.reps },
      { label: "Ângulo", value: `${state.angle}°` },
      { label: "Forma", value: `${state.quality}%` },
    ],
    [config.isometric, state.angle, state.holdSeconds, state.quality, state.reps],
  );

  return (
    <MobileFrame>
      <PageTransition>
        <main className="relative flex h-full flex-col bg-background-deep">
          <div className="relative flex-1 overflow-hidden">
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
            />
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full scale-x-[-1] object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

            <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 py-3 safe-top">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  stop();
                  navigate({ to: "/" });
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/40 text-white backdrop-blur"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-white backdrop-blur">
                <span
                  className={`h-2 w-2 rounded-full ${status === "running" ? "animate-pulse bg-success" : "bg-muted"}`}
                />
                <span className="text-xs font-semibold">
                  {status === "running" ? (personDetected ? "IA analisando" : "Procurando você") : "Câmera desligada"}
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={resetReps}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/40 text-white backdrop-blur"
                aria-label="Zerar contagem"
              >
                <RotateCcw className="h-4 w-4" />
              </motion.button>
            </div>

            {status !== "running" && (
              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary">
                    <Camera className="h-7 w-7" />
                  </div>
                  <h1 className="font-display text-xl font-bold text-white">
                    Seu personal de IA precisa te ver
                  </h1>
                  <p className="max-w-xs text-sm text-white/70">
                    Libere a câmera, posicione o corpo inteiro no quadro e comece. A IA conta suas
                    repetições e corrige sua execução por voz.
                  </p>
                  <Button variant="primary" size="lg" loading={status === "loading"} onClick={() => void start()}>
                    Ativar câmera
                  </Button>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>
              </div>
            )}

            <div className="absolute bottom-3 left-0 right-0 px-4">
              <div className="grid grid-cols-3 gap-2">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-white/10 bg-black/45 px-3 py-2 text-center backdrop-blur"
                  >
                    <p className="font-display text-xl font-bold text-white">{m.value}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/60">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border/30 px-4 py-3">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {EXERCISES.map((key) => (
                <button
                  key={key}
                  onClick={() => setExercise(key)}
                  className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    key === exercise
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-surface-elevated text-text-secondary"
                  }`}
                >
                  {EXERCISE_CONFIG[key].label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={feedback || state.cue || "idle"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 rounded-2xl border border-border/60 bg-surface-card px-4 py-3"
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground">
                  {feedback || state.cue || "Posicione-se e comece o movimento — eu te guio."}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <Button
                variant={active ? "secondary" : "primary"}
                size="md"
                className="flex-1"
                onClick={() => setActive((a) => !a)}
              >
                {active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {active ? "Pausar" : "Retomar"}
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                loading={analyzing}
                onClick={() => void analyze()}
                disabled={status !== "running"}
              >
                Analisar agora
              </Button>
            </div>

            {feedback && <VoiceController text={feedback} autoPlay />}
          </div>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}