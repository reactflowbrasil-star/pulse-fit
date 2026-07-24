import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, BarChart3, MessageCircle, Sparkles } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/meal", icon: UtensilsCrossed, label: "Dieta" },
  { to: "/stats", icon: BarChart3, label: "Progresso" },
  { to: "/whatsapp", icon: MessageCircle, label: "Suporte" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the fixed nav */}
      <div aria-hidden="true" className="h-[112px] shrink-0" />

      {/* Floating nav — always visible at viewport bottom, aligned to frame */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-6"
        style={{
          background:
            "linear-gradient(to top, var(--background-deep) 40%, color-mix(in oklab, var(--background-deep) 80%, transparent) 75%, transparent)",
        }}
      >
        <div className="pointer-events-auto relative mx-3 flex h-[68px] w-full max-w-[430px] items-center justify-around gap-1 rounded-[28px] bg-surface/95 px-2 shadow-elevated ring-1 ring-white/8 backdrop-blur-xl md:max-w-[460px] lg:max-w-[480px]">
          {items.slice(0, 2).map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}

          <Link
            to="/coach"
            aria-label="Treinador IA"
            className="relative -mt-9 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow ring-4 ring-background-deep transition-transform animate-[pulse-fab_2.4s_ease-out_infinite] active:scale-95"
          >
            <Sparkles className="h-7 w-7" strokeWidth={2.4} />
          </Link>

          {items.slice(2).map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}
        </div>
      </div>
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
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 font-display text-[11px] uppercase tracking-widest transition-colors ${
        active ? "text-primary" : "text-text-tertiary"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.4 : 1.8} />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}
