import { Footprints, TrendingUp } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

export function StepsProgressCard({ current, goal }: { current: number; goal: number }) {
  const animated = useAnimatedNumber(current, { duration: 1100 });
  const pct = Math.min(100, Math.round((current / goal) * 100));

  return (
    <section className="grain-noise relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary via-primary to-primary-dark p-6 text-primary-foreground shadow-neon animate-[card-in_500ms_ease-out]">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Footprints className="h-5 w-5" strokeWidth={2.4} />
          <span className="font-display text-sm uppercase tracking-widest opacity-80">
            Passos hoje
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-bold">
          <TrendingUp className="h-3 w-3" />
          {pct}%
        </span>
      </div>
      <div className="relative mt-4 flex items-baseline gap-2">
        <span className="font-display text-7xl leading-none tabular-nums">
          {Math.round(animated).toLocaleString("pt-BR")}
        </span>
        <span className="font-display text-xl uppercase tracking-wider opacity-60">
          /{goal.toLocaleString("pt-BR")}
        </span>
      </div>
      <div className="relative mt-5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary-foreground/15">
          <div
            className="h-full rounded-full bg-primary-foreground transition-[width] duration-1000 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs font-semibold">
          <span className="opacity-70">Meta diária</span>
          <span className="font-display text-sm uppercase tracking-wide">
            {(goal - current).toLocaleString("pt-BR")} restantes
          </span>
        </div>
      </div>
    </section>
  );
}
