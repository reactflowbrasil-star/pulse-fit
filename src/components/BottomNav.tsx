import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, BarChart3, MessageCircle, Plus } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/meal", icon: UtensilsCrossed, label: "Dieta" },
  { to: "/stats", icon: BarChart3, label: "Progresso" },
  { to: "/whatsapp", icon: MessageCircle, label: "WhatsApp" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-background-deep via-background-deep to-transparent pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="relative mx-3 flex h-[72px] items-center justify-around gap-1 rounded-full bg-surface px-2 shadow-elevated ring-1 ring-white/5 sm:mx-4">
        {items.slice(0, 2).map((item) => (
          <NavItem key={item.to} {...item} active={pathname === item.to} />
        ))}

        <Link
          to="/coach"
          aria-label="Treino com IA"
          className="relative -mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform animate-[pulse-fab_2.4s_ease-out_infinite] active:scale-95"
        >
          <Plus className="h-7 w-7" strokeWidth={2.6} />
        </Link>

        {items.slice(2).map((item) => (
          <NavItem key={item.to} {...item} active={pathname === item.to} />
        ))}
      </div>
    </div>
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
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
        active ? "text-foreground" : "text-text-tertiary"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.4 : 1.8} />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}
