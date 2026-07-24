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
  size = "sm",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  unit?: string;
  goal?: number;
  accent?: "primary" | "orange" | "blue";
  decimals?: number;
  size?: "sm" | "lg";
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
    <div
      className={`relative overflow-hidden rounded-[24px] bg-surface p-4 ring-1 ring-white/5 transition-transform animate-[card-in_500ms_ease-out] hover:-translate-y-0.5 ${
        size === "lg" ? "min-h-[148px]" : ""
      }`}
    >
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 blur-xl"
        style={{ backgroundColor: accentColor }}
      />
      <div className="relative flex items-center justify-between">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in oklab, ${accentColor} 22%, transparent)`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
        {pct !== null && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
            style={{
              backgroundColor: `color-mix(in oklab, ${accentColor} 18%, transparent)`,
              color: accentColor,
            }}
          >
            {Math.round(pct)}%
          </span>
        )}
      </div>
      <p className="relative mt-3 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
        {label}
      </p>
      <div className="relative mt-1 flex items-baseline gap-1">
        <span className="font-display text-3xl leading-none tabular-nums">
          {formatted}
        </span>
        {unit && (
          <span className="text-[11px] font-semibold text-text-tertiary">
            {unit}
          </span>
        )}
      </div>
      {pct !== null && (
        <div className="relative mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-out"
            style={{ width: `${pct}%`, backgroundColor: accentColor }}
          />
        </div>
      )}
    </div>
  );
}
