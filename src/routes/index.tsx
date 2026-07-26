import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight, Flame, Droplets, Timer, Sparkles, Play, Trophy,
  LogIn, Loader2, Zap, TrendingUp, Target, Calendar,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboard } from "@/data/mock";
import { useAuth } from "@/hooks/useAuth";
import { getMe } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse Fit — Painel diário de treino" },
      { name: "description", content: "Cadastre-se, valide seu WhatsApp e acompanhe todos os seus dados de treino no Pulse Fit." },
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

  if (loading) return <MobileFrame><DashboardSkeleton /></MobileFrame>;
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
    if (error) { setError(error.message); setSigning(false); }
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
              <span className="font-display text-sm font-semibold uppercase tracking-widest text-primary">Pulse Fit</span>
            </div>
            <h1 className="font-display text-[3.5rem] font-bold leading-[1]">
              Seu treino
              <br />
              <span className="text-primary">com IA</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary max-w-[300px]">
              Cadastre-se em segundos com sua conta Google. Depois valide seu WhatsApp para receber lembretes e treinos personalizados.
            </p>
          </div>

          <StaggerContainer className="my-8 space-y-3">
            <StaggerItem>
              <FeatureRow icon={<Sparkles className="h-5 w-5" />} title="Coach IA 24/7" text="Planos gerados no seu nível e objetivo." />
            </StaggerItem>
            <StaggerItem>
              <FeatureRow icon={<Trophy className="h-5 w-5" />} title="Progresso completo" text="Histórico, conquistas e métricas de cada treino." />
            </StaggerItem>
            <StaggerItem>
              <FeatureRow icon={<Target className="h-5 w-5" />} title="Metas personalizadas" text="Defina objetivos e acompanhe sua evolução." />
            </StaggerItem>
          </StaggerContainer>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="space-y-3">
            <motion.button
              onClick={signInGoogle}
              disabled={signing}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 disabled:opacity-50"
            >
              {signing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continuar com Google
            </motion.button>
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-destructive">{error}</motion.p>}
            <Link to="/" className="block text-center text-xs text-text-tertiary hover:text-text-secondary transition-colors">Continuar sem entrar</Link>
          </motion.div>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}

function FeatureRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-surface-card border border-border p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-text-tertiary">{text}</p>
      </div>
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────── */

function StudentDashboard() {
  const { user } = useAuth();
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const displayName = me.data?.profile?.full_name || user?.user_metadata?.full_name || "Atleta";

  const calories = dashboard.calories;
  const steps = dashboard.steps;
  const activeMin = dashboard.activeMinutes;
  const workouts = dashboard.recentWorkouts ?? [];
  const achievements = dashboard.achievements ?? 0;

  return (
    <MobileFrame>
      <PageTransition>
        <main className="flex-1 space-y-5 px-5 py-5 pb-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{greeting()}</p>
              <h1 className="font-display text-2xl font-bold truncate">{displayName.split(" ")[0]} 👋</h1>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-border overflow-hidden">
                {me.data?.profile?.avatar_url ? (
                  <img src={me.data.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : <span className="text-sm font-bold text-primary">{displayName[0]}</span>}
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <StaggerContainer className="grid grid-cols-2 gap-3">
            <StaggerItem>
              <KPICard icon={<Flame className="h-4 w-4" />} label="Calorias" value={`${calories.current}`} unit="kcal" progress={calories.current / calories.goal} color="text-accent-orange" />
            </StaggerItem>
            <StaggerItem>
              <KPICard icon={<Droplets className="h-4 w-4" />} label="Passos" value={`${steps.current.toLocaleString()}`} unit="" progress={steps.current / steps.goal} color="text-accent-blue" />
            </StaggerItem>
            <StaggerItem>
              <KPICard icon={<Timer className="h-4 w-4" />} label="Ativo" value={`${activeMin.current}`} unit="min" progress={activeMin.current / activeMin.goal} color="text-primary" />
            </StaggerItem>
            <StaggerItem>
              <KPICard icon={<Trophy className="h-4 w-4" />} label="Conquistas" value={`${achievements}`} unit="" progress={0.6} color="text-accent-purple" />
            </StaggerItem>
          </StaggerContainer>

          {/* Quick Actions */}
          <StaggerContainer className="grid grid-cols-2 gap-3">
            <StaggerItem>
              <Link to="/browse" className="group block rounded-2xl bg-gradient-to-br from-primary/10 via-surface-card to-surface-card border border-primary/10 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]">
                <Play className="h-5 w-5 text-primary" fill="currentColor" />
                <p className="mt-2 font-display text-lg font-semibold">Treinos</p>
                <p className="text-[11px] text-text-tertiary">Explorar disponíveis</p>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link to="/rewards" className="group block rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-4 text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]">
                <Trophy className="h-5 w-5" />
                <p className="mt-2 font-display text-lg font-semibold">{achievements}</p>
                <p className="text-[11px] opacity-70">Conquistas</p>
              </Link>
            </StaggerItem>
          </StaggerContainer>

          {/* Recent Workouts */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Treinos recentes</h2>
              <Link to="/history" className="text-xs font-semibold text-primary">Ver todos</Link>
            </div>
            {workouts.length === 0 ? (
              <Card variant="default" className="p-6 text-center">
                <p className="text-sm text-text-tertiary">Nenhum treino ainda. Comece pelo Coach IA!</p>
                <Link to="/coach" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                  <Sparkles className="h-3.5 w-3.5" /> Abrir Coach
                </Link>
              </Card>
            ) : (
              <StaggerContainer className="space-y-2">
                {workouts.map((w) => (
                  <StaggerItem key={w.id}>
                    <Link to={`/workout/${w.id}`} className="flex items-center justify-between rounded-2xl bg-surface-card border border-border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Treino</p>
                          <p className="text-[11px] text-text-tertiary">
                            {w.duration_seconds ? `${Math.round(w.duration_seconds / 60)} min · ` : ""}
                            {w.started_at ? new Date(w.started_at).toLocaleDateString("pt-BR") : "—"}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        w.status === "completed" ? "bg-success/15 text-success" : "bg-surface-elevated text-text-tertiary"
                      }`}>
                        {w.status === "completed" ? "Concluído" : w.status ?? "—"}
                      </span>
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

/* ─── KPI Card ────────────────────────────────────────── */

function KPICard({ icon, label, value, unit, progress, color }: {
  icon: React.ReactNode; label: string; value: string; unit: string; progress: number; color: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-card border border-border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-1.5">
        <span className={color}>{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold truncate">{value}</span>
        {unit && <span className="text-xs text-text-muted">{unit}</span>}
      </div>
      <div className="mt-2.5 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className={`h-full rounded-full ${color.replace("text-", "bg-")}`}
        />
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <main className="flex-1 space-y-5 px-5 py-5">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-6 w-32" /></div>
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
    </main>
  );
}
