import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { user } from "@/data/mock";
import { Settings, History, Trophy } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Pulse Fit" },
      { name: "description", content: "Gerencie seu perfil, objetivos e conquistas." },
      { property: "og:title", content: "Perfil — Pulse Fit" },
      { property: "og:description", content: "Gerencie seu perfil, objetivos e conquistas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Perfil" onBack={() => window.history.back()} />
      <main className="flex-1 space-y-4 px-5 py-4">
        <section className="flex items-center gap-4 rounded-3xl bg-surface p-5">
          <img
            src={user.avatar}
            alt=""
            className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/40"
          />
          <div className="min-w-0">
            <p className="text-lg font-black">{user.name}</p>
            <p className="text-xs text-text-tertiary">Nível intermediário · 4x por semana</p>
          </div>
        </section>

        <nav className="space-y-2">
          <ProfileLink to="/history" icon={<History className="h-5 w-5" />} label="Histórico" />
          <ProfileLink to="/rewards" icon={<Trophy className="h-5 w-5" />} label="Conquistas" />
          <ProfileLink to="/settings" icon={<Settings className="h-5 w-5" />} label="Configurações" />
        </nav>
      </main>
      <BottomNav />
    </MobileFrame>
  );
}

function ProfileLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-2xl bg-surface p-4 transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-elevated text-primary">
          {icon}
        </div>
        <span className="font-semibold">{label}</span>
      </div>
      <span className="text-text-tertiary">›</span>
    </Link>
  );
}
