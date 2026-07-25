import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Star, Clock, Flame } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/trainer/$id")({
  head: () => ({ meta: [{ title: "Personal — Pulse Fit" }] }),
  component: TrainerDetailPage,
});

function TrainerDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <ScreenHeader title="Personal" onBack={() => navigate({ to: "/trainers" })} />
      <PageTransition>
        <main className="flex-1 px-5 py-4 space-y-4">
          <Card variant="gradient" className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15">
              <Star className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold">Personal Trainer</h2>
            <p className="mt-2 text-sm text-text-tertiary">Seu treinador pessoal com IA avançada.</p>
          </Card>
          <Button className="w-full" onClick={() => navigate({ to: "/coach" })}>
            <Play className="h-4 w-4" /> Iniciar sessão
          </Button>
        </main>
      </PageTransition>
    </MobileFrame>
  );
}
