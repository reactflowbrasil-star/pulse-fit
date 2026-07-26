import { createFileRoute, useNavigate, useRouterState, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  Loader2,
  Send,
  ShieldAlert,
  Megaphone,
  Users,
  MessageCircle,
  Cpu,
  Settings,
  ChevronRight,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getMe, adminListUsers, adminSendMessage, adminBroadcast } from "@/lib/auth.functions";
import { getWhatsappStatus, listWhatsappMessages } from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Pulse Fit" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe(), enabled: !!session });
  const isChildRoute = useRouterState({ select: (s) => s.location.pathname }).startsWith("/admin/");

  if (loading || !session || me.isLoading)
    return (
      <MobileFrame>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </MobileFrame>
    );
  if (!me.data?.isAdmin)
    return (
      <MobileFrame>
        <ScreenHeader title="Admin" onBack={() => navigate({ to: "/" })} />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <ShieldAlert className="h-10 w-10 text-primary" />
          <p className="font-display text-xl">Acesso restrito</p>
          <p className="text-sm text-text-tertiary">Sua conta não é administradora.</p>
        </main>
        <BottomNav />
      </MobileFrame>
    );

  return isChildRoute ? <Outlet /> : <AdminDashboard />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => adminListUsers() });
  const status = useQuery({
    queryKey: ["wa", "status"],
    queryFn: () => getWhatsappStatus(),
    refetchInterval: 15000,
  });
  const messages = useQuery({
    queryKey: ["wa", "messages", "admin"],
    queryFn: () => listWhatsappMessages({ data: { limit: 20 } }),
    refetchInterval: 10000,
  });
  const broadcastFn = useServerFn(adminBroadcast);
  const [broadcast, setBroadcast] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const broadcastMut = useMutation({
    mutationFn: (m: string) => broadcastFn({ data: { message: m } }),
    onSuccess: (r) => {
      setFeedback(r.ok ? `Broadcast: ${r.sent} enviadas` : r.error);
      if (r.ok) setBroadcast("");
    },
  });

  const total = users.data?.length ?? 0;
  const verified = users.data?.filter((u) => u.whatsapp_verified).length ?? 0;

  return (
    <MobileFrame>
      <ScreenHeader title="Admin" onBack={() => navigate({ to: "/" })} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4 overflow-y-auto">
          <StaggerContainer className="grid grid-cols-3 gap-2">
            <StaggerItem>
              <Card variant="default" className="p-3 text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-display text-xl font-bold">{total}</p>
                <p className="text-[10px] text-text-tertiary">Usuários</p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card variant="default" className="p-3 text-center">
                <MessageCircle className="h-4 w-4 mx-auto mb-1 text-success" />
                <p className="font-display text-xl font-bold">{verified}</p>
                <p className="text-[10px] text-text-tertiary">Verificados</p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card variant="default" className="p-3 text-center">
                <div
                  className={`h-2.5 w-2.5 rounded-full mx-auto mb-1.5 ${status.data?.state === "open" ? "bg-success" : "bg-destructive"}`}
                />
                <p className="font-display text-lg font-bold">{status.data?.state ?? "…"}</p>
                <p className="text-[10px] text-text-tertiary">Bot</p>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          {/* NVIDIA Panel Link */}
          <Card
            variant="gradient"
            hover
            className="p-4 cursor-pointer"
            onClick={() => navigate({ to: "/admin/nvidia" })}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">NVIDIA API</p>
                <p className="text-[11px] text-text-tertiary">Gerenciar chaves e modelos</p>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </div>
          </Card>

          {/* WhatsApp Integration Link */}
          <Card
            variant="gradient"
            hover
            className="p-4 cursor-pointer"
            onClick={() => navigate({ to: "/admin/whatsapp-integration" })}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
                <Settings className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">WhatsApp Integration</p>
                <p className="text-[11px] text-text-tertiary">
                  Evolution API, webhook e credenciais
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </div>
          </Card>

          {/* Broadcast */}
          <Card variant="default" className="p-4 space-y-3">
            <CardTitle>Broadcast</CardTitle>
            <p className="text-xs text-text-tertiary">
              Enviar para {verified} usuários verificados.
            </p>
            <textarea
              className="min-h-[70px] w-full rounded-2xl bg-surface-elevated border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-text-muted"
              placeholder="Sua mensagem..."
              value={broadcast}
              onChange={(e) => setBroadcast(e.target.value)}
              maxLength={4000}
            />
            <Button
              className="w-full"
              onClick={() => broadcast.trim() && broadcastMut.mutate(broadcast.trim())}
              loading={broadcastMut.isPending}
              disabled={!broadcast.trim()}
            >
              <Send className="h-4 w-4" /> Enviar broadcast
            </Button>
          </Card>

          {feedback && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-primary font-medium"
            >
              {feedback}
            </motion.p>
          )}
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
