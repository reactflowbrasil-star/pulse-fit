import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ArrowUpRight, Footprints, Flame, Droplets, Sparkles } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { dashboard, user } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AirFlow — Seu painel diário de treino" },
      {
        name: "description",
        content:
          "Acompanhe passos, treinos, calorias e mantenha seu ritmo com o painel do Pulse Fit.",
      },
      { property: "og:title", content: "AirFlow — Seu painel diário de treino" },
      {
        property: "og:description",
        content: "Acompanhe passos, treinos, calorias e mantenha seu ritmo com o painel do Pulse Fit.",
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

function DashboardPage() {
  const stepsPct = Math.round((dashboard.steps.current / dashboard.steps.goal) * 100);

  return (
    <MobileFrame>
      <StatusBar />
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 pt-2 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={user.avatar}
            alt=""
            width={512}
            height={512}
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary/40"
          />
          <div className="min-w-0">
            <p className="text-sm text-text-tertiary">Olá, {user.name}!</p>
            <p className="truncate text-base font-bold">Vamos começar o seu dia</p>
          </div>
        </div>
        <Link
          to="/rewards"
          aria-label="Recompensas"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface"
        >
          <Trophy className="h-5 w-5 text-primary" />
        </Link>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-6">
        <section className="rounded-[28px] bg-primary p-6 text-primary-foreground shadow-glow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold opacity-70">Passos</span>
            <Footprints className="h-5 w-5" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-6xl font-black tracking-tight">
              {dashboard.steps.current.toLocaleString("pt-BR")}
            </span>
            <span className="text-lg font-semibold opacity-60">
              / {dashboard.steps.goal.toLocaleString("pt-BR")}
            </span>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-primary-foreground/15">
              <div
                className="h-full rounded-full bg-primary-foreground transition-all"
                style={{ width: `${stepsPct}%` }}
              />
            </div>
            <div className="mt-2 text-sm font-bold">{stepsPct}%</div>
          </div>
        </section>
        <Link
          to="/coach"
          className="flex items-center justify-between rounded-[28px] bg-gradient-to-r from-primary/25 via-surface to-surface p-4 ring-1 ring-primary/25 transition-transform active:scale-[0.98]"
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


        <section className="rounded-[28px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Atividade do dia</h2>
            <Link to="/browse" className="text-xs font-semibold text-primary">
              Ver todos
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4">
            <div className="space-y-3">
              <Metric
                icon={<Footprints className="h-4 w-4" />}
                label="Passos"
                value={`${dashboard.steps.current.toLocaleString("pt-BR")}`}
                sub={`/ ${dashboard.steps.goal.toLocaleString("pt-BR")}`}
              />
              <Metric
                icon={<Flame className="h-4 w-4" />}
                label="Calorias"
                value={`${dashboard.calories.current}`}
                sub={`/ ${dashboard.calories.goal} kcal`}
              />
              <Metric
                icon={<Droplets className="h-4 w-4" />}
                label="Água"
                value={`${dashboard.water.current.toString().replace(".", ",")}`}
                sub={`/ ${dashboard.water.goal.toString().replace(".", ",")} L`}
              />
            </div>
            <ActivityRings />
          </div>
        </section>

        <section className="rounded-[28px] bg-surface p-5">
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
                    <p className="text-xs text-text-tertiary">{a.distance} · {a.when}</p>
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

function Metric({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-xl font-black">{value}</span>
        <span className="text-xs text-text-tertiary">{sub}</span>
      </div>
    </div>
  );
}

function ActivityRings() {
  const rings = [
    { r: 46, pct: 68, color: "var(--primary)" },
    { r: 34, pct: 64, color: "oklch(0.75 0.15 200)" },
    { r: 22, pct: 72, color: "oklch(0.78 0.18 60)" },
  ];
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32">
      {rings.map((ring) => {
        const c = 2 * Math.PI * ring.r;
        return (
          <g key={ring.r} transform="rotate(-90 60 60)">
            <circle cx="60" cy="60" r={ring.r} fill="none" stroke="oklch(0.29 0.008 265)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (c * ring.pct) / 100}
            />
          </g>
        );
      })}
    </svg>
  );
}
