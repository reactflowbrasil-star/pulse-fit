import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { MessageCircle, Bell, Shield, HelpCircle, User2, Check } from "lucide-react";

const GLB_KEY = "pulsefit.trainer.glb-url";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Pulse Fit" },
      { name: "description", content: "Notificações, integrações e avatar 3D do app." },
      { property: "og:title", content: "Configurações — Pulse Fit" },
      { property: "og:description", content: "Notificações, integrações e avatar 3D do app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const items = [
    { to: "/whatsapp", icon: <MessageCircle className="h-5 w-5" />, label: "WhatsApp Bot" },
    { to: "/settings", icon: <Bell className="h-5 w-5" />, label: "Notificações" },
    { to: "/settings", icon: <Shield className="h-5 w-5" />, label: "Privacidade" },
    { to: "/settings", icon: <HelpCircle className="h-5 w-5" />, label: "Ajuda e suporte" },
  ];

  const [glbUrl, setGlbUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setGlbUrl(window.localStorage.getItem(GLB_KEY) ?? "");
  }, []);

  function save() {
    const trimmed = glbUrl.trim();
    if (trimmed) window.localStorage.setItem(GLB_KEY, trimmed);
    else window.localStorage.removeItem(GLB_KEY);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Configurações" onBack={() => window.history.back()} />
      <main className="flex-1 space-y-4 px-5 py-4">
        {/* Photoreal avatar (GLB URL) */}
        <section className="rounded-2xl bg-surface p-4 ring-1 ring-white/5">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-elevated text-primary">
              <User2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg uppercase tracking-wide">Avatar 3D fotorreal</div>
              <div className="text-xs text-text-tertiary">
                Cole uma URL de modelo GLB (Ready Player Me / Mixamo).
              </div>
            </div>
          </div>
          <input
            type="url"
            inputMode="url"
            placeholder="https://models.readyplayer.me/…​.glb"
            value={glbUrl}
            onChange={(e) => setGlbUrl(e.target.value)}
            className="mb-2 w-full rounded-xl bg-surface-elevated px-3 py-2 text-sm outline-none ring-1 ring-white/5 focus:ring-primary/60"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-text-tertiary">
              Deixe em branco para usar o vídeo real ou o modelo 3D padrão.
            </p>
            <button
              onClick={save}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-widest text-primary-foreground transition-transform active:scale-95"
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : null}
              {saved ? "Salvo" : "Salvar"}
            </button>
          </div>
        </section>

        {items.map((it, i) => (
          <Link
            key={i}
            to={it.to}
            className="flex items-center justify-between rounded-2xl bg-surface p-4 transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-elevated text-primary">
                {it.icon}
              </div>
              <span className="font-semibold">{it.label}</span>
            </div>
            <span className="text-text-tertiary">›</span>
          </Link>
        ))}
      </main>
      <BottomNav />
    </MobileFrame>
  );
}
