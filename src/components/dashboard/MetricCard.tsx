import type { ReactNode } from "react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

export function MetricCard({
  icon,
  label,
  value,
  unit,
  goal,
  accent = "primary",
  decimals = 0,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  unit?: string;
  goal?: number;
  accent?: "primary" | "orange" | "blue";
  decimals?: number;
}) {
  const animated = useAnimatedNumber(value, { duration: 900 });
  const pct = goal ? Math.min(100, (value / goal) * 100) : null;

  const accentColor =
    accent === "orange"
      ? "var(--accent-orange)"
      : accent === "blue"
        ? "var(--accent-blue)"
        : "var(--primary)";

  const formatted = decimals
    ? animated.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : Math.round(animated).toLocaleString("pt-BR");

  return (
    <div className="rounded-2xl bg-surface-elevated p-4 animate-[card-in_500ms_ease-out]">
      <div className="flex items-center justify-between">
        <div
          className="grid h-8 w-8 place-items-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklab, ${accentColor} 18%, transparent)`, color: accentColor }}
        >
          {icon}
        </div>
        {pct !== null && (
          <span className="text-[10px] font-bold text-text-tertiary tabular-nums">
            {Math.round(pct)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-xs text-text-tertiary">{label}</p>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-2xl font-black tabular-nums">{formatted}</span>
        {unit && <span className="text-xs text-text-tertiary">{unit}</span>}
      </div>
      {pct !== null && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-out"
            style={{ width: `${pct}%`, backgroundColor: accentColor }}
          />
        </div>
      )}
    </div>
  );
}
