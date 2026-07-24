import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Recompensas — Pulse Fit" },
      { name: "description", content: "Conquiste sequências e medalhas conforme treina." },
      { property: "og:title", content: "Recompensas — Pulse Fit" },
      { property: "og:description", content: "Conquiste sequências e medalhas." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Recompensas" />
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-primary">
            <Trophy className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black">Ganhe recompensas</h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Complete sessões para desbloquear medalhas em breve.
          </p>
        </div>
      </main>
      <BottomNav />
    </MobileFrame>
  ),
});
