import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Play, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Card, Screen, SectionTitle } from "@/components/nf/Shell";
import { savePlan } from "@/lib/nutrifit.functions";
import { useNutriFit } from "@/lib/nf/store";
import { EQUIPMENT_LABELS, EXERCISE_LIBRARY, MUSCLES, exerciseMode, type ExerciseMode, type Muscle } from "@/lib/nf/exercises";
import {
  DAY_KEYS,
  DAY_LABELS,
  dayKeyOf,
  todayISO,
  type DayKey,
  type Plan,
  type PlanExercise,
} from "@/lib/nf/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workout/")({
  head: () => ({
    meta: [
      { title: "Workout Plan — NutriFit" },
      {
        name: "description",
        content:
          "Build your weekly training split, pick exercises from the library and set sets, reps, weight and rest.",
      },
      { property: "og:title", content: "Workout Plan — NutriFit" },
      { property: "og:description", content: "Your week, your split, your progression." },
    ],
  }),
  component: () => (
    <Screen title="Workout" subtitle="Your weekly plan">
      <PlanBody />
    </Screen>
  ),
});

function PlanBody() {
  const { state, keypass, refresh } = useNutriFit();
  const [day, setDay] = useState<DayKey>(dayKeyOf(todayISO()));
  const [plan, setPlan] = useState<Plan>({});
  const [picker, setPicker] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (state?.plan) setPlan(state.plan);
  }, [state?.plan]);

  if (!state || !keypass) return null;
  const current = plan[day] ?? { title: "", exercises: [] };

  function mutate(next: Plan) {
    setPlan(next);
    setDirty(true);
  }

  function setDayValue(value: { title: string; exercises: PlanExercise[] }) {
    mutate({ ...plan, [day]: value });
  }

  async function persist() {
    try {
      await savePlan({ data: { keypass: keypass!, days: plan } });
      await refresh();
      setDirty(false);
      toast.success("Plan saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const list = [...current.exercises];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target]!, list[index]!];
    setDayValue({ ...current, exercises: list });
  }

  const totalSets = current.exercises.reduce((s, e) => s + e.sets, 0);

  return (
    <>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {DAY_KEYS.map((d) => {
          const has = (plan[d]?.exercises?.length ?? 0) > 0;
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={cn(
                "press flex w-14 shrink-0 flex-col items-center gap-1 rounded-2xl border py-2.5 text-xs font-semibold",
                d === day ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground",
              )}
            >
              {DAY_LABELS[d]}
              <span className={cn("h-1.5 w-1.5 rounded-full", has ? "energy-bg" : "bg-elevated")} />
            </button>
          );
        })}
      </div>

      <Card className="space-y-3">
        <input
          value={current.title}
          onChange={(e) => setDayValue({ ...current, title: e.target.value.slice(0, 40) })}
          placeholder={`${DAY_LABELS[day]} — e.g. Push Day`}
          className="input-nf"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {current.exercises.length} exercises · {totalSets} sets
          </span>
          {current.exercises.length ? (
            <Link
              to="/workout/session"
              search={{ day }}
              className="press energy-bg flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-primary-foreground"
            >
              <Play className="h-3 w-3" /> Start
            </Link>
          ) : null}
        </div>
      </Card>

      <SectionTitle
        action={
          <button onClick={() => setPicker(true)} className="press flex items-center gap-1 text-xs font-semibold text-primary">
            <Plus className="h-3.5 w-3.5" /> Add exercise
          </button>
        }
      >
        Exercises
      </SectionTitle>

      {current.exercises.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Rest day. Add exercises to train on {DAY_LABELS[day]}.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {current.exercises.map((ex, i) => (
            <Card key={ex.id} delay={i * 40} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{ex.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {ex.muscle} · {(ex.mode ?? exerciseMode(ex.name)) === "time" ? "Timed" : "Reps"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconBtn onClick={() => move(i, -1)} label="Move up">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn onClick={() => move(i, 1)} label="Move down">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    onClick={() =>
                      setDayValue({
                        ...current,
                        exercises: current.exercises.filter((x) => x.id !== ex.id),
                      })
                    }
                    label="Remove"
                    danger
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </div>
              {(() => {
                const mode = ex.mode ?? exerciseMode(ex.name);
                const fields: [keyof PlanExercise, string][] =
                  mode === "time"
                    ? [
                        ["sets", "Sets"],
                        ["seconds", "Seconds"],
                        ["rest", "Rest s"],
                      ]
                    : [
                        ["sets", "Sets"],
                        ["reps", "Reps"],
                        ["weight", "Kg"],
                        ["rest", "Rest s"],
                      ];
                return (
                  <div className={cn("grid gap-2", mode === "time" ? "grid-cols-3" : "grid-cols-4")}>
                    {fields.map(([key, label]) => (
                      <label key={String(key)} className="rounded-xl bg-elevated px-2.5 py-1.5">
                        <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">
                          {label}
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={String(ex[key] ?? (key === "seconds" ? 30 : 0))}
                          onChange={(e) =>
                            setDayValue({
                              ...current,
                              exercises: current.exercises.map((x) =>
                                x.id === ex.id
                                  ? { ...x, [key]: Math.max(0, +e.target.value || 0) }
                                  : x,
                              ),
                            })
                          }
                          className="w-full bg-transparent text-sm font-bold outline-none"
                        />
                      </label>
                    ))}
                  </div>
                );
              })()}

            </Card>
          ))}
        </div>
      )}

      <div className="h-2" />
      {dirty ? (
        <button
          onClick={persist}
          className="press energy-bg sticky bottom-24 mb-4 w-full rounded-full py-3.5 text-sm font-bold text-primary-foreground"
        >
          Save plan
        </button>
      ) : (
        <div className="pb-4" />
      )}

      {picker ? (
        <ExercisePicker
          onClose={() => setPicker(false)}
          onPick={(name, muscle, mode) => {
            setDayValue({
              title: current.title || defaultTitle(muscle),
              exercises: [
                ...current.exercises,
                {
                  id: crypto.randomUUID(),
                  name,
                  muscle,
                  mode,
                  sets: 3,
                  reps: mode === "time" ? 0 : 10,
                  seconds: mode === "time" ? 30 : 0,
                  weight: 0,
                  rest: 90,
                },
              ],
            });
            setPicker(false);
          }}
        />
      ) : null}
    </>
  );
}

function defaultTitle(muscle: string) {
  return `${muscle} Day`;
}

function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "press grid h-8 w-8 place-items-center rounded-lg bg-elevated",
        danger && "text-destructive",
      )}
    >
      {children}
    </button>
  );
}

function ExercisePicker({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (name: string, muscle: Muscle, mode: ExerciseMode) => void;
}) {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<Muscle | "All">("All");
  const list = useMemo(
    () =>
      EXERCISE_LIBRARY.filter(
        (e) =>
          (muscle === "All" || e.muscle === muscle) &&
          e.name.toLowerCase().includes(q.toLowerCase().trim()),
      ),
    [q, muscle],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="rise flex h-[85vh] max-h-[85vh] w-full flex-col rounded-t-3xl border-t border-border bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 space-y-3 px-5 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">Exercise library</p>
          <button onClick={onClose} className="press text-muted-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search exercises"
            className="input-nf pl-10"
          />
        </div>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {(["All", ...MUSCLES] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMuscle(m as Muscle | "All")}
              className={cn(
                "press shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold",
                muscle === m ? "energy-bg text-primary-foreground" : "bg-elevated text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {(["dumbbell", "none"] as const).map((eq) => {
            const group = list.filter((e) => e.equipment === eq);
            if (!group.length) return null;
            return (
              <div key={eq} className="space-y-1.5">
                <p className="sticky top-0 bg-card py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {EQUIPMENT_LABELS[eq]}
                </p>
                {group.map((e) => (
                  <button
                    key={e.name}
                    onClick={() => onPick(e.name, e.muscle, e.mode)}
                    className="press flex w-full items-center justify-between gap-3 rounded-2xl bg-elevated px-4 py-3 text-left"
                  >
                    <span className="min-w-0 truncate text-sm font-medium">{e.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {e.muscle}{e.mode === "time" ? " · timed" : ""}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
          {!list.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No exercises found.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
