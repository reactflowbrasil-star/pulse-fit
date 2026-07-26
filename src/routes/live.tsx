import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Send,
  ArrowLeft,
  Volume2,
  VolumeX,
  Flame,
  Clock,
  Zap,
  Heart,
  Pause,
  Play,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Telemetry = {
  exercise: string;
  elapsedSec: number;
  heartRate: number;
  cadence: number;
  fatigue: number;
  zone: string;
};

type LiveMessage = {
  role: "user" | "assistant";
  content: string;
};

export const Route = createFileRoute("/live")({
  head: () => ({ meta: [{ title: "Sessão ao Vivo — Pulse Fit" }] }),
  component: LiveCoachPage,
});

function LiveCoachPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    exercise: "Flexões",
    elapsedSec: 0,
    heartRate: 125,
    cadence: 45,
    fatigue: 30,
    zone: "Moderado",
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  // Timer
  useEffect(() => {
    if (!isActive) return;
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
      setTelemetry((t) => ({
        ...t,
        elapsedSec: t.elapsedSec + 1,
        heartRate: Math.min(195, t.heartRate + Math.floor(Math.random() * 3 - 1)),
        fatigue: Math.min(100, t.fatigue + 0.2),
      }));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: LiveMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/live-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          telemetry,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const assistantMsg: LiveMessage = {
        role: "assistant",
        content: data.content ?? data.text ?? "Sem resposta",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Conexão instável. Tente novamente." },
      ]);
    }
    setLoading(false);
  }, [input, loading, messages, telemetry]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <MobileFrame>
      <div className="sticky top-0 z-30 safe-top">
        <div className="flex items-center justify-between px-4 py-3 glass-strong">
          <motion.button
            onClick={() => navigate({ to: "/" })}
            whileTap={{ scale: 0.92 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated/80 border border-border/40"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-success animate-pulse" />
            <span className="text-sm font-semibold">Ao vivo</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsActive(!isActive)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated/80 border border-border/40"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>

      <PageTransition>
        <main className="flex-1 flex flex-col">
          {/* Telemetry Bar */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <Clock className="h-3.5 w-3.5" />, value: formatTime(elapsed), label: "Tempo", color: "text-accent-blue" },
                { icon: <Heart className="h-3.5 w-3.5" />, value: telemetry.heartRate.toString(), label: "BPM", color: "text-accent-pink" },
                { icon: <Zap className="h-3.5 w-3.5" />, value: `${Math.round(telemetry.fatigue)}%`, label: "Fadiga", color: "text-accent-orange" },
                { icon: <Flame className="h-3.5 w-3.5" />, value: telemetry.zone, label: "Zona", color: "text-accent-green" },
              ].map((t) => (
                <Card key={t.label} variant="default" className="p-2 text-center">
                  <div className={`flex items-center justify-center gap-1 ${t.color}`}>
                    {t.icon}
                    <span className="text-[9px] font-semibold uppercase">{t.label}</span>
                  </div>
                  <p className="font-display text-sm font-bold mt-1">{t.value}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-surface-card border border-border/60 text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-surface-card border border-border/60 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border/30">
            <input
              className="flex-1 rounded-2xl bg-surface-elevated border border-border px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-text-muted transition-all"
              placeholder="Pergunte ao coach..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <Button variant="primary" size="icon" onClick={sendMessage} disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}
