import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { exercises } from "@/data/mock";
import { StatusBar } from "@/components/StatusBar";

export const Route = createFileRoute("/player")({
  validateSearch: (search: Record<string, unknown>) => ({
    workout: (search.workout as string) ?? "home-chest",
    i: Number(search.i ?? 0),
  }),
  head: () => ({
    meta: [
      { title: "Exercise Player — Pulse Fit" },
      { name: "description", content: "Guided countdown for your current exercise." },
      { property: "og:title", content: "Exercise Player — Pulse Fit" },
      { property: "og:description", content: "Guided countdown for your current exercise." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlayerPage,
});

function PlayerPage() {
  const { workout, i } = Route.useSearch();
  const navigate = useNavigate();
  const exercise = exercises[i] ?? exercises[0];
  const [remaining, setRemaining] = useState(exercise.seconds);

  useEffect(() => {
    setRemaining(exercise.seconds);
  }, [exercise.seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      const next = i + 1;
      if (next >= exercises.length) {
        navigate({ to: "/done" });
      } else {
        navigate({ to: "/player", search: { workout, i: next } });
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, i, navigate, workout]);

  const pct = ((exercise.seconds - remaining) / exercise.seconds) * 100;

  return (
    <div className="min-h-screen w-full bg-background-deep">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:overflow-hidden sm:rounded-[2.5rem] sm:shadow-elevated">
        <div className="relative">
          <img
            src={exercise.image}
            alt=""
            width={900}
            height={900}
            className="h-[420px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />

          <div className="absolute inset-x-0 top-0">
            <StatusBar />
            <div className="flex items-center justify-between px-5 py-2">
              <button
                onClick={() => navigate({ to: "/browse" })}
                aria-label="Exit"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/40 backdrop-blur"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <Link
                to="/workout/$id"
                params={{ id: workout }}
                className="text-xs font-semibold text-primary"
              >
                See all
              </Link>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center">
            <span
              key={remaining}
              className="text-[140px] font-black leading-none text-primary drop-shadow-[0_8px_40px_oklch(0.94_0.19_128_/_0.6)]"
              style={{ animation: "count-pop 400ms cubic-bezier(0.2,0.8,0.2,1)" }}
            >
              {remaining.toString().padStart(2, "0")}
            </span>
            <p className="mt-2 text-lg font-bold">{exercise.name}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-end px-5 pb-8 pt-6">
          <div className="mb-4 flex items-center justify-between text-xs font-semibold text-text-tertiary">
            <span>Exercise {i + 1} of {exercises.length}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                i > 0 && navigate({ to: "/player", search: { workout, i: i - 1 } })
              }
              disabled={i === 0}
              className="rounded-full bg-surface-elevated py-4 text-sm font-bold text-primary transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => {
                const next = i + 1;
                if (next >= exercises.length) navigate({ to: "/done" });
                else navigate({ to: "/player", search: { workout, i: next } });
              }}
              className="rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
