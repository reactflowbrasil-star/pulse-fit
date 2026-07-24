import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Footprints, Flame, Droplets, Timer, Sparkles } from "lucide-react";
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

        <Link
          to="/coach"
          className="flex items-center justify-between rounded-[28px] bg-gradient-to-r from-primary/25 via-surface to-surface p-4 ring-1 ring-primary/25 transition-transform active:scale-[0.98] animate-[card-in_500ms_ease-out]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Coach IA</p>
              <p className="truncate text-sm font-black">Treinador 3D com IA e voz</p>
            </div>
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-primary" />
        </Link>

        <section className="rounded-[28px] bg-surface p-5 animate-[card-in_500ms_ease-out]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Atividade do dia</h2>
            <Link to="/stats" className="text-xs font-semibold text-primary">
              Ver detalhes
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-5">
            <div className="grid grid-cols-1 gap-2">
              {rings.map((r) => (
                <div key={r.label} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="text-text-tertiary">{r.label}</span>
                  <span className="ml-auto font-bold tabular-nums">
                    {Math.round(r.pct)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="h-32 w-32">
              <ActivityRings rings={rings} size={128} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Flame className="h-4 w-4" />}
            label="Calorias"
            value={dashboard.calories.current}
            unit={`/ ${dashboard.calories.goal} kcal`}
            goal={dashboard.calories.goal}
            accent="orange"
          />
          <MetricCard
            icon={<Droplets className="h-4 w-4" />}
            label="Água"
            value={dashboard.water.current}
            unit={`/ ${dashboard.water.goal.toLocaleString("pt-BR")} L`}
            goal={dashboard.water.goal}
            accent="blue"
            decimals={1}
          />
          <MetricCard
            icon={<Timer className="h-4 w-4" />}
            label="Minutos ativos"
            value={dashboard.activeMinutes.current}
            unit={`/ ${dashboard.activeMinutes.goal} min`}
            goal={dashboard.activeMinutes.goal}
            accent="primary"
          />
          <MetricCard
            icon={<Footprints className="h-4 w-4" />}
            label="Distância"
            value={dashboard.distanceKm.current}
            unit={`/ ${dashboard.distanceKm.goal.toLocaleString("pt-BR")} km`}
            goal={dashboard.distanceKm.goal}
            accent="primary"
            decimals={1}
          />
        </section>

        <section className="rounded-[28px] bg-surface p-5 animate-[card-in_500ms_ease-out]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Treinos</h2>
            <Link to="/browse" className="text-xs font-semibold text-primary">
              Ver todos
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {dashboard.activities.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-2xl bg-surface-elevated p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-xs text-text-tertiary">
                      {a.distance} · {a.when}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary">Registrar</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <BottomNav />
    </MobileFrame>
  );
}
