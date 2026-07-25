import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2, ArrowRight } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/coach/")({
  head: () => ({ meta: [{ title: "Coach IA — Pulse Fit" }] }),
  component: CoachPage,
});

function CoachPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const quickActions = [
    { label: "Montar treino", prompt: "Monte um treino de 30 minutos para mim" },
    { label: "Dica de nutrição", prompt: "Me dê uma dica de nutrição para hoje" },
    { label: "Motivação", prompt: "Me motiva para treinar hoje!" },
  ];

  return (
    <MobileFrame>
      <ScreenHeader title="Coach IA" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 flex flex-col px-5 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold">Olá! 👋</h2>
              <p className="mt-2 text-sm text-text-tertiary max-w-[260px]">Sou seu coach IA. Pergunte sobre treinos, nutrição ou peça motivação.</p>
              <div className="mt-6 space-y-2 w-full max-w-[300px]">
                {quickActions.map((a) => (
                  <button key={a.label} onClick={() => setInput(a.prompt)} className="w-full rounded-2xl bg-surface-card border border-border p-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
                    <span className="font-semibold">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl p-3.5 text-sm ${m.role === "user" ? "ml-8 bg-primary text-primary-foreground" : "mr-8 bg-surface-card border border-border"}`}>
                  {m.content}
                </motion.div>
              ))}
              {loading && (
                <div className="mr-8 rounded-2xl bg-surface-card border border-border p-3.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <input
              className="flex-1 rounded-2xl bg-surface-elevated border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-text-muted"
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) { setMessages((p) => [...p, { role: "user", content: input }]); setInput(""); } }}
            />
            <Button variant="primary" size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
