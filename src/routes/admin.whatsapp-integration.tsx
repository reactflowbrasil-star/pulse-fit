import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Save,
  TestTube,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Link2,
  Key,
  Hash,
  Lock,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  testWhatsAppConnection,
} from "@/lib/whatsapp-config.functions";

export const Route = createFileRoute("/admin/whatsapp-integration")({
  head: () => ({ meta: [{ title: "WhatsApp Integration — Admin" }] }),
  component: WhatsAppIntegrationPage,
});

function WhatsAppIntegrationPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  const config = useQuery({
    queryKey: ["wa", "config"],
    queryFn: () => getWhatsAppConfig(),
    enabled: !!session,
  });

  const saveFn = useServerFn(saveWhatsAppConfig);
  const testFn = useServerFn(testWhatsAppConnection);

  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [webhookToken, setWebhookToken] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = {};
      if (apiUrl.trim()) payload.apiUrl = apiUrl.trim();
      if (apiKey.trim()) payload.apiKey = apiKey.trim();
      if (instanceName.trim()) payload.instanceName = instanceName.trim();
      if (webhookToken.trim()) payload.webhookToken = webhookToken.trim();
      return saveFn({ data: payload as never });
    },
    onSuccess: (r) => {
      if (r?.data?.ok) {
        setFeedback({ type: "ok", msg: "Configuração salva com sucesso!" });
        setDirty(false);
        setApiKey("");
        setWebhookToken("");
        qc.invalidateQueries({ queryKey: ["wa", "config"] });
      } else {
        setFeedback({ type: "err", msg: r?.data?.error || "Erro ao salvar" });
      }
    },
    onError: (e) => setFeedback({ type: "err", msg: e.message }),
  });

  const testMut = useMutation({
    mutationFn: () => testFn({ data: undefined as never }),
    onSuccess: (r) => {
      const d = r?.data;
      if (d?.ok) {
        setFeedback({
          type: "ok",
          msg: `✅ Conectado! Estado: ${d.connectionState} | Instância: ${d.instanceName}`,
        });
      } else {
        setFeedback({ type: "err", msg: `❌ ${d?.error || "Falha no teste"}` });
      }
    },
    onError: (e) => setFeedback({ type: "err", msg: e.message }),
  });

  if (loading || !session) {
    return (
      <MobileFrame>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <ScreenHeader title="WhatsApp Integration" onBack={() => navigate({ to: "/admin" })} />
      <PageTransition>
        <main className="flex-1 space-y-4 px-5 py-4 overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
              <MessageCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Evolution API</h2>
              <p className="text-[11px] text-text-tertiary">Configure a conexão com o WhatsApp</p>
            </div>
          </div>

          <Card variant="default" className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Status</span>
              <span className={`text-xs font-medium ${config.data?.configured ? "text-success" : "text-text-muted"}`}>
                {config.isLoading ? "Carregando..." : config.data?.configured ? "Configurado" : "Não configurado"}
              </span>
            </div>
            {config.data?.instanceName && (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Instância</span>
                <span className="text-xs text-text-tertiary font-mono">{config.data.instanceName}</span>
              </div>
            )}
            {config.data?.updatedAt && (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Atualizado</span>
                <span className="text-xs text-text-tertiary">{new Date(config.data.updatedAt).toLocaleString("pt-BR")}</span>
              </div>
            )}
          </Card>

          <Card variant="default" className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Credenciais</p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
                <Link2 className="h-3 w-3" /> API URL
              </label>
              <Input placeholder="https://sua-evolution-api.com.br" value={apiUrl} onChange={(e) => { setApiUrl(e.target.value); setDirty(true); setFeedback(null); }} inputMode="url" />
              <p className="text-[10px] text-text-muted">URL base da sua Evolution API (ex: https://evo.exemplo.com)</p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
                <Key className="h-3 w-3" /> API Key
              </label>
              <div className="relative">
                <Input placeholder={config.data?.configured ? "•••••••• (já salva)" : "Sua API key"} value={apiKey} onChange={(e) => { setApiKey(e.target.value); setDirty(true); setFeedback(null); }} type={showApiKey ? "text" : "password"} className="pr-10" />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-text-muted">Encontre em Evolution API {'>'} Settings {'>'} API Key</p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
                <Hash className="h-3 w-3" /> Nome da Instância
              </label>
              <Input placeholder="pulsefit" value={instanceName} onChange={(e) => { setInstanceName(e.target.value); setDirty(true); setFeedback(null); }} />
              <p className="text-[10px] text-text-muted">Nome da instância criada na Evolution API</p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
                <Lock className="h-3 w-3" /> Webhook Token
              </label>
              <div className="relative">
                <Input placeholder="Token para validar webhooks" value={webhookToken} onChange={(e) => { setWebhookToken(e.target.value); setDirty(true); setFeedback(null); }} type={showWebhook ? "text" : "password"} className="pr-10" />
                <button type="button" onClick={() => setShowWebhook(!showWebhook)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-text-muted">Token compartilhado para autenticar o webhook (opcional)</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1" onClick={() => saveMut.mutate()} loading={saveMut.isPending} disabled={!dirty && !apiKey && !webhookToken}>
                <Save className="h-4 w-4" /> Salvar
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => testMut.mutate()} loading={testMut.isPending}>
                <TestTube className="h-4 w-4" /> Testar
              </Button>
            </div>
          </Card>

          {feedback && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-2 rounded-2xl p-3 text-xs ${feedback.type === "ok" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              {feedback.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              <span>{feedback.msg}</span>
            </motion.div>
          )}

          <Card variant="default" className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-2">Ajuda rápida</p>
            <ul className="space-y-1.5 text-[11px] text-text-secondary">
              <li>1. Crie uma instância na Evolution API</li>
              <li>2. Copie a API Key em Settings</li>
              <li>3. Cole os dados acima e clique Salvar</li>
              <li>4. Clique em Testar para validar</li>
              <li>5. Configure o webhook: <code className="rounded bg-surface-elevated px-1 py-0.5 text-[10px]">{typeof window !== "undefined" ? `${window.location.origin}/api/public/whatsapp/webhook` : "/api/public/whatsapp/webhook"}</code></li>
            </ul>
          </Card>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
