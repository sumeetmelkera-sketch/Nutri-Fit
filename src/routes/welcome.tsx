import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/components/nf/Shell";
import { createProfile, restoreProfile } from "@/lib/nutrifit.functions";
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
import { TRAINERS } from "@/lib/nf/trainers";
import { useNutriFit } from "@/lib/nf/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Get Started — NutriFit" },
      {
        name: "description",
        content:
          "Set up your NutriFit profile in under a minute and get personalised calorie, protein and training targets.",
      },
      { property: "og:title", content: "Get Started — NutriFit" },
      {
        property: "og:description",
        content: "Create your NutriFit profile and get your private Keypass.",
      },
    ],
  }),
  component: Welcome,
});

type Draft = {
  name: string;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity: Activity;
  goal: Goal;
  experience: Experience;
  workout_days: DayKey[];
  trainer_id: string;
};

const DEFAULT: Draft = {
  name: "",
  age: 25,
  gender: "male",
  height_cm: 172,
  weight_kg: 70,
  activity: "moderate",
  goal: "gain",
  experience: "beginner",
  workout_days: ["mon", "wed", "fri"],
  trainer_id: "aria",
};

function Welcome() {
  const [mode, setMode] = useState<"intro" | "setup" | "restore" | "done">("intro");
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(DEFAULT);
  const [keypass, setKeypass] = useState("");
  const [restoreValue, setRestoreValue] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn } = useNutriFit();
  const navigate = useNavigate();

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  async function submit() {
    setBusy(true);
    try {
      const res = await createProfile({ data: { ...draft } });
      setKeypass(res.keypass);
      signIn(res.keypass);
      setMode("done");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    setBusy(true);
    try {
      const res = await restoreProfile({ data: { keypass: restoreValue } });
      signIn(res.keypass);
      toast.success(`Welcome back, ${res.profile.name}`);
      navigate({ to: "/" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (mode === "intro") {
    return (
      <Frame>
        <div className="rise flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Brand size={104} />
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              NUTRI<span className="energy-text">FIT</span>
            </h1>
            <p className="mt-2 text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Train. Eat. Improve.
            </p>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Your personal trainer, nutrition coach and progress tracker — in one place. No email, no
            password. Just a private Keypass.
          </p>
        </div>
        <div className="space-y-3 pb-2">
          <PrimaryButton onClick={() => setMode("setup")}>Create my profile</PrimaryButton>
          <button
            onClick={() => setMode("restore")}
            className="press w-full rounded-full border border-border py-3.5 text-sm font-semibold"
          >
            I have a Keypass
          </button>
        </div>
      </Frame>
    );
  }

  if (mode === "restore") {
    return (
      <Frame>
        <button
          onClick={() => setMode("intro")}
          className="press flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="rise flex flex-1 flex-col justify-center gap-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-elevated">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Restore your data</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the 11-character Keypass you saved when you created your profile.
            </p>
          </div>
          <input
            value={restoreValue}
            onChange={(e) => setRestoreValue(e.target.value.toUpperCase())}
            placeholder="A7K4M92P1XZ"
            maxLength={11}
            autoCapitalize="characters"
            className="w-full rounded-2xl border border-border bg-elevated px-4 py-4 text-center font-mono text-xl tracking-[0.25em] outline-none focus:border-primary"
          />
          <PrimaryButton disabled={restoreValue.length !== 11 || busy} onClick={restore}>
            {busy ? "Checking…" : "Restore data"}
          </PrimaryButton>
        </div>
      </Frame>
    );
  }

  if (mode === "done") {
    return (
      <Frame>
        <div className="pop flex flex-1 flex-col justify-center gap-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-elevated">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">This is your Keypass</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              It is the only way back to your data. Save it somewhere safe — we cannot recover it
              for you.
            </p>
          </div>
          <div className="surface flex items-center justify-between gap-3 p-4">
            <span className="font-mono text-xl tracking-[0.2em]">{keypass}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(keypass);
                toast.success("Keypass copied");
              }}
              className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-elevated"
              aria-label="Copy Keypass"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <PrimaryButton onClick={() => navigate({ to: "/" })}>
            I've saved it — continue
          </PrimaryButton>
        </div>
      </Frame>
    );
  }

  const steps = [
    {
      title: "What should we call you?",
      valid: draft.name.trim().length > 1,
      body: (
        <div className="space-y-4">
          <Field label="Name">
            <input
              value={draft.name}
              onChange={(e) => set("name", e.target.value.slice(0, 40))}
              placeholder="Your name"
              className="input-nf"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <input
                type="number"
                value={draft.age}
                onChange={(e) => set("age", Math.min(100, Math.max(13, +e.target.value || 0)))}
                className="input-nf"
              />
            </Field>
            <Field label="Gender">
              <Segmented
                value={draft.gender}
                onChange={(v) => set("gender", v as Gender)}
                options={[
                  { value: "male", label: "M" },
                  { value: "female", label: "F" },
                  { value: "other", label: "Other" },
                ]}
              />
            </Field>
          </div>
        </div>
      ),
    },
    {
      title: "Your body stats",
      valid: draft.height_cm > 100 && draft.weight_kg > 30,
      body: (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (cm)">
            <input
              type="number"
              value={draft.height_cm}
              onChange={(e) => set("height_cm", +e.target.value || 0)}
              className="input-nf"
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              type="number"
              value={draft.weight_kg}
              onChange={(e) => set("weight_kg", +e.target.value || 0)}
              className="input-nf"
            />
          </Field>
        </div>
      ),
    },
    {
      title: "How active are you?",
      valid: true,
      body: (
        <div className="space-y-2">
          {(Object.keys(ACTIVITY_LABELS) as Activity[]).map((a) => (
            <Choice
              key={a}
              active={draft.activity === a}
              onClick={() => set("activity", a)}
              title={ACTIVITY_LABELS[a].split(" — ")[0]!}
              detail={ACTIVITY_LABELS[a].split(" — ")[1]!}
            />
          ))}
        </div>
      ),
    },
    {
      title: "What's the goal?",
      valid: true,
      body: (
        <div className="space-y-2">
          {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
            <Choice
              key={g}
              active={draft.goal === g}
              onClick={() => set("goal", g)}
              title={GOAL_LABELS[g]}
              detail={
                g === "lose"
                  ? "Moderate deficit, high protein"
                  : g === "gain"
                    ? "Small surplus, progressive overload"
                    : "Maintenance calories, steady training"
              }
            />
          ))}
        </div>
      ),
    },
    {
      title: "Training experience",
      valid: true,
      body: (
        <div className="space-y-2">
          {(["beginner", "intermediate", "advanced"] as Experience[]).map((x) => (
            <Choice
              key={x}
              active={draft.experience === x}
              onClick={() => set("experience", x)}
              title={x[0]!.toUpperCase() + x.slice(1)}
              detail={
                x === "beginner"
                  ? "Under a year of consistent lifting"
                  : x === "intermediate"
                    ? "1-3 years, comfortable with form"
                    : "3+ years, structured programming"
              }
            />
          ))}
        </div>
      ),
    },
    {
      title: "Which days will you train?",
      valid: draft.workout_days.length > 0,
      body: (
        <div className="grid grid-cols-4 gap-2">
          {DAY_KEYS.map((d) => {
            const active = draft.workout_days.includes(d);
            return (
              <button
                key={d}
                onClick={() =>
                  set(
                    "workout_days",
                    active ? draft.workout_days.filter((x) => x !== d) : [...draft.workout_days, d],
                  )
                }
                className={cn(
                  "press rounded-2xl border py-3 text-sm font-semibold",
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
      ),
    },
    {
      title: "Pick your trainer",
      valid: true,
      body: (
        <div className="space-y-2">
          {TRAINERS.map((t) => (
            <button
              key={t.id}
              onClick={() => set("trainer_id", t.id)}
              className={cn(
                "press flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
                draft.trainer_id === t.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-elevated",
              )}
            >
              <img
                src={t.image}
                alt={t.name}
                width={52}
                height={52}
                loading="lazy"
                className="h-13 w-13 shrink-0 rounded-xl object-cover"
                style={{ width: 52, height: 52 }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {t.name} · <span className="text-muted-foreground">{t.style}</span>
                </span>
                <span className="block text-xs text-muted-foreground">{t.personality}</span>
              </span>
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step]!;
  const preview = computeTargets(draft);

  return (
    <Frame>
      <div className="flex items-center gap-3 pb-4">
        <button
          onClick={() => (step === 0 ? setMode("intro") : setStep(step - 1))}
          className="press grid h-9 w-9 place-items-center rounded-xl bg-elevated"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
          <div
            className="energy-bg h-full rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {step + 1}/{steps.length}
        </span>
      </div>

      <div key={step} className="rise flex-1 space-y-5 overflow-y-auto">
        <h2 className="text-2xl font-bold tracking-tight">{current.title}</h2>
        {current.body}
        {step === steps.length - 1 ? (
          <div className="surface p-4 text-sm">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Your estimated targets
            </p>
            <p className="mt-2 font-semibold">
              {preview.calories} kcal · {preview.protein}g protein · {preview.carbs}g carbs ·{" "}
              {preview.fat}g fat
            </p>
          </div>
        ) : null}
      </div>

      <div className="pt-3">
        <PrimaryButton
          disabled={!current.valid || busy}
          onClick={() => (step === steps.length - 1 ? submit() : setStep(step + 1))}
        >
          {step === steps.length - 1 ? (busy ? "Creating…" : "Create profile") : "Continue"}
          {step === steps.length - 1 ? (
            <Check className="ml-1 inline h-4 w-4" />
          ) : (
            <ArrowRight className="ml-1 inline h-4 w-4" />
          )}
        </PrimaryButton>
      </div>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">{children}</div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="press energy-bg w-full rounded-full py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
    >
      {children}
    </button>
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

function Choice({
  active,
  onClick,
  title,
  detail,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  detail?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "press w-full rounded-2xl border p-3.5 text-left",
        active ? "border-primary bg-primary/10" : "border-border bg-elevated",
      )}
    >
      <span className="block text-sm font-semibold">{title}</span>
      {detail ? <span className="block text-xs text-muted-foreground">{detail}</span> : null}
    </button>
  );
}
