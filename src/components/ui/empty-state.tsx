import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-elevated text-primary border border-border">
        {icon}
      </div>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-text-tertiary">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
