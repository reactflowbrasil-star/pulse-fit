import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

export function DashboardHeader({
  name,
  avatar,
  greeting = "Bom dia",
}: {
  name: string;
  avatar: string;
  greeting?: string;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 pt-2 pb-4">
      <Link to="/profile" className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <img
            src={avatar}
            alt=""
            width={512}
            height={512}
            className="h-13 w-13 h-[52px] w-[52px] rounded-2xl object-cover ring-2 ring-primary/50"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-background-deep" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
            {greeting}
          </p>
          <p className="truncate font-display text-2xl uppercase tracking-wide">
            {name}
          </p>
        </div>
      </Link>
      <Link
        to="/settings"
        aria-label="Notificações"
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-surface ring-1 ring-white/5"
      >
        <Bell className="h-5 w-5 text-foreground" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
      </Link>
    </header>
  );
}
