export type LibraryExercise = { name: string; muscle: Muscle };
export type Muscle = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";

export const MUSCLES: Muscle[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  { name: "Barbell Bench Press", muscle: "Chest" },
  { name: "Incline Dumbbell Press", muscle: "Chest" },
  { name: "Dumbbell Fly", muscle: "Chest" },
  { name: "Cable Crossover", muscle: "Chest" },
  { name: "Push-Up", muscle: "Chest" },
  { name: "Chest Dip", muscle: "Chest" },

  { name: "Deadlift", muscle: "Back" },
  { name: "Pull-Up", muscle: "Back" },
  { name: "Lat Pulldown", muscle: "Back" },
  { name: "Barbell Row", muscle: "Back" },
  { name: "Seated Cable Row", muscle: "Back" },
  { name: "Single-Arm Dumbbell Row", muscle: "Back" },
  { name: "Face Pull", muscle: "Back" },

  { name: "Back Squat", muscle: "Legs" },
  { name: "Front Squat", muscle: "Legs" },
  { name: "Romanian Deadlift", muscle: "Legs" },
  { name: "Leg Press", muscle: "Legs" },
  { name: "Walking Lunge", muscle: "Legs" },
  { name: "Leg Extension", muscle: "Legs" },
  { name: "Leg Curl", muscle: "Legs" },
  { name: "Standing Calf Raise", muscle: "Legs" },
  { name: "Hip Thrust", muscle: "Legs" },

  { name: "Overhead Press", muscle: "Shoulders" },
  { name: "Dumbbell Shoulder Press", muscle: "Shoulders" },
  { name: "Lateral Raise", muscle: "Shoulders" },
  { name: "Rear Delt Fly", muscle: "Shoulders" },
  { name: "Arnold Press", muscle: "Shoulders" },
  { name: "Upright Row", muscle: "Shoulders" },

  { name: "Barbell Curl", muscle: "Arms" },
  { name: "Dumbbell Hammer Curl", muscle: "Arms" },
  { name: "Preacher Curl", muscle: "Arms" },
  { name: "Triceps Pushdown", muscle: "Arms" },
  { name: "Overhead Triceps Extension", muscle: "Arms" },
  { name: "Close-Grip Bench Press", muscle: "Arms" },
  { name: "Cable Curl", muscle: "Arms" },

  { name: "Plank", muscle: "Core" },
  { name: "Hanging Leg Raise", muscle: "Core" },
  { name: "Cable Crunch", muscle: "Core" },
  { name: "Russian Twist", muscle: "Core" },
  { name: "Ab Wheel Rollout", muscle: "Core" },
  { name: "Dead Bug", muscle: "Core" },
];
