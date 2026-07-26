import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  Flame,
  TrendingUp,
  Star,
  Home,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/coach/summary/$sessionId")({
  head: () => ({ meta: [{ title: "Resumo do Treino — Pulse Fit" }] }),
  component: CoachSummaryPage,
});

function CoachSummaryPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();

  const summary = {
    title: "Treino Completo",
    duration: 32,
    calories: 245,
    exercises: 6,
    effort: 4,
    feeling: "Ótimo",
  };

  return (
    <MobileFrame>
      <PageTransition>
        <main className="flex-1 px-5 py-6 space-y-5">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10 text-success">
              <Check className="h-10 w-10" />
            </div>
            <h2 className="font-display text-2xl font-bold">Treino Concluído!</h2>
            <p className="mt-1 text-sm text-text-tertiary">
              Você mandou bem! Continue assim.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Clock className="h-4 w-4" />, value: `${summary.duration} min`, label: "Duração", color: "text-accent-blue" },
              { icon: <Flame className="h-4 w-4" />, value: `${summary.calories} kcal`, label: "Calorias", color: "text-accent-orange" },
              { icon: <TrendingUp className="h-4 w-4" />, value: summary.exercises.toString(), label: "Exercícios", color: "text-accent-green" },
              { icon: <Star className="h-4 w-4" />, value: `${summary.effort}/5`, label: "Esforço", color: "text-amber-400" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card variant="default" className="p-4 text-center">
                  <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-surface-elevated ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="font-display text-lg font-bold">{stat.value}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {stat.label}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card variant="default" className="p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3">
                Como você se sentiu?
              </h3>
              <div className="flex gap-2">
                {["😄 Ótimo", "😊 Bom", "😐 Regular", "😓 Cansado"].map((f) => (
                  <button
                    key={f}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-medium transition-all ${
                      f === "😄 Ótimo"
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-elevated text-foreground border border-border hover:border-primary/30"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Coach Message */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card variant="gradient" className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
                  💪
                </div>
                <div>
                  <p className="text-sm font-semibold">Mensagem do Coach</p>
                  <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                    Excelente treino! Você completou todos os exercícios com dedicação.
                    Descanse bem e se hidrate. Amanhã tem mais!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2 pb-6"
          >
            <Button className="w-full" onClick={() => navigate({ to: "/coach" })}>
              <MessageSquare className="h-4 w-4" /> Falar com Coach
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => navigate({ to: "/" })}>
              <Home className="h-4 w-4" /> Voltar ao início
            </Button>
          </motion.div>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}
