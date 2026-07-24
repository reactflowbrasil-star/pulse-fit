import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Footprints,
  Flame,
  Droplets,
  Timer,
  Sparkles,
  Play,
  Trophy,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StepsProgressCard } from "@/components/dashboard/StepsProgressCard";
import { ActivityRings } from "@/components/dashboard/ActivityRings";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { dashboard, user } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse Fit — Painel diário de treino" },
      {
        name: "description",
        content:
          "Acompanhe passos, treinos, calorias e mantenha seu ritmo com o painel do Pulse Fit.",
      },
      { property: "og:title", content: "Pulse Fit — Painel diário de treino" },
      {
        property: "og:description",
        content:
          "Acompanhe passos, treinos, calorias e mantenha seu ritmo com o painel do Pulse Fit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/06a41eb4-2831-45bf-ad6c-91cfc47e481e/id-preview-d7162385--098b7ea2-536d-465c-90ab-17053513cb5a.lovable.app-1784861650238.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/06a41eb4-2831-45bf-ad6c-91cfc47e481e/id-preview-d7162385--098b7ea2-536d-465c-90ab-17053513cb5a.lovable.app-1784861650238.png",
      },
    ],
  }),
  component: DashboardPage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function DashboardPage() {
  const rings: [
    { label: string; pct: number; color: string },
    { label: string; pct: number; color: string },
    { label: string; pct: number; color: string },
  ] = [
    {
      label: "Passos",
      pct: (dashboard.steps.current / dashboard.steps.goal) * 100,
      color: "var(--primary)",
    },
    {
      label: "Calorias",
      pct: (dashboard.calories.current / dashboard.calories.goal) * 100,
      color: "var(--accent-orange)",
    },
    {
      label: "Ativo",
      pct: (dashboard.activeMinutes.current / dashboard.activeMinutes.goal) * 100,
      color: "var(--accent-blue)",
    },
  ];

  return (
    <MobileFrame>
      <StatusBar />
      <DashboardHeader name={user.name} avatar={user.avatar} greeting={greeting()} />

      <main className="flex-1 space-y-4 px-5 pb-6">
        <StepsProgressCard current={dashboard.steps.current} goal={dashboard.steps.goal} />

        {/* Bento: Coach IA CTA */}
        <Link
          to="/coach"
          className="grain-noise relative flex items-center justify-between overflow-hidden rounded-[28px] bg-surface p-5 ring-1 ring-primary/25 transition-transform active:scale-[0.98] animate-[card-in_500ms_ease-out]"
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

        {/* Bento: Activity rings — large tile */}
        <section className="relative overflow-hidden rounded-[28px] bg-surface p-5 ring-1 ring-white/5 animate-[card-in_500ms_ease-out]">
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

        {/* Bento grid — 2x2 metrics */}
        <section className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Flame className="h-4 w-4" strokeWidth={2.4} />}
            label="Calorias"
            value={dashboard.calories.current}
            unit={`/ ${dashboard.calories.goal} kcal`}
            goal={dashboard.calories.goal}
            accent="orange"
          />
          <MetricCard
            icon={<Droplets className="h-4 w-4" strokeWidth={2.4} />}
            label="Água"
            value={dashboard.water.current}
            unit={`/ ${dashboard.water.goal.toLocaleString("pt-BR")} L`}
            goal={dashboard.water.goal}
            accent="blue"
            decimals={1}
          />
          <MetricCard
            icon={<Timer className="h-4 w-4" strokeWidth={2.4} />}
            label="Ativo"
            value={dashboard.activeMinutes.current}
            unit={`/ ${dashboard.activeMinutes.goal} min`}
            goal={dashboard.activeMinutes.goal}
            accent="primary"
          />
          <MetricCard
            icon={<Footprints className="h-4 w-4" strokeWidth={2.4} />}
            label="Distância"
            value={dashboard.distanceKm.current}
            unit={`/ ${dashboard.distanceKm.goal.toLocaleString("pt-BR")} km`}
            goal={dashboard.distanceKm.goal}
            accent="primary"
            decimals={1}
          />
        </section>

        {/* Bento: Wide split — Rewards + Streak */}
        <section className="grid grid-cols-[1.4fr_1fr] gap-3">
          <Link
            to="/browse"
            className="relative overflow-hidden rounded-[24px] bg-surface p-4 ring-1 ring-white/5 transition-transform active:scale-[0.98] animate-[card-in_500ms_ease-out]"
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
            className="relative overflow-hidden rounded-[24px] bg-primary p-4 text-primary-foreground shadow-glow transition-transform active:scale-[0.98] animate-[card-in_500ms_ease-out]"
          >
            <Trophy className="h-5 w-5" strokeWidth={2.4} />
            <p className="mt-2 font-display text-2xl uppercase leading-none tracking-wide">
              7<span className="text-lg">d</span>
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-70">
              Sequência
            </p>
          </Link>
        </section>

        {/* Bento: Recent activity */}
        <section className="rounded-[28px] bg-surface p-5 ring-1 ring-white/5 animate-[card-in_500ms_ease-out]">
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
          <ul className="mt-3 space-y-2">
            {dashboard.activities.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-2xl bg-surface-elevated p-3 ring-1 ring-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2.6} />
                  </div>
                  <div>
                    <p className="font-display text-base uppercase tracking-wide">
                      {a.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {a.distance} · {a.when}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Registrar
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <BottomNav />
    </MobileFrame>
  );
}
