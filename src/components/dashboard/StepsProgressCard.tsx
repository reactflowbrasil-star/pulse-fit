import { Footprints } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

export function StepsProgressCard({
  current,
  goal,
}: {
  current: number;
  goal: number;
}) {
  const animated = useAnimatedNumber(current, { duration: 1100 });
  const pct = Math.min(100, Math.round((current / goal) * 100));

  return (
    <section className="rounded-[28px] bg-primary p-6 text-primary-foreground shadow-glow animate-[card-in_500ms_ease-out]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold opacity-70">Passos hoje</span>
        <Footprints className="h-5 w-5" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-6xl font-black tracking-tight tabular-nums">
          {Math.round(animated).toLocaleString("pt-BR")}
        </span>
        <span className="text-lg font-semibold opacity-60">
          / {goal.toLocaleString("pt-BR")}
        </span>
      </div>
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary-foreground/15">
          <div
            className="h-full rounded-full bg-primary-foreground transition-[width] duration-1000 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-sm font-bold">{pct}% da meta diária</div>
      </div>
    </section>
  );
}
