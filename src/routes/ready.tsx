import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ready")({
  head: () => ({ meta: [{ title: "Pronto — Pulse Fit" }] }),
  component: () => {
    const navigate = useNavigate();
    return (
      <MobileFrame>
        <PageTransition>
          <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Play className="h-10 w-10" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold">Pronto</h2>
            <p className="mt-2 text-sm text-text-tertiary">Tudo certo para começar!</p>
            <Button className="mt-8" onClick={() => navigate({ to: "/" })}>Continuar</Button>
          </main>
        </PageTransition>
      </MobileFrame>
    );
  },
});
