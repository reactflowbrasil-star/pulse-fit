import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Target, Dumbbell, ArrowRight } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Bem-vindo — Pulse Fit" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Bem-vindo ao Pulse Fit",
      desc: "Seu app de treinos inteligente com IA.",
    },
    {
      icon: <Target className="h-10 w-10" />,
      title: "Defina suas metas",
      desc: "Perda de ganho, resistência, força... você escolhe.",
    },
    {
      icon: <Dumbbell className="h-10 w-10" />,
      title: "Comece a treinar",
      desc: "Seu coach IA monta planos personalizados pra você.",
    },
  ];

  const current = steps[step];

  return (
    <MobileFrame>
      <PageTransition>
        <main className="flex flex-1 flex-col items-center justify-between px-6 py-12">
          <div className="flex flex-1 flex-col items-center text-center justify-center">
            <motion.div
              key={step}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              {current.icon}
            </motion.div>
            <motion.h2
              key={`t-${step}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl font-bold"
            >
              {current.title}
            </motion.h2>
            <motion.p
              key={`d-${step}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-3 max-w-[280px] text-sm text-text-tertiary"
            >
              {current.desc}
            </motion.p>
          </div>
          <div className="w-full space-y-3 pb-6">
            <Button
              className="w-full"
              onClick={() => (step < 2 ? setStep(step + 1) : navigate({ to: "/" }))}
            >
              {step < 2 ? "Próximo" : "Começar"} <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-surface-elevated"}`}
                />
              ))}
            </div>
          </div>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}
