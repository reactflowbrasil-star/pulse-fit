import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Search, SlidersHorizontal, ArrowUpDown, Star } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { trainers } from "@/data/mock";

export const Route = createFileRoute("/trainers")({
  head: () => ({
    meta: [
      { title: "Browse Trainers — Pulse Fit" },
      {
        name: "description",
        content:
          "Meet certified strength, calisthenics, yoga and powerlifting coaches ready to guide your training.",
      },
      { property: "og:title", content: "Browse Trainers — Pulse Fit" },
      {
        property: "og:description",
        content: "Certified coaches for every discipline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrowseTrainers,
});

const tabs = ["All", "Strength", "Yoga", "Cardio", "Calisthenics"] as const;

function BrowseTrainers() {
  const [active, setActive] = useState<(typeof tabs)[number]>("All");

  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Browse" />

      <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 pb-3">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActive(t)}>
            <span
              className={`inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold ${
                active === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-card text-text-secondary"
              }`}
            >
              {t}
            </span>
          </button>
        ))}
      </div>

      <div className="mx-5 flex items-center justify-between rounded-2xl bg-surface px-2 py-2 text-xs font-semibold text-text-secondary">
        <FBtn icon={<SlidersHorizontal className="h-4 w-4" />} label="Filters" />
        <span className="h-5 w-px bg-white/10" />
        <FBtn icon={<ArrowUpDown className="h-4 w-4" />} label="Sorting" />
        <span className="h-5 w-px bg-white/10" />
        <FBtn icon={<Search className="h-4 w-4" />} label="Search" />
      </div>

      <main className="flex-1 space-y-2.5 px-5 pt-4 pb-2">
        {trainers.map((t) => (
          <Link
            key={t.id}
            to="/trainer/$id"
            params={{ id: t.id }}
            className="flex items-center gap-3 rounded-3xl bg-surface p-3.5 transition-transform active:scale-[0.98]"
          >
            <div className="relative shrink-0">
              <img
                src={t.image}
                alt=""
                width={512}
                height={512}
                className="h-14 w-14 rounded-full object-cover"
              />
              <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                <Star className="h-2 w-2 fill-primary-foreground" />
                {t.rating}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{t.name}</p>
              <p className="truncate text-xs text-text-tertiary">{t.role}</p>
              <p className="text-xs text-primary">{t.experience}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-primary" />
          </Link>
        ))}
      </main>

      <BottomNav />
    </MobileFrame>
  );
}

function FBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-1 items-center justify-center gap-2 py-2">
      {icon}
      {label}
    </button>
  );
}
