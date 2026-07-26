import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type Ring = {
  label: string;
  pct: number; // 0-100
  color: string; // CSS color
};

export function ActivityRings({ rings, size = 140 }: { rings: [Ring, Ring, Ring]; size?: number }) {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1100);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const radii = [size / 2 - 8, size / 2 - 24, size / 2 - 40];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
      {rings.map((ring, i) => {
        const r = radii[i];
        const c = 2 * Math.PI * r;
        const target = Math.min(100, ring.pct) / 100;
        const offset = c - c * (target * progress);
        return (
          <g key={ring.label} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeOpacity={0.15}
              strokeWidth={10}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </g>
        );
      })}
    </svg>
  );
}
