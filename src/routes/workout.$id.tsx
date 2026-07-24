import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Flame, ChevronRight, Music, BookOpen, Star } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { StatusBar } from "@/components/StatusBar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { workouts, trainers, exercises } from "@/data/mock";

export const Route = createFileRoute("/workout/$id")({
  loader: ({ params }) => {
    const workout = workouts.find((w) => w.id === params.id);
    if (!workout) throw notFound();
    return { workout };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Treino não encontrado — Pulse Fit" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { workout } = loaderData;
    return {
      meta: [
        { title: `${workout.title} — Pulse Fit` },
        {
          name: "description",
          content: `${workout.duration} · ${workout.level}. Um treino de ${workout.focus} guiado por Chris Heria.`,
        },
        { property: "og:title", content: workout.title },
        {
          property: "og:description",
          content: `${workout.duration} · ${workout.level} · ${workout.focus}`,
        },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <MobileFrame>
      <StatusBar />
      <div className="flex flex-1 items-center justify-center p-8 text-center text-text-tertiary">
        Erro ao carregar este treino.
      </div>
    </MobileFrame>
  ),
  notFoundComponent: () => (
    <MobileFrame>
      <StatusBar />
      <ScreenHeader />
      <div className="flex flex-1 items-center justify-center p-8 text-center text-text-tertiary">
        Treino não encontrado.
      </div>
    </MobileFrame>
  ),
  component: WorkoutDetails,
});

function WorkoutDetails() {
  const { workout } = Route.useLoaderData();
  const trainer = trainers[0];

  return (
    <MobileFrame>
      <div className="relative">
        <img
          src={workout.image}
          alt=""
          width={800}
          height={1000}
          className="h-[280px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-background" />
        <div className="absolute inset-x-0 top-0">
          <StatusBar />
          <ScreenHeader />
        </div>
        <div className="absolute inset-x-0 bottom-4 px-5">
          <h1 className="text-2xl font-black leading-tight text-balance">
            {workout.title}
          </h1>
          <div className="mt-3 flex gap-2">
            <Chip icon={<Clock className="h-3.5 w-3.5" />} label={workout.duration} />
            <Chip icon={<Flame className="h-3.5 w-3.5" />} label={workout.calories ?? ""} />
          </div>
        </div>
      </div>

      <main className="scrollbar-none flex-1 space-y-4 overflow-y-auto px-5 pb-24 pt-4">
        <section className="rounded-3xl bg-surface p-5">
          <h2 className="text-base font-bold">Sobre</h2>
          <div className="mt-3 grid grid-cols-3 divide-x divide-white/10 text-center">
            <Info label="Nível" value={workout.level} />
            <Info label="Progresso" value="0%" />
            <Info label="Foco" value={workout.focus ?? "—"} />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl bg-surface">
          <Row icon={<Music className="h-5 w-5" />} label="Som e música" />
          <div className="h-px bg-white/8 mx-5" />
          <Row icon={<BookOpen className="h-5 w-5" />} label="Guia" />
        </section>

        <Link
          to="/trainer/$id"
          params={{ id: trainer.id }}
          className="flex items-center gap-3 rounded-3xl bg-surface p-4"
        >
          <img
            src={trainer.image}
            alt=""
            width={512}
            height={512}
            className="h-14 w-14 rounded-2xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{trainer.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                <Star className="h-2.5 w-2.5 fill-primary" /> {trainer.rating.toString().replace(".", ",")}
              </span>
            </div>
            <p className="truncate text-xs text-text-tertiary">{trainer.role}</p>
            <p className="text-xs text-primary">{trainer.experience}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-text-tertiary" />
        </Link>

        <section className="rounded-3xl bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black">4,6</div>
              <div className="text-xs text-text-tertiary">174 avaliações</div>
            </div>
            <div className="flex-1 space-y-1.5 pl-6">
              {[92, 62, 14, 4, 2].map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 text-[10px] text-text-tertiary">{5 - i}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full bg-primary" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold">Exercícios</h2>
            <span className="text-xs text-text-tertiary">{exercises.length} movimentos</span>
          </div>
          <ul className="mt-3 space-y-2">
            {exercises.map((ex) => (
              <li
                key={ex.id}
                className="flex items-center gap-3 rounded-2xl bg-surface p-3"
              >
                <img
                  src={ex.image}
                  alt=""
                  width={800}
                  height={800}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">{ex.name}</p>
                  <p className="text-xs text-text-tertiary">{ex.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <Link
          to="/ready"
          search={{ workout: workout.id }}
          className="mt-2 block w-full rounded-full bg-primary py-4 text-center text-sm font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98]"
        >
          Iniciar treino
        </Link>
      </main>
    </MobileFrame>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold backdrop-blur">
      {icon}
      {label}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
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
