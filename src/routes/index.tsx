import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Footprints,
  Flame,
  Droplets,
  Timer,
  Sparkles,
  Play,
  Trophy,
  LogIn,
  Loader2,
  ShieldCheck,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StepsProgressCard } from "@/components/dashboard/StepsProgressCard";
import { ActivityRings } from "@/components/dashboard/ActivityRings";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { dashboard, user as mockUser } from "@/data/mock";
import { useAuth } from "@/hooks/useAuth";
import { getMe } from "@/lib/auth.functions";
import { lovable } from "@/integrations/lovable";
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
      {
        property: "og:description",
        content:
          "Cadastre-se, valide seu WhatsApp e acompanhe todos os seus dados de treino no Pulse Fit.",
      },
      { property: "og:type", content: "website" },
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

  if (loading) {
    return (
      <MobileFrame>
        <StatusBar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </MobileFrame>
    );
  }

  if (!session || !user) return <LandingSignup />;

  return <StudentDashboard />;
}

/* ============= LANDING / CADASTRO ============= */

function LandingSignup() {
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInGoogle = async () => {
    setSigning(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(
        result.error instanceof Error ? result.error.message : "Falha ao entrar.",
      );
      setSigning(false);
    }
  };

  return (
    <MobileFrame>
      <StatusBar />
      <main className="flex flex-1 flex-col justify-between px-6 pb-10 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-display text-xs uppercase tracking-[0.35em] text-primary">
            Pulse Fit
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-[0.9] tracking-wide">
            Seu treino
            <br />
            <span className="text-primary">com IA</span>
          </h1>
          <p className="mt-4 text-sm text-text-secondary">
            Cadastre-se em segundos com sua conta Google. Depois valide seu
            WhatsApp para receber lembretes, treinos personalizados e feedback
            do seu coach virtual.
          </p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="my-8 space-y-3"
        >
          <FeatureRow
            icon={<Sparkles className="h-5 w-5" />}
            title="Coach IA 24/7"
            text="Planos gerados no seu nível e objetivo."
          />
          <FeatureRow
            icon={<MessageCircle className="h-5 w-5" />}
            title="Bot no WhatsApp"
            text="Lembretes, motivação e check-ins diretos no seu celular."
          />
          <FeatureRow
            icon={<Trophy className="h-5 w-5" />}
            title="Progresso completo"
            text="Histórico, conquistas e métricas de cada treino."
          />
        </motion.ul>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={signInGoogle}
            disabled={signing}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {signing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            Cadastrar / entrar com Google
          </button>
          {error && <p className="text-center text-xs text-red-400">{error}</p>}
          <p className="text-center text-[11px] text-text-tertiary">
            Ao continuar você concorda em receber mensagens do bot Pulse Fit no
            WhatsApp.
          </p>
        </motion.div>
      </main>
    </MobileFrame>
  );
}

function FeatureRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-surface p-4 ring-1 ring-white/5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        {icon}
      </div>
      <div>
        <p className="font-display text-base uppercase tracking-wide">{title}</p>
        <p className="text-xs text-text-tertiary">{text}</p>
      </div>
    </li>
  );
}

/* ============= WHATSAPP GATE ============= */

function WhatsappGate({ phone }: { phone?: string | null }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-surface p-5 ring-1 ring-primary/30">
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Passo final
          </p>
          <p className="font-display text-xl uppercase tracking-wide">
            Valide seu WhatsApp
          </p>
        </div>
      </div>
      <p className="relative mt-3 text-xs text-text-secondary">
        Precisamos confirmar seu número{phone ? ` (${phone})` : ""} para liberar
        os lembretes e o histórico completo dos seus treinos.
      </p>
      <Link
        to="/whatsapp-setup"
        className="relative mt-4 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-glow"
      >
        <ShieldCheck className="h-4 w-4" />
        Confirmar meu WhatsApp
      </Link>
    </section>
  );
}

/* ============= STUDENT DASHBOARD ============= */

type WorkoutRow = {
  id: string;
  started_at: string | null;
  completed_at: string | null;
  status: string | null;
  focus: string | null;
  duration_minutes: number | null;
};

type MetricRow = {
  date: string;
  steps: number | null;
  calories: number | null;
  active_minutes: number | null;
  water_ml: number | null;
  distance_km: number | null;
};

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });

  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [metric, setMetric] = useState<MetricRow | null>(null);
  const [achievements, setAchievements] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [w, m, a] = await Promise.all([
        supabase
          .from("workout_sessions")
          .select("id, started_at, completed_at, status, focus, duration_minutes")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(5),
        supabase
          .from("daily_metrics")
          .select("date, steps, calories, active_minutes, water_ml, distance_km")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("user_achievements")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);
      setWorkouts((w.data as WorkoutRow[] | null) ?? []);
      setMetric((m.data as MetricRow | null) ?? null);
      setAchievements(a.count ?? 0);
    })();
  }, [user]);

  const profile = me.data?.profile;
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || "Aluno";
  const avatar =
    profile?.avatar_url || user?.user_metadata?.avatar_url || mockUser.avatar;
  const whatsappOk = !!profile?.whatsapp_verified;
  const whatsappNumber = profile?.whatsapp_number
    ? String(profile.whatsapp_number).replace(/@.*/, "")
    : null;

  const steps = metric?.steps ?? dashboard.steps.current;
  const stepsGoal = dashboard.steps.goal;
  const calories = metric?.calories ?? dashboard.calories.current;
  const activeMin = metric?.active_minutes ?? dashboard.activeMinutes.current;
  const waterL = metric?.water_ml
    ? metric.water_ml / 1000
    : dashboard.water.current;
  const distanceKm = metric?.distance_km ?? dashboard.distanceKm.current;

  const rings: [
    { label: string; pct: number; color: string },
    { label: string; pct: number; color: string },
    { label: string; pct: number; color: string },
  ] = [
    {
      label: "Passos",
      pct: (steps / stepsGoal) * 100,
      color: "var(--primary)",
    },
    {
      label: "Calorias",
      pct: (calories / dashboard.calories.goal) * 100,
      color: "var(--accent-orange)",
    },
    {
      label: "Ativo",
      pct: (activeMin / dashboard.activeMinutes.goal) * 100,
      color: "var(--accent-blue)",
    },
  ];

  const completed = workouts.filter((w) => w.status === "completed").length;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <MobileFrame>
      <StatusBar />
      <DashboardHeader name={displayName} avatar={avatar} greeting={greeting()} />

      <main className="flex-1 space-y-4 px-5 pb-6">
        {!whatsappOk && <WhatsappGate phone={whatsappNumber} />}

        {/* Ficha do aluno */}
        <section className="rounded-[28px] bg-surface p-5 ring-1 ring-white/5">
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt=""
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/40"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                Ficha do aluno
              </p>
              <p className="truncate font-display text-xl uppercase tracking-wide">
                {displayName}
              </p>
              {me.data?.isAdmin && (
                <span className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Admin
                </span>
              )}
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-xs">
            <InfoLine
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={user?.email ?? "—"}
            />
            <InfoLine
              icon={<Phone className="h-4 w-4" />}
              label="WhatsApp"
              value={
                whatsappNumber
                  ? `${whatsappNumber} ${whatsappOk ? "✓" : "(não verificado)"}`
                  : "Não cadastrado"
              }
              accent={whatsappOk}
            />
            <InfoLine
              icon={<Calendar className="h-4 w-4" />}
              label="Membro desde"
              value={memberSince}
            />
            <InfoLine
              icon={<Trophy className="h-4 w-4" />}
              label="Treinos concluídos"
              value={String(completed)}
            />
            <InfoLine
              icon={<Sparkles className="h-4 w-4" />}
              label="Conquistas"
              value={String(achievements)}
            />
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/profile"
              className="rounded-full bg-surface-elevated py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-primary"
            >
              Meu perfil
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="rounded-full bg-surface-elevated py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-red-400"
            >
              Sair
            </button>
          </div>
        </section>

        <StepsProgressCard current={steps} goal={stepsGoal} />

        {/* Coach IA CTA */}
        <Link
          to="/coach"
          className="grain-noise relative flex items-center justify-between overflow-hidden rounded-[28px] bg-surface p-5 ring-1 ring-primary/25 transition-transform active:scale-[0.98]"
        >
          <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex min-w-0 items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-7 w-7" strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Coach IA
              </p>
              <p className="truncate font-display text-xl uppercase tracking-wide">
                Treino guiado 3D
              </p>
              <p className="truncate text-xs text-text-tertiary">
                Voz + demonstração ao vivo
              </p>
            </div>
          </div>
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
            <ArrowUpRight className="h-5 w-5" strokeWidth={2.6} />
          </div>
        </Link>

        {/* Anéis */}
        <section className="relative overflow-hidden rounded-[28px] bg-surface p-5 ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                Hoje
              </p>
              <h2 className="font-display text-2xl uppercase tracking-wide">
                Atividade
              </h2>
            </div>
            <Link
              to="/stats"
              className="rounded-full bg-surface-elevated px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary"
            >
              Detalhes
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-5">
            <div className="grid grid-cols-1 gap-2.5">
              {rings.map((r) => (
                <div key={r.label} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: r.color,
                      boxShadow: `0 0 8px ${r.color}`,
                    }}
                  />
                  <span className="text-text-secondary">{r.label}</span>
                  <span className="ml-auto font-display text-base tabular-nums">
                    {Math.round(r.pct)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="h-36 w-36">
              <ActivityRings rings={rings} size={144} />
            </div>
          </div>
        </section>

        {/* Métricas */}
        <section className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Flame className="h-4 w-4" strokeWidth={2.4} />}
            label="Calorias"
            value={calories}
            unit={`/ ${dashboard.calories.goal} kcal`}
            goal={dashboard.calories.goal}
            accent="orange"
          />
          <MetricCard
            icon={<Droplets className="h-4 w-4" strokeWidth={2.4} />}
            label="Água"
            value={waterL}
            unit={`/ ${dashboard.water.goal.toLocaleString("pt-BR")} L`}
            goal={dashboard.water.goal}
            accent="blue"
            decimals={1}
          />
          <MetricCard
            icon={<Timer className="h-4 w-4" strokeWidth={2.4} />}
            label="Ativo"
            value={activeMin}
            unit={`/ ${dashboard.activeMinutes.goal} min`}
            goal={dashboard.activeMinutes.goal}
            accent="primary"
          />
          <MetricCard
            icon={<Footprints className="h-4 w-4" strokeWidth={2.4} />}
            label="Distância"
            value={distanceKm}
            unit={`/ ${dashboard.distanceKm.goal.toLocaleString("pt-BR")} km`}
            goal={dashboard.distanceKm.goal}
            accent="primary"
            decimals={1}
          />
        </section>

        {/* Wide split */}
        <section className="grid grid-cols-[1.4fr_1fr] gap-3">
          <Link
            to="/browse"
            className="relative overflow-hidden rounded-[24px] bg-surface p-4 ring-1 ring-white/5 transition-transform active:scale-[0.98]"
          >
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" fill="currentColor" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                Explorar
              </span>
            </div>
            <p className="relative mt-2 font-display text-2xl uppercase leading-none tracking-wide">
              Treinos
              <br />
              <span className="text-primary">em alta</span>
            </p>
            <p className="relative mt-3 text-xs text-text-tertiary">
              +240 sessões disponíveis
            </p>
          </Link>
          <Link
            to="/rewards"
            className="relative overflow-hidden rounded-[24px] bg-primary p-4 text-primary-foreground shadow-glow transition-transform active:scale-[0.98]"
          >
            <Trophy className="h-5 w-5" strokeWidth={2.4} />
            <p className="mt-2 font-display text-2xl uppercase leading-none tracking-wide">
              {achievements}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-70">
              Conquistas
            </p>
          </Link>
        </section>

        {/* Treinos recentes */}
        <section className="rounded-[28px] bg-surface p-5 ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                Recentes
              </p>
              <h2 className="font-display text-xl uppercase tracking-wide">
                Seus treinos
              </h2>
            </div>
            <Link
              to="/history"
              className="text-[11px] font-bold uppercase tracking-wider text-primary"
            >
              Ver todos
            </Link>
          </div>
          {workouts.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-surface-elevated p-4 text-center text-xs text-text-tertiary">
              Você ainda não tem treinos. Comece agora pelo Coach IA.
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {workouts.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between rounded-2xl bg-surface-elevated p-3 ring-1 ring-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <ArrowUpRight className="h-5 w-5" strokeWidth={2.6} />
                    </div>
                    <div>
                      <p className="font-display text-base uppercase tracking-wide">
                        {w.focus ?? "Treino"}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {w.duration_minutes
                          ? `${w.duration_minutes} min · `
                          : ""}
                        {w.started_at
                          ? new Date(w.started_at).toLocaleDateString("pt-BR")
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      w.status === "completed"
                        ? "bg-primary/15 text-primary"
                        : "bg-surface text-text-tertiary"
                    }`}
                  >
                    {w.status === "completed" ? "Concluído" : w.status ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <BottomNav />
    </MobileFrame>
  );
}

function InfoLine({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-surface-elevated px-3 py-2">
      <span className={accent ? "text-primary" : "text-text-tertiary"}>
        {icon}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
        {label}
      </span>
      <span className="ml-auto truncate text-right text-xs font-semibold">
        {value}
      </span>
    </li>
  );
}
