import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Clock, Flame, Search } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";


export const Route = createFileRoute("/browse")({
  head: () => ({ meta: [{ title: "Treinos — Pulse Fit" }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const plans = useQuery({ queryKey: ["plans"], queryFn: async () => [] });
  const [search, setSearch] = useState("");

  const filtered = (plans.data ?? []).filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MobileFrame>
      <ScreenHeader title="Treinos" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              className="w-full rounded-2xl bg-surface-elevated border border-border pl-10 pr-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 placeholder:text-text-muted transition-all"
              placeholder="Buscar treinos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {plans.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-surface-card border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-surface-elevated skeleton" />
                    <div className="flex-1 space-y-2"><div className="h-4 w-1/2 skeleton" /><div className="h-3 w-3/4 skeleton" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Play className="h-6 w-6" />} title="Nenhum treino" description="Treinos disponíveis aparecerão aqui." />
          ) : (
            <StaggerContainer className="space-y-3">
              {filtered.map((plan: any) => (
                <StaggerItem key={plan.id}>
                  <Link to={`/workout/${plan.id}`} className="block rounded-2xl bg-surface-card border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Play className="h-5 w-5" fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-base font-semibold truncate">{plan.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-text-tertiary">
                          {plan.duration_min && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{plan.duration_min} min</span>}
                          {plan.difficulty && <span className="flex items-center gap-1"><Flame className="h-3 w-3" />{plan.difficulty}</span>}
                        </div>
                      </div>
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


