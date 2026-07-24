import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { exerciseVideos } from "@/lib/exercise-videos";
import type { AnimationId, CameraAngle } from "@/lib/exercise-catalog";

const Trainer3DViewer = lazy(() =>
  import("@/components/Trainer3DViewer").then((m) => ({ default: m.Trainer3DViewer })),
);

const GLBTrainerViewer = lazy(() =>
  import("@/components/GLBTrainerViewer").then((m) => ({ default: m.GLBTrainerViewer })),
);

type Props = {
  animationId: AnimationId;
  cameraAngle: CameraAngle;
  paused?: boolean;
};

const GLB_STORAGE_KEY = "pulsefit.trainer.glb-url";

function useGlbUrl() {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(GLB_STORAGE_KEY);
    if (stored) setUrl(stored);
    const onStorage = (e: StorageEvent) => {
      if (e.key === GLB_STORAGE_KEY) setUrl(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return url;
}

/**
 * Chooses the highest-fidelity trainer surface available, in priority order:
 * 1. Real photorealistic exercise video (mapped in exercise-videos.ts)
 * 2. Custom photorealistic GLB avatar (user-provided URL, e.g. Ready Player Me)
 * 3. Procedural three.js humanoid fallback (always works, always animated)
 */
export function TrainerCoach({ animationId, cameraAngle, paused }: Props) {
  const glbUrl = useGlbUrl();
  const videoUrl = useMemo(() => exerciseVideos[animationId] ?? null, [animationId]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else void v.play().catch(() => {});
  }, [paused, videoUrl]);

  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="wait">
        {videoUrl ? (
          <motion.div
            key={`video-${videoUrl}`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <video
              key={videoUrl}
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
            />
            {/* Cinematic vignette + tint to blend with app palette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background-deep/60 via-transparent to-background-deep/25" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.55)]" />
            <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-[10px] uppercase tracking-widest text-primary backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Live capture · 4K
            </div>
          </motion.div>
        ) : glbUrl ? (
          <motion.div
            key={`glb-${glbUrl}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Suspense fallback={<StageLoader label="Carregando avatar fotorreal…" />}>
              <GLBTrainerViewer url={glbUrl} cameraAngle={cameraAngle} paused={paused} />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="proc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Suspense fallback={<StageLoader label="Carregando treinador…" />}>
              <Trainer3DViewer
                animationId={animationId}
                cameraAngle={cameraAngle}
                paused={paused}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageLoader({ label }: { label: string }) {
  return (
    <div className="grid h-full w-full place-items-center text-text-tertiary">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <span className="text-xs uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}
