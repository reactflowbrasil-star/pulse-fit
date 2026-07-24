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
    title: "Home Chest Workout (No Equipment)",
    duration: "45 min",
    level: "AAA Hard",
    calories: "381 Cal",
    focus: "Chest",
    image: workoutChest,
  },
  {
    id: "home-leg",
    title: "Complete Home Leg Workout",
    duration: "45 min",
    level: "AA Middle",
    calories: "412 Cal",
    focus: "Legs",
    image: workoutLeg,
  },
  {
    id: "total-body",
    title: "Total Body Strength Burnout",
    duration: "38 min",
    level: "AAA Hard",
    calories: "455 Cal",
    focus: "Full body",
    image: workoutTotal,
  },
  {
    id: "shoulder",
    title: "Perfect Home Shoulder Workout",
    duration: "32 min",
    level: "AA Middle",
    calories: "298 Cal",
    focus: "Shoulders",
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
  { id: "push-ups", name: "Push Ups", detail: "20 reps", image: exercisePushup, seconds: 30 },
  { id: "hold-90", name: "90° Hold", detail: "20 sec", image: workoutChest, seconds: 20 },
  { id: "circle-push", name: "Push Ups in a Circle", detail: "12 reps", image: workoutTotal, seconds: 40 },
  { id: "diamond", name: "Diamond Push Ups", detail: "15 reps", image: workoutShoulder, seconds: 25 },
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
    role: "High Intensity Fitness Trainer",
    rating: 4.6,
    experience: "7 years experience",
    image: trainerChris,
    bio: "Founder of a global calisthenics community. Focused on high intensity bodyweight training and strength progression.",
    stats: { experience: "7 years", completed: "88", clients: "32" },
  },
  {
    id: "richard-smith",
    name: "Richard Smith",
    role: "Strength & Conditioning Coach",
    rating: 4.8,
    experience: "5 years experience",
    image: avatar1,
    stats: { experience: "5 years", completed: "64", clients: "24" },
  },
  {
    id: "kasandra-lilo",
    name: "Kasandra Lilo",
    role: "Yoga & Mobility Specialist",
    rating: 4.9,
    experience: "8 years experience",
    image: avatar2,
    stats: { experience: "8 years", completed: "112", clients: "41" },
  },
  {
    id: "ronald-chief",
    name: "Ronald Chief",
    role: "Powerlifting Trainer",
    rating: 4.5,
    experience: "10 years experience",
    image: avatar3,
    stats: { experience: "10 years", completed: "156", clients: "52" },
  },
];

export const dashboard = {
  steps: { current: 11000, goal: 16000 },
  calories: { current: 440, goal: 680 },
  water: { current: 1.8, goal: 2.5 },
  activities: [
    { id: "walk", name: "Indoor Walk", distance: "2.44 km", when: "Today" },
    { id: "run", name: "Morning Running", distance: "3.88 km", when: "Today" },
  ],
};
