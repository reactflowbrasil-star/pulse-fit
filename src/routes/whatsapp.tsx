import { createFileRoute } from "@tanstack/react-router";
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
  Power,
  Wifi,
  WifiOff,
  QrCode,
  Smartphone,
  ExternalLink,
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
import { getBotStatus, sendBotCommand, getBotQr } from "@/lib/bot-status.functions";

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
  const qc = useQueryClient();

  // Bot server status
  const botStatus = useQuery({
    queryKey: ["bot", "status"],
    queryFn: () => getBotStatus(),
    refetchInterval: 10000,
  });

  // QR Code
  const qrQuery = useQuery({
    queryKey: ["bot", "qr"],
    queryFn: () => getBotQr(),
    enabled: false,
    refetchInterval: false,
  });

  // Evolution API status
  const evoStatus = useQuery({
    queryKey: ["wa", "status"],
    queryFn: () => getWhatsappStatus(),
    refetchInterval: 15000,
  });

  // Messages
  const messages = useQuery({
    queryKey: ["wa", "messages"],
    queryFn: () => listWhatsappMessages({ data: { limit: 20 } }),
    refetchInterval: 8000,
  });

  // Sessions
  const sessions = useQuery({
    queryKey: ["wa", "sessions"],
    queryFn: () => listWhatsappSessions(),
    refetchInterval: 15000,
  });

  // Bot commands
  const botCommandFn = useServerFn(sendBotCommand);
  const connectMut = useMutation({
    mutationFn: () => botCommandFn({ data: { command: "connect" } }),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["bot"] }), 2000);
    },
  });
  const disconnectMut = useMutation({
    mutationFn: () => botCommandFn({ data: { command: "disconnect" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bot"] }),
  });

  // Send message
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

  // QR code modal
  const [showQr, setShowQr] = useState(false);
  const handleShowQr = async () => {
    setShowQr(true);
    await qc.fetchQuery({ queryKey: ["bot", "qr"], queryFn: () => getBotQr() });
  };

  const [webhookUrl, setWebhookUrl] = useState("");
  if (typeof window !== "undefined" && !webhookUrl) {
    setWebhookUrl(`${window.location.origin}/api/public/whatsapp/webhook`);
  }

  const botConnected = botStatus.data?.connectionState === "open";
  const botConfigured = botStatus.data?.configured !== false;

  return (
    <MobileFrame>
      <ScreenHeader title="WhatsApp" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4 overflow-y-auto">
          {/* Bot Status Card */}
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
                  {botConnected ? (
                    <Wifi className="h-5 w-5" />
                  ) : botStatus.isLoading ? (
                    <Skeleton className="h-5 w-5 rounded" />
                  ) : (
                    <WifiOff className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">Bot WhatsApp</p>
                  <p className="text-[11px] text-text-tertiary">
                    {!botConfigured
                      ? "BOT_URL não configurado"
                      : botConnected
                        ? `Conectado${botStatus.data?.phone ? ` (${botStatus.data.phone})` : ""}`
                        : botStatus.data?.connectionState === "connecting"
                          ? "Conectando..."
                          : "Desconectado"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => qc.invalidateQueries({ queryKey: ["bot"] })}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                {botConfigured && (
                  <>
                    {botConnected ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => disconnectMut.mutate()}
                        disabled={disconnectMut.isPending}
                      >
                        <Power className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => connectMut.mutate()}
                        disabled={connectMut.isPending || botStatus.data?.connectionState === "connecting"}
                      >
                        <Power className="h-4 w-4 text-success" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Connection buttons */}
            {botConfigured && !botConnected && (
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => connectMut.mutate()}
                  loading={connectMut.isPending}
                >
                  <Power className="h-3.5 w-3.5" /> Conectar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleShowQr}
                >
                  <QrCode className="h-3.5 w-3.5" /> QR Code
                </Button>
              </div>
            )}
          </Card>

          {/* QR Code Modal */}
          {showQr && (
            <Card variant="default" className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">QR Code</p>
                <button onClick={() => setShowQr(false)} className="text-xs text-text-tertiary hover:text-foreground">
                  ✕
                </button>
              </div>
              {qrQuery.isLoading ? (
                <div className="flex justify-center py-6">
                  <Skeleton className="h-[200px] w-[200px] rounded-xl" />
                </div>
              ) : qrQuery.data?.ok && qrQuery.data.qr ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={qrQuery.data.qr}
                    alt="QR Code WhatsApp"
                    className="rounded-xl border border-border"
                    style={{ width: 220, height: 220 }}
                  />
                  <p className="text-[11px] text-text-tertiary text-center">
                    Abra WhatsApp &gt; Dispositivos conectados &gt; Vincular dispositivo
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => qc.fetchQuery({ queryKey: ["bot", "qr"], queryFn: () => getBotQr() })}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Atualizar QR
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-text-tertiary">
                    {qrQuery.data?.error || "QR não disponível. Conecte o bot primeiro."}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Bot error */}
          {botStatus.data?.error && (
            <Card variant="default" className="p-3">
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{botStatus.data.error}</span>
              </div>
            </Card>
          )}

          {/* Evolution API status */}
          {evoStatus.data?.configured && (
            <Card variant="default" className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-text-tertiary" />
                  <span className="text-xs text-text-secondary">
                    Evolution API: {evoStatus.data.state || "desconhecido"}
                  </span>
                </div>
                <div className={`h-2 w-2 rounded-full ${evoStatus.data.state === "open" ? "bg-success" : "bg-muted"}`} />
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
