import { createFileRoute } from "@tanstack/react-router";
import { UtensilsCrossed, Apple, Droplets, Flame } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { EmptyState } from "@/components/ui/empty-state";

export const Route = createFileRoute("/meal")({
  head: () => ({
    meta: [
      { title: "Dieta — Pulse Fit" },
      { name: "description", content: "Registre refeições e mantenha suas metas de nutrição." },
    ],
  }),
  component: () => (
    <MobileFrame>
      <ScreenHeader title="Dieta" />
      <PageTransition>
        <EmptyState
          icon={<UtensilsCrossed className="h-8 w-8" />}
          title="Controle de refeições"
          description="Acompanhe calorias, macros e hidratação numa só tela. Em breve disponível!"
        />
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  ),
});
