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
        <img
          src={avatar}
          alt=""
          width={512}
          height={512}
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary/40"
        />
        <div className="min-w-0">
          <p className="text-sm text-text-tertiary">{greeting},</p>
          <p className="truncate text-base font-bold">{name}</p>
        </div>
      </Link>
      <Link
        to="/settings"
        aria-label="Notificações e configurações"
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-surface"
      >
        <Bell className="h-5 w-5 text-foreground" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
      </Link>
    </header>
  );
}
