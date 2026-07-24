import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Progresso — Pulse Fit" },
      { name: "description", content: "Veja volume de treino, sequências e evolução." },
      { property: "og:title", content: "Progresso — Pulse Fit" },
      { property: "og:description", content: "Volume de treino, sequências e evolução." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Progresso" />
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-primary">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black">Sua evolução</h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Gráficos e sequências estão a caminho.
          </p>
        </div>
      </main>
      <BottomNav />
    </MobileFrame>
  ),
});
