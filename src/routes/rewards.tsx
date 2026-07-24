import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — Pulse Fit" },
      { name: "description", content: "Redeem streaks and badges as you train." },
      { property: "og:title", content: "Rewards — Pulse Fit" },
      { property: "og:description", content: "Redeem streaks and badges." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader title="Rewards" />
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-primary">
            <Trophy className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black">Earn rewards</h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Complete sessions to unlock badges soon.
          </p>
        </div>
      </main>
      <BottomNav />
    </MobileFrame>
  ),
});
