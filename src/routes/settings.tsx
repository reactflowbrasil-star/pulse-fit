import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { MessageCircle, Bell, Shield, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Pulse Fit" },
      { name: "description", content: "Notificações, integrações e preferências do app." },
      { property: "og:title", content: "Configurações — Pulse Fit" },
      { property: "og:description", content: "Notificações, integrações e preferências do app." },
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
  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Configurações" onBack={() => window.history.back()} />
      <main className="flex-1 space-y-2 px-5 py-4">
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
