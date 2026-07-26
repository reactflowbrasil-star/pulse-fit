import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Flame,
  Sparkles,
  Play,
  Trophy,
  Zap,
  TrendingUp,
  Target,
  Calendar,
  ChevronRight,
  MessageSquare,
  Dumbbell,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboard, workouts } from "@/data/mock";
import { trainers } from "@/data/trainers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse Fit — Painel diário de treino" },
      {
        name: "description",
        content:
          "Cadastre-se, valide seu WhatsApp e acompanhe todos os seus dados de treino no Pulse Fit.",
      },
      { property: "og:title", content: "Pulse Fit — Painel diário de treino" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function HomePage() {
  const { session, user, loading } = useAuth();

  if (loading)
    return (
      <MobileFrame>
        <DashboardSkeleton />
      </MobileFrame>
    );
  if (!session || !user) return <LandingSignup />;
  return <StudentDashboard />;
}

/* ─── Landing ─────────────────────────────────────────── */

function LandingSignup() {
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInGoogle = async () => {
    setSigning(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setSigning(false);
    }
  };

  return (
    <MobileFrame>
      <div className="absolute top-4 right-4 safe-top z-10">
        <ThemeToggle />
      </div>
      <PageTransition>
        <main className="flex flex-1 flex-col justify-between px-6 py-12">
          <div>
            <div className="flex items-center gap-2.5 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
                Pulse Fit
              </span>
            </div>
            <h1 className="font-display text-[3.5rem] font-bold leading-[1]">
              Seu treino
              <br />
              <span className="text-primary">com IA</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary max-w-[300px]">
              Cadastre-se em segundos com sua conta Google. Depois valide seu WhatsApp para receber
              lembretes e treinos personalizados.
            </p>
          </div>

          <StaggerContainer className="my-8 space-y-3">
            <StaggerItem>
              <FeatureRow
                icon={<Sparkles className="h-5 w-5" />}
                title="Coach IA 24/7"
                text="Planos gerados no seu nível e objetivo."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureRow
                icon={<Trophy className="h-5 w-5" />}
                title="Progresso completo"
                text="Histórico, conquistas e métricas de cada treino."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureRow
                icon={<Target className="h-5 w-5" />}
                title="Metas personalizadas"
                text="Defina objetivos e acompanhe sua evolução."
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureRow
                icon={<Dumbbell className="h-5 w-5" />}
                title="Personal Trainers IA"
                text="Escolha um treinador com estilo e especialidade."
              />
            </StaggerItem>
          </StaggerContainer>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-3"
          >
            <motion.button
              onClick={signInGoogle}
              disabled={signing}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {signing ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#fff"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#fff"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#fff"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#fff"
                    />
                  </svg>
                  Entrar com Google
                </>
              )}
            </motion.button>
            {error && (
              <p className="text-center text-xs text-destructive">{error}</p>
            )}
          </motion.div>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}

function FeatureRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface-card border border-border p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-text-tertiary mt-0.5">{text}</p>
      </div>
    </div>
  );
}

/* ─── Dashboard (logged in) ──────────────────────────── */

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Atleta";
  const defaultTrainer = trainers[0];

  const kpis = [
    { icon: <Flame className="h-4 w-4" />, label: "Calorias", value: "440", unit: "kcal", progress: 440 / 680, color: "text-accent-orange" },
    { icon: <TrendingUp className="h-4 w-4" />, label: "Passos", value: "11k", unit: "", progress: 11000 / 16000, color: "text-accent-blue" },
    { icon: <Target className="h-4 w-4" />, label: "Minutos", value: "42", unit: "min", progress: 42 / 60, color: "text-accent-green" },
    { icon: <Calendar className="h-4 w-4" />, label: "Distância", value: "6.3", unit: "km", progress: 6.3 / 8, color: "text-accent-pink" },
  ];

  return (
    <MobileFrame>
      <PageTransition>
        <main className="flex-1 space-y-5 px-5 py-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                {greeting()} 👋
              </p>
              <h1 className="font-display text-xl font-bold mt-0.5">{name}</h1>
            </div>
            <ThemeToggle />
          </div>

          {/* KPI Cards */}
          <StaggerContainer className="grid grid-cols-2 gap-3">
            {kpis.map((kpi) => (
              <StaggerItem key={kpi.label}>
                <Card variant="default" className="p-4">
                  <div className="flex items-center gap-1.5">
                    <span className={kpi.color}>{kpi.icon}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                      {kpi.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-2xl font-bold">{kpi.value}</span>
                    {kpi.unit && <span className="text-xs text-text-muted">{kpi.unit}</span>}
                  </div>
                  <div className="mt-2.5 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(kpi.progress * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                      className={`h-full rounded-full ${kpi.color.replace("text-", "bg-")}`}
                    />
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Coach CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card variant="gradient" hover className="p-4" onClick={() => navigate({ to: "/coach" })}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-2xl">
                  {defaultTrainer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-tertiary">Seu treinador</p>
                  <p className="font-display text-sm font-bold">{defaultTrainer.name}</p>
                  <p className="text-[11px] text-text-tertiary">{defaultTrainer.role}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Ações rápidas
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Sparkles className="h-5 w-5" />, label: "Coach", to: "/coach", color: "text-primary" },
                { icon: <Dumbbell className="h-5 w-5" />, label: "Treinos", to: "/browse", color: "text-accent-orange" },
                { icon: <User className="h-5 w-5" />, label: "Trainers", to: "/trainers", color: "text-accent-blue" },
              ].map((a) => (
                <motion.button
                  key={a.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate({ to: a.to })}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-surface-card border border-border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                >
                  <span className={a.color}>{a.icon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recent Workouts */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                Treinos recentes
              </h3>
              <Link to="/browse" className="text-xs font-semibold text-primary flex items-center gap-0.5">
                Ver todos <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {workouts.length === 0 ? (
              <Card variant="default" className="p-6 text-center">
                <p className="text-sm text-text-tertiary">
                  Nenhum treino ainda. Comece pelo Coach IA!
                </p>
                <Link
                  to="/coach"
                  search={{ trainer: "marcus-power" }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Abrir Coach
                </Link>
              </Card>
            ) : (
              <StaggerContainer className="space-y-2">
                {workouts.slice(0, 4).map((w) => (
                  <StaggerItem key={w.id}>
                    <Link
                      to={`/workout/${w.id}`}
                      className="flex items-center justify-between rounded-2xl bg-surface-card border border-border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Play className="h-4 w-4" strokeWidth={2.6} fill="currentColor" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{w.title}</p>
                          <p className="text-[11px] text-text-tertiary">
                            {w.duration} · {w.focus}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-text-muted" />
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </section>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}


/* ─── Skeleton ────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <main className="flex-1 space-y-5 px-5 py-5">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-surface-card border border-border p-4 space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </main>
  );
}
