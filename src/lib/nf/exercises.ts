export type ExerciseMode = "reps" | "time";
export type LibraryExercise = { name: string; muscle: Muscle; mode: ExerciseMode };
export type Muscle =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Legs"
  | "Glutes"
  | "Calves"
  | "Core";

export const MUSCLES: Muscle[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Legs",
  "Glutes",
  "Calves",
  "Core",
];

const R = (name: string, muscle: Muscle): LibraryExercise => ({ name, muscle, mode: "reps" });
const T = (name: string, muscle: Muscle): LibraryExercise => ({ name, muscle, mode: "time" });

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // Chest
  R("Barbell Bench Press", "Chest"),
  R("Incline Barbell Press", "Chest"),
  R("Incline Dumbbell Press", "Chest"),
  R("Flat Dumbbell Press", "Chest"),
  R("Dumbbell Fly", "Chest"),
  R("Cable Crossover", "Chest"),
  R("Pec Deck Machine", "Chest"),
  R("Push-Up", "Chest"),
  R("Decline Push-Up", "Chest"),
  R("Chest Dip", "Chest"),

  // Back
  R("Deadlift", "Back"),
  R("Pull-Up", "Back"),
  R("Chin-Up", "Back"),
  R("Lat Pulldown", "Back"),
  R("Close-Grip Pulldown", "Back"),
  R("Barbell Row", "Back"),
  R("Pendlay Row", "Back"),
  R("Seated Cable Row", "Back"),
  R("Single-Arm Dumbbell Row", "Back"),
  R("T-Bar Row", "Back"),
  R("Straight-Arm Pulldown", "Back"),
  R("Face Pull", "Back"),
  R("Back Extension", "Back"),
  T("Dead Hang", "Back"),

  // Shoulders
  R("Overhead Press", "Shoulders"),
  R("Dumbbell Shoulder Press", "Shoulders"),
  R("Arnold Press", "Shoulders"),
  R("Lateral Raise", "Shoulders"),
  R("Cable Lateral Raise", "Shoulders"),
  R("Front Raise", "Shoulders"),
  R("Rear Delt Fly", "Shoulders"),
  R("Reverse Pec Deck", "Shoulders"),
  R("Upright Row", "Shoulders"),
  R("Shrug", "Shoulders"),

  // Biceps
  R("Barbell Curl", "Biceps"),
  R("EZ-Bar Curl", "Biceps"),
  R("Dumbbell Curl", "Biceps"),
  R("Hammer Curl", "Biceps"),
  R("Incline Dumbbell Curl", "Biceps"),
  R("Preacher Curl", "Biceps"),
  R("Cable Curl", "Biceps"),
  R("Concentration Curl", "Biceps"),

  // Triceps
  R("Triceps Pushdown", "Triceps"),
  R("Rope Pushdown", "Triceps"),
  R("Overhead Triceps Extension", "Triceps"),
  R("Skull Crusher", "Triceps"),
  R("Close-Grip Bench Press", "Triceps"),
  R("Triceps Dip", "Triceps"),
  R("Dumbbell Kickback", "Triceps"),
  R("Diamond Push-Up", "Triceps"),

  // Forearms
  R("Barbell Wrist Curl", "Forearms"),
  R("Reverse Wrist Curl", "Forearms"),
  R("Reverse Barbell Curl", "Forearms"),
  R("Wrist Roller", "Forearms"),
  T("Farmer's Carry", "Forearms"),
  T("Plate Pinch Hold", "Forearms"),

  // Legs
  R("Back Squat", "Legs"),
  R("Front Squat", "Legs"),
  R("Goblet Squat", "Legs"),
  R("Hack Squat", "Legs"),
  R("Leg Press", "Legs"),
  R("Romanian Deadlift", "Legs"),
  R("Walking Lunge", "Legs"),
  R("Bulgarian Split Squat", "Legs"),
  R("Leg Extension", "Legs"),
  R("Lying Leg Curl", "Legs"),
  R("Seated Leg Curl", "Legs"),
  R("Step-Up", "Legs"),
  T("Wall Sit", "Legs"),

  // Glutes
  R("Hip Thrust", "Glutes"),
  R("Glute Bridge", "Glutes"),
  R("Cable Kickback", "Glutes"),
  R("Sumo Deadlift", "Glutes"),
  R("Reverse Lunge", "Glutes"),
  R("Abduction Machine", "Glutes"),
  T("Glute Bridge Hold", "Glutes"),

  // Calves
  R("Standing Calf Raise", "Calves"),
  R("Seated Calf Raise", "Calves"),
  R("Leg Press Calf Raise", "Calves"),
  R("Single-Leg Calf Raise", "Calves"),
  R("Donkey Calf Raise", "Calves"),

  // Core
  T("Plank", "Core"),
  T("Side Plank", "Core"),
  T("Hollow Body Hold", "Core"),
  R("Hanging Leg Raise", "Core"),
  R("Cable Crunch", "Core"),
  R("Crunch", "Core"),
  R("Russian Twist", "Core"),
  R("Ab Wheel Rollout", "Core"),
  R("Dead Bug", "Core"),
  R("Bicycle Crunch", "Core"),
  T("Mountain Climbers", "Core"),
];

export function exerciseMode(name: string): ExerciseMode {
  return EXERCISE_LIBRARY.find((e) => e.name === name)?.mode ?? "reps";
}
