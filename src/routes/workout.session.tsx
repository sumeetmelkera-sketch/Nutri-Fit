import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, Pause, Play, Timer, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { Card, Screen } from "@/components/nf/Shell";
import { finishWorkout } from "@/lib/nutrifit.functions";
import { useNutriFit } from "@/lib/nf/store";
import { getTrainer } from "@/lib/nf/trainers";
import {
  DAY_LABELS,
  dayKeyOf,
  todayISO,
  type DayKey,
  type SessionEntry,
} from "@/lib/nf/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workout/session")({
  validateSearch: (s: Record<string, unknown>): { day?: DayKey } =>
    s["day"] ? { day: s["day"] as DayKey } : {},
  head: () => ({
    meta: [
      { title: "Active Workout — NutriFit" },
      {
        name: "description",
        content:
          "Run your session set by set with a rest timer, previous performance and automatic personal best detection.",
      },
      { property: "og:title", content: "Active Workout — NutriFit" },
      { property: "og:description", content: "Match it or beat it." },
    ],
  }),
  component: SessionRoute,
});

function SessionRoute() {
  return (
    <Screen title="Session" header={false}>
      <SessionBody />
    </Screen>
  );
}

type LiveSet = { weight: number; reps: number; done: boolean };
type LiveEntry = { name: string; muscle: string; sets: LiveSet[]; rest: number };

function SessionBody() {
  const { state, keypass, refresh } = useNutriFit();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LiveEntry[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rest, setRest] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState<{ prs: string[]; unlocked: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const startedAt = useRef(Date.now());

  const dayKey = (search.day ?? dayKeyOf(todayISO())) as DayKey;
  const planDay = state?.plan?.[dayKey];

  useEffect(() => {
    if (!planDay || entries) return;
    setEntries(
      planDay.exercises.map((e) => ({
        name: e.name,
        muscle: e.muscle,
        rest: e.rest || 90,
        sets: Array.from({ length: Math.max(1, e.sets) }, () => ({
          weight: e.weight,
          reps: e.reps,
          done: false,
        })),
      })),
    );
  }, [planDay, entries]);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!restRunning) return;
    const id = setInterval(() => {
      setRest((r) => {
        if (r <= 1) {
          setRestRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [restRunning]);

  const previous = useMemo(() => {
    const map = new Map<string, { weight: number; reps: number }>();
    for (const s of state?.sessions ?? []) {
      for (const e of s.entries ?? []) {
        if (map.has(e.name)) continue;
        const best = [...e.sets].sort((a, b) => b.weight * b.reps - a.weight * a.reps)[0];
        if (best) map.set(e.name, { weight: best.weight, reps: best.reps });
      }
    }
    return map;
  }, [state?.sessions]);

  if (!state || !keypass) return null;
  const trainer = getTrainer(state.profile.trainer_id);

  if (!planDay || !planDay.exercises.length) {
    return (
      <div className="space-y-4 pt-6">
        <Card className="space-y-3 text-center">
          <p className="text-lg font-bold">Nothing scheduled for {DAY_LABELS[dayKey]}</p>
          <p className="text-sm text-muted-foreground">
            Build a plan for this day first, then start your session.
          </p>
          <button
            onClick={() => navigate({ to: "/workout" })}
            className="press energy-bg w-full rounded-full py-3 text-sm font-bold text-primary-foreground"
          >
            Go to plan
          </button>
        </Card>
      </div>
    );
  }

  if (!entries) return null;
  const entry = entries[index]!;
  const prev = previous.get(entry.name);
  const completedSets = entries.reduce((s, e) => s + e.sets.filter((x) => x.done).length, 0);
  const totalSets = entries.reduce((s, e) => s + e.sets.length, 0);

  function updateSet(setIdx: number, patch: Partial<LiveSet>) {
    setEntries((list) =>
      (list ?? []).map((e, i) =>
        i === index ? { ...e, sets: e.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) } : e,
      ),
    );
  }

  function completeSet(setIdx: number) {
    updateSet(setIdx, { done: true });
    setRest(entry.rest);
    setRestRunning(true);
    const remaining = entry.sets.filter((s, j) => !s.done && j !== setIdx).length;
    if (remaining === 0 && index < entries!.length - 1) {
      setTimeout(() => setIndex((i) => Math.min(i + 1, entries!.length - 1)), 450);
    }
  }

  async function finish() {
    setSaving(true);
    try {
      const payload: SessionEntry[] = entries!.map((e) => ({
        name: e.name,
        muscle: e.muscle,
        sets: e.sets.map((s) => ({ weight: s.weight, reps: s.reps, done: s.done })),
      }));
      if (!payload.some((e) => e.sets.some((s) => s.done))) {
        toast.error("Complete at least one set first");
        setSaving(false);
        return;
      }
      const res = await finishWorkout({
        data: {
          keypass: keypass!,
          day_key: dayKey,
          title: planDay!.title || "Workout",
          duration_sec: elapsed,
          entries: payload,
        },
      });
      await refresh();
      setDone({ prs: res.newPRs.map((p) => `${p.exercise} ${p.weight}kg × ${p.reps}`), unlocked: res.unlocked });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[80vh] flex-col justify-center gap-5 pt-6">
        <div className="pop flex flex-col items-center gap-4 text-center">
          <div className="energy-bg grid h-20 w-20 place-items-center rounded-3xl">
            <Check className="h-9 w-9 text-primary-foreground" strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Workout complete</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {completedSets} sets · {Math.round(elapsed / 60)} min
            </p>
          </div>
        </div>

        {done.prs.length ? (
          <Card className="pop space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold text-primary">
              <Trophy className="h-4 w-4" /> New personal best
            </p>
            {done.prs.map((p) => (
              <p key={p} className="text-sm">
                {p}
              </p>
            ))}
          </Card>
        ) : null}

        <Card className="flex items-start gap-3">
          <img src={trainer.image} alt={trainer.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
          <p className="text-sm">
            {done.prs.length
              ? "That's a new best. Log it, eat well, and repeat next week."
              : "Solid work. Get your protein in and recover well."}
          </p>
        </Card>

        <button
          onClick={() => navigate({ to: "/" })}
          className="press energy-bg w-full rounded-full py-3.5 text-sm font-bold text-primary-foreground"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-5">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => navigate({ to: "/workout" })} className="press grid h-9 w-9 place-items-center rounded-xl bg-elevated" aria-label="Back">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{planDay.title || "Workout"}</p>
          <p className="text-[11px] text-muted-foreground">
            {completedSets}/{totalSets} sets · {formatTime(elapsed)}
          </p>
        </div>
        <button onClick={finish} disabled={saving} className="press rounded-full border border-border px-3.5 py-2 text-xs font-semibold">
          Finish
        </button>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
        <div
          className="energy-bg h-full rounded-full transition-all duration-500"
          style={{ width: `${totalSets ? (completedSets / totalSets) * 100 : 0}%` }}
        />
      </div>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
        {entries.map((e, i) => (
          <button
            key={e.name + i}
            onClick={() => setIndex(i)}
            className={cn(
              "press shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold",
              i === index ? "energy-bg text-primary-foreground" : "bg-elevated text-muted-foreground",
              e.sets.every((s) => s.done) && i !== index && "text-primary",
            )}
          >
            {e.name}
          </button>
        ))}
      </div>

      <Card key={entry.name} className="space-y-4">
        <div>
          <p className="text-xl font-bold">{entry.name}</p>
          <p className="text-xs text-muted-foreground">{entry.muscle}</p>
        </div>

        <div className="rounded-2xl bg-elevated p-3 text-xs">
          {prev ? (
            <>
              <p className="text-muted-foreground">
                Previous: <span className="font-semibold text-foreground">{prev.weight} kg × {prev.reps}</span>
              </p>
              <p className="mt-1 text-muted-foreground">
                {trainer.name}: "Try to match or beat your last workout."
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              {trainer.name}: "First time logging this one — set your baseline."
            </p>
          )}
        </div>

        <div className="space-y-2">
          {entry.sets.map((s, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 rounded-2xl border p-2",
                s.done ? "border-primary/40 bg-primary/10" : "border-border bg-elevated",
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-background text-xs font-bold">
                {i + 1}
              </span>
              <NumberField
                value={s.weight}
                onChange={(v) => updateSet(i, { weight: v })}
                suffix="kg"
                disabled={s.done}
              />
              <NumberField
                value={s.reps}
                onChange={(v) => updateSet(i, { reps: v })}
                suffix="reps"
                disabled={s.done}
              />
              <button
                onClick={() => (s.done ? updateSet(i, { done: false }) : completeSet(i))}
                className={cn(
                  "press grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                  s.done ? "energy-bg text-primary-foreground" : "bg-background text-muted-foreground",
                )}
                aria-label={s.done ? "Undo set" : "Complete set"}
              >
                {s.done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Check className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() =>
            setEntries((list) =>
              (list ?? []).map((e, i) =>
                i === index
                  ? {
                      ...e,
                      sets: [
                        ...e.sets,
                        { ...(e.sets[e.sets.length - 1] ?? { weight: 0, reps: 10 }), done: false },
                      ],
                    }
                  : e,
              ),
            )
          }
          className="press w-full rounded-2xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground"
        >
          Add set
        </button>
      </Card>

      {rest > 0 || restRunning ? (
        <Card className="pop flex items-center gap-3">
          <Timer className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Rest</p>
            <p className="text-2xl font-bold tabular-nums">{formatTime(rest)}</p>
          </div>
          <button onClick={() => setRestRunning((r) => !r)} className="press grid h-10 w-10 place-items-center rounded-xl bg-elevated" aria-label="Toggle rest timer">
            {restRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              setRest(0);
              setRestRunning(false);
            }}
            className="press grid h-10 w-10 place-items-center rounded-xl bg-elevated"
            aria-label="Skip rest"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      ) : null}

      <button
        onClick={finish}
        disabled={saving}
        className="press energy-bg mb-4 w-full rounded-full py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
      >
        {saving ? "Saving…" : "Finish workout"}
      </button>
    </div>
  );
}

function NumberField({
  value,
  onChange,
  suffix,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex min-w-0 flex-1 items-baseline gap-1 rounded-xl bg-background px-2.5 py-2">
      <input
        type="number"
        inputMode="decimal"
        value={String(value)}
        disabled={disabled}
        onChange={(e) => onChange(Math.max(0, +e.target.value || 0))}
        className="w-full min-w-0 bg-transparent text-base font-bold outline-none disabled:opacity-70"
      />
      <span className="shrink-0 text-[10px] text-muted-foreground">{suffix}</span>
    </label>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
