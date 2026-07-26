import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, ChevronRight, Trophy, Users, Clock } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { trainers } from "@/data/trainers";

export const Route = createFileRoute("/trainers")({
  head: () => ({ meta: [{ title: "Personal Trainers — Pulse Fit" }] }),
  component: TrainersPage,
});

function TrainersPage() {
  return (
    <MobileFrame>
      <ScreenHeader title="Personal Trainers" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
          <p className="text-sm text-text-tertiary">
            Escolha um treinador IA personalizado para guiar seus treinos.
          </p>

          <StaggerContainer className="space-y-3">
            {trainers.map((trainer) => (
              <StaggerItem key={trainer.id}>
                <Link to={`/trainer/${trainer.id}`}>
                  <Card variant="default" hover className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                        {trainer.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-bold truncate">
                            {trainer.name}
                          </h3>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-bold text-amber-400">
                              {trainer.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 truncate">
                          {trainer.role}
                        </p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {trainer.specialties.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="rounded-lg bg-primary/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary"
                            >
                              {s === "forca"
                                ? "Força"
                                : s === "hipertrofia"
                                  ? "Hipertrofia"
                                  : s === "emagrecimento"
                                    ? "Emagrecimento"
                                    : s === "calistenia"
                                      ? "Calistenia"
                                      : s === "yoga"
                                        ? "Yoga"
                                        : s === "hiit"
                                          ? "HIIT"
                                          : s === "funcional"
                                            ? "Funcional"
                                            : "Reabilitação"}
                            </span>
                          ))}
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-text-tertiary">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {trainer.stats.years} anos
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" /> {trainer.stats.completed}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {trainer.stats.clients}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-5 w-5 shrink-0 text-text-muted mt-1" />
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
