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
  D("Dumbbell Squeeze Press", "Chest"),
  D("Dumbbell Decline Press", "Chest"),
  D("Dumbbell Incline Fly", "Chest"),
  B("Archer Push-Up", "Chest"),
  B("Explosive Push-Up", "Chest"),
  B("Push-Up Hold", "Chest", "time"),

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
  D("Chest-Supported Dumbbell Row", "Back"),
  D("Dumbbell Reverse Fly", "Back"),
  D("Renegade Row", "Back"),
  B("Wide-Grip Pull-Up", "Back"),
  B("Australian Row", "Back"),
  B("Scapular Pull-Up", "Back"),

  // ---------- Shoulders ----------
  D("Dumbbell Shoulder Press", "Shoulders"),
  D("Arnold Press", "Shoulders"),
  D("Lateral Raise", "Shoulders"),
  D("Front Raise", "Shoulders"),
  D("Rear Delt Fly", "Shoulders"),
  B("Pike Push-Up", "Shoulders"),
  B("Wall Handstand Hold", "Shoulders", "time"),
  B("Arm Circles", "Shoulders", "time"),
  D("Dumbbell Upright Row", "Shoulders"),
  D("Dumbbell Push Press", "Shoulders"),
  D("Dumbbell Y-Raise", "Shoulders"),
  B("Wall Walk", "Shoulders"),
  B("Elevated Pike Push-Up", "Shoulders"),

  // ---------- Biceps ----------
  D("Dumbbell Curl", "Biceps"),
  D("Hammer Curl", "Biceps"),
  D("Incline Dumbbell Curl", "Biceps"),
  D("Concentration Curl", "Biceps"),
  B("Chin-Up (Biceps Focus)", "Biceps"),
  B("Towel Curl (Isometric)", "Biceps", "time"),
  D("Zottman Curl", "Biceps"),
  D("Preacher Dumbbell Curl", "Biceps"),
  D("Cross-Body Hammer Curl", "Biceps"),
  B("Underhand Inverted Row", "Biceps"),

  // ---------- Triceps ----------
  D("Overhead Dumbbell Extension", "Triceps"),
  D("Dumbbell Skull Crusher", "Triceps"),
  D("Dumbbell Kickback", "Triceps"),
  D("Close-Grip Dumbbell Press", "Triceps"),
  B("Diamond Push-Up", "Triceps"),
  B("Bench Dip", "Triceps"),
  B("Triceps Dip", "Triceps"),
  D("Single-Arm Overhead Extension", "Triceps"),
  D("Dumbbell Tate Press", "Triceps"),
  B("Bodyweight Skull Crusher", "Triceps"),
  B("Pseudo Planche Push-Up", "Triceps"),

  // ---------- Forearms ----------
  D("Dumbbell Wrist Curl", "Forearms"),
  D("Reverse Wrist Curl", "Forearms"),
  D("Farmer's Carry", "Forearms", "time"),
  B("Dead Hang for Grip", "Forearms", "time"),
  B("Fingertip Push-Up", "Forearms"),
  D("Dumbbell Hammer Hold", "Forearms", "time"),
  D("Plate/Dumbbell Pinch Hold", "Forearms", "time"),
  B("Towel Hang", "Forearms", "time"),
  B("Wrist Rotations", "Forearms", "time"),

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
  D("Dumbbell Woodchopper", "Core"),
  D("Dumbbell Suitcase Carry", "Core", "time"),
  B("Plank Shoulder Taps", "Core"),
  B("Flutter Kicks", "Core", "time"),
  B("V-Up", "Core"),
  B("Dead Bug", "Core"),
  B("Reverse Crunch", "Core"),

  // ---------- Quads ----------
  D("Dumbbell Goblet Squat", "Quads"),
  D("Dumbbell Front Squat", "Quads"),
  D("Dumbbell Lunge", "Quads"),
  D("Dumbbell Step-Up", "Quads"),
  B("Bodyweight Squat", "Quads"),
  B("Split Squat", "Quads"),
  B("Jump Squat", "Quads"),
  B("Wall Sit", "Quads", "time"),
  D("Dumbbell Bulgarian Split Squat", "Quads"),
  D("Dumbbell Walking Lunge", "Quads"),
  B("Pause Squat", "Quads"),
  B("Reverse Lunge", "Quads"),
  B("Step-Up (Bodyweight)", "Quads"),

  // ---------- Hamstrings ----------
  D("Dumbbell Romanian Deadlift", "Hamstrings"),
  D("Dumbbell Stiff-Leg Deadlift", "Hamstrings"),
  D("Dumbbell Single-Leg RDL", "Hamstrings"),
  B("Nordic Curl", "Hamstrings"),
  B("Glute-Ham Bridge Walkout", "Hamstrings"),
  B("Good Morning (Bodyweight)", "Hamstrings"),
  D("Dumbbell Good Morning", "Hamstrings"),
  D("Dumbbell Sumo Deadlift", "Hamstrings"),
  B("Single-Leg Hip Hinge", "Hamstrings"),
  B("Hamstring Slider Curl", "Hamstrings"),

  // ---------- Glutes ----------
  D("Dumbbell Hip Thrust", "Glutes"),
  D("Dumbbell Sumo Squat", "Glutes"),
  D("Dumbbell Reverse Lunge", "Glutes"),
  B("Glute Bridge", "Glutes"),
  B("Single-Leg Glute Bridge", "Glutes"),
  B("Donkey Kick", "Glutes"),
  B("Glute Bridge Hold", "Glutes", "time"),
  D("Dumbbell Step-Through Lunge", "Glutes"),
  D("Dumbbell Curtsy Lunge", "Glutes"),
  B("Frog Pump", "Glutes"),
  B("Fire Hydrant", "Glutes"),
  B("Hip Abduction (Side-Lying)", "Glutes"),

  // ---------- Calves ----------
  D("Dumbbell Standing Calf Raise", "Calves"),
  D("Dumbbell Seated Calf Raise", "Calves"),
  D("Dumbbell Single-Leg Calf Raise", "Calves"),
  B("Bodyweight Calf Raise", "Calves"),
  B("Stair Calf Raise", "Calves"),
  B("Calf Raise Hold", "Calves", "time"),
  D("Dumbbell Calf Raise (Elevated)", "Calves"),
  B("Jump Rope", "Calves", "time"),
  B("Tibialis Raise", "Calves"),

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
  B("Brisk Walk", "Rest & Recovery", "time"),
  B("Foam Rolling", "Rest & Recovery", "time"),
  B("Yoga Flow", "Rest & Recovery", "time"),
  B("Deep Breathing", "Rest & Recovery", "time"),
  B("Hip Mobility Drill", "Rest & Recovery", "time"),
  B("Shoulder Mobility Drill", "Rest & Recovery", "time"),

export function exerciseMode(name: string): ExerciseMode {
  return EXERCISE_LIBRARY.find((e) => e.name === name)?.mode ?? "reps";
}
