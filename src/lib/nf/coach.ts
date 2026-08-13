import { getTrainer } from "./trainers";
import { dayKeyOf, pct, todayISO, type Nutrition, type Plan, type Profile } from "./shared";

export function todayWorkout(plan: Plan, iso = todayISO()) {
  const key = dayKeyOf(iso);
  const day = plan?.[key];
  if (!day || !day.exercises?.length) return null;
  return { key, ...day };
}

/** Deterministic coach line built from real user data (no AI). */
export function coachLine(args: {
  profile: Profile;
  totals: Nutrition;
  plan: Plan;
  trainedToday: boolean;
  streak: number;
  lastPR?: string | null;
}) {
  const { profile, totals, plan, trainedToday, streak } = args;
  const t = getTrainer(profile.trainer_id);
  const workout = todayWorkout(plan);
  const proteinPct = pct(totals.protein, profile.targets.protein);
  const caloriePct = pct(totals.calories, profile.targets.calories);
  const first = profile.name.split(" ")[0] || "there";

  if (args.lastPR) return `New personal best on ${args.lastPR}. That's real progress, ${first}.`;
  if (trainedToday && proteinPct >= 80) return "Session done and protein on point. Great day.";
  if (trainedToday) return "Session logged. Now get your protein in and recover well.";
  if (workout) {
    const hour = new Date().getHours();
    if (hour >= 20) return `${workout.title} is still open today. Even a short session counts.`;
    return `Ready for ${workout.title}? ${workout.exercises.length} exercises lined up.`;
  }
  if (streak >= 7) return `${streak} day streak. Rest day today — recover well, ${first}.`;
  if (caloriePct > 110) return "You're over your calorie target today. Keep dinner light.";
  if (proteinPct >= 80) return "You're on track with protein. Nice consistency.";
  return `Rest day. ${t.name} says: recovery is when the work pays off.`;
}

export function weeklySummary(args: {
  sessions: { log_date: string; total_volume: number }[];
  mealDays: number;
  streak: number;
  volumeDelta: number;
}) {
  const { sessions, mealDays, streak, volumeDelta } = args;
  const count = sessions.length;
  if (!count && !mealDays) return "No data logged this week yet. Log one meal or one session to start.";
  const parts: string[] = [];
  parts.push(count ? `You trained ${count} time${count === 1 ? "" : "s"} this week` : "You didn't train this week");
  if (volumeDelta > 3) parts.push("and your total volume went up");
  else if (volumeDelta < -3) parts.push("and volume dipped a little");
  parts.push(mealDays >= 5 ? "Nutrition logging was consistent." : "Try logging food on more days.");
  if (streak >= 3) parts.push(`Streak: ${streak} days.`);
  return parts.join(". ").replace(/\.\./g, ".") + (streak >= 3 ? "" : " Keep your protein consistent.");
}
