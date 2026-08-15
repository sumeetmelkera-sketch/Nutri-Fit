import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, History, Pencil, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Card, Screen, SectionTitle } from "@/components/nf/Shell";
import { Bar, Ring } from "@/components/nf/Ring";
import { analyzeMeal, deleteMeal, saveMeal, updateMeal } from "@/lib/nutrifit.functions";
import { useMealsFor, useNutriFit } from "@/lib/nf/store";
import { EMPTY_NUTRITION, type Meal, type MealType, type Nutrition } from "@/lib/nf/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition — NutriFit" },
      {
        name: "description",
        content:
          "Type what you ate and get estimated calories, protein, carbs, fat, fiber and micronutrients against your daily targets.",
      },
      { property: "og:title", content: "Nutrition — NutriFit" },
      { property: "og:description", content: "Describe your meal, we estimate the numbers." },
    ],
  }),
  component: () => (
    <Screen title="Nutrition" subtitle="Type it. We estimate it.">
      <NutritionBody />
    </Screen>
  ),
});

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

function NutritionBody() {
  const { state, keypass, refresh } = useNutriFit();
  const { meals, totals } = useMealsFor();
  const [text, setText] = useState("");
  const [mealType, setMealType] = useState<MealType>(guessMealType());
  const [draft, setDraft] = useState<Nutrition | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);

  const recent = useMemo(() => {
    const seen = new Set<string>();
    const list: Meal[] = [];
    for (const m of state?.meals ?? []) {
      const k = m.description.toLowerCase().trim();
      if (seen.has(k)) continue;
      seen.add(k);
      list.push(m);
      if (list.length >= 6) break;
    }
    return list;
  }, [state?.meals]);

  if (!state || !keypass) return null;
  const t = state.profile.targets;

  async function analyze(value?: string) {
    const input = (value ?? text).trim();
    if (input.length < 2) return;
    setText(input);
    setBusy(true);
    try {
      const n = await analyzeMeal({ data: { keypass: keypass!, text: input } });
      setDraft(n as Nutrition);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function commit() {
    if (!draft) return;
    setBusy(true);
    try {
      const res = await saveMeal({
        data: { keypass: keypass!, meal_type: mealType, description: text, nutrition: draft },
      });
      setDraft(null);
      setText("");
      await refresh();
      if (res.unlocked?.includes("nutrition_goal")) toast.success("Achievement: Nutrition Goal");
      else toast.success("Meal saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await deleteMeal({ data: { keypass: keypass!, id } });
    await refresh();
    toast.success("Meal deleted");
  }

  return (
    <>
      <Card className="flex items-center gap-4">
        <Ring value={totals.calories} max={t.calories} size={112} />
        <div className="min-w-0 flex-1 space-y-2.5">
          <Macro label="Protein" v={totals.protein} m={t.protein} tone="lime" />
          <Macro label="Carbs" v={totals.carbs} m={t.carbs} tone="amber" />
          <Macro label="Fat" v={totals.fat} m={t.fat} tone="ember" />
          <Macro label="Fiber" v={totals.fiber} m={t.fiber} tone="lime" />
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Mini label="Sugar" value={`${Math.round(totals.sugar)}g`} />
        <Mini label="Sat. fat" value={`${Math.round(totals.satFat)}g`} />
        <Mini label="Sodium" value={`${Math.round(totals.sodium)}mg`} />
      </div>

      <SectionTitle>Log a meal</SectionTitle>
      <Card className="space-y-3">
        <div className="flex gap-1 rounded-2xl bg-elevated p-1">
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              onClick={() => setMealType(m)}
              className={cn(
                "press flex-1 rounded-xl py-2 text-[11px] font-semibold capitalize transition-colors",
                mealType === m ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 400))}
          rows={2}
          placeholder="e.g. 2 eggs, 2 rotis and 1 banana"
          className="input-nf resize-none"
        />
        <button
          onClick={() => analyze()}
          disabled={busy || text.trim().length < 2}
          className="press energy-bg flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4" />
          {busy && !draft ? "Analyzing…" : "Analyze meal"}
        </button>

        {recent.length ? (
          <div className="space-y-2 pt-1">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
              <History className="h-3 w-3" /> Reuse recent
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recent.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setText(m.description);
                    setDraft(m.nutrition);
                    setMealType(m.meal_type);
                  }}
                  className="press max-w-full truncate rounded-full bg-elevated px-3 py-1.5 text-[11px] text-muted-foreground"
                >
                  {m.description}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      {draft ? (
        <Card className="pop space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Estimated nutrition</p>
            <button onClick={() => setDraft(null)} className="press text-muted-foreground" aria-label="Discard">
              <X className="h-4 w-4" />
            </button>
          </div>
          <NutritionEditor value={draft} onChange={setDraft} />
          {draft.micros?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {draft.micros.map((mi) => (
                <span key={mi.name} className="rounded-full bg-elevated px-2.5 py-1 text-[11px] text-muted-foreground">
                  {mi.name} {mi.amount}
                </span>
              ))}
            </div>
          ) : null}
          <p className="text-[11px] leading-snug text-muted-foreground">
            Estimates only — portions, brands and recipes vary. Edit any value before saving.
          </p>
          <button
            onClick={commit}
            disabled={busy}
            className="press energy-bg w-full rounded-full py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            {busy ? "Saving…" : `Save to ${mealType}`}
          </button>
        </Card>
      ) : null}

      <SectionTitle>Today's meals</SectionTitle>
      {meals.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">Nothing logged yet today.</p>
        </Card>
      ) : (
        <div className="space-y-3 pb-4">
          {MEAL_TYPES.filter((mt) => meals.some((m) => m.meal_type === mt)).map((mt) => (
            <Card key={mt} className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">{mt}</p>
              {meals
                .filter((m) => m.meal_type === mt)
                .map((m) => (
                  <div key={m.id} className="flex items-start justify-between gap-3 border-t border-border pt-2 first:border-0 first:pt-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{m.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(m.nutrition.calories)} kcal • {Math.round(m.nutrition.protein)}g Protein •{" "}
                        {Math.round(m.nutrition.carbs)}g Carbohydrates • {Math.round(m.nutrition.fat)}g Fat
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => setEditing(m)} className="press grid h-8 w-8 place-items-center rounded-lg bg-elevated" aria-label="Edit meal">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => remove(m.id)} className="press grid h-8 w-8 place-items-center rounded-lg bg-elevated text-destructive" aria-label="Delete meal">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </Card>
          ))}
        </div>
      )}

      {editing ? (
        <EditSheet
          meal={editing}
          onClose={() => setEditing(null)}
          onSave={async (nutrition, meal_type) => {
            await updateMeal({ data: { keypass: keypass!, id: editing.id, nutrition, meal_type } });
            await refresh();
            setEditing(null);
            toast.success("Meal updated");
          }}
        />
      ) : null}
    </>
  );
}

function EditSheet({
  meal,
  onClose,
  onSave,
}: {
  meal: Meal;
  onClose: () => void;
  onSave: (n: Nutrition, type: MealType) => Promise<void>;
}) {
  const [value, setValue] = useState<Nutrition>({ ...EMPTY_NUTRITION, ...meal.nutrition });
  const [type, setType] = useState<MealType>(meal.meal_type);
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="rise max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="truncate text-sm font-bold">{meal.description}</p>
          <button onClick={onClose} className="press text-muted-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-4 flex gap-1 rounded-2xl bg-elevated p-1">
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              onClick={() => setType(m)}
              className={cn(
                "press flex-1 rounded-xl py-2 text-[11px] font-semibold capitalize",
                type === m ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <NutritionEditor value={value} onChange={setValue} />
        <button
          onClick={async () => {
            setBusy(true);
            await onSave(value, type);
            setBusy(false);
          }}
          disabled={busy}
          className="press energy-bg mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground"
        >
          <Check className="h-4 w-4" /> Save changes
        </button>
      </div>
    </div>
  );
}

const FIELDS: { key: keyof Nutrition; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
  { key: "sugar", label: "Sugar", unit: "g" },
  { key: "satFat", label: "Sat. fat", unit: "g" },
  { key: "sodium", label: "Sodium", unit: "mg" },
];

function NutritionEditor({
  value,
  onChange,
}: {
  value: Nutrition;
  onChange: (n: Nutrition) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FIELDS.map((f) => (
        <label key={f.key} className="rounded-2xl bg-elevated px-3 py-2">
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
            {f.label} ({f.unit})
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={String(value[f.key] ?? 0)}
            onChange={(e) => onChange({ ...value, [f.key]: Math.max(0, +e.target.value || 0) })}
            className="w-full bg-transparent text-base font-semibold outline-none"
          />
        </label>
      ))}
    </div>
  );
}

function Macro({ label, v, m, tone }: { label: string; v: number; m: number; tone: "lime" | "amber" | "ember" }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          {Math.round(v)}
          <span className="text-muted-foreground">/{Math.round(m)}g</span>
        </span>
      </div>
      <Bar value={v} max={m} tone={tone} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-base font-bold">{value}</p>
    </Card>
  );
}

function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 19) return "snack";
  return "dinner";
}
