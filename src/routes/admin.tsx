import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, ShieldAlert, Megaphone, Users, MessageCircle } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { getMe, adminListUsers, adminSendMessage, adminBroadcast } from "@/lib/auth.functions";
import { getWhatsappStatus, listWhatsappMessages } from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Pulse Fit" },
      { name: "description", content: "Painel administrativo do Pulse Fit." },
      { property: "og:title", content: "Admin — Pulse Fit" },
      { property: "og:description", content: "Painel administrativo do Pulse Fit." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe(), enabled: !!session });

  if (loading || !session || me.isLoading) {
    return <MobileFrame>
<Loader /></MobileFrame>;
  }
  if (!me.data?.isAdmin) {
    return (
      <MobileFrame>
        <ScreenHeader title="Admin" onBack={() => navigate({ to: "/" })} />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <ShieldAlert className="h-10 w-10 text-primary" />
          <p className="font-display text-xl">Acesso restrito</p>
          <p className="text-sm text-text-tertiary">
            Sua conta ({me.data?.profile?.email ?? "sem e-mail"}) não é administradora.
          </p>
        </main>
        <BottomNav />
      </MobileFrame>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => adminListUsers() });
  const status = useQuery({ queryKey: ["wa", "status"], queryFn: () => getWhatsappStatus(), refetchInterval: 15000 });
  const messages = useQuery({
    queryKey: ["wa", "messages", "admin"],
    queryFn: () => listWhatsappMessages({ data: { limit: 20 } }),
    refetchInterval: 10000,
  });

  const sendFn = useServerFn(adminSendMessage);
  const broadcastFn = useServerFn(adminBroadcast);

  const [broadcast, setBroadcast] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const broadcastMut = useMutation({
    mutationFn: (m: string) => broadcastFn({ data: { message: m } }),
    onSuccess: (r) => {
      setFeedback(r.ok ? `Broadcast: ${r.sent} enviadas, ${r.failed} falharam.` : r.error);
      if (r.ok) { setBroadcast(""); qc.invalidateQueries({ queryKey: ["wa", "messages", "admin"] }); }
    },
  });

  const directMut = useMutation({
    mutationFn: (v: { userId: string; message: string }) => sendFn({ data: v }),
    onSuccess: (r) => setFeedback(r.ok ? "Mensagem enviada." : r.error),
  });

  const total = users.data?.length ?? 0;
  const verified = users.data?.filter((u) => u.whatsapp_verified).length ?? 0;

  return (
    <MobileFrame>
      <ScreenHeader title="Painel Admin" onBack={() => navigate({ to: "/" })} />
      <main className="flex-1 space-y-4 overflow-y-auto px-5 py-4 pb-6">
        <section className="grid grid-cols-3 gap-2">
          <Stat icon={<Users className="h-4 w-4" />} label="Usuários" value={total} />
          <Stat icon={<MessageCircle className="h-4 w-4" />} label="Verificados" value={verified} />
          <Stat icon={<MessageCircle className="h-4 w-4" />} label="Bot" value={status.data?.state ?? "…"} />
        </section>

        <section className="rounded-3xl bg-surface p-5">
          <h2 className="flex items-center gap-2 font-display text-lg"><Megaphone className="h-4 w-4" /> Broadcast</h2>
          <p className="mt-1 text-xs text-text-tertiary">Enviar mensagem para todos os usuários com WhatsApp confirmado.</p>
          <textarea
            className="mt-3 min-h-[80px] w-full rounded-2xl bg-surface-elevated px-3 py-2.5 text-sm outline-none placeholder:text-text-tertiary"
            placeholder="Sua mensagem…"
            value={broadcast}
            onChange={(e) => setBroadcast(e.target.value)}
            maxLength={4000}
          />
          <button
            onClick={() => broadcast.trim() && broadcastMut.mutate(broadcast.trim())}
            disabled={broadcastMut.isPending || !broadcast.trim() || verified === 0}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {broadcastMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar para {verified} usuários
          </button>
        </section>

        <section className="rounded-3xl bg-surface p-5">
          <h2 className="font-display text-lg">Usuários</h2>
          {users.isLoading ? (
            <p className="mt-3 text-xs text-text-tertiary">Carregando…</p>
          ) : (users.data?.length ?? 0) === 0 ? (
            <p className="mt-3 text-xs text-text-tertiary">Sem usuários registrados.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {users.data!.map((u) => (
                <UserRow
                  key={u.user_id}
                  user={u}
                  onSend={(msg) => directMut.mutate({ userId: u.user_id, message: msg })}
                  pending={directMut.isPending}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl bg-surface p-5">
          <h2 className="font-display text-lg">Últimas mensagens</h2>
          {messages.isLoading ? (
            <p className="mt-3 text-xs text-text-tertiary">Carregando…</p>
          ) : (messages.data?.length ?? 0) === 0 ? (
            <p className="mt-3 text-xs text-text-tertiary">Sem histórico.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {messages.data!.slice(0, 10).map((m) => (
                <li key={m.id} className="rounded-2xl bg-surface-elevated p-3 text-xs">
                  <p className="font-semibold text-text-secondary">
                    {m.direction === "outbound" ? "→" : "←"} {m.remote_jid}
                  </p>
                  <p className="mt-1 text-foreground">{m.content ?? "[mídia]"}</p>
                  <p className="mt-1 text-[10px] text-text-tertiary">
                    {new Date(m.created_at).toLocaleString("pt-BR")} · {m.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {feedback && <p className="text-center text-xs text-primary">{feedback}</p>}
      </main>
      <BottomNav />
    </MobileFrame>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <div className="flex items-center gap-1 text-text-tertiary">{icon}<span className="text-[10px] uppercase tracking-widest">{label}</span></div>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}

function UserRow({
  user,
  onSend,
  pending,
}: {
  user: { user_id: string; email: string | null; full_name: string | null; whatsapp_number: string | null; whatsapp_verified: boolean; roles: string[] };
  onSend: (msg: string) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <li className="rounded-2xl bg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.full_name || user.email || user.user_id.slice(0, 8)}</p>
          <p className="truncate text-[11px] text-text-tertiary">
            {user.email} {user.roles.includes("admin") && "· admin"}
          </p>
          <p className="truncate text-[11px] text-text-tertiary">
            {user.whatsapp_number ? user.whatsapp_number.replace(/@.*/, "") : "sem WhatsApp"} {user.whatsapp_verified ? "✅" : "⏳"}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={!user.whatsapp_verified}
          className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground disabled:opacity-40"
        >
          {open ? "Fechar" : "Mensagem"}
        </button>
      </div>
      {open && (
        <div className="mt-2 space-y-2">
          <textarea
            className="min-h-[60px] w-full rounded-xl bg-surface px-3 py-2 text-xs outline-none"
            placeholder="Escreva a mensagem…"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            maxLength={4000}
          />
          <button
            onClick={() => { if (msg.trim()) { onSend(msg.trim()); setMsg(""); setOpen(false); } }}
            disabled={pending || !msg.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-3 w-3" /> Enviar
          </button>
        </div>
      )}
    </li>
  );
}

function Loader() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
