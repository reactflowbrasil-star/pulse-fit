/**
 * Loop de câmera + detecção de pose no navegador.
 * Desenha o esqueleto num canvas e conta repetições em tempo real.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { POSE_CONNECTIONS, loadPoseLandmarker, type Landmark } from "@/lib/pose/pose-engine";
import { createRepCounter, type ExerciseKey, type RepState } from "@/lib/pose/rep-counter";

type Options = {
  exercise: ExerciseKey;
  active: boolean;
};

export type PoseStatus = "idle" | "loading" | "running" | "error";

const EMPTY_STATE: RepState = {
  reps: 0,
  phase: "up",
  angle: 180,
  holdSeconds: 0,
  quality: 0,
  cue: "",
};

export function usePoseDetection({ exercise, active }: Options) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const counterRef = useRef(createRepCounter(exercise));
  const activeRef = useRef(active);

  const [status, setStatus] = useState<PoseStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<RepState>(EMPTY_STATE);
  const [personDetected, setPersonDetected] = useState(false);

  activeRef.current = active;

  useEffect(() => {
    counterRef.current = createRepCounter(exercise);
    setState(EMPTY_STATE);
  }, [exercise]);

  const draw = useCallback((landmarks: Landmark[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const w = video.videoWidth || canvas.width;
    const h = video.videoHeight || canvas.height;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    if (!landmarks.length) return;

    ctx.lineWidth = Math.max(2, w / 250);
    ctx.strokeStyle = "rgba(255,122,26,0.9)";
    for (const [a, b] of POSE_CONNECTIONS) {
      const la = landmarks[a];
      const lb = landmarks[b];
      if (!la || !lb) continue;
      ctx.beginPath();
      ctx.moveTo(la.x * w, la.y * h);
      ctx.lineTo(lb.x * w, lb.y * h);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    for (const l of landmarks) {
      if ((l.visibility ?? 1) < 0.4) continue;
      ctx.beginPath();
      ctx.arc(l.x * w, l.y * h, Math.max(2.5, w / 320), 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    setStatus("loading");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Vídeo indisponível");
      video.srcObject = stream;
      await video.play().catch(() => {});

      const landmarker = await loadPoseLandmarker();
      setStatus("running");

      let lastVideoTime = -1;
      const loop = () => {
        rafRef.current = requestAnimationFrame(loop);
        const v = videoRef.current;
        if (!v || v.readyState < 2) return;
        if (v.currentTime === lastVideoTime) return;
        lastVideoTime = v.currentTime;

        const result = landmarker.detectForVideo(v, performance.now());
        const landmarks = (result.landmarks?.[0] ?? []) as Landmark[];
        setPersonDetected(landmarks.length > 0);
        draw(landmarks);
        if (landmarks.length && activeRef.current) {
          setState(counterRef.current.update(landmarks, performance.now()));
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Não foi possível acessar a câmera");
    }
  }, [draw]);

  useEffect(() => stop, [stop]);

  /** Captura o frame atual em JPEG base64 para análise de IA. */
  const captureFrame = useCallback((maxWidth = 640): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    const c = document.createElement("canvas");
    c.width = Math.round(video.videoWidth * scale);
    c.height = Math.round(video.videoHeight * scale);
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.7);
  }, []);

  const resetReps = useCallback(() => {
    counterRef.current.reset();
    setState(EMPTY_STATE);
  }, []);

  return {
    videoRef,
    canvasRef,
    status,
    error,
    state,
    personDetected,
    start,
    stop,
    captureFrame,
    resetReps,
  };
}