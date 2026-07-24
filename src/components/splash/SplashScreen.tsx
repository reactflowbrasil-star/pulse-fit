import { motion, AnimatePresence, useReducedMotion as useFramerReducedMotion } from "framer-motion";
import { Sparkles, Volume2, VolumeX, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";


export type SplashScreenProps = {
  appName?: string;
  logo?: ReactNode;
  loading?: boolean;
  loadingComplete?: boolean;
  destination?: string;
  onAnimationComplete?: (destination?: string) => void;
  error?: Error | null;
  reducedMotion?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function SplashScreen({
  appName = "Pulse Fit",
  logo,
  loading = false,
  loadingComplete = true,
  destination,
  onAnimationComplete,
  error = null,
  reducedMotion,
}: SplashScreenProps) {
  const framerReduced = useFramerReducedMotion();
  const reduced = reducedMotion ?? framerReduced ?? false;

  const [exiting, setExiting] = useState(false);
  const [barDone, setBarDone] = useState(false);
  const firedRef = useRef(false);

  // Animation total duration
  const totalMs = reduced ? 900 : 2800;
  const barStartMs = reduced ? 100 : 1300;
  const barDurationMs = reduced ? 500 : 1000;

  // Kick off exit once bar animation is done AND loading is complete AND no error
  useEffect(() => {
    if (firedRef.current) return;
    if (!barDone) return;
    if (loading && !loadingComplete && !error) return;
    firedRef.current = true;
    setExiting(true);
    const t = window.setTimeout(() => {
      onAnimationComplete?.(destination);
    }, reduced ? 200 : 500);
    return () => window.clearTimeout(t);
  }, [barDone, loading, loadingComplete, error, destination, onAnimationComplete, reduced]);

  // Ensure bar completion tick even if animation events miss
  useEffect(() => {
    const t = window.setTimeout(() => setBarDone(true), barStartMs + barDurationMs + 50);
    return () => window.clearTimeout(t);
  }, [barStartMs, barDurationMs]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          role="status"
          aria-live="polite"
          aria-label={`${appName} — carregando`}
          initial={{ opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: reduced ? 0.2 : 0.5, ease: EASE }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[#090B0E]"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Radial ambient glow */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(183,255,82,0.18), rgba(183,255,82,0.06) 45%, transparent 70%)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: exiting ? 1.35 : 1 }}
            transition={{
              opacity: { duration: reduced ? 0.2 : 0.4 },
              scale: { duration: reduced ? 0.2 : 0.6, ease: EASE },
            }}
          />

          <div className="relative mx-auto flex h-full max-w-md flex-col items-center justify-between px-6 py-10 sm:py-16">
            <div className="h-4 shrink-0" />

            {/* Center block */}
            <div className="flex w-full flex-col items-center gap-6">
              <AnimatedLogo reduced={reduced}>{logo}</AnimatedLogo>

              <SplashAppName name={appName} reduced={reduced} />

              <SplashTagline reduced={reduced} />

              <SplashLoadingBar
                startDelayMs={barStartMs}
                durationMs={barDurationMs}
                reduced={reduced}
                onComplete={() => setBarDone(true)}
              />
            </div>

            {/* Bottom secondary text */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0.2 : 0.6,
                delay: reduced ? 0.15 : 1.6,
                ease: EASE,
              }}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#B7FF52]/70" strokeWidth={2.2} />
              <span>Treinos personalizados por inteligência artificial</span>
            </motion.div>
          </div>

          {/* Total duration failsafe */}
          <FailsafeExit ms={totalMs + 400} onFire={() => setBarDone(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FailsafeExit({ ms, onFire }: { ms: number; onFire: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onFire, ms);
    return () => window.clearTimeout(t);
  }, [ms, onFire]);
  return null;
}

function AnimatedLogo({ reduced, children }: { reduced: boolean; children?: ReactNode }) {
  return (
    <div className="relative grid place-items-center">
      {/* Pulse ring */}
      {!reduced && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 m-auto h-24 w-24 rounded-[30%] bg-[#B7FF52]"
          initial={{ opacity: 0.5, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.9 }}
          transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.75 }}
        animate={
          reduced
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 1, y: 0, scale: [0.75, 1.05, 1] }
        }
        transition={{
          duration: reduced ? 0.3 : 0.6,
          delay: reduced ? 0 : 0.3,
          ease: EASE,
          times: reduced ? undefined : [0, 0.7, 1],
        }}
        className="relative"
        style={{
          filter: "drop-shadow(0 0 24px rgba(183,255,82,0.45))",
        }}
      >
        {children ?? (
          <div className="grid h-24 w-24 place-items-center rounded-[30%] bg-[#B7FF52]">
            <Zap className="h-12 w-12 text-[#090B0E]" strokeWidth={2.8} fill="currentColor" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SplashAppName({ name, reduced }: { name: string; reduced: boolean }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0.25 : 0.6,
        delay: reduced ? 0.1 : 0.9,
        ease: EASE,
      }}
      className="font-display text-4xl uppercase tracking-[0.14em] text-white"
    >
      {name}
    </motion.h1>
  );
}

function SplashTagline({ reduced }: { reduced: boolean }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0.25 : 0.7,
        delay: reduced ? 0.15 : 1.2,
        ease: EASE,
      }}
      className="max-w-[280px] text-center text-[15px] font-medium leading-snug text-white"
    >
      Seu <span className="text-[#B7FF52]">próximo nível</span> começa agora.
    </motion.p>
  );
}

function SplashLoadingBar({
  startDelayMs,
  durationMs,
  reduced,
  onComplete,
}: {
  startDelayMs: number;
  durationMs: number;
  reduced: boolean;
  onComplete: () => void;
}) {
  const delaySec = useMemo(() => startDelayMs / 1000, [startDelayMs]);
  const durSec = useMemo(() => durationMs / 1000, [durationMs]);
  return (
    <div
      role="progressbar"
      aria-label="Carregando"
      className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-white/8"
    >
      <motion.div
        className="h-full rounded-full bg-[#B7FF52]"
        style={{ boxShadow: "0 0 12px rgba(183,255,82,0.6)" }}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{
          duration: durSec,
          delay: delaySec,
          ease: reduced ? "linear" : EASE,
        }}
        onAnimationComplete={onComplete}
      />
    </div>
  );
}
