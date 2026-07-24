import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AnimatedLogo } from "@/components/AnimatedLogo";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "Pulse Fit" },
      { name: "description", content: "Seu próximo nível começa agora." },
    ],
  }),
  component: SplashPage,
});

function SplashPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = reduced ? 400 : 2500;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        navigate({ to: "/", replace: true });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [navigate, reduced]);

  const size = 380;
  const r = 170;
  const c = 2 * Math.PI * r;
  const offset = c - c * progress;

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background-deep px-6">
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative grid place-items-center" style={{ width: size, height: size }}>
          <svg
            viewBox="0 0 380 380"
            className="absolute inset-0"
            aria-hidden="true"
          >
            <circle
              cx="190"
              cy="190"
              r={r}
              fill="none"
              stroke="oklch(0.29 0.008 265)"
              strokeWidth="3"
            />
            <g transform="rotate(-90 190 190)">
              <circle
                cx="190"
                cy="190"
                r={r}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 80ms linear" }}
              />
            </g>
          </svg>
          <div
            className="animate-[splash-in_600ms_ease-out]"
            style={{ opacity: progress > 0.05 ? 1 : 0, transition: "opacity 300ms" }}
          >
            <AnimatedLogo size={120} breathing glow />
          </div>
        </div>

        <div className="text-center">
          <p
            className="text-2xl font-black tracking-tight text-foreground"
            style={{
              opacity: progress > 0.3 ? 1 : 0,
              transform: `translateY(${progress > 0.3 ? 0 : 12}px)`,
              transition: "opacity 500ms, transform 500ms",
            }}
          >
            Pulse Fit
          </p>
          <p
            className="mt-2 text-sm text-text-tertiary"
            style={{
              opacity: progress > 0.5 ? 1 : 0,
              transform: `translateY(${progress > 0.5 ? 0 : 8}px)`,
              transition: "opacity 500ms, transform 500ms",
            }}
          >
            Seu próximo nível começa agora.
          </p>
        </div>
      </div>
    </div>
  );
}
