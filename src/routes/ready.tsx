import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/ready")({
  validateSearch: (search: Record<string, unknown>) => ({
    workout: (search.workout as string) ?? "home-chest",
  }),
  head: () => ({
    meta: [
      { title: "Get Ready — Pulse Fit" },
      { name: "description", content: "Take a breath. Your workout is about to start." },
      { property: "og:title", content: "Get Ready — Pulse Fit" },
      { property: "og:description", content: "Your workout is about to start." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GetReadyPage,
});

function GetReadyPage() {
  const navigate = useNavigate();
  const { workout } = Route.useSearch();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: "/player", search: { workout, i: 0 } });
    }, 1800);
    return () => clearTimeout(t);
  }, [navigate, workout]);

  return (
    <div className="min-h-screen w-full bg-background-deep">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-primary text-primary-foreground sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:overflow-hidden sm:rounded-[2.5rem] sm:shadow-elevated">
        <div className="flex flex-1 items-center justify-center px-6">
          <div
            className="text-center"
            style={{ animation: "ready-fade 500ms cubic-bezier(0.2,0.8,0.2,1) both" }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-60">
              Focus
            </p>
            <h1 className="mt-4 text-[80px] font-black leading-none tracking-tight">
              Get<br />ready
            </h1>
            <p className="mt-6 text-sm font-semibold opacity-70">
              Starting in a moment…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
