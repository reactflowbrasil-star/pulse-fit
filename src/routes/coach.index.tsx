/**
 * Coach IA — Personal Trainer Virtual Hub
 * Shows trainer greeting, today's suggestion, quick actions, and chat.
 */
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  Dumbbell,
  Zap,
  Target,
  MessageSquare,
  Play,
  Clock,
  Flame,
  Heart,
  ArrowRight,
  ChevronRight,
  Mic,
  Volume2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachChat, type ChatMessage } from "@/components/CoachChat";
import { useAuth } from "@/hooks/useAuth";
import { trainers, getTrainerById, type TrainerProfile } from "@/data/trainers";

export const Route = createFileRoute("/coach/")({
  head: () => ({ meta: [{ title: "Coach IA — Pulse Fit" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    trainer: (search.trainer as string) ?? "marcus-power",
  }),
  component: CoachPage,
});

function CoachPage() {
  const { user } = useAuth();
  const { trainer: trainerId } = Route.useSearch();
  const navigate = useNavigate();
  const [view, setView] = useState<"home" | "chat" | "select-trainer">("home");
  const [greeting, setGreeting] = useState<string>("");
  const [greetingLoading, setGreetingLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);

  const trainer = useMemo(() => getTrainerById(trainerId) ?? trainers[0], [trainerId]);
  const userName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Atleta";

  // Fetch personalized greeting
  useEffect(() => {
    async function fetchGreeting() {
      setGreetingLoading(true);
      try {
        const { getTrainerGreeting } = await import("@/lib/trainer-chat.functions");
        const result = await getTrainerGreeting({
          data: {
            trainerId: trainer.id,
            userName,
          },
        });
        setGreeting(result.greeting);
      } catch {
        setGreeting(`${trainer.style.emoji} Olá, ${userName}! ${trainer.style.greeting}`);
      }
      setGreetingLoading(false);
    }
    fetchGreeting();
  }, [trainer.id, userName]);

  const handleSendMessage = useCallback(
    async (message: string, existingMessages: ChatMessage[]): Promise<string> => {
      // Build messages for API from existing + new
      const apiMessages = [
        ...existingMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ];

      try {
        const response = await fetch("/api/trainer/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trainerId: trainer.id,
            messages: apiMessages,
            userProfile: { name: userName },
          }),
        });

        if (!response.ok) throw new Error("Chat failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              const text = line.slice(2).replace(/^"/, "").replace(/"$/, "");
              fullText += text;
            }
          }
        }

        return fullText || "Sem resposta do treinador.";
      } catch {
        return "Desculpe, tive um problema de conexão. Pode repetir?";
      }
    },
    [trainer.id, userName],
  );

  const handleGenerateWorkout = useCallback(async () => {
    setGeneratingWorkout(true);
    try {
      const { generateTrainerWorkout } = await import("@/lib/trainer-chat.functions");
      const result = await generateTrainerWorkout({
        data: {
          trainerId: trainer.id,
          objective: "condicionamento",
          level: "intermediario",
          minutes: 30,
          location: "casa",
          equipment: [],
        },
      });

      if (result.plan) {
        const planMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Perfeito! Montei um treino de ${result.plan.estimatedMinutes} minutos pra você:\n\n**${result.plan.title}**\n${result.plan.intro}\n\n${
            result.plan.exercises
              .map(
                (ex, i) =>
                  `${i + 1}. **${ex.exerciseId}** — ${ex.sets}x${ex.reps} (${ex.restSeconds}s descanso)`,
              )
              .join("\n")
          }\n\nQuer começar agora?`,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, planMsg]);
        setView("chat");
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Não consegui montar o treino agora. Tente novamente em instantes!",
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
      setView("chat");
    }
    setGeneratingWorkout(false);
  }, [trainer.id]);

  // ─── SELECT TRAINER VIEW ────────────────────────────
  if (view === "select-trainer") {
    return (
      <MobileFrame>
        <ScreenHeader title="Escolher Treinador" onBack={() => setView("home")} />
        <PageTransition>
          <main className="flex-1 px-5 py-4 overflow-y-auto">
            <StaggerContainer className="space-y-2">
              {trainers.map((t) => (
                <StaggerItem key={t.id}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigate({
                        to: "/coach",
                        search: { trainer: t.id },
                        replace: true,
                      });
                      setView("home");
                    }}
                    className={`w-full flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all ${
                      t.id === trainer.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-surface-card border border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                      {t.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-bold">{t.name}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-bold">{t.rating}</span>
                      </div>
                      <p className="text-[11px] text-text-tertiary truncate">{t.role}</p>
                    </div>
                    {t.id === trainer.id && (
                      <span className="rounded-lg bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                        ATUAL
                      </span>
                    )}
                  </motion.button>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </main>
        </PageTransition>
        <BottomNav />
      </MobileFrame>
    );
  }

  // ─── CHAT VIEW ──────────────────────────────────────
  if (view === "chat") {
    return (
      <MobileFrame>
        <div className="sticky top-0 z-30 safe-top">
          <div className="flex items-center gap-3 px-4 py-3 glass-strong">
            <motion.button
              onClick={() => setView("home")}
              whileTap={{ scale: 0.92 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated/80 border border-border/40 text-foreground"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </motion.button>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm">
                {trainer.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{trainer.name}</p>
                <p className="text-[10px] text-text-tertiary flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setView("select-trainer")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated/80 border border-border/40"
            >
              <RefreshCw className="h-4 w-4 text-text-secondary" />
            </motion.button>
          </div>
        </div>

        <CoachChat
          trainerName={trainer.name}
          trainerEmoji={trainer.style.emoji}
          initialMessages={
            chatMessages.length > 0
              ? chatMessages
              : [
                  {
                    id: "welcome",
                    role: "assistant",
                    content: `${trainer.style.emoji} Olá ${userName}! Sou o ${trainer.name}, seu personal trainer virtual. Como posso te ajudar hoje? Posso montar um treino, dar dicas ou te motivar!`,
                    timestamp: Date.now(),
                  },
                ]
          }
          onSendMessage={handleSendMessage}
          placeholder={`Fale com ${trainer.name}...`}
          showVoice={true}
        />
      </MobileFrame>
    );
  }

  // ─── HOME VIEW (DEFAULT) ────────────────────────────
  return (
    <MobileFrame>
      <ScreenHeader
        title="Coach IA"
        onBack={() => window.history.back()}
        right={
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setView("select-trainer")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated/80 border border-border/40"
          >
            <RefreshCw className="h-4 w-4 text-text-secondary" />
          </motion.button>
        }
      />
      <PageTransition>
        <main className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {greetingLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-text-secondary">{greeting}</p>
            )}
          </motion.div>

          {/* Trainer Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card variant="gradient" className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  {trainer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base font-bold">{trainer.name}</p>
                  <p className="text-xs text-text-tertiary">{trainer.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400">{trainer.rating}</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("select-trainer")}
                  className="text-xs font-semibold text-primary flex items-center gap-0.5"
                >
                  Trocar <ChevronRight className="h-3 w-3" />
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-2">
              Ações rápidas
            </h3>
            <StaggerContainer className="grid grid-cols-2 gap-2">
              <StaggerItem>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerateWorkout}
                  disabled={generatingWorkout}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-surface-card border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {generatingWorkout ? (
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  ) : (
                    <Dumbbell className="h-6 w-6 text-accent-orange" />
                  )}
                  <span className="text-xs font-semibold">Montar treino</span>
                </motion.button>
              </StaggerItem>
              <StaggerItem>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setView("chat")}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-surface-card border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                >
                  <MessageSquare className="h-6 w-6 text-accent-blue" />
                  <span className="text-xs font-semibold">Conversar</span>
                </motion.button>
              </StaggerItem>
              <StaggerItem>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const msg: ChatMessage = {
                      id: crypto.randomUUID(),
                      role: "user",
                      content: "Me dê uma dica de nutrição para hoje!",
                      timestamp: Date.now(),
                    };
                    setChatMessages([msg]);
                    setView("chat");
                  }}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-surface-card border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                >
                  <Flame className="h-6 w-6 text-accent-pink" />
                  <span className="text-xs font-semibold">Dica nutricional</span>
                </motion.button>
              </StaggerItem>
              <StaggerItem>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const msg: ChatMessage = {
                      id: crypto.randomUUID(),
                      role: "user",
                      content: "Me motiva para treinar hoje!",
                      timestamp: Date.now(),
                    };
                    setChatMessages([msg]);
                    setView("chat");
                  }}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-surface-card border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                >
                  <Zap className="h-6 w-6 text-accent-green" />
                  <span className="text-xs font-semibold">Motivação</span>
                </motion.button>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Today's Suggestion */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-2">
              Sugerido para hoje
            </h3>
            <Card variant="default" hover className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Play className="h-5 w-5" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Treino HIIT Express</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 20 min
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" /> ~250 kcal
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted" />
              </div>
            </Card>
          </motion.div>

          {/* Motivation Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-2"
          >
            <p className="text-xs italic text-text-tertiary">
              "{trainer.style.catchphrase}"
            </p>
            <p className="text-[10px] text-text-muted mt-1">— {trainer.name}</p>
          </motion.div>

          {/* Start Session CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="pb-4"
          >
            <Button
              className="w-full"
              size="lg"
              onClick={() => setView("chat")}
            >
              <MessageSquare className="h-4 w-4" /> Conversar com {trainer.name}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
