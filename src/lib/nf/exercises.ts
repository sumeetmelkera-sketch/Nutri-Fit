export type ExerciseMode = "reps" | "time";
/** "dumbbell" = With Dumbbell, "none" = Without Dumbbell (bodyweight / bar / machine-free). */
export type Equipment = "dumbbell" | "none";

export type Muscle =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Core"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Rest & Recovery";

export type LibraryExercise = {
  name: string;
  muscle: Muscle;
  mode: ExerciseMode;
  equipment: Equipment;
};

export const MUSCLES: Muscle[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Core",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Rest & Recovery",
];

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  dumbbell: "With dumbbell",
  none: "Without dumbbell",
};

const D = (name: string, muscle: Muscle, mode: ExerciseMode = "reps"): LibraryExercise => ({
  name,
  muscle,
  mode,
  equipment: "dumbbell",
});
const B = (name: string, muscle: Muscle, mode: ExerciseMode = "reps"): LibraryExercise => ({
  name,
  muscle,
  mode,
  equipment: "none",
});

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // ---------- Chest ----------
  D("Dumbbell Bench Press", "Chest"),
  D("Dumbbell Incline Press", "Chest"),
  D("Dumbbell Fly", "Chest"),
  D("Dumbbell Floor Press", "Chest"),
  D("Dumbbell Pullover", "Chest"),
  B("Push-Up", "Chest"),
  B("Incline Push-Up", "Chest"),
  B("Decline Push-Up", "Chest"),
  B("Wide Push-Up", "Chest"),
  B("Chest Dip", "Chest"),

  // ---------- Back ----------
  D("Single-Arm Dumbbell Row", "Back"),
  D("Bent-Over Dumbbell Row", "Back"),
  D("Dumbbell Deadlift", "Back"),
  D("Dumbbell Shrug", "Back"),
  B("Pull-Up", "Back"),
  B("Chin-Up", "Back"),
  B("Inverted Row", "Back"),
  B("Superman", "Back"),
  B("Back Extension", "Back"),
  B("Dead Hang", "Back", "time"),

  // ---------- Shoulders ----------
  D("Dumbbell Shoulder Press", "Shoulders"),
  D("Arnold Press", "Shoulders"),
  D("Lateral Raise", "Shoulders"),
  D("Front Raise", "Shoulders"),
  D("Rear Delt Fly", "Shoulders"),
  B("Pike Push-Up", "Shoulders"),
  B("Wall Handstand Hold", "Shoulders", "time"),
  B("Arm Circles", "Shoulders", "time"),

  // ---------- Biceps ----------
  D("Dumbbell Curl", "Biceps"),
  D("Hammer Curl", "Biceps"),
  D("Incline Dumbbell Curl", "Biceps"),
  D("Concentration Curl", "Biceps"),
  B("Chin-Up (Biceps Focus)", "Biceps"),
  B("Towel Curl (Isometric)", "Biceps", "time"),

  // ---------- Triceps ----------
  D("Overhead Dumbbell Extension", "Triceps"),
  D("Dumbbell Skull Crusher", "Triceps"),
  D("Dumbbell Kickback", "Triceps"),
  D("Close-Grip Dumbbell Press", "Triceps"),
  B("Diamond Push-Up", "Triceps"),
  B("Bench Dip", "Triceps"),
  B("Triceps Dip", "Triceps"),

  // ---------- Forearms ----------
  D("Dumbbell Wrist Curl", "Forearms"),
  D("Reverse Wrist Curl", "Forearms"),
  D("Farmer's Carry", "Forearms", "time"),
  B("Dead Hang for Grip", "Forearms", "time"),
  B("Fingertip Push-Up", "Forearms"),

  // ---------- Core / Abs ----------
  D("Dumbbell Russian Twist", "Core"),
  D("Dumbbell Side Bend", "Core"),
  D("Weighted Sit-Up", "Core"),
  B("Plank", "Core", "time"),
  B("Side Plank", "Core", "time"),
  B("Hollow Body Hold", "Core", "time"),
  B("Crunch", "Core"),
  B("Leg Raise", "Core"),
  B("Bicycle Crunch", "Core"),
  B("Mountain Climbers", "Core", "time"),

  // ---------- Quads ----------
  D("Dumbbell Goblet Squat", "Quads"),
  D("Dumbbell Front Squat", "Quads"),
  D("Dumbbell Lunge", "Quads"),
  D("Dumbbell Step-Up", "Quads"),
  B("Bodyweight Squat", "Quads"),
  B("Split Squat", "Quads"),
  B("Jump Squat", "Quads"),
  B("Wall Sit", "Quads", "time"),

  // ---------- Hamstrings ----------
  D("Dumbbell Romanian Deadlift", "Hamstrings"),
  D("Dumbbell Stiff-Leg Deadlift", "Hamstrings"),
  D("Dumbbell Single-Leg RDL", "Hamstrings"),
  B("Nordic Curl", "Hamstrings"),
  B("Glute-Ham Bridge Walkout", "Hamstrings"),
  B("Good Morning (Bodyweight)", "Hamstrings"),

  // ---------- Glutes ----------
  D("Dumbbell Hip Thrust", "Glutes"),
  D("Dumbbell Sumo Squat", "Glutes"),
  D("Dumbbell Reverse Lunge", "Glutes"),
  B("Glute Bridge", "Glutes"),
  B("Single-Leg Glute Bridge", "Glutes"),
  B("Donkey Kick", "Glutes"),
  B("Glute Bridge Hold", "Glutes", "time"),

  // ---------- Calves ----------
  D("Dumbbell Standing Calf Raise", "Calves"),
  D("Dumbbell Seated Calf Raise", "Calves"),
  D("Dumbbell Single-Leg Calf Raise", "Calves"),
  B("Bodyweight Calf Raise", "Calves"),
  B("Stair Calf Raise", "Calves"),
  B("Calf Raise Hold", "Calves", "time"),

  // ---------- Rest & Recovery ----------
  B("Walking", "Rest & Recovery", "time"),
  B("Jogging", "Rest & Recovery", "time"),
  B("Light Running", "Rest & Recovery", "time"),
  B("Light Cycling", "Rest & Recovery", "time"),
  B("Full Body Stretching", "Rest & Recovery", "time"),
  B("Mobility Flow", "Rest & Recovery", "time"),
  B("Cool-Down", "Rest & Recovery", "time"),
  B("Active Recovery Session", "Rest & Recovery", "time"),
];

export function exerciseMode(name: string): ExerciseMode {
  return EXERCISE_LIBRARY.find((e) => e.name === name)?.mode ?? "reps";
}
