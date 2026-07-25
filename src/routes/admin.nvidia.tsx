import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2, Key, Cpu, Settings, Plus, Trash2, RefreshCw,
  ShieldCheck, ShieldX, Eye, EyeOff, Zap, ChevronDown, ChevronUp,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { getMe } from "@/lib/auth.functions";
import {
  listNvidiaApiKeys, createNvidiaApiKey, deleteNvidiaApiKey,
  toggleNvidiaApiKey, validateNvidiaApiKey,
  listNvidiaModels, toggleNvidiaModel, fetchNvidiaRemoteModels,
  getNvidiaSettings, updateNvidiaSetting,
} from "@/lib/nvidia.functions";

export const Route = createFileRoute("/admin/nvidia")({
  head: () => ({
    meta: [
      { title: "NVIDIA API — Admin" },
      { name: "description", content: "Gerenciamento da API NVIDIA (VIN)." },
    ],
  }),
  component: NvidiaAdminPage,
});

type Tab = "keys" | "models" | "settings";

function NvidiaAdminPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("keys");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe(), enabled: !!session });

  if (loading || !session || me.isLoading) {
    return <MobileFrame><Loader /></MobileFrame>;
  }
  if (!me.data?.isAdmin) {
    return (
      <MobileFrame>
        <ScreenHeader title="NVIDIA API" onBack={() => navigate({ to: "/admin" })} />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <ShieldX className="h-10 w-10 text-red-400" />
          <p className="font-display text-xl">Acesso restrito</p>
        </main>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <ScreenHeader title="NVIDIA API" onBack={() => navigate({ to: "/admin" })} />
      <TabBar tab={tab} setTab={setTab} />
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-6">
        {tab === "keys" && <KeysTab />}
        {tab === "models" && <ModelsTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
      <BottomNav />
    </MobileFrame>
  );
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "keys", label: "Chaves", icon: <Key className="h-4 w-4" /> },
    { id: "models", label: "Modelos", icon: <Cpu className="h-4 w-4" /> },
    { id: "settings", label: "Config", icon: <Settings className="h-4 w-4" /> },
  ];
  return (
    <div className="flex gap-1 px-4 pt-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition ${
            tab === t.id ? "bg-primary text-primary-foreground" : "bg-surface text-text-tertiary"
          }`}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Keys Tab ────────────────────────────────────────── */

function KeysTab() {
  const qc = useQueryClient();
  const keys = useQuery({ queryKey: ["nvidia", "keys"], queryFn: () => listNvidiaApiKeys() });

  const createFn = useServerFn(createNvidiaApiKey);
  const deleteFn = useServerFn(deleteNvidiaApiKey);
  const toggleFn = useServerFn(toggleNvidiaApiKey);
  const validateFn = useServerFn(validateNvidiaApiKey);

  const createMut = useMutation({
    mutationFn: (d: { name: string; api_key: string }) => createFn({ data: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["nvidia", "keys"] }); setShowAdd(false); setNewName(""); setNewKey(""); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nvidia", "keys"] }),
  });
  const toggleMut = useMutation({
    mutationFn: (d: { id: string; is_active: boolean }) => toggleFn({ data: d }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nvidia", "keys"] }),
  });
  const validateMut = useMutation({
    mutationFn: (id: string) => validateFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nvidia", "keys"] }),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">Chaves API</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
        >
          <Plus className="h-3 w-3" /> Adicionar
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl bg-surface p-4 space-y-3">
          <input
            className="w-full rounded-xl bg-surface-elevated px-3 py-2.5 text-sm outline-none placeholder:text-text-tertiary"
            placeholder="Nome da chave (ex: Produção)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="w-full rounded-xl bg-surface-elevated px-3 py-2.5 text-sm font-mono outline-none placeholder:text-text-tertiary"
            placeholder="nvapi-..."
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            type="password"
          />
          <button
            onClick={() => newName.trim() && newKey.trim() && createMut.mutate({ name: newName.trim(), api_key: newKey.trim() })}
            disabled={createMut.isPending || !newName.trim() || !newKey.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50"
          >
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Salvar chave
          </button>
        </div>
      )}

      {keys.isLoading ? (
        <Loader />
      ) : (keys.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Key className="h-8 w-8" />} text="Nenhuma chave configurada" />
      ) : (
        <div className="space-y-2">
          {keys.data!.map((k) => (
            <div key={k.id} className="rounded-2xl bg-surface p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{k.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-text-tertiary">
                    {k.is_active ? (
                      <><ShieldCheck className="h-3 w-3 text-green-400" /> Ativa</>
                    ) : (
                      <><ShieldX className="h-3 w-3 text-text-tertiary" /> Inativa</>
                    )}
                    {k.last_validated_at && (
                      <span className="ml-2">
                        {k.last_validation_ok ? "✅ Válida" : "❌ Inválida"}
                        {" · "}
                        {new Date(k.last_validated_at).toLocaleString("pt-BR")}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => validateMut.mutate(k.id)}
                    disabled={validateMut.isPending}
                    className="rounded-full bg-surface-elevated p-2 text-text-tertiary hover:text-primary"
                    title="Validar"
                  >
                    <Zap className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleMut.mutate({ id: k.id, is_active: !k.is_active })}
                    className="rounded-full bg-surface-elevated p-2 text-text-tertiary hover:text-primary"
                    title={k.is_active ? "Desativar" : "Ativar"}
                  >
                    {k.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => { if (confirm("Excluir esta chave?")) deleteMut.mutate(k.id); }}
                    className="rounded-full bg-surface-elevated p-2 text-text-tertiary hover:text-red-400"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Models Tab ──────────────────────────────────────── */

function ModelsTab() {
  const qc = useQueryClient();
  const models = useQuery({ queryKey: ["nvidia", "models"], queryFn: () => listNvidiaModels() });
  const toggleFn = useServerFn(toggleNvidiaModel);
  const fetchRemoteFn = useServerFn(fetchNvidiaRemoteModels);

  const toggleMut = useMutation({
    mutationFn: (d: { id: string; is_enabled: boolean }) => toggleFn({ data: d }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nvidia", "models"] }),
  });
  const fetchRemoteMut = useMutation({
    mutationFn: () => fetchRemoteFn(),
    onSuccess: (data: unknown) => {
      const count = Array.isArray(data) ? data.length : 0;
      alert(`${count} modelos encontrados na NVIDIA API`);
      qc.invalidateQueries({ queryKey: ["nvidia", "models"] });
    },
  });

  const [expanded, setExpanded] = useState<string | null>(null);
  const categories = [...new Set(models.data?.map((m) => m.category) ?? [])];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">Modelos</h2>
        <button
          onClick={() => fetchRemoteMut.mutate()}
          disabled={fetchRemoteMut.isPending}
          className="flex items-center gap-1 rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-text-tertiary"
        >
          {fetchRemoteMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Sincronizar
        </button>
      </div>

      {models.isLoading ? (
        <Loader />
      ) : (models.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Cpu className="h-8 w-8" />} text="Nenhum modelo cadastrado" />
      ) : (
        categories.map((cat) => (
          <div key={cat}>
            <button
              onClick={() => setExpanded(expanded === cat ? null : cat)}
              className="flex w-full items-center gap-2 py-2 text-xs font-semibold uppercase tracking-widest text-text-tertiary"
            >
              {expanded === cat ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {cat} ({models.data!.filter((m) => m.category === cat).length})
            </button>
            {(expanded === cat || expanded === null) && (
              <div className="space-y-1.5">
                {models.data!.filter((m) => m.category === cat).map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-2xl bg-surface p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{m.display_name}</p>
                      <p className="truncate text-[11px] text-text-tertiary font-mono">{m.model_id}</p>
                      {m.description && <p className="mt-0.5 text-[11px] text-text-tertiary">{m.description}</p>}
                    </div>
                    <button
                      onClick={() => toggleMut.mutate({ id: m.id, is_enabled: !m.is_enabled })}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                        m.is_enabled ? "bg-green-500/20 text-green-400" : "bg-surface-elevated text-text-tertiary"
                      }`}
                    >
                      {m.is_enabled ? "ON" : "OFF"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Settings Tab ────────────────────────────────────── */

function SettingsTab() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["nvidia", "settings"], queryFn: () => getNvidiaSettings() });
  const updateFn = useServerFn(updateNvidiaSetting);

  const updateMut = useMutation({
    mutationFn: (d: { key: string; value: unknown }) => updateFn({ data: d }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nvidia", "settings"] }),
  });

  const fields = [
    { key: "base_url", label: "Base URL", type: "text" },
    { key: "default_model", label: "Modelo padrão", type: "text" },
    { key: "max_tokens_default", label: "Max Tokens", type: "number" },
    { key: "temperature_default", label: "Temperature", type: "number" },
  ];

  if (settings.isLoading) return <Loader />;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg">Configurações</h2>
      <div className="rounded-2xl bg-surface p-4 space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">{f.label}</label>
            <input
              type={f.type}
              className="mt-1 w-full rounded-xl bg-surface-elevated px-3 py-2.5 text-sm font-mono outline-none"
              value={String(settings.data?.[f.key] ?? "")}
              onChange={(e) => {
                const val = f.type === "number" ? Number(e.target.value) : e.target.value;
                updateMut.mutate({ key: f.key, value: val });
              }}
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-text-tertiary text-center">Alterações são salvas automaticamente.</p>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────── */

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface py-8 text-text-tertiary">
      {icon}
      <p className="text-xs">{text}</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
