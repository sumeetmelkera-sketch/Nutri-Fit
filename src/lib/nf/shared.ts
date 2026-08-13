// Shared, browser-safe domain types + pure calculation logic for NutriFit.

export type Gender = "male" | "female" | "other";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "athlete";
export type Goal = "lose" | "maintain" | "gain";
export type Experience = "beginner" | "intermediate" | "advanced";
export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];
export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export type Nutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  satFat: number;
  sodium: number;
  micros?: { name: string; amount: string }[];
  items?: string[];
};

export const EMPTY_NUTRITION: Nutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  satFat: 0,
  sodium: 0,
};

export type Targets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type Profile = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity: Activity;
  goal: Goal;
  experience: Experience;
  workout_days: string[];
  trainer_id: string;
  targets: Targets;
  created_at: string;
};

export type Meal = {
  id: string;
  log_date: string;
  meal_type: MealType;
  description: string;
  nutrition: Nutrition;
  created_at: string;
};

export type PlanExercise = {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
};

export type PlanDay = { title: string; exercises: PlanExercise[] };
export type Plan = Partial<Record<DayKey, PlanDay>>;

export type SessionEntry = {
  name: string;
  muscle: string;
  sets: { weight: number; reps: number; done: boolean }[];
};

export type WorkoutSession = {
  id: string;
  log_date: string;
  day_key: string;
  title: string;
  duration_sec: number;
  total_volume: number;
  entries: SessionEntry[];
  created_at: string;
};

export type PersonalRecord = {
  id: string;
  exercise: string;
  weight_kg: number;
  reps: number;
  est_1rm: number;
  achieved_on: string;
};

export type Measurement = {
  id: string;
  log_date: string;
  weight_kg: number | null;
  metrics: Record<string, number>;
  photo_url: string | null;
};

export type AchievementRow = { code: string; earned_at: string };

export const ACHIEVEMENTS: { code: string; title: string; detail: string }[] = [
  { code: "first_workout", title: "First Workout", detail: "Complete your first session" },
  { code: "ten_workouts", title: "10 Workouts", detail: "Log 10 completed sessions" },
  { code: "new_pb", title: "New Personal Best", detail: "Beat a previous lift" },
  { code: "streak_7", title: "7 Day Streak", detail: "A full week of consistency" },
  { code: "streak_30", title: "30 Day Streak", detail: "One month, unbroken" },
  { code: "nutrition_goal", title: "Nutrition Goal", detail: "Hit your calorie + protein target" },
];

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: "Sedentary — desk job, little movement",
  light: "Light — 1-2 sessions a week",
  moderate: "Moderate — 3-4 sessions a week",
  active: "Active — 5-6 sessions a week",
  athlete: "Athlete — daily hard training",
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "Lose fat",
  maintain: "Stay lean",
  gain: "Build muscle",
};

export function computeTargets(p: {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity: Activity;
  goal: Goal;
}): Targets {
  const s = p.gender === "male" ? 5 : p.gender === "female" ? -161 : -78;
  const bmr = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age + s;
  const tdee = bmr * (ACTIVITY_FACTOR[p.activity] ?? 1.55);
  const adjust = p.goal === "lose" ? -0.18 : p.goal === "gain" ? 0.12 : 0;
  const calories = Math.round((tdee * (1 + adjust)) / 10) * 10;
  const proteinPerKg = p.goal === "gain" ? 2.0 : p.goal === "lose" ? 2.2 : 1.8;
  const protein = Math.round(p.weight_kg * proteinPerKg);
  const fat = Math.round((calories * 0.27) / 9);
  const carbs = Math.max(50, Math.round((calories - protein * 4 - fat * 9) / 4));
  const fiber = Math.round((calories / 1000) * 14);
  return { calories, protein, carbs, fat, fiber };
}

export function sumNutrition(list: Nutrition[]): Nutrition {
  return list.reduce<Nutrition>(
    (acc, n) => ({
      calories: acc.calories + (n.calories || 0),
      protein: acc.protein + (n.protein || 0),
      carbs: acc.carbs + (n.carbs || 0),
      fat: acc.fat + (n.fat || 0),
      fiber: acc.fiber + (n.fiber || 0),
      sugar: acc.sugar + (n.sugar || 0),
      satFat: acc.satFat + (n.satFat || 0),
      sodium: acc.sodium + (n.sodium || 0),
    }),
    { ...EMPTY_NUTRITION },
  );
}

export function epley1rm(weight: number, reps: number) {
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function dayKeyOf(iso: string): DayKey {
  const idx = new Date(iso + "T00:00:00").getDay(); // 0=Sun
  return DAY_KEYS[(idx + 6) % 7]!;
}

/** Streak that ignores scheduled rest days. */
export function computeStreak(sessionDates: string[], workoutDays: string[]): number {
  const set = new Set(sessionDates);
  const scheduled = new Set(workoutDays.length ? workoutDays : [...DAY_KEYS]);
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const iso = todayISO(-i);
    const isScheduled = scheduled.has(dayKeyOf(iso));
    if (set.has(iso)) {
      streak++;
      continue;
    }
    if (!isScheduled) continue; // rest day: does not break the streak
    if (i === 0) continue; // today is not over yet
    break;
  }
  return streak;
}

export function pct(value: number, target: number) {
  if (!target) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}
