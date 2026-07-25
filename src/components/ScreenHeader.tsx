import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const spring = { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.6 };

export function ScreenHeader({
  title,
  right,
  onBack,
}: {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 safe-top">
      <div className="flex items-center justify-between px-4 py-3 glass-strong">
        <motion.button
          onClick={onBack ?? (() => router.history.back())}
          aria-label="Voltar"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={spring}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated/80 text-foreground border border-border/40 hover:bg-surface-elevated transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
        {title ? (
          <motion.h1
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.05 }}
            className="font-display text-lg font-semibold"
          >
            {title}
          </motion.h1>
        ) : (
          <span />
        )}
        <div className="flex h-10 w-10 items-center justify-center">{right}</div>
      </div>
    </div>
  );
}
