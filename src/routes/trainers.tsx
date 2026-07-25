import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, ChevronRight } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { EmptyState } from "@/components/ui/empty-state";

export const Route = createFileRoute("/trainers")({
  head: () => ({ meta: [{ title: "Personal — Pulse Fit" }] }),
  component: TrainersPage,
});

function TrainersPage() {
  return (
    <MobileFrame>
      <ScreenHeader title="Personal" onBack={() => window.history.back()} />
      <PageTransition>
        <main className="flex-1 px-5 py-4">
          <EmptyState
            icon={<User className="h-6 w-6" />}
            title="Personal trainers"
            description="Escolha um treinador personalizado para te guiar nos treinos."
          />
        </main>
      </PageTransition>
      <BottomNav />
    </MobileFrame>
  );
}
