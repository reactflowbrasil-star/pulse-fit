import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Boas-vindas — Pulse Fit" },
      { name: "description", content: "Configure seu perfil para receber treinos personalizados." },
      { property: "og:title", content: "Boas-vindas — Pulse Fit" },
      { property: "og:description", content: "Configure seu perfil para receber treinos personalizados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <MobileFrame>
      <StatusBar />
      <main className="flex flex-1 flex-col justify-between px-6 py-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Bem-vindo ao Pulse Fit
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight">
            Vamos personalizar sua jornada
          </h1>
          <p className="mt-3 text-sm text-text-tertiary">
            Em poucos passos configuramos seus objetivos, nível e frequência para gerar treinos com IA sob medida para você.
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-glow"
        >
          Começar <ArrowRight className="h-5 w-5" />
        </Link>
      </main>
    </MobileFrame>
  );
}
