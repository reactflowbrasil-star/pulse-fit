import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/done")({
  head: () => ({
    meta: [
      { title: "Treino Concluído — Pulse Fit" },
      { name: "description", content: "Você mandou muito bem. Sessão concluída." },
      { property: "og:title", content: "Treino Concluído — Pulse Fit" },
      { property: "og:description", content: "Você mandou muito bem. Sessão concluída." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CongratulationPage,
});

function CongratulationPage() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen w-full bg-background-deep">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:overflow-hidden sm:rounded-[2.5rem]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,oklch(0.94_0.19_128_/_0.18),transparent_60%)]" />
        <div className="flex flex-1 items-center justify-center px-5">
          <div
            className="w-full max-w-sm rounded-[34px] bg-primary p-7 text-primary-foreground shadow-glow"
            style={{ animation: "modal-in 320ms cubic-bezier(0.2,0.8,0.2,1)" }}
          >
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-foreground/12">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground"
                  style={{ animation: "check-pop 500ms cubic-bezier(0.2,0.8,0.2,1) 120ms both" }}
                >
                  <Check className="h-8 w-8 text-primary" strokeWidth={3} />
                </div>
              </div>
            </div>
            <h1 className="mt-6 text-center text-3xl font-black">Parabéns!</h1>
            <p className="mt-3 text-center text-sm font-semibold opacity-70">
              Sua sessão foi registrada.<br />
              Um resumo foi enviado para<br />
              les***@gmail.com
            </p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="mt-7 w-full rounded-full bg-surface-elevated py-4 text-sm font-bold text-primary transition-transform active:scale-[0.98]"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
