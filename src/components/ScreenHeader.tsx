import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const spring = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.6 };

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
    <div className="flex items-center justify-between px-5 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <motion.button
        onClick={onBack ?? (() => router.history.back())}
        aria-label="Voltar"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.9 }}
        transition={spring}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-foreground ring-1 ring-white/5"
      >
        <ChevronLeft className="h-5 w-5" />
      </motion.button>
      {title ? (
        <motion.h1
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="font-display text-2xl uppercase tracking-wide"
        >
          {title}
        </motion.h1>
      ) : (
        <span />
      )}
      <div className="flex h-11 w-11 items-center justify-center">{right}</div>
    </div>
  );
}
