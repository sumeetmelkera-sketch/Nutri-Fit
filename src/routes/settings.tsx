import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Copy, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, Screen, SectionTitle } from "@/components/nf/Shell";
import { USER_AVATARS } from "@/lib/nf/avatars";
import { ACCENTS, THEMES, useTheme } from "@/lib/nf/theme";
import { TRAINERS } from "@/lib/nf/trainers";
import { useAction, useNutriFit } from "@/lib/nf/store";
import { updateProfile } from "@/lib/nutrifit.functions";
import {
  ACTIVITY_LABELS,
  DAY_KEYS,
  DAY_LABELS,
  GOAL_LABELS,
  type Activity,
  type DayKey,
  type Experience,
  type Gender,
  type Goal,
} from "@/lib/nf/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NutriFit" },
      {
        name: "description",
        content:
          "Manage your NutriFit profile, avatar, AI trainer, appearance and Keypass. Everything stays on this device.",
      },
      { property: "og:title", content: "Settings — NutriFit" },
      { property: "og:description", content: "Profile, trainer, appearance and data controls." },
    ],
  }),
  component: () => (
    <Screen title="Settings" header={false}>
      <SettingsBody />
    </Screen>
  ),
});

const digitsOnly = (v: string) => v.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");

function SettingsBody() {
  const { state, keypass, signOut } = useNutriFit();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const save = useAction(updateProfile);
  const navigate = useNavigate();
  const p = state?.profile;

  const [name, setName] = useState(p?.name ?? "");
  const [age, setAge] = useState(String(p?.age ?? ""));
  const [height, setHeight] = useState(String(p?.height_cm ?? ""));
  const [weight, setWeight] = useState(String(p?.weight_kg ?? ""));

  if (!p) return null;

  const patch = (data: Record<string, unknown>) =>
    save.mutate({ keypass: keypass!, patch: data }, { onSuccess: () => toast.success("Saved") });

  const saveBasics = () =>
    patch({
      name: name.trim().slice(0, 40) || p.name,
      age: Number(age) || p.age,
      height_cm: Number(height) || p.height_cm,
      weight_kg: Number(weight) || p.weight_kg,
    });

  const toggleDay = (d: DayKey) => {
    const next = p.workout_days.includes(d)
      ? p.workout_days.filter((x) => x !== d)
      : [...p.workout_days, d];
    patch({ workout_days: next });
  };

  return (
    <>
      <header className="-mx-5 flex items-center gap-3 px-5 pb-2 pt-1">
        <Link
          to="/me"
          aria-label="Back"
          className="press grid h-10 w-10 place-items-center rounded-full border border-border bg-card"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground">Everything stays on this device</p>
        </div>
      </header>

      {/* Profile */}
      <SectionTitle>Profile</SectionTitle>
      <Card className="space-y-3">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveBasics}
            className="input-nf"
          />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Age">
            <input
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(digitsOnly(e.target.value))}
              onBlur={saveBasics}
              className="input-nf"
            />
          </Field>
          <Field label="Height (cm)">
            <input
              inputMode="numeric"
              value={height}
              onChange={(e) => setHeight(digitsOnly(e.target.value))}
              onBlur={saveBasics}
              className="input-nf"
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              inputMode="numeric"
              value={weight}
              onChange={(e) => setWeight(digitsOnly(e.target.value))}
              onBlur={saveBasics}
              className="input-nf"
            />
          </Field>
        </div>

        <Field label="Gender">
          <Segmented
            value={p.gender}
            options={[
              { id: "male", label: "Male" },
              { id: "female", label: "Female" },
              { id: "other", label: "Other" },
            ]}
            onChange={(v) => patch({ gender: v as Gender })}
          />
        </Field>

        <Field label="Goal">
          <Segmented
            value={p.goal}
            options={(Object.keys(GOAL_LABELS) as Goal[]).map((g) => ({
              id: g,
              label: GOAL_LABELS[g],
            }))}
            onChange={(v) => patch({ goal: v as Goal })}
          />
        </Field>

        <Field label="Activity">
          <div className="grid gap-1.5">
            {(Object.keys(ACTIVITY_LABELS) as Activity[]).map((a) => {
              const [head, sub] = ACTIVITY_LABELS[a].split(" — ");
              const on = p.activity === a;
              return (
                <button
                  key={a}
                  onClick={() => patch({ activity: a })}
                  className={cn(
                    "press flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left",
                    on ? "border-primary bg-primary/10" : "border-border",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold">{head}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">{sub}</span>
                  </span>
                  <span
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 rounded-full border",
                      on ? "energy-bg border-transparent" : "border-border",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Experience">
          <Segmented
            value={p.experience}
            options={[
              { id: "beginner", label: "Beginner" },
              { id: "intermediate", label: "Intermediate" },
              { id: "advanced", label: "Advanced" },
            ]}
            onChange={(v) => patch({ experience: v as Experience })}
          />
        </Field>

        <Field label="Training days">
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_KEYS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={cn(
                  "press rounded-xl border py-2 text-[11px] font-semibold",
                  p.workout_days.includes(d)
                    ? "energy-bg border-transparent text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {DAY_LABELS[d].slice(0, 3)}
              </button>
            ))}
          </div>
        </Field>
      </Card>

      {/* Avatar */}
      <SectionTitle>Your avatar</SectionTitle>
      <Card>
        <div className="grid grid-cols-5 gap-2">
          {USER_AVATARS.map((a) => (
            <button
              key={a.id}
              onClick={() => patch({ avatar_id: a.id })}
              aria-label={a.label}
              className={cn(
                "press overflow-hidden rounded-full border-2",
                p.avatar_id === a.id ? "border-primary" : "border-border",
              )}
            >
              <img src={a.image} alt={a.label} loading="lazy" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      </Card>

      {/* Trainer */}
      <SectionTitle>AI trainer</SectionTitle>
      <Card className="space-y-2">
        {TRAINERS.map((t) => (
          <button
            key={t.id}
            onClick={() => patch({ trainer_id: t.id })}
            className={cn(
              "press flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left",
              p.trainer_id === t.id ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <img
              src={t.image}
              alt={t.name}
              loading="lazy"
              className="h-11 w-11 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="truncate text-xs text-muted-foreground">{t.style}</p>
            </div>
          </button>
        ))}
      </Card>

      {/* Appearance */}
      <SectionTitle>Appearance</SectionTitle>
      <Card className="space-y-3">
        <Field label="Theme">
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "press rounded-xl border py-2.5 text-xs font-semibold",
                  theme === t.id ? "border-primary bg-primary/10" : "border-border",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Accent">
          <div className="flex gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                aria-label={a.label}
                className={cn(
                  "press h-9 w-9 rounded-full border-2",
                  accent === a.id ? "border-foreground" : "border-border",
                )}
                style={{ background: a.swatch }}
              />
            ))}
          </div>
        </Field>
      </Card>

      <button
        onClick={saveBasics}
        className="press energy-bg w-full rounded-full py-3.5 text-sm font-bold text-primary-foreground"
      >
        Save changes
      </button>

      {/* Data */}
      <SectionTitle>Data & Keypass</SectionTitle>
      <Card className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Your Keypass</p>
          <p className="font-mono text-lg font-bold tracking-[0.2em]">{keypass}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Save this. It is the only way to restore your data on another device.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(keypass ?? "");
              toast.success("Keypass copied");
            }}
            className="press flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold"
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
          <button
            onClick={() => {
              signOut();
              navigate({ to: "/welcome" });
            }}
            className="press flex items-center justify-center gap-2 rounded-xl border border-destructive/40 py-2.5 text-xs font-semibold text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </Card>

      {/* About */}
      <SectionTitle>About</SectionTitle>
      <Card className="mb-4 space-y-1 text-sm">
        <p className="font-semibold">NutriFit : Train. Eat. Improve</p>
        <p className="text-xs text-muted-foreground">Version 1.0</p>
        <p className="text-xs text-muted-foreground">
          A simple fitness app to track food, calories, nutrients, workouts, and progress in daily
          life.
        </p>
        <p className="text-xs text-muted-foreground">Created by Sumeeth Ashok Melkera</p>
      </Card>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "press rounded-xl border py-2 text-xs font-semibold",
            value === o.id ? "energy-bg border-transparent text-primary-foreground" : "border-border",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
