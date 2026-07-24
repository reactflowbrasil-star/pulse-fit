import { useEffect, useState, type ReactNode } from "react";
import { SplashScreen } from "@/components/splash/SplashScreen";

const KEY = "pulsefit_splash_shown";

export function SplashGate({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      if (!sessionStorage.getItem(KEY)) setShowSplash(true);
    } catch {
      /* ignore */
    }
  }, []);

  const handleComplete = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShowSplash(false);
  };

  return (
    <>
      {children}
      {hydrated && showSplash && (
        <SplashScreen appName="Pulse Fit" onAnimationComplete={handleComplete} />
      )}
    </>
  );
}
