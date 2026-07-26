import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BarChart3, User, MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/browse", icon: MessageCircle, label: "Treinos" },
  { to: "/stats", icon: BarChart3, label: "Progresso" },
  { to: "/trainers", icon: User, label: "Coach" },
] as const;

const spring = { type: "spring" as const, stiffness: 380, damping: 26, mass: 0.7 };

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <div
        aria-hidden="true"
        className="shrink-0"
        style={{ height: "calc(96px + env(safe-area-inset-bottom))" }}
      />

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.08 }}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pt-3"
        style={{
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
          background: "linear-gradient(to top, var(--background-deep) 45%, transparent)",
        }}
      >
        <div className="pointer-events-auto relative mx-3 flex h-[60px] w-full max-w-[430px] items-center justify-around rounded-[20px] glass-strong px-1 shadow-elevated md:max-w-[460px] lg:max-w-[480px]">
          {items.slice(0, 2).map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}

          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            transition={spring}
            className="-mt-7"
          >
            <Link
              to="/coach"
              search={{ trainer: "marcus-power" }}
              aria-label="Treinador IA"
              className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow ring-[3px] ring-background-deep animate-[pulse-fab_2.4s_ease-out_infinite]"
            >
              <Sparkles className="h-5 w-5" strokeWidth={2.4} />
            </Link>
          </motion.div>

          {items.slice(2).map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}
        </div>
      </motion.div>
    </>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: typeof Home;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group relative flex min-w-0 flex-1 flex-col items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wider transition-colors duration-200 ${
        active ? "text-primary" : "text-text-muted"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <motion.span
          layoutId="navIndicator"
          transition={spring}
          className="absolute -top-0.5 left-1/2 h-[2.5px] w-5 -translate-x-1/2 rounded-full bg-primary"
        />
      )}
      <motion.span
        whileTap={{ scale: 0.85 }}
        transition={spring}
        className="flex flex-col items-center gap-0.5"
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.6} />
        <span className="max-w-full truncate">{label}</span>
      </motion.span>
    </Link>
  );
}
