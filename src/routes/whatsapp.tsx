import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, RefreshCw, CheckCheck, Check, Clock3, AlertTriangle, Copy } from "lucide-react";
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
  getWhatsappStatus, listWhatsappMessages, listWhatsappSessions, sendWhatsappMessage,
} from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp Bot — Pulse Fit" },
      { name: "description", content: "Painel do bot de WhatsApp com Evolution API." },
    ],
  }),
  component: WhatsappPage,
});

const TEMPLATES: Record<string, (name: string) => string> = {
  "boas-vindas": (n) => `Olá ${n || "aluno"}! 💪 Bem-vindo ao Pulse Fit.`,
  "lembrete-treino": (n) => `Oi ${n || ""}! Bora treinar? Seu treino de hoje já está te esperando. 🔥`,
  "parabens": (n) => `Parabéns${n ? ", " + n : ""}! 🎉 Você concluiu mais uma sessão.`,
};

function WhatsappPage() {
  const status = useQuery({ queryKey: ["wa", "status"], queryFn: () => getWhatsappStatus(), refetchInterval: 15000 });
  const messages = useQuery({ queryKey: ["wa", "messages"], queryFn: () => listWhatsappMessages({ data: { limit: 20 } }), refetchInterval: 8000 });
  const sessions = useQuery({ queryKey: ["wa", "sessions"], queryFn: () => listWhatsappSessions(), refetchInterval: 15000 });
  const sendFn = useServerFn(sendWhatsappMessage);
  const qc = useQueryClient();

  const [webhookUrl, setWebhookUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setWebhookUrl(`${window.location.origin}/api/public/whatsapp/webhook`);
  }, []);

  const [target, setTarget] = useState("");
  const [text, setText] = useState("");

  const sendMut = useMutation({
    mutationFn: () => sendFn({ data: { to: target, message: text } }),
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["wa", "messages"] }); },
  });

  const isOnline = status.data?.state === "open";

  return (
    <MobileFrame>
      <ScreenHeader title="WhatsApp" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4 overflow-y-auto">
          {/* Status */}
          <Card variant="default" className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isOnline ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                  <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-success animate-pulse" : "bg-destructive"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Bot WhatsApp</p>
                  <p className="text-[11px] text-text-tertiary">{isOnline ? "Conectado" : "Desconectado"}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => qc.invalidateQueries({ queryKey: ["wa"] })}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Webhook */}
          {webhookUrl && (
            <Card variant="default" className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-2">Webhook URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-xl bg-surface-elevated px-3 py-2 text-[11px] font-mono text-text-secondary">{webhookUrl}</code>
                <button onClick={() => navigator.clipboard.writeText(webhookUrl)} className="shrink-0 rounded-xl bg-surface-elevated p-2 text-text-tertiary hover:text-primary transition-colors">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          )}

          {/* Send Message */}
          <Card variant="default" className="p-4 space-y-3">
            <p className="text-sm font-semibold">Enviar mensagem</p>
            <Input placeholder="Número (ex: 5511999999999)" value={target} onChange={(e) => setTarget(e.target.value)} />
            <Input placeholder="Mensagem..." value={text} onChange={(e) => setText(e.target.value)} />
            <Button variant="primary" className="w-full" onClick={() => sendMut.mutate()} loading={sendMut.isPending} disabled={!target.trim() || !text.trim()}>
              <Send className="h-4 w-4" /> Enviar
            </Button>
          </Card>

          {/* Messages */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Mensagens recentes</h3>
            {messages.isLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-2xl bg-surface-card border border-border p-3"><Skeleton className="h-3 w-1/2 mb-2" /><Skeleton className="h-2 w-3/4" /></div>)}</div>
            ) : (messages.data?.length ?? 0) === 0 ? (
              <EmptyState icon={<MessageCircle className="h-6 w-6" />} title="Sem mensagens" description="As mensagens recebidas e enviadas aparecerão aqui." />
            ) : (
              <StaggerContainer className="space-y-2">
                {messages.data!.slice(0, 10).map((m) => (
                  <StaggerItem key={m.id}>
                    <div className="rounded-2xl bg-surface-card border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-text-secondary">
                          {m.direction === "outbound" ? "→" : "←"} {m.remote_jid?.replace(/@.*/, "")}
                        </span>
                        <StatusIcon status={m.status} />
                      </div>
                      <p className="mt-1 text-xs text-foreground break-words">{m.content ?? "[mídia]"}</p>
                      <p className="mt-1 text-[10px] text-text-muted">{new Date(m.created_at).toLocaleString("pt-BR")}</p>
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
