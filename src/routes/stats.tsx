import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Statistics — Pulse Fit" },
      { name: "description", content: "See training volume, streaks and progress trends." },
      { property: "og:title", content: "Statistics — Pulse Fit" },
      { property: "og:description", content: "Training volume, streaks and progress." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Statistics" />
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-primary">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black">Your progress</h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Charts and streaks are on the way.
          </p>
        </div>
      </main>
      <BottomNav />
    </MobileFrame>
  ),
});
