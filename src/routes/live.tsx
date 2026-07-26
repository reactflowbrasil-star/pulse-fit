import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/live")({
  head: () => ({ meta: [{ title: "Ao vivo — Pulse Fit" }] }),
  component: () => {
    const navigate = useNavigate();
    return (
      <MobileFrame>
        <ScreenHeader title="Ao vivo" onBack={() => navigate({ to: "/" })} />
        <PageTransition>
          <main className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              <Radio className="h-10 w-10" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold">Sessão ao vivo</h2>
            <p className="mt-2 text-sm text-text-tertiary">Acompanhe seu treino em tempo real.</p>
          </main>
        </PageTransition>
      </MobileFrame>
    );
  },
});
