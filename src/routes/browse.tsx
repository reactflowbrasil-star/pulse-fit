import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Clock, Flame, Search, Sparkles, ArrowRight, Filter } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { workouts } from "@/data/mock";

export const Route = createFileRoute("/browse")({
  head: () => ({ meta: [{ title: "Treinos — Pulse Fit" }] }),
  component: BrowsePage,
});

const categories = [
  { id: "all", label: "Todos" },
  { id: "forca", label: "Força" },
  { id: "cardio", label: "Cardio" },
  { id: "hiit", label: "HIIT" },
  { id: "mobilidade", label: "Mobilidade" },
];

function BrowsePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredWorkouts = workouts.filter((w) => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.focus?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <MobileFrame>
      <ScreenHeader title="Treinos" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4 overflow-y-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              className="w-full rounded-2xl bg-surface-elevated border border-border pl-10 pr-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 placeholder:text-text-muted transition-all"
              placeholder="Buscar treinos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-elevated text-text-secondary border border-border hover:border-primary/30"
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>

          {/* Quick Coach CTA */}
          <Card variant="gradient" hover className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Coach IA personaliza pra você</p>
                <p className="text-[11px] text-text-tertiary">Treino sob medida com IA avançada</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate({ to: "/coach" })}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </Card>

          {/* Workout List */}
          {filteredWorkouts.length === 0 ? (
            <EmptyState
              icon={<Play className="h-6 w-6" />}
              title="Nenhum treino encontrado"
              description="Tente buscar por outro termo ou peça um treino ao Coach IA."
            />
          ) : (
            <StaggerContainer className="space-y-3">
              {filteredWorkouts.map((w) => (
                <StaggerItem key={w.id}>
                  <Link
                    to={`/workout/${w.id}`}
                    className="block rounded-2xl bg-surface-card border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                        style={{ backgroundImage: `url(${w.image})`, backgroundSize: "cover" }}
                      >
                        {!w.image && <Play className="h-5 w-5" fill="currentColor" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-semibold truncate">{w.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-text-tertiary">
                          {w.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {w.duration}
                            </span>
                          )}
                          {w.calories && (
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3" /> {w.calories}
                            </span>
                          )}
                          {w.focus && (
                            <span className="rounded-lg bg-primary/8 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                              {w.focus}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
