import workoutChest from "@/assets/workout-chest.jpg";
import workoutLeg from "@/assets/workout-leg.jpg";
import workoutShoulder from "@/assets/workout-shoulder.jpg";
import workoutTotal from "@/assets/workout-total.jpg";
import trainerChris from "@/assets/trainer-chris.jpg";
import exercisePushup from "@/assets/exercise-pushup.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatarUser from "@/assets/avatar-user.jpg";

export const user = {
  name: "Lester",
  avatar: avatarUser,
};

export type Workout = {
  id: string;
  title: string;
  duration: string;
  level: string;
  calories?: string;
  focus?: string;
  image: string;
};

export const workouts: Workout[] = [
  {
    id: "home-chest",
    title: "Treino de Peito em Casa (Sem Equipamentos)",
    duration: "45 min",
    level: "AAA Difícil",
    calories: "381 kcal",
    focus: "Peito",
    image: workoutChest,
  },
  {
    id: "home-leg",
    title: "Treino Completo de Pernas em Casa",
    duration: "45 min",
    level: "AA Médio",
    calories: "412 kcal",
    focus: "Pernas",
    image: workoutLeg,
  },
  {
    id: "total-body",
    title: "Força Total — Corpo Inteiro",
    duration: "38 min",
    level: "AAA Difícil",
    calories: "455 kcal",
    focus: "Corpo todo",
    image: workoutTotal,
  },
  {
    id: "shoulder",
    title: "Treino Perfeito de Ombros em Casa",
    duration: "32 min",
    level: "AA Médio",
    calories: "298 kcal",
    focus: "Ombros",
    image: workoutShoulder,
  },
];

export type Exercise = {
  id: string;
  name: string;
  detail: string;
  image: string;
  seconds: number;
};

export const exercises: Exercise[] = [
  { id: "push-ups", name: "Flexões", detail: "20 repetições", image: exercisePushup, seconds: 30 },
  { id: "hold-90", name: "Isometria 90°", detail: "20 seg", image: workoutChest, seconds: 20 },
  { id: "circle-push", name: "Flexões em Círculo", detail: "12 repetições", image: workoutTotal, seconds: 40 },
  { id: "diamond", name: "Flexão Diamante", detail: "15 repetições", image: workoutShoulder, seconds: 25 },
];

export type Trainer = {
  id: string;
  name: string;
  role: string;
  rating: number;
  experience: string;
  image: string;
  bio?: string;
  stats?: { experience: string; completed: string; clients: string };
};

export const trainers: Trainer[] = [
  {
    id: "chris-heria",
    name: "Chris Heria",
    role: "Treinador de Alta Intensidade",
    rating: 4.6,
    experience: "7 anos de experiência",
    image: trainerChris,
    bio: "Fundador de uma comunidade global de calistenia. Foco em treinos de alta intensidade com peso corporal e progressão de força.",
    stats: { experience: "7 anos", completed: "88", clients: "32" },
  },
  {
    id: "richard-smith",
    name: "Richard Smith",
    role: "Preparador de Força e Condicionamento",
    rating: 4.8,
    experience: "5 anos de experiência",
    image: avatar1,
    stats: { experience: "5 anos", completed: "64", clients: "24" },
  },
  {
    id: "kasandra-lilo",
    name: "Kasandra Lilo",
    role: "Especialista em Yoga e Mobilidade",
    rating: 4.9,
    experience: "8 anos de experiência",
    image: avatar2,
    stats: { experience: "8 anos", completed: "112", clients: "41" },
  },
  {
    id: "ronald-chief",
    name: "Ronald Chief",
    role: "Treinador de Powerlifting",
    rating: 4.5,
    experience: "10 anos de experiência",
    image: avatar3,
    stats: { experience: "10 anos", completed: "156", clients: "52" },
  },
];

export const dashboard = {
  steps: { current: 11000, goal: 16000 },
  calories: { current: 440, goal: 680 },
  water: { current: 1.8, goal: 2.5 },
  activeMinutes: { current: 42, goal: 60 },
  distanceKm: { current: 6.3, goal: 8 },
  activities: [
    { id: "walk", name: "Caminhada Indoor", distance: "2,44 km", when: "Hoje" },
    { id: "run", name: "Corrida Matinal", distance: "3,88 km", when: "Hoje" },
  ],
};
