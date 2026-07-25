import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Calendar } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { EmptyState } from "@/components/ui/empty-state";


export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Histórico — Pulse Fit" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const sessions = useQuery({ queryKey: ["history"], queryFn: async () => [] });

  return (
    <MobileFrame>
      <ScreenHeader title="Histórico" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 space-y-3 px-5 py-4 overflow-y-auto">
          {sessions.isLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-surface-card border border-border skeleton" />)}</div>
          ) : (sessions.data?.length ?? 0) === 0 ? (
            <EmptyState icon={<Calendar className="h-6 w-6" />} title="Sem histórico" description="Seus treinos concluídos aparecerão aqui." />
          ) : (
            <StaggerContainer className="space-y-2">
              {sessions.data!.map((s: any) => (
                <StaggerItem key={s.id}>
                  <Link to={`/workout/${s.id}`} className="flex items-center gap-3 rounded-2xl bg-surface-card border border-border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">Treino</p>
                      <p className="text-[11px] text-text-tertiary">
                        {s.duration_seconds ? `${Math.round(s.duration_seconds / 60)} min · ` : ""}
                        {s.started_at ? new Date(s.started_at).toLocaleDateString("pt-BR") : "—"}
                      </p>
                    </div>
                    <span className={`rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      s.status === "completed" ? "bg-success/15 text-success" : "bg-surface-elevated text-text-tertiary"
                    }`}>
                      {s.status === "completed" ? "✓" : "—"}
                    </span>
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
