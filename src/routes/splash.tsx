import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { SplashScreen } from "@/components/splash/SplashScreen";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "Pulse Fit — Seu próximo nível começa agora" },
      {
        name: "description",
        content: "Treinos personalizados por inteligência artificial.",
      },
      { property: "og:title", content: "Pulse Fit" },
      {
        property: "og:description",
        content: "Treinos personalizados por inteligência artificial.",
      },
    ],
  }),
  component: SplashRoute,
});

async function bootstrap(): Promise<string> {
  // Placeholder for parallel session/profile/metrics loading.
  // Currently the app has no auth surface; always route to dashboard.
  try {
    await new Promise((r) => setTimeout(r, 0));
    return "/";
  } catch (err) {
    if (import.meta.env.DEV) console.error("[splash] bootstrap error", err);
    return "/";
  }
}

function SplashRoute() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    bootstrap().then((dest) => {
      if (cancelled) return;
      setDestination(dest);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleComplete = useCallback(
    (dest?: string) => {
      navigate({ to: (dest ?? "/") as "/", replace: true });
    },
    [navigate],
  );

  return (
    <SplashScreen
      appName="Pulse Fit"
      loading
      loadingComplete={ready}
      destination={destination}
      onAnimationComplete={handleComplete}
    />
  );
}
