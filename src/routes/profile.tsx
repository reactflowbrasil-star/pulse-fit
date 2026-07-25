import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Settings, History, Trophy, MessageCircle, LogIn, LogOut, ShieldCheck, ChevronRight } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getMe } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { user as mockUser } from "@/data/mock";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Pulse Fit" },
      { name: "description", content: "Gerencie seu perfil, WhatsApp e conquistas." },
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

  const menuItems = [
    { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Configurações" },
    { to: "/history", icon: <History className="h-5 w-5" />, label: "Histórico" },
    { to: "/rewards", icon: <Trophy className="h-5 w-5" />, label: "Conquistas" },
    { to: "/whatsapp", icon: <MessageCircle className="h-5 w-5" />, label: "WhatsApp" },
  ];

  return (
    <MobileFrame>
      <ScreenHeader title="Perfil" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4">
          {/* Profile Card */}
          <Card variant="gradient" className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-primary/20 border border-border">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xl font-bold text-primary">
                    {displayName[0]}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold truncate min-w-0">{displayName}</p>
                <p className="truncate text-xs text-text-tertiary">{email ?? "Sessão convidada"}</p>
              </div>
            </div>
          </Card>

          {/* WhatsApp Status */}
          {session && (
            <Card variant="default" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${whatsappOk ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                    {whatsappOk ? <ShieldCheck className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">WhatsApp</p>
                    <p className="text-[11px] text-text-tertiary">{whatsappOk ? "Verificado ✓" : "Não verificado"}</p>
                  </div>
                </div>
                {!whatsappOk && (
                  <Link to="/whatsapp-setup" className="rounded-xl bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
                    Configurar
                  </Link>
                )}
              </div>
            </Card>
          )}

          {/* Menu */}
          <StaggerContainer className="space-y-2">
            {menuItems.map((item) => (
              <StaggerItem key={item.to}>
                <Link to={item.to} className="flex items-center gap-3 rounded-2xl bg-surface-card border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated text-text-tertiary">{item.icon}</div>
                  <span className="flex-1 text-sm font-semibold">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Auth Actions */}
          {!session ? (
            <Link to="/auth" className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/20">
              <LogIn className="h-4 w-4" /> Entrar com Google
            </Link>
          ) : (
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sair da conta
            </button>
          )}
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
