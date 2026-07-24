import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Flame, Timer, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { getWorkoutSession } from "@/lib/coach.functions";

export const Route = createFileRoute("/coach/summary/$sessionId")({
  head: () => ({
    meta: [
      { title: "Treino concluído — Pulse Fit" },
      { name: "description", content: "Resumo da sua sessão de treino." },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  const { sessionId } = Route.useParams();
  const getSession = useServerFn(getWorkoutSession);
  const { data: session } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession({ data: { sessionId } }),
  });

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1200);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const duration = session?.duration_seconds ?? 0;
  const calories = session?.calories_estimate ?? 0;

  const r = 80;
  const c = 2 * Math.PI * r;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-[480px] flex-col items-center bg-background-deep px-6 pt-[max(3rem,env(safe-area-inset-top))]">
      <div className="relative grid place-items-center">
        <svg viewBox="0 0 200 200" className="h-56 w-56">
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="oklch(0.29 0.008 265)"
            strokeWidth="10"
          />
          <g transform="rotate(-90 100 100)">
            <circle
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - c * progress}
              style={{ filter: "drop-shadow(0 0 12px oklch(0.94 0.19 128 / 0.6))" }}
            />
          </g>
        </svg>
        <div className="absolute grid place-items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground animate-[check-pop_500ms_ease-out]">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
        </div>
      </div>

      <h1 className="mt-8 text-3xl font-black">Treino concluído!</h1>
      <p className="mt-1 text-sm text-text-tertiary">
        Você deu um passo firme rumo ao próximo nível.
      </p>

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        <StatCard
          icon={<Timer className="h-5 w-5" />}
          label="Duração"
          value={formatDuration(duration)}
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Calorias"
          value={`${calories} kcal`}
        />
      </div>

      <div className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-primary/10 p-4 text-primary ring-1 ring-primary/25">
        <Trophy className="h-5 w-5 shrink-0" />
        <p className="text-sm font-semibold">
          Conquista: consistência em dia. Continue assim!
        </p>
      </div>

      <div className="mt-auto w-full space-y-3 py-6">
        <Link
          to="/coach"
          className="block w-full rounded-full bg-primary py-4 text-center text-base font-black text-primary-foreground shadow-glow active:scale-[0.98]"
        >
          Fazer outro treino
        </Link>
        <Link
          to="/"
          className="block w-full rounded-full bg-surface py-4 text-center text-sm font-bold text-foreground active:scale-[0.98]"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="flex items-center gap-2 text-primary">{icon}</div>
      <p className="mt-2 text-xs uppercase tracking-widest text-text-tertiary">
        {label}
      </p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}
