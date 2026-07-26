import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";

export const Route = createFileRoute("/splash")({
  head: () => ({ meta: [{ title: "Pulse Fit" }] }),
  component: () => (
    <MobileFrame>
      <main className="flex flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-glow"
        >
          <Zap className="h-12 w-12" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 font-display text-2xl font-bold"
        >
          Pulse Fit
        </motion.p>
      </main>
    </MobileFrame>
  ),
});
