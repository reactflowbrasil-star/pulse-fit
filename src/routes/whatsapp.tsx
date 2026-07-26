import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Send,
  RefreshCw,
  CheckCheck,
  Check,
  Clock3,
  AlertTriangle,
  Copy,
  Wifi,
  WifiOff,
  Settings,
  ExternalLink,
  Wrench,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getWhatsappStatus,
  listWhatsappMessages,
  listWhatsappSessions,
  sendWhatsappMessage,
} from "@/lib/whatsapp.functions";
import { getBotStatus } from "@/lib/bot-status.functions";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp Bot — Pulse Fit" },
      { name: "description", content: "Painel do bot de WhatsApp." },
    ],
  }),
  component: WhatsappPage,
});

function WhatsappPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const botStatus = useQuery({
    queryKey: ["bot", "status"],
    queryFn: () => getBotStatus(),
    refetchInterval: 10000,
  });

  const evoStatus = useQuery({
    queryKey: ["wa", "status"],
    queryFn: () => getWhatsappStatus(),
    refetchInterval: 15000,
  });

  const messages = useQuery({
    queryKey: ["wa", "messages"],
    queryFn: () => listWhatsappMessages({ data: { limit: 20 } }),
    refetchInterval: 8000,
  });

  const sessions = useQuery({
    queryKey: ["wa", "sessions"],
    queryFn: () => listWhatsappSessions(),
    refetchInterval: 15000,
  });

  const sendFn = useServerFn(sendWhatsappMessage);
  const [target, setTarget] = useState("");
  const [text, setText] = useState("");
  const sendMut = useMutation({
    mutationFn: () => sendFn({ data: { to: target, message: text } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["wa", "messages"] });
    },
  });

  const [webhookUrl, setWebhookUrl] = useState("");
  if (typeof window !== "undefined" && !webhookUrl) {
    setWebhookUrl(`${window.location.origin}/api/public/whatsapp/webhook`);
  }

  const botConnected = botStatus.data?.connectionState === "open";
  const botConfigured = botStatus.data?.configured !== false;
  const evoConfigured = evoStatus.data?.configured;
  const evoConnected = evoStatus.data?.state === "open";

  return (
    <MobileFrame>
      <ScreenHeader title="WhatsApp" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4 overflow-y-auto">
          {/* Bot Status */}
          <Card variant="default" className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    botConnected
                      ? "bg-success/15 text-success"
                      : botStatus.isLoading
                        ? "bg-muted text-text-tertiary"
                        : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {botConnected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">Bot WhatsApp</p>
                  <p className="text-[11px] text-text-tertiary">
                    {!botConfigured
                      ? "Evolution API não configurada"
                      : botConnected
                        ? "Conectado"
                        : "Desconectado"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => qc.invalidateQueries({ queryKey: ["bot"] })}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* ── DIAGNÓSTICO ── */}
          {!evoConfigured && (
            <Card variant="default" className="p-4 space-y-3 border-warning/30 bg-warning/5">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-warning" />
                <p className="text-sm font-semibold">Configuração necessária</p>
              </div>
              <p className="text-xs text-text-secondary">
                A Evolution API não está configurada. Para enviar e receber mensagens, você precisa:
              </p>
              <ul className="space-y-1.5 text-[11px] text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-warning font-bold">1.</span>
                  <span>Ter uma instância da Evolution API rodando</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning font-bold">2.</span>
                  <span>Cadastrar as credenciais no painel de integração</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning font-bold">3.</span>
                  <span>Configurar o webhook na Evolution API</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: "/admin/whatsapp-integration" })}
              >
                <Settings className="h-4 w-4" /> Abrir painel de integração
              </Button>
            </Card>
          )}

          {/* Erro de conexão */}
          {botStatus.data?.error && evoConfigured && (
            <Card variant="default" className="p-3">
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{botStatus.data.error}</span>
              </div>
            </Card>
          )}

          {/* Evolution API status */}
          {evoConfigured && (
            <Card variant="default" className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${evoConnected ? "bg-success animate-pulse" : "bg-muted"}`}
                  />
                  <span className="text-xs text-text-secondary">
                    Evolution API: {evoStatus.data?.state || "desconhecido"}
                  </span>
                </div>
                {evoStatus.data?.phone && (
                  <span className="text-[11px] text-text-muted font-mono">
                    {evoStatus.data.phone}
                  </span>
                )}
              </div>
            </Card>
          )}

          {/* Webhook */}
          {webhookUrl && (
            <Card variant="default" className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-2">
                Webhook URL
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-xl bg-surface-elevated px-3 py-2 text-[11px] font-mono text-text-secondary">
                  {webhookUrl}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="shrink-0 rounded-xl bg-surface-elevated p-2 text-text-tertiary hover:text-primary transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          )}

          {/* Send Message */}
          <Card variant="default" className="p-4 space-y-3">
            <p className="text-sm font-semibold">Enviar mensagem</p>
            <Input
              placeholder="Número (ex: 5511999999999)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Input
              placeholder="Mensagem..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              variant="primary"
              className="w-full"
              onClick={() => sendMut.mutate()}
              loading={sendMut.isPending}
              disabled={!target.trim() || !text.trim()}
            >
              <Send className="h-4 w-4" /> Enviar
            </Button>
          </Card>

          {/* Messages */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Mensagens recentes</h3>
            {messages.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-surface-card border border-border p-3">
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-2 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (messages.data?.length ?? 0) === 0 ? (
              <EmptyState
                icon={<MessageCircle className="h-6 w-6" />}
                title="Sem mensagens"
                description="As mensagens recebidas e enviadas aparecerão aqui."
              />
            ) : (
              <StaggerContainer className="space-y-2">
                {messages.data!.slice(0, 10).map((m) => (
                  <StaggerItem key={m.id}>
                    <div className="rounded-2xl bg-surface-card border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-text-secondary">
                          {m.direction === "outbound" ? "→" : "←"}{" "}
                          {m.remote_jid?.replace(/@.*/, "")}
                        </span>
                        <StatusIcon status={m.status} />
                      </div>
                      <p className="mt-1 text-xs text-foreground break-words">
                        {m.content ?? "[mídia]"}
                      </p>
                      <p className="mt-1 text-[10px] text-text-muted">
                        {new Date(m.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </section>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "read") return <CheckCheck className="h-3.5 w-3.5 text-accent-blue" />;
  if (status === "delivered") return <CheckCheck className="h-3.5 w-3.5 text-text-muted" />;
  if (status === "sent") return <Check className="h-3.5 w-3.5 text-text-muted" />;
  if (status === "failed") return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
  return <Clock3 className="h-3.5 w-3.5 text-text-muted" />;
}
