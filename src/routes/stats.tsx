import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Flame } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Progresso — Pulse Fit" },
      { name: "description", content: "Veja volume de treino, sequências e evolução." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const stats = [
    {
      icon: <Flame className="h-5 w-5" />,
      label: "Treinos",
      value: "12",
      color: "text-accent-orange",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Sequência",
      value: "5 dias",
      color: "text-success",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Este mês",
      value: "8",
      color: "text-accent-blue",
    },
  ];

  return (
    <MobileFrame>
      <ScreenHeader title="Progresso" />
      <PageTransition>
        <main className="flex-1 space-y-5 px-5 py-4 overflow-y-auto">
          <StaggerContainer className="grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <Card variant="default" className="p-3.5 text-center">
                  <div
                    className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated ${s.color}`}
                  >
                    {s.icon}
                  </div>
                  <p className="font-display text-xl font-bold">{s.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {s.label}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Card variant="default" className="p-5">
            <CardTitle>Volume semanal</CardTitle>
            <div className="mt-4 flex items-end gap-2 h-32 px-1">
              {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => {
                const heights = [40, 65, 50, 80, 35, 70, 45];
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heights[i]}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full rounded-xl bg-primary/80"
                    />
                    <span className="text-[10px] font-semibold text-text-muted">{d}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card variant="gradient" className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">Evolução</p>
                <p className="text-xs text-text-tertiary">Gráficos detalhados em breve.</p>
              </div>
            </div>
          </Card>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
