import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Activity, Flame, Heart, Send, Sparkles, Zap } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Coach ao Vivo — Pulse Fit" },
      {
        name: "description",
        content:
          "IA em tempo real reagindo à sua telemetria de treino: frequência cardíaca, cadência e fadiga com resposta instantânea.",
      },
      { property: "og:title", content: "Coach ao Vivo — Pulse Fit" },
      {
        property: "og:description",
        content: "Treinador de IA que analisa seus sensores ao vivo e responde em segundos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LivePage,
});

const EXERCISES = ["Corrida", "Bike", "Burpee", "Prancha", "Agachamento"] as const;

type Telemetry = {
  exercise: string;
  elapsedSec: number;
  heartRate: number;
  cadence: number;
  fatigue: number;
  zone: string;
};

function zoneOf(hr: number): string {
  if (hr < 110) return "Aquecimento";
  if (hr < 140) return "Aeróbica leve";
  if (hr < 160) return "Cardio";
  if (hr < 175) return "Limiar";
  return "Máxima";
}

function LivePage() {
  const [exercise, setExercise] = useState<string>(EXERCISES[0]);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    exercise: EXERCISES[0],
    elapsedSec: 0,
    heartRate: 92,
    cadence: 60,
    fatigue: 5,
    zone: "Aquecimento",
  });
  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  // Simulador de sensores — atualiza a cada 1.5s
  useEffect(() => {
    const id = setInterval(() => {
      setTelemetry((prev) => {
        const drift = (Math.random() - 0.4) * 8;
        const targetHR =
          prev.exercise === "Prancha"
            ? 130
            : prev.exercise === "Burpee"
              ? 175
              : prev.exercise === "Bike"
                ? 155
                : prev.exercise === "Corrida"
                  ? 165
                  : 145;
        const hr = Math.round(
          Math.min(195, Math.max(70, prev.heartRate + (targetHR - prev.heartRate) * 0.15 + drift)),
        );
        const cadence = Math.round(
          Math.max(30, Math.min(190, prev.cadence + (Math.random() - 0.5) * 12)),
        );
        const fatigue = Math.min(100, prev.fatigue + Math.random() * 1.4);
        return {
          exercise: prev.exercise,
          elapsedSec: prev.elapsedSec + 1.5,
          heartRate: hr,
          cadence,
          fatigue,
          zone: zoneOf(hr),
        };
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Trocar exercício reseta cadence/fatigue parcialmente
  useEffect(() => {
    setTelemetry((prev) => ({ ...prev, exercise, fatigue: Math.max(0, prev.fatigue - 10) }));
  }, [exercise]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/live-coach",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages, telemetry: telemetryRef.current },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status } = useChat({
    id: "live-coach",
    transport,
  });

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-alerta quando HR cruza limite (uma vez por 20s)
  const lastAlertRef = useRef(0);
  useEffect(() => {
    const now = Date.now();
    if (telemetry.heartRate > 178 && now - lastAlertRef.current > 20000) {
      lastAlertRef.current = now;
      void sendMessage({ text: `[AUTO] HR atingiu ${telemetry.heartRate}bpm — o que faço agora?` });
    }
  }, [telemetry.heartRate, sendMessage]);

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    void sendMessage({ text: text.trim() });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const hrPct = Math.min(100, ((telemetry.heartRate - 60) / 140) * 100);

  return (
    <MobileFrame>
      <ScreenHeader title="Coach ao Vivo" subtitle="IA reagindo aos seus sensores" />

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4">
        {/* HUD de sensores */}
        <div className="grid grid-cols-3 gap-2">
          <SensorTile
            icon={<Heart className="h-4 w-4" />}
            label="BPM"
            value={telemetry.heartRate.toString()}
            accent={telemetry.heartRate > 170 ? "danger" : "primary"}
          />
          <SensorTile
            icon={<Activity className="h-4 w-4" />}
            label="Cadência"
            value={`${telemetry.cadence}`}
          />
          <SensorTile
            icon={<Flame className="h-4 w-4" />}
            label="Fadiga"
            value={`${Math.round(telemetry.fatigue)}%`}
            accent={telemetry.fatigue > 75 ? "danger" : "default"}
          />
        </div>

        <div className="rounded-2xl bg-surface/70 p-3 ring-1 ring-white/5">
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-text-tertiary">
            <span>Zona: {telemetry.zone}</span>
            <span>{Math.round(telemetry.elapsedSec)}s</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${hrPct}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EXERCISES.map((e) => (
              <button
                key={e}
                onClick={() => setExercise(e)}
                className={`rounded-full px-3 py-1 font-display text-[11px] uppercase tracking-widest transition-colors ${
                  exercise === e
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-text-tertiary ring-1 ring-white/10"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Feed de conversa */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-black/20 p-3 ring-1 ring-white/5"
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-text-tertiary">
              <Sparkles className="h-6 w-6 text-primary" />
              <p className="max-w-[240px] text-sm">
                Faça uma pergunta ou toque em uma ação rápida. O coach lê seus sensores em tempo real.
              </p>
            </div>
          )}
          {messages.map((m: UIMessage) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("")
              .trim();
            if (!text) return null;
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-text-primary ring-1 ring-white/8"
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-strong:text-primary">
                    <ReactMarkdown>{text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl bg-surface px-3 py-2 ring-1 ring-white/8">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-1.5">
          {[
            "Estou cansado",
            "Sinto dor no joelho",
            "Como está minha performance?",
            "Próximo passo?",
          ].map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={isLoading}
              className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] text-text-secondary ring-1 ring-white/10 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 pb-1"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ao coach…"
            className="flex-1 rounded-full bg-surface px-4 py-3 text-sm text-text-primary outline-none ring-1 ring-white/10 placeholder:text-text-tertiary focus:ring-primary/60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform active:scale-95 disabled:opacity-40"
            aria-label="Enviar"
          >
            {isLoading ? <Zap className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>

      <BottomNav />
    </MobileFrame>
  );
}

function SensorTile({
  icon,
  label,
  value,
  accent = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "default" | "primary" | "danger";
}) {
  const color =
    accent === "danger"
      ? "text-red-400"
      : accent === "primary"
        ? "text-primary"
        : "text-text-primary";
  return (
    <div className="rounded-2xl bg-surface/70 p-3 ring-1 ring-white/5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-text-tertiary">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`font-display text-2xl tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
