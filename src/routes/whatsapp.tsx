import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { MessageCircle, Send, RefreshCw, CheckCheck, Check, Clock3, AlertTriangle, Copy } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  getWhatsappStatus,
  listWhatsappMessages,
  listWhatsappSessions,
  sendWhatsappMessage,
} from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp Bot — Pulse Fit" },
      { name: "description", content: "Painel do bot de WhatsApp com Evolution API: envio, recebimento e sessões." },
      { property: "og:title", content: "WhatsApp Bot — Pulse Fit" },
      { property: "og:description", content: "Painel do bot de WhatsApp integrado à Evolution API." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WhatsappPage,
});

const TEMPLATES: Record<string, (name: string) => string> = {
  "boas-vindas": (n) => `Olá ${n || "aluno"}! 💪 Bem-vindo ao Pulse Fit. Estou aqui para te lembrar dos seus treinos.`,
  "lembrete-treino": (n) => `Oi ${n || ""}! Bora treinar? Seu treino de hoje já está te esperando no app. 🔥`,
  "parabens": (n) => `Parabéns${n ? ", " + n : ""}! 🎉 Você concluiu mais uma sessão. Continue assim!`,
};

function WhatsappPage() {
  const status = useQuery({
    queryKey: ["wa", "status"],
    queryFn: () => getWhatsappStatus(),
    refetchInterval: 15000,
  });
  const messages = useQuery({
    queryKey: ["wa", "messages"],
    queryFn: () => listWhatsappMessages({ data: { limit: 30 } }),
    refetchInterval: 8000,
  });
  const sessions = useQuery({
    queryKey: ["wa", "sessions"],
    queryFn: () => listWhatsappSessions(),
    refetchInterval: 15000,
  });

  const [webhookUrl, setWebhookUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/public/whatsapp/webhook`);
    }
  }, []);

  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader
        title="WhatsApp Bot"
        right={
          <button
            aria-label="Atualizar"
            onClick={() => {
              status.refetch();
              messages.refetch();
              sessions.refetch();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        }
      />

      <main className="flex-1 space-y-4 overflow-y-auto px-5 pb-6">
        <StatusCard status={status.data} loading={status.isLoading} />
        <WebhookCard webhookUrl={webhookUrl} />
        <SendCard />
        <SessionsCard sessions={sessions.data ?? []} loading={sessions.isLoading} />
        <MessagesCard messages={messages.data ?? []} loading={messages.isLoading} />
      </main>

      <BottomNav />
    </MobileFrame>
  );
}

function StatusCard({
  status,
  loading,
}: {
  status: Awaited<ReturnType<typeof getWhatsappStatus>> | undefined;
  loading: boolean;
}) {
  const configured = status?.configured;
  const state = status?.state;
  const ok = configured && (state === "open" || state === "connected");
  return (
    <section className="rounded-3xl bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${ok ? "bg-primary text-primary-foreground" : "bg-white/10 text-primary"}`}>
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Status da instância</p>
          <p className="truncate text-xs text-text-tertiary">
            {loading ? "Carregando…" : status?.error ? status.error :
              !configured ? "Configuração ausente" :
              `Instância: ${status?.instance} · ${state ?? "?"}`}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
            ok ? "bg-primary/20 text-primary" : "bg-white/10 text-text-secondary"
          }`}
        >
          {ok ? "Conectado" : "Offline"}
        </span>
      </div>
      {!status?.webhookTokenSet && (
        <p className="mt-3 flex items-start gap-2 text-xs text-text-tertiary">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-primary" />
          Token de webhook não configurado.
        </p>
      )}
    </section>
  );
}

function WebhookCard({ webhookUrl }: { webhookUrl: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };
  return (
    <section className="rounded-3xl bg-surface p-5">
      <h2 className="text-sm font-bold">URL do Webhook</h2>
      <p className="mt-1 text-xs text-text-tertiary">
        Configure este endereço no painel da Evolution, acrescentando <code className="text-primary">?token=SEU_TOKEN</code> ao final ou enviando o header <code className="text-primary">x-evolution-token</code>.
      </p>
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-surface-elevated p-3">
        <code className="flex-1 truncate text-xs text-foreground">{webhookUrl || "…"}</code>
        <button
          onClick={copy}
          className="flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-[11px] font-bold text-primary-foreground"
        >
          <Copy className="h-3 w-3" /> {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </section>
  );
}

function SendCard() {
  const qc = useQueryClient();
  const send = useServerFn(sendWhatsappMessage);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [template, setTemplate] = useState<string>("");
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const mutation = useMutation({
    mutationFn: (vars: { phone: string; message: string; templateName?: string }) =>
      send({ data: vars }),
    onSuccess: (res) => {
      if (res.ok) {
        setFeedback({ ok: true, text: "Mensagem enviada." });
        setMessage("");
        qc.invalidateQueries({ queryKey: ["wa", "messages"] });
        qc.invalidateQueries({ queryKey: ["wa", "sessions"] });
      } else {
        setFeedback({ ok: false, text: res.error });
      }
    },
    onError: (err: unknown) => {
      setFeedback({ ok: false, text: err instanceof Error ? err.message : "Falha ao enviar" });
    },
  });

  const applyTemplate = (id: string) => {
    setTemplate(id);
    const fn = TEMPLATES[id];
    if (fn) setMessage(fn(name));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) return;
    setFeedback(null);
    mutation.mutate({
      phone: phone.trim(),
      message: message.trim(),
      templateName: template || undefined,
    });
  };

  return (
    <section className="rounded-3xl bg-surface p-5">
      <h2 className="text-sm font-bold">Enviar mensagem</h2>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded-2xl bg-surface-elevated px-3 py-2.5 text-sm outline-none placeholder:text-text-tertiary"
            placeholder="Telefone (ex: 5511999998888)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            maxLength={32}
          />
          <input
            className="rounded-2xl bg-surface-elevated px-3 py-2.5 text-sm outline-none placeholder:text-text-tertiary"
            placeholder="Nome do aluno (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.keys(TEMPLATES).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => applyTemplate(t)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                template === t ? "bg-primary text-primary-foreground" : "bg-surface-elevated text-text-secondary"
              }`}
            >
              {t}
            </button>
          ))}
          {template && (
            <button
              type="button"
              onClick={() => { setTemplate(""); setMessage(""); }}
              className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-bold text-text-tertiary"
            >
              livre
            </button>
          )}
        </div>

        <textarea
          className="min-h-[96px] w-full resize-y rounded-2xl bg-surface-elevated px-3 py-2.5 text-sm outline-none placeholder:text-text-tertiary"
          placeholder="Digite a mensagem…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={4000}
        />

        <button
          type="submit"
          disabled={mutation.isPending || !phone.trim() || !message.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {mutation.isPending ? "Enviando…" : "Enviar via WhatsApp"}
        </button>

        {feedback && (
          <p className={`text-xs font-semibold ${feedback.ok ? "text-primary" : "text-red-400"}`}>
            {feedback.text}
          </p>
        )}
      </form>
    </section>
  );
}

function SessionsCard({
  sessions,
  loading,
}: {
  sessions: Awaited<ReturnType<typeof listWhatsappSessions>>;
  loading: boolean;
}) {
  return (
    <section className="rounded-3xl bg-surface p-5">
      <h2 className="text-sm font-bold">Conversas ativas</h2>
      {loading ? (
        <p className="mt-3 text-xs text-text-tertiary">Carregando…</p>
      ) : sessions.length === 0 ? (
        <p className="mt-3 text-xs text-text-tertiary">
          Nenhuma conversa ainda. Envie uma mensagem ou aguarde uma resposta pelo webhook.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sessions.slice(0, 8).map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-2xl bg-surface-elevated p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{s.display_name || s.remote_jid}</p>
                <p className="truncate text-[11px] text-text-tertiary">{s.remote_jid}</p>
              </div>
              <span className="text-[11px] text-text-tertiary">
                {s.last_message_at ? new Date(s.last_message_at).toLocaleString("pt-BR") : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MessagesCard({
  messages,
  loading,
}: {
  messages: Awaited<ReturnType<typeof listWhatsappMessages>>;
  loading: boolean;
}) {
  return (
    <section className="rounded-3xl bg-surface p-5">
      <h2 className="text-sm font-bold">Últimas mensagens</h2>
      {loading ? (
        <p className="mt-3 text-xs text-text-tertiary">Carregando…</p>
      ) : messages.length === 0 ? (
        <p className="mt-3 text-xs text-text-tertiary">Sem mensagens registradas.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl p-3 text-sm ${
                m.direction === "outbound" ? "bg-primary/10" : "bg-surface-elevated"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                <span className="font-semibold">
                  {m.direction === "outbound" ? "→ enviada" : "← recebida"} · {m.remote_jid}
                </span>
                <StatusIcon status={m.status} />
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-foreground">
                {m.content || <span className="italic text-text-tertiary">[mídia]</span>}
              </p>
              {m.error && <p className="mt-1 text-[11px] text-red-400">{m.error}</p>}
              <p className="mt-1 text-[10px] text-text-tertiary">
                {new Date(m.created_at).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusIcon({ status }: { status: string }) {
  const label = ({
    pending: "pendente",
    sent: "enviada",
    delivered: "entregue",
    read: "lida",
    failed: "falha",
    received: "recebida",
  } as Record<string, string>)[status] ?? status;
  const Icon =
    status === "read" ? CheckCheck :
    status === "delivered" ? CheckCheck :
    status === "sent" ? Check :
    status === "failed" ? AlertTriangle :
    Clock3;
  const color =
    status === "read" ? "text-primary" :
    status === "failed" ? "text-red-400" :
    "text-text-tertiary";
  return (
    <span className={`inline-flex items-center gap-1 ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
