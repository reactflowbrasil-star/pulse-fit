import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/coach/session/$sessionId")({
  head: () => ({ meta: [{ title: "Coach IA — Pulse Fit" }] }),
  component: () => {
    const navigate = useNavigate();
    return (
      <MobileFrame>
        <ScreenHeader title="Coach IA" onBack={() => navigate({ to: "/coach" })} />
        <PageTransition>
          <main className="flex-1 px-5 py-4">
            <Card variant="gradient" className="p-6 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h2 className="font-display text-xl font-bold">Sessão do Coach</h2>
              <p className="mt-2 text-sm text-text-tertiary">Detalhes da sessão em breve.</p>
            </Card>
          </main>
        </PageTransition>
      </MobileFrame>
    );
  },
});
