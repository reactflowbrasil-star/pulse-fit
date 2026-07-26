import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Flame, Check, Play } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/workout/$id")({
  head: () => ({ meta: [{ title: "Treino — Pulse Fit" }] }),
  component: WorkoutDetailPage,
});

function WorkoutDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const session = useQuery({
    queryKey: ["workout", id],
    queryFn: async () => ({
      status: "in_progress",
      client_session_id: id,
      duration_seconds: 0,
      calories_estimate: 0,
    }),
  });

  if (session.isLoading)
    return (
      <MobileFrame>
        <ScreenHeader title="Treino" onBack={() => navigate({ to: "/" })} />
        <main className="flex-1 space-y-4 px-5 py-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </main>
      </MobileFrame>
    );

  const s = session.data;

  return (
    <MobileFrame>
      <ScreenHeader title="Treino" onBack={() => navigate({ to: "/" })} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4 overflow-y-auto">
          <Card variant="gradient" className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Sessão
                </p>
                <h2 className="font-display text-2xl font-bold">
                  {s?.client_session_id?.slice(0, 8) || "Treino"}
                </h2>
              </div>
              <span
                className={`rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  s?.status === "completed"
                    ? "bg-success/20 text-success"
                    : "bg-primary/20 text-primary"
                }`}
              >
                {s?.status ?? "—"}
              </span>
            </div>
            {s?.duration_seconds && (
              <div className="mt-3 flex items-center gap-4 text-xs text-text-tertiary">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {Math.round(s.duration_seconds / 60)} min
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> {s.calories_estimate ?? 0} kcal
                </span>
              </div>
            )}
          </Card>

          {s?.status === "completed" && (
            <Card variant="default" className="p-5 text-center">
              <Check className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="font-display text-lg font-semibold">Treino concluído!</p>
              <p className="text-xs text-text-tertiary mt-1">Continue assim! 💪</p>
            </Card>
          )}
        </main>
      </PageTransition>
    </MobileFrame>
  );
}
