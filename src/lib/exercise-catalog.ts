// Client-safe types for the exercise catalog.
export type CameraAngle = "frontal" | "lateral" | "angulo_45";

export type AnimationId =
  | "squat"
  | "pushup"
  | "plank"
  | "lunge"
  | "jumpingjack"
  | "mountain_climber"
  | "glute_bridge"
  | "curl"
  | "lateral_raise"
  | "burpee";

export type ExerciseCatalogItem = {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  level: "iniciante" | "intermediario" | "avancado";
  equipment: string[];
  animation_id: AnimationId;
  allowed_camera_angles: CameraAngle[];
  default_sets: number;
  default_reps: string;
  default_duration_s: number | null;
  default_rest_s: number;
  initial_position: string[];
  execution_steps: string[];
  breathing: string | null;
  common_mistakes: string[];
  safety_warnings: string[];
  easier_variation: string | null;
  harder_variation: string | null;
  substitute_exercise_ids: string[];
  default_voice_instruction: string | null;
};

export type PlanExercise = {
  exerciseId: string;
  sets: number;
  reps: string;
  durationSeconds: number | null;
  restSeconds: number;
  voiceInstruction: string;
  personalNote: string;
};

export type WorkoutPlan = {
  title: string;
  objective: string;
  difficulty: "iniciante" | "intermediario" | "avancado";
  estimatedMinutes: number;
  intro: string;
  exercises: PlanExercise[];
};

export type WorkoutContext = {
  objective: "emagrecer" | "ganhar_massa" | "condicionamento" | "manter";
  level: "iniciante" | "intermediario" | "avancado";
  minutes: number;
  location: "casa" | "academia" | "ar_livre";
  equipment: string[];
};
