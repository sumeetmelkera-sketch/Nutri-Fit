import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { Card, Screen } from "@/components/nf/Shell";
import { useNutriFit } from "@/lib/nf/store";
import { getUserAvatar } from "@/lib/nf/avatars";
import { ACTIVITY_LABELS, GOAL_LABELS, DAY_LABELS, type DayKey } from "@/lib/nf/shared";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "Me — NutriFit" },
      {
        name: "description",
        content:
          "Your NutriFit profile at a glance: avatar, goal, daily targets, streak and training days.",
      },
      { property: "og:title", content: "Me — NutriFit" },
      { property: "og:description", content: "Your NutriFit profile at a glance." },
    ],
  }),
  component: () => (
    <Screen title="Me" header={false}>
      <MeBody />
    </Screen>
  ),
});

function MeBody() {
  const { state } = useNutriFit();
  if (!state) return null;
  const { profile, sessions, streak } = state;
  const avatar = getUserAvatar(profile.avatar_id);
  const days = profile.workout_days
    .map((d) => DAY_LABELS[d as DayKey])
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <header className="-mx-5 flex items-center justify-between gap-3 px-5 pb-2 pt-1">
        <h1 className="text-2xl font-bold tracking-tight">Me</h1>
        <Link
          to="/settings"
          aria-label="Settings"
          className="press grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
        >
          <Settings className="h-4.5 w-4.5" />
        </Link>
      </header>

      <Card className="flex items-center gap-4">
        <img
          src={avatar.image}
          alt="Your avatar"
          width={64}
          height={64}
          loading="lazy"
          className="h-16 w-16 rounded-full border border-border object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-xl font-bold">{profile.name}</p>
          <p className="text-xs text-muted-foreground">
            {profile.age} yrs · {profile.height_cm} cm · {profile.weight_kg} kg
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Streak" value={`${streak}d`} />
        <Stat label="Sessions" value={String(sessions.length)} />
        <Stat label="Goal" value={GOAL_LABELS[profile.goal]} />
      </div>

      <Card className="space-y-2 text-sm">
        <Line label="Daily calories" value={`${profile.targets.calories} kcal`} />
        <Line label="Protein target" value={`${profile.targets.protein} g`} />
        <Line label="Activity" value={ACTIVITY_LABELS[profile.activity].split(" — ")[0]!} />
        <Line label="Experience" value={profile.experience} />
        <Line label="Training days" value={days || "Not set"} />
      </Card>

      <Link
        to="/settings"
        className="press mb-4 flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-xs font-semibold"
      >
        <Settings className="h-3.5 w-3.5" /> Open settings
      </Link>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="truncate text-base font-bold">{value}</p>
    </Card>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-semibold capitalize">{value}</span>
    </div>
  );
}
