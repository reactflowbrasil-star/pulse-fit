import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Histórico — Pulse Fit" },
      { name: "description", content: "Todos os seus treinos concluídos, dia a dia." },
      { property: "og:title", content: "Histórico — Pulse Fit" },
      { property: "og:description", content: "Todos os seus treinos concluídos, dia a dia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Histórico" backTo="/" />
      <main className="flex-1 px-5 py-4">
        <p className="rounded-2xl bg-surface p-5 text-sm text-text-tertiary">
          Seu histórico completo de treinos aparecerá aqui assim que você concluir sua primeira sessão com o Coach IA.
        </p>
      </main>
      <BottomNav />
    </MobileFrame>
  );
}
