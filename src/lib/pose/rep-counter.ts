/**
 * Contagem de repetições por ângulo articular (BlazePose 33 pontos).
 * Máquina de estados simples: "cima" -> "baixo" -> "cima" = 1 repetição.
 */
import type { Landmark } from "./pose-engine";

export type ExerciseKey =
  | "squat"
  | "pushup"
  | "lunge"
  | "glute_bridge"
  | "curl"
  | "lateral_raise"
  | "jumpingjack"
  | "plank";

type JointTriple = [number, number, number];

type ExerciseConfig = {
  label: string;
  /** Articulações medidas (lado esquerdo e direito). */
  joints: JointTriple[];
  /** Ângulo abaixo do qual considera-se fase "baixo". */
  downAngle: number;
  /** Ângulo acima do qual considera-se fase "cima". */
  upAngle: number;
  /** Exercícios isométricos contam tempo, não repetições. */
  isometric?: boolean;
  cue: { down: string; up: string };
};

export const EXERCISE_CONFIG: Record<ExerciseKey, ExerciseConfig> = {
  squat: {
    label: "Agachamento",
    joints: [
      [23, 25, 27],
      [24, 26, 28],
    ],
    downAngle: 100,
    upAngle: 160,
    cue: { down: "Desce controlado", up: "Sobe empurrando o chão" },
  },
  pushup: {
    label: "Flexão de braço",
    joints: [
      [11, 13, 15],
      [12, 14, 16],
    ],
    downAngle: 95,
    upAngle: 160,
    cue: { down: "Peito perto do chão", up: "Estende os braços" },
  },
  lunge: {
    label: "Afundo",
    joints: [
      [23, 25, 27],
      [24, 26, 28],
    ],
    downAngle: 105,
    upAngle: 165,
    cue: { down: "Joelho a 90 graus", up: "Volta à posição inicial" },
  },
  glute_bridge: {
    label: "Elevação de quadril",
    joints: [
      [11, 23, 25],
      [12, 24, 26],
    ],
    downAngle: 130,
    upAngle: 168,
    cue: { down: "Desce o quadril", up: "Contrai o glúteo no topo" },
  },
  curl: {
    label: "Rosca bíceps",
    joints: [
      [11, 13, 15],
      [12, 14, 16],
    ],
    downAngle: 55,
    upAngle: 155,
    cue: { down: "Sobe até contrair", up: "Desce devagar" },
  },
  lateral_raise: {
    label: "Elevação lateral",
    joints: [
      [23, 11, 13],
      [24, 12, 14],
    ],
    downAngle: 30,
    upAngle: 80,
    cue: { down: "Braços ao lado do corpo", up: "Até a linha do ombro" },
  },
  jumpingjack: {
    label: "Polichinelo",
    joints: [
      [23, 11, 13],
      [24, 12, 14],
    ],
    downAngle: 35,
    upAngle: 130,
    cue: { down: "Fecha", up: "Abre braços e pernas" },
  },
  plank: {
    label: "Prancha",
    joints: [
      [11, 23, 25],
      [12, 24, 26],
    ],
    downAngle: 150,
    upAngle: 172,
    isometric: true,
    cue: { down: "Quadril alinhado", up: "Segura a linha do corpo" },
  },
};

/** Ângulo em graus formado por três landmarks (b é o vértice). */
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magA = Math.hypot(abx, aby);
  const magC = Math.hypot(cbx, cby);
  if (magA === 0 || magC === 0) return 180;
  const cos = Math.min(1, Math.max(-1, dot / (magA * magC)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export type RepState = {
  reps: number;
  phase: "up" | "down";
  angle: number;
  holdSeconds: number;
  quality: number;
  cue: string;
};

export function createRepCounter(exercise: ExerciseKey) {
  const config = EXERCISE_CONFIG[exercise];
  let reps = 0;
  let phase: "up" | "down" = "up";
  let holdMs = 0;
  let lastTs: number | null = null;
  let smoothed: number | null = null;

  return {
    config,
    reset() {
      reps = 0;
      phase = "up";
      holdMs = 0;
      lastTs = null;
      smoothed = null;
    },
    update(landmarks: Landmark[], timestampMs: number): RepState {
      const angles = config.joints
        .map(([a, b, c]) => {
          const la = landmarks[a];
          const lb = landmarks[b];
          const lc = landmarks[c];
          if (!la || !lb || !lc) return null;
          const visible =
            (la.visibility ?? 1) > 0.4 && (lb.visibility ?? 1) > 0.4 && (lc.visibility ?? 1) > 0.4;
          return visible ? calculateAngle(la, lb, lc) : null;
        })
        .filter((v): v is number => v !== null);

      const raw = angles.length ? angles.reduce((s, v) => s + v, 0) / angles.length : (smoothed ?? 180);
      smoothed = smoothed === null ? raw : smoothed * 0.6 + raw * 0.4;
      const angle = smoothed;

      const delta = lastTs === null ? 0 : Math.max(0, timestampMs - lastTs);
      lastTs = timestampMs;

      let cue = "";
      if (config.isometric) {
        const holding = angle >= config.downAngle;
        holdMs = holding ? holdMs + delta : 0;
        cue = holding ? config.cue.up : config.cue.down;
        phase = holding ? "up" : "down";
      } else if (phase === "up" && angle < config.downAngle) {
        phase = "down";
        cue = config.cue.up;
      } else if (phase === "down" && angle > config.upAngle) {
        phase = "up";
        reps += 1;
        cue = config.cue.down;
      }

      const range = config.upAngle - config.downAngle;
      const quality = angles.length
        ? Math.round(
            Math.min(
              100,
              Math.max(
                40,
                100 - (Math.abs(angle - (phase === "up" ? config.upAngle : config.downAngle)) / Math.max(range, 1)) * 60,
              ),
            ),
          )
        : 0;

      return { reps, phase, angle: Math.round(angle), holdSeconds: Math.floor(holdMs / 1000), quality, cue };
    },
  };
}