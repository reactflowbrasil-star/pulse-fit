import { createFileRoute } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/meal")({
  head: () => ({
    meta: [
      { title: "Dieta — Pulse Fit" },
      { name: "description", content: "Registre refeições e mantenha suas metas de nutrição." },
      { property: "og:title", content: "Dieta — Pulse Fit" },
      { property: "og:description", content: "Registre refeições e bata suas metas de nutrição." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Dieta" />
      <Placeholder icon={<UtensilsCrossed className="h-8 w-8" />} title="Controle de refeições" />
      <BottomNav />
    </MobileFrame>
  ),
});

function Placeholder({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-primary">
          {icon}
        </div>
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-2 text-sm text-text-tertiary">
          Em breve. Acompanhe calorias, macros e hidratação numa só tela.
        </p>
      </div>
    </main>
  );
}
