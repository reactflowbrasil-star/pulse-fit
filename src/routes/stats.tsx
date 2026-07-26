import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Flame, Trophy, Target, Zap, Heart } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Atleta";

  const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
  const weekHeights = [40, 65, 50, 80, 35, 70, 45];

  return (
    <MobileFrame>
      <ScreenHeader title="Progresso" />
      <PageTransition>
        <main className="flex-1 space-y-5 px-5 py-4 overflow-y-auto">
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display text-xl font-bold">Seu progresso, {name}</h2>
            <p className="text-xs text-text-tertiary mt-1">Continue evoluindo! 💪</p>
          </motion.div>

          {/* KPI Cards */}
          <StaggerContainer className="grid grid-cols-2 gap-3">
            {[
              { icon: <Flame className="h-5 w-5" />, label: "Treinos", value: "12", color: "text-accent-orange", bg: "bg-accent-orange/10" },
              { icon: <TrendingUp className="h-5 w-5" />, label: "Sequência", value: "5 dias", color: "text-success", bg: "bg-success/10" },
              { icon: <Calendar className="h-5 w-5" />, label: "Este mês", value: "8", color: "text-accent-blue", bg: "bg-accent-blue/10" },
              { icon: <Trophy className="h-5 w-5" />, label: "Conquistas", value: "3", color: "text-amber-400", bg: "bg-amber-400/10" },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <Card variant="default" className="p-4">
                  <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
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

          {/* Weekly Volume */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card variant="default" className="p-5">
              <CardTitle>Volume semanal</CardTitle>
              <div className="mt-4 flex items-end gap-2 h-36 px-1">
                {weekDays.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${weekHeights[i]}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full rounded-xl bg-primary/80"
                    />
                    <span className="text-[10px] font-semibold text-text-muted">{d}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Goals Progress */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card variant="default" className="p-5">
              <CardTitle>Metas da semana</CardTitle>
              <div className="mt-4 space-y-4">
                {[
                  { label: "Treinos", current: 4, goal: 5, color: "bg-primary" },
                  { label: "Minutos ativos", current: 120, goal: 180, color: "bg-accent-blue", unit: "min" },
                  { label: "Calorias", current: 1800, goal: 2500, color: "bg-accent-orange", unit: "kcal" },
                ].map((g) => (
                  <div key={g.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-secondary">{g.label}</span>
                      <span className="text-text-tertiary">
                        {g.current}{g.unit ?? ""} / {g.goal}{g.unit ?? ""}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((g.current / g.goal) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${g.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Evolution Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
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
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card variant="default" className="p-5">
              <CardTitle>Conquistas recentes</CardTitle>
              <div className="mt-3 space-y-2">
                {[
                  { icon: "🔥", title: "Sequência de 5 dias", desc: "Treinou 5 dias seguidos" },
                  { icon: "💪", title: "Primeira semana completa", desc: "5 treinos na semana" },
                  { icon: "🎯", title: "Meta atingida", desc: "2000 calorias queimadas" },
                ].map((a, i) => (
                  <motion.div
                    key={a.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-xl bg-surface-elevated/50 p-3"
                  >
                    <span className="text-xl">{a.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{a.title}</p>
                      <p className="text-[11px] text-text-tertiary">{a.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
