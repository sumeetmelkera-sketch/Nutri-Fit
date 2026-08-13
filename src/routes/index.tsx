import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, Dumbbell, Flame, Plus, TrendingUp } from "lucide-react";
import { Card, Screen, SectionTitle } from "@/components/nf/Shell";
import { AnimatedNumber, Bar, Ring } from "@/components/nf/Ring";
import { coachLine, todayWorkout } from "@/lib/nf/coach";
import { useMealsFor, useNutriFit } from "@/lib/nf/store";
import { getTrainer } from "@/lib/nf/trainers";
import { todayISO } from "@/lib/nf/shared";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriFit — Train. Eat. Improve." },
      {
        name: "description",
        content:
          "NutriFit is your personal fitness coach: nutrition tracking, workout logging and progress insights in one premium mobile app.",
      },
      { property: "og:title", content: "NutriFit — Train. Eat. Improve." },
      {
        property: "og:description",
        content: "Track meals, log workouts and watch your strength climb with your AI trainer.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Screen title="Today" subtitle={new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}>
      <HomeBody />
    </Screen>
  );
}

function HomeBody() {
  const { state } = useNutriFit();
  const { totals } = useMealsFor();
  if (!state) return null;
  const { profile, plan, sessions, streak, records } = state;
  const trainer = getTrainer(profile.trainer_id);
  const trainedToday = sessions.some((s) => s.log_date === todayISO());
  const workout = todayWorkout(plan);
  const lastPR = records
    .slice()
    .sort((a, b) => b.achieved_on.localeCompare(a.achieved_on))[0];
  const prToday = lastPR?.achieved_on === todayISO() ? lastPR.exercise : null;

  const message = coachLine({ profile, totals, plan, trainedToday, streak, lastPR: prToday });

  return (
    <>
      <Card className="flex items-start gap-3">
        <img
          src={trainer.image}
          alt={trainer.name}
          width={48}
          height={48}
          loading="lazy"
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{trainer.name}</p>
          <p className="mt-1 text-sm leading-relaxed">{message}</p>
        </div>
      </Card>

      <Card delay={60} className="flex items-center gap-4">
        <Ring value={totals.calories} max={profile.targets.calories} />
        <div className="min-w-0 flex-1 space-y-3">
          <MacroRow label="Protein" value={totals.protein} max={profile.targets.protein} tone="lime" />
          <MacroRow label="Carbs" value={totals.carbs} max={profile.targets.carbs} tone="amber" />
          <MacroRow label="Fat" value={totals.fat} max={profile.targets.fat} tone="ember" />
        </div>
      </Card>

      <SectionTitle
        action={
          <Link to="/workout" className="text-xs font-semibold text-primary">
            Plan
          </Link>
        }
      >
        Today's workout
      </SectionTitle>
      <Card delay={120}>
        {workout ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{workout.title}</p>
                <p className="text-xs text-muted-foreground">
                  {workout.exercises.length} exercises ·{" "}
                  {workout.exercises.reduce((s, e) => s + e.sets, 0)} sets
                </p>
              </div>
              {trainedToday ? (
                <span className="rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">
                  Completed
                </span>
              ) : (
                <Link
                  to="/workout/session"
                  className="press energy-bg shrink-0 rounded-full px-4 py-2.5 text-xs font-bold text-primary-foreground"
                >
                  Start
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {workout.exercises.slice(0, 5).map((e) => (
                <span key={e.id} className="rounded-full bg-elevated px-2.5 py-1 text-[11px] text-muted-foreground">
                  {e.name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold">Rest day</p>
              <p className="text-xs text-muted-foreground">Nothing scheduled. Recover well.</p>
            </div>
            <Link to="/workout" className="press rounded-full border border-border px-4 py-2.5 text-xs font-semibold">
              Edit plan
            </Link>
          </div>
        )}
      </Card>

      <SectionTitle>Progress</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <Stat delay={160} icon={<Flame className="h-4 w-4 text-primary" />} value={streak} label="Day streak" />
        <Stat delay={200} icon={<Dumbbell className="h-4 w-4 text-primary" />} value={sessions.length} label="Sessions" />
        <Stat delay={240} icon={<TrendingUp className="h-4 w-4 text-primary" />} value={records.length} label="PRs" />
      </div>

      <SectionTitle>Quick actions</SectionTitle>
      <div className="grid grid-cols-2 gap-3 pb-4">
        <QuickAction to="/nutrition" icon={<Apple className="h-4 w-4" />} label="Log a meal" />
        <QuickAction to="/workout/session" icon={<Plus className="h-4 w-4" />} label="Start workout" />
        <QuickAction to="/progress" icon={<TrendingUp className="h-4 w-4" />} label="Log weight" />
        <QuickAction to="/trainer" icon={<Dumbbell className="h-4 w-4" />} label="Ask trainer" />
      </div>
    </>
  );
}

function MacroRow({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "lime" | "amber" | "ember";
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          <AnimatedNumber value={Math.round(value)} />
          <span className="text-muted-foreground">/{Math.round(max)}g</span>
        </span>
      </div>
      <Bar value={value} max={max} tone={tone} />
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <Card delay={delay} className="space-y-1 p-3.5">
      {icon}
      <p className="text-xl font-bold">
        <AnimatedNumber value={value} />
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}

function QuickAction({
  to,
  icon,
  label,
}: {
  to: "/nutrition" | "/workout/session" | "/progress" | "/trainer";
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="press surface flex items-center gap-2.5 p-3.5 text-sm font-semibold"
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-elevated text-primary">
        {icon}
      </span>
      {label}
    </Link>
  );
}
