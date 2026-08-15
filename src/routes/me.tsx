import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, LogOut, MessageCircle, Palette } from "lucide-react";
import { toast } from "sonner";
import { Card, Screen, SectionTitle } from "@/components/nf/Shell";
import { updateProfile } from "@/lib/nutrifit.functions";
import { useNutriFit } from "@/lib/nf/store";
import { TRAINERS, getTrainer } from "@/lib/nf/trainers";
import { ACCENTS, useTheme } from "@/lib/nf/theme";
import {
  ACTIVITY_LABELS,
  DAY_KEYS,
  DAY_LABELS,
  GOAL_LABELS,
  computeTargets,
  type Activity,
  type DayKey,
  type Experience,
  type Gender,
  type Goal,
} from "@/lib/nf/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "Me — NutriFit Settings" },
      {
        name: "description",
        content:
          "Edit your NutriFit profile, training days, trainer, appearance and accent colour, and manage your Keypass recovery.",
      },
      { property: "og:title", content: "Me — NutriFit Settings" },
      { property: "og:description", content: "Your profile, trainer and appearance settings." },
    ],
  }),
  component: () => (
    <Screen title="Me" subtitle="Profile, trainer and appearance">
      <MeBody />
    </Screen>
  ),
});

const digits = (v: string, max = 3) =>
  v.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "").slice(0, max);

function MeBody() {
  const { state, keypass, refresh, signOut } = useNutriFit();
  const { theme, accent, setTheme, setAccent } = useTheme();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [experience, setExperience] = useState<Experience>("beginner");
  const [days, setDays] = useState<DayKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const profile = state?.profile;

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setAge(String(profile.age));
    setHeight(String(profile.height_cm));
    setWeight(String(profile.weight_kg));
    setGender(profile.gender);
    setActivity(profile.activity);
    setGoal(profile.goal);
    setExperience(profile.experience);
    setDays(profile.workout_days.filter((d): d is DayKey => (DAY_KEYS as readonly string[]).includes(d)));
  }, [profile]);

  if (!state || !profile || !keypass) return null;
  const trainer = getTrainer(profile.trainer_id);

  const ageN = Number(age);
  const heightN = Number(height);
  const weightN = Number(weight);
  const valid =
    name.trim().length > 1 &&
    ageN >= 13 &&
    ageN <= 100 &&
    heightN >= 100 &&
    heightN <= 250 &&
    weightN >= 30 &&
    weightN <= 300;

  const preview = computeTargets({
    age: ageN || profile.age,
    gender,
    height_cm: heightN || profile.height_cm,
    weight_kg: weightN || profile.weight_kg,
    activity,
    goal,
  });

  async function save() {
    if (!valid) {
      toast.error("Check your name, age, height and weight");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        data: {
          keypass: keypass!,
          patch: {
            name: name.trim(),
            age: ageN,
            gender,
            height_cm: heightN,
            weight_kg: weightN,
            activity,
            goal,
            experience,
            workout_days: days,
          },
        },
      });
      await refresh();
      toast.success("Profile updated");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function chooseTrainer(id: string) {
    try {
      await updateProfile({ data: { keypass: keypass!, patch: { trainer_id: id } } });
      await refresh();
      toast.success(`${getTrainer(id).name} is now your trainer`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <>
      <Card className="flex items-center gap-3">
        <img
          src={trainer.image}
          alt={trainer.name}
          width={56}
          height={56}
          loading="lazy"
          className="h-14 w-14 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{profile.name}</p>
          <p className="text-xs text-muted-foreground">
            Coached by {trainer.name} · {GOAL_LABELS[profile.goal]}
          </p>
        </div>
        <Link
          to="/trainer"
          className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-elevated text-primary"
          aria-label="Chat with your trainer"
        >
          <MessageCircle className="h-4 w-4" />
        </Link>
      </Card>

      <SectionTitle>Personal details</SectionTitle>
      <Card className="space-y-3">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} className="input-nf" />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Age">
            <input
              value={age}
              inputMode="numeric"
              onChange={(e) => setAge(digits(e.target.value))}
              className="input-nf"
            />
          </Field>
          <Field label="Height cm">
            <input
              value={height}
              inputMode="numeric"
              onChange={(e) => setHeight(digits(e.target.value))}
              className="input-nf"
            />
          </Field>
          <Field label="Weight kg">
            <input
              value={weight}
              inputMode="numeric"
              onChange={(e) => setWeight(digits(e.target.value))}
              className="input-nf"
            />
          </Field>
        </div>
        <Field label="Gender">
          <Segmented
            value={gender}
            onChange={(v) => setGender(v as Gender)}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />
        </Field>
      </Card>

      <SectionTitle>Activity level</SectionTitle>
      <Card className="space-y-2">
        {(Object.keys(ACTIVITY_LABELS) as Activity[]).map((a) => (
          <Row key={a} active={activity === a} onClick={() => setActivity(a)} title={ACTIVITY_LABELS[a]} />
        ))}
      </Card>

      <SectionTitle>Fitness goal</SectionTitle>
      <Card className="space-y-2">
        {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
          <Row key={g} active={goal === g} onClick={() => setGoal(g)} title={GOAL_LABELS[g]} />
        ))}
      </Card>

      <SectionTitle>Workout experience</SectionTitle>
      <Card className="space-y-2">
        {(["beginner", "intermediate", "advanced"] as Experience[]).map((x) => (
          <Row
            key={x}
            active={experience === x}
            onClick={() => setExperience(x)}
            title={x[0]!.toUpperCase() + x.slice(1)}
          />
        ))}
      </Card>

      <SectionTitle>Workout days</SectionTitle>
      <Card>
        <div className="grid grid-cols-4 gap-2">
          {DAY_KEYS.map((d) => {
            const active = days.includes(d);
            return (
              <button
                key={d}
                onClick={() => setDays(active ? days.filter((x) => x !== d) : [...days, d])}
                className={cn(
                  "press rounded-2xl border py-2.5 text-xs font-semibold",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-elevated text-muted-foreground",
                )}
              >
                {DAY_LABELS[d]}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="text-sm">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">New targets</p>
        <p className="mt-2 font-semibold">
          {preview.calories} kcal · {preview.protein}g protein · {preview.carbs}g carbs · {preview.fat}g fat
        </p>
      </Card>

      <button
        onClick={save}
        disabled={saving}
        className="press energy-bg w-full rounded-full py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>

      <SectionTitle>Trainer</SectionTitle>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {TRAINERS.map((t) => (
          <button
            key={t.id}
            onClick={() => chooseTrainer(t.id)}
            className={cn(
              "press w-20 shrink-0 space-y-1.5 rounded-2xl border p-1.5",
              t.id === trainer.id ? "border-primary bg-primary/10" : "border-border bg-card",
            )}
          >
            <img
              src={t.image}
              alt={t.name}
              width={68}
              height={68}
              loading="lazy"
              className="h-16 w-full rounded-xl object-cover"
            />
            <span className="block text-[11px] font-semibold">{t.name}</span>
          </button>
        ))}
      </div>
      <Link
        to="/trainer"
        className="press flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-xs font-semibold"
      >
        <MessageCircle className="h-3.5 w-3.5" /> Talk to {trainer.name}
      </Link>

      <SectionTitle>Appearance</SectionTitle>
      <Card className="space-y-3">
        <Field label="Theme">
          <Segmented
            value={theme}
            onChange={(v) => setTheme(v as "dark" | "light")}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
        </Field>
        <Field label="Accent colour">
          <div className="grid grid-cols-4 gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                className={cn(
                  "press flex flex-col items-center gap-1.5 rounded-2xl border py-2.5",
                  accent === a.id ? "border-primary bg-primary/10" : "border-border bg-elevated",
                )}
                aria-label={a.label}
              >
                <span
                  className="grid h-6 w-6 place-items-center rounded-full"
                  style={{ backgroundColor: a.swatch }}
                >
                  {accent === a.id ? <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} /> : null}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </Field>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Palette className="h-3 w-3" /> Contrast is tuned automatically to keep text readable.
        </p>
      </Card>

      <SectionTitle>Keypass & recovery</SectionTitle>
      <Card className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Your Keypass is the only way back to your data. Keep it somewhere safe.
        </p>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-elevated p-3">
          <span className="font-mono text-lg tracking-[0.2em]">
            {revealed ? keypass : "•••••••••••"}
          </span>
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => setRevealed((r) => !r)}
              className="press rounded-xl bg-background px-3 py-2 text-[11px] font-semibold"
            >
              {revealed ? "Hide" : "Show"}
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(keypass);
                toast.success("Keypass copied");
              }}
              className="press grid h-9 w-9 place-items-center rounded-xl bg-background"
              aria-label="Copy Keypass"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          onClick={signOut}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-xs font-semibold text-muted-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out / switch Keypass
        </button>
      </Card>

      <SectionTitle>About</SectionTitle>
      <Card className="mb-4 space-y-2 text-sm">
        <p className="font-bold">NutriFit : Train. Eat. Improve</p>
        <p className="text-muted-foreground">Version 1.0</p>
        <p className="text-muted-foreground">
          A simple fitness app to track your food, calories, nutrients, workouts, and progress in
          daily life.
        </p>
        <p className="text-muted-foreground">Created by Sumeeth Ashok Melkera</p>
      </Card>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-2xl bg-elevated p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "press flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors",
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ active, onClick, title }: { active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "press flex w-full items-center justify-between gap-2 rounded-2xl border px-3.5 py-3 text-left text-sm",
        active ? "border-primary bg-primary/10" : "border-border bg-elevated",
      )}
    >
      <span className="min-w-0 truncate">{title}</span>
      {active ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
    </button>
  );
}
