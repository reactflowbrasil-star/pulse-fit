import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ArrowUpRight, Footprints, Flame, Droplets } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { dashboard, user } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse Fit — Your daily training dashboard" },
      {
        name: "description",
        content:
          "Track steps, workouts, calories and stay on top of your training with the Pulse Fit dashboard.",
      },
      { property: "og:title", content: "Pulse Fit — Daily training dashboard" },
      {
        property: "og:description",
        content: "Steps, workouts and daily activity in one dark, focused view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
            <p className="text-sm text-text-tertiary">Hello {user.name}!</p>
            <p className="truncate text-base font-bold">Let's start your day</p>
          </div>
        </div>
        <button
          aria-label="Rewards"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface"
        >
          <Trophy className="h-5 w-5 text-primary" />
        </button>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-6">
        {/* Steps hero card */}
        <section className="rounded-[28px] bg-primary p-6 text-primary-foreground shadow-glow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold opacity-70">Steps</span>
            <Footprints className="h-5 w-5" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-6xl font-black tracking-tight">
              {dashboard.steps.current.toLocaleString("en-US").replace(",", " ")}
            </span>
            <span className="text-lg font-semibold opacity-60">
              / {dashboard.steps.goal.toLocaleString("en-US").replace(",", " ")}
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

        {/* Daily activity */}
        <section className="rounded-[28px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Daily Activity</h2>
            <Link to="/browse" className="text-xs font-semibold text-primary">
              See all
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4">
            <div className="space-y-3">
              <Metric
                icon={<Footprints className="h-4 w-4" />}
                label="Steps"
                value={`${dashboard.steps.current.toLocaleString("en-US").replace(",", " ")}`}
                sub={`/ ${dashboard.steps.goal.toLocaleString("en-US").replace(",", " ")}`}
              />
              <Metric
                icon={<Flame className="h-4 w-4" />}
                label="Calories"
                value={`${dashboard.calories.current}`}
                sub={`/ ${dashboard.calories.goal} Cal`}
              />
              <Metric
                icon={<Droplets className="h-4 w-4" />}
                label="Water"
                value={`${dashboard.water.current}`}
                sub={`/ ${dashboard.water.goal} L`}
              />
            </div>
            <ActivityRings />
          </div>
        </section>

        {/* Workouts */}
        <section className="rounded-[28px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Workouts</h2>
            <Link to="/browse" className="text-xs font-semibold text-primary">
              See all
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
                <span className="text-xs font-semibold text-primary">Log</span>
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
            <circle
              cx="60"
              cy="60"
              r={ring.r}
              fill="none"
              stroke="oklch(0.29 0.008 265)"
              strokeWidth="8"
            />
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
