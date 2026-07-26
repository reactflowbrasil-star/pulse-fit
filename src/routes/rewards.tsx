import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Star, Medal, Award } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [{ title: "Conquistas — Pulse Fit" }] }),
  component: RewardsPage,
});

function RewardsPage() {
  const badges = [
    {
      icon: <Star className="h-6 w-6" />,
      title: "Primeiro Treino",
      desc: "Complete seu primeiro treino",
      unlocked: true,
    },
    {
      icon: <Medal className="h-6 w-6" />,
      title: "5 Dias Seguidos",
      desc: "Treine 5 dias consecutivos",
      unlocked: false,
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "10 Treinos",
      desc: "Complete 10 treinos no total",
      unlocked: false,
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Maratona",
      desc: "Complete 30 treinos",
      unlocked: false,
    },
  ];

  return (
    <MobileFrame>
      <ScreenHeader title="Conquistas" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4 overflow-y-auto">
          <StaggerContainer className="grid grid-cols-2 gap-3">
            {badges.map((b) => (
              <StaggerItem key={b.title}>
                <Card
                  variant={b.unlocked ? "gradient" : "default"}
                  className={`p-4 text-center ${!b.unlocked ? "opacity-50" : ""}`}
                >
                  <div
                    className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl ${b.unlocked ? "bg-primary/15 text-primary" : "bg-surface-elevated text-text-muted"}`}
                  >
                    {b.icon}
                  </div>
                  <p className="font-display text-sm font-semibold">{b.title}</p>
                  <p className="mt-0.5 text-[10px] text-text-tertiary">{b.desc}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
