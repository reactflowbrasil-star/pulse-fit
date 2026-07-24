import { createFileRoute, notFound } from "@tanstack/react-router";
import { MessageCircle, ChevronRight, Instagram, Globe } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { trainers } from "@/data/mock";

export const Route = createFileRoute("/trainer/$id")({
  loader: ({ params }) => {
    const trainer = trainers.find((t) => t.id === params.id);
    if (!trainer) throw notFound();
    return { trainer };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Treinador não encontrado — Pulse Fit" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { trainer } = loaderData;
    return {
      meta: [
        { title: `${trainer.name} — ${trainer.role}` },
        {
          name: "description",
          content: `${trainer.name} · ${trainer.role}. ${trainer.experience}, avaliação ${trainer.rating.toString().replace(".", ",")}/5.`,
        },
        { property: "og:title", content: `${trainer.name} — Pulse Fit` },
        { property: "og:description", content: trainer.role },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <MobileFrame>
      <StatusBar />
      <div className="flex flex-1 items-center justify-center p-8 text-text-tertiary">
        Algo deu errado.
      </div>
    </MobileFrame>
  ),
  notFoundComponent: () => (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader />
      <div className="flex flex-1 items-center justify-center p-8 text-text-tertiary">
        Treinador não encontrado.
      </div>
    </MobileFrame>
  ),
  component: TrainerProfile,
});

function TrainerProfile() {
  const { trainer } = Route.useLoaderData();
  const stats = trainer.stats ?? { experience: "—", completed: "—", clients: "—" };

  return (
    <MobileFrame>
      <div className="relative">
        <img
          src={trainer.image}
          alt=""
          width={900}
          height={1100}
          className="h-[340px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-background" />
        <div className="absolute inset-x-0 top-0">
          <StatusBar />
          <ScreenHeader />
        </div>
        <button
          aria-label="Enviar mensagem"
          className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
        <div className="absolute inset-x-0 bottom-5 px-5">
          <h1 className="text-2xl font-black">{trainer.name}</h1>
          <p className="text-sm font-semibold text-primary">{trainer.role}</p>
        </div>
      </div>

      <main className="scrollbar-none flex-1 space-y-4 overflow-y-auto px-5 pb-10 pt-4">
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="text-base font-bold">Sobre</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {trainer.bio ??
              `${trainer.name} acompanha atletas de todos os níveis com foco em ${trainer.role.toLowerCase()}.`}
          </p>
        </section>

        <section className="grid grid-cols-3 rounded-3xl bg-surface p-5 text-center divide-x divide-white/10">
          <Stat label="Experiência" value={stats.experience} />
          <Stat label="Concluídos" value={stats.completed} />
          <Stat label="Alunos ativos" value={stats.clients} />
        </section>

        <section className="overflow-hidden rounded-3xl bg-surface">
          <Row icon={<Globe className="h-5 w-5" />} label="Programas online" />
          <div className="mx-5 h-px bg-white/8" />
          <Row icon={<Instagram className="h-5 w-5" />} label="Redes sociais" />
        </section>
      </main>
    </MobileFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2">
      <p className="text-lg font-black">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
    </div>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <ChevronRight className="h-5 w-5 text-text-tertiary" />
    </button>
  );
}
