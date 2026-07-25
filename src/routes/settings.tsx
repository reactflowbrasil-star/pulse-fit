import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Bell, Shield, HelpCircle, User2, Check, Palette } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

const GLB_KEY = "pulsefit.trainer.glb-url";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Pulse Fit" },
      { name: "description", content: "Notificações, integrações e avatar 3D do app." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme } = useTheme();
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
    setTimeout(() => setSaved(false), 2000);
  }

  const menuItems = [
    { icon: <MessageCircle className="h-5 w-5" />, label: "WhatsApp Bot", to: "/whatsapp" },
    { icon: <Bell className="h-5 w-5" />, label: "Notificações", to: "/settings" },
    { icon: <Shield className="h-5 w-5" />, label: "Privacidade", to: "/settings" },
    { icon: <HelpCircle className="h-5 w-5" />, label: "Ajuda e suporte", to: "/settings" },
  ];

  return (
    <MobileFrame>
      <ScreenHeader title="Configurações" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 space-y-5 px-5 py-4 overflow-y-auto">
          {/* Theme */}
          <Card variant="default" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Tema</p>
                  <p className="text-[11px] text-text-tertiary">{theme === "dark" ? "Escuro" : "Claro"}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </Card>

          {/* Avatar 3D */}
          <Card variant="default" className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated text-text-tertiary">
                <User2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Avatar 3D</p>
                <p className="text-[11px] text-text-tertiary">URL do modelo fotorreal (GLB)</p>
              </div>
            </div>
            <Input
              placeholder="https://exemplo.com/avatar.glb"
              value={glbUrl}
              onChange={(e) => setGlbUrl(e.target.value)}
            />
            <Button variant="secondary" size="sm" onClick={save} loading={false} className="w-full">
              {saved ? <><Check className="h-3.5 w-3.5" /> Salvo!</> : "Salvar"}
            </Button>
          </Card>

          {/* Menu Items */}
          <StaggerContainer className="space-y-2">
            {menuItems.map((item) => (
              <StaggerItem key={item.label}>
                <a href={item.to} className="flex items-center gap-3 rounded-2xl bg-surface-card border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated text-text-tertiary">{item.icon}</div>
                  <span className="flex-1 text-sm font-semibold">{item.label}</span>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
