import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Settings, History, Trophy, MessageCircle, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMe } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { user as mockUser } from "@/data/mock";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Pulse Fit" },
      { name: "description", content: "Gerencie seu perfil, WhatsApp e conquistas." },
      { property: "og:title", content: "Perfil — Pulse Fit" },
      { property: "og:description", content: "Gerencie seu perfil, WhatsApp e conquistas." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe(), enabled: !!session });

  const displayName = me.data?.profile?.full_name || user?.user_metadata?.full_name || mockUser.name;
  const avatar = me.data?.profile?.avatar_url || user?.user_metadata?.avatar_url || mockUser.avatar;
  const email = user?.email;
  const whatsappOk = !!me.data?.profile?.whatsapp_verified;

  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Perfil" onBack={() => window.history.back()} />
      <main className="flex-1 space-y-4 px-5 py-4">
        <section className="flex items-center gap-4 rounded-3xl bg-surface p-5">
          <img src={avatar} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/40" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black">{displayName}</p>
            <p className="truncate text-xs text-text-tertiary">{email ?? "Sessão convidada"}</p>
          </div>
        </section>

        {!session ? (
          <Link
            to="/auth"
            className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-bold text-primary-foreground shadow-glow"
          >
            <LogIn className="h-4 w-4" /> Entrar com Google
          </Link>
        ) : (
          <section className="rounded-3xl bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">WhatsApp</p>
                <p className="text-xs text-text-tertiary">
                  {whatsappOk
                    ? `Verificado: ${String(me.data?.profile?.whatsapp_number).replace(/@.*/, "")}`
                    : "Não verificado"}
                </p>
              </div>
              <Link
                to="/whatsapp-setup"
                className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground"
              >
                {whatsappOk ? "Alterar" : "Confirmar"}
              </Link>
            </div>
          </section>
        )}

        <nav className="space-y-2">
          <ProfileLink to="/history" icon={<History className="h-5 w-5" />} label="Histórico" />
          <ProfileLink to="/rewards" icon={<Trophy className="h-5 w-5" />} label="Conquistas" />
          <ProfileLink to="/whatsapp" icon={<MessageCircle className="h-5 w-5" />} label="Bot WhatsApp" />
          <ProfileLink to="/settings" icon={<Settings className="h-5 w-5" />} label="Configurações" />
          {me.data?.isAdmin && (
            <ProfileLink to="/admin" icon={<ShieldCheck className="h-5 w-5" />} label="Painel administrativo" />
          )}
        </nav>

        {session && (
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-surface py-3 text-sm font-semibold text-red-400"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        )}
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
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-elevated text-primary">{icon}</div>
        <span className="font-semibold">{label}</span>
      </div>
      <span className="text-text-tertiary">›</span>
    </Link>
  );
}
