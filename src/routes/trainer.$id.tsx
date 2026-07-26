import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Star,
  Clock,
  Trophy,
  Users,
  ArrowRight,
  Dumbbell,
  Target,
  Zap,
  Heart,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTrainerById, trainers } from "@/data/trainers";

export const Route = createFileRoute("/trainer/$id")({
  head: () => ({ meta: [{ title: "Personal Trainer — Pulse Fit" }] }),
  component: TrainerDetailPage,
});

function TrainerDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const trainer = getTrainerById(id);
  const [selectedGoal, setSelectedGoal] = useState<string>("condicionamento");

  if (!trainer) {
    return (
      <MobileFrame>
        <ScreenHeader title="Personal" onBack={() => navigate({ to: "/trainers" })} />
        <PageTransition>
          <main className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <p className="text-text-tertiary">Treinador não encontrado.</p>
              <Button className="mt-4" onClick={() => navigate({ to: "/trainers" })}>
                Ver treinadores
              </Button>
            </div>
          </main>
        </PageTransition>
      </MobileFrame>
    );
  }

  const goals = [
    { id: "emagrecer", label: "Emagrecer", icon: <Zap className="h-4 w-4" /> },
    { id: "ganhar_massa", label: "Hipertrofia", icon: <Dumbbell className="h-4 w-4" /> },
    { id: "condicionamento", label: "Condicionamento", icon: <Heart className="h-4 w-4" /> },
    { id: "manter", label: "Manter", icon: <Target className="h-4 w-4" /> },
  ];

  return (
    <MobileFrame>
      <ScreenHeader title={trainer.name} onBack={() => navigate({ to: "/trainers" })} />
      <PageTransition>
        <main className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
          {/* Hero Card */}
          <Card variant="gradient" className="p-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-4xl"
            >
              {trainer.avatar}
            </motion.div>
            <h2 className="font-display text-2xl font-bold">{trainer.name}</h2>
            <p className="mt-1 text-sm text-text-secondary">{trainer.role}</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{trainer.rating}</span>
              <span className="text-xs text-text-tertiary ml-1">({trainer.experience})</span>
            </div>
          </Card>

          {/* Bio */}
          <Card variant="default" className="p-4">
            <p className="text-sm text-text-secondary leading-relaxed">{trainer.bio}</p>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                icon: <Trophy className="h-4 w-4" />,
                value: trainer.stats.completed.toLocaleString(),
                label: "Treinos",
                color: "text-accent-orange",
              },
              {
                icon: <Users className="h-4 w-4" />,
                value: trainer.stats.clients.toString(),
                label: "Atletas",
                color: "text-accent-blue",
              },
              {
                icon: <Clock className="h-4 w-4" />,
                value: `${trainer.stats.years} anos`,
                label: "Experiência",
                color: "text-accent-green",
              },
            ].map((stat) => (
              <Card key={stat.label} variant="default" className="p-3 text-center">
                <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-surface-elevated ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="font-display text-lg font-bold">{stat.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-text-tertiary">
                  {stat.label}
                </p>
              </Card>
            ))}
          </div>

          {/* Specialties */}
          <Card variant="default" className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3">
              Especialidades
            </h3>
            <div className="flex flex-wrap gap-2">
              {trainer.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  {s === "forca"
                    ? "💪 Força"
                    : s === "hipertrofia"
                      ? "🏋️ Hipertrofia"
                      : s === "emagrecimento"
                        ? "🔥 Emagrecimento"
                        : s === "calistenia"
                          ? "🤸 Calistenia"
                          : s === "yoga"
                            ? "🧘 Yoga"
                            : s === "hiit"
                              ? "⚡ HIIT"
                              : s === "funcional"
                                ? "🏃 Funcional"
                                : "🩹 Reabilitação"}
                </span>
              ))}
            </div>
          </Card>

          {/* Goal selection */}
          <Card variant="default" className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3">
              Seu objetivo
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {goals.map((g) => (
                <motion.button
                  key={g.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedGoal(g.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    selectedGoal === g.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-surface-elevated text-foreground border border-border hover:border-primary/30"
                  }`}
                >
                  {g.icon}
                  {g.label}
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Catchphrase */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-2"
          >
            <p className="text-xs italic text-text-tertiary">
              "{trainer.style.catchphrase}"
            </p>
          </motion.div>

          {/* CTA */}
          <div className="space-y-2 pb-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate({ to: "/coach", search: { trainer: trainer.id } })}
            >
              <Play className="h-4 w-4" /> Iniciar sessão com {trainer.name}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate({ to: "/trainers" })}
            >
              Ver outros treinadores
            </Button>
          </div>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}
