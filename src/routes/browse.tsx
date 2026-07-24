import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, Clock, Flame, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { workouts } from "@/data/mock";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Explorar Treinos — Pulse Fit" },
      {
        name: "description",
        content:
          "Descubra treinos em casa de alta intensidade, planos e treinadores para todos os níveis.",
      },
      { property: "og:title", content: "Explorar Treinos — Pulse Fit" },
      {
        property: "og:description",
        content: "Cards de treinos em casa com duração e dificuldade num relance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrowsePage,
});

const tabs = ["Treinos", "Fitness", "Planos", "Treinadores", "Exercícios"] as const;

function BrowsePage() {
  const [active, setActive] = useState<(typeof tabs)[number]>("Treinos");

  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Explorar" />

      <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 pb-3">
        {tabs.map((t) => {
          const isActive = t === active;
          const target = t === "Treinadores" ? "/trainers" : undefined;
          const content = (
            <span
              className={`inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-card text-text-secondary"
              }`}
            >
              {t}
            </span>
          );
          return target ? (
            <Link key={t} to={target}>
              {content}
            </Link>
          ) : (
            <button key={t} onClick={() => setActive(t)}>
              {content}
            </button>
          );
        })}
      </div>

      <div className="mx-5 flex items-center justify-between rounded-2xl bg-surface px-2 py-2 text-xs font-semibold text-text-secondary">
        <FilterButton icon={<SlidersHorizontal className="h-4 w-4" />} label="Filtros" />
        <span className="h-5 w-px bg-white/10" />
        <FilterButton icon={<ArrowUpDown className="h-4 w-4" />} label="Ordenar" />
        <span className="h-5 w-px bg-white/10" />
        <FilterButton icon={<Search className="h-4 w-4" />} label="Buscar" />
      </div>

      <main className="flex-1 px-5 pt-4 pb-2">
        <div className="grid grid-cols-2 gap-3">
          {workouts.map((w) => (
            <Link
              key={w.id}
              to="/workout/$id"
              params={{ id: w.id }}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-surface transition-transform active:scale-[0.98]"
            >
              <img
                src={w.image}
                alt={w.title}
                loading="lazy"
                width={800}
                height={1000}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />
              <button
                aria-label="Salvar"
                className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur ring-1 ring-white/20"
              >
                <Bookmark className="h-4 w-4 text-primary" />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <p className="line-clamp-2 text-sm font-bold leading-tight">
                  {w.title}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {w.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {w.level}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </MobileFrame>
  );
}

function FilterButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-1 items-center justify-center gap-2 py-2">
      {icon}
      {label}
    </button>
  );
}
