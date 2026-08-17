import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Camera, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar as RBar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, Screen, SectionTitle } from "@/components/nf/Shell";
import { AnimatedNumber } from "@/components/nf/Ring";
import { saveMeasurement } from "@/lib/nutrifit.functions";
import { useNutriFit } from "@/lib/nf/store";
import { weeklySummary } from "@/lib/nf/coach";
import { todayISO } from "@/lib/nf/shared";
import { getTrainer } from "@/lib/nf/trainers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — NutriFit" },
      {
        name: "description",
        content:
          "Track body weight, measurements, strength records, workout consistency and nutrition consistency over time.",
      },
      { property: "og:title", content: "Progress — NutriFit" },
      { property: "og:description", content: "See the trend, not just today." },
    ],
  }),
  component: () => (
    <Screen title="Progress" subtitle="The long game">
      <ProgressBody />
    </Screen>
  ),
});

function ProgressBody() {
  const { state, keypass, refresh } = useNutriFit();
  const [open, setOpen] = useState(false);

  const data = useMemo(() => {
    if (!state) return null;
    const last7 = Array.from({ length: 7 }, (_, i) => todayISO(-6 + i));
    const sessionDates = new Set(state.sessions.map((s) => s.log_date));
    const mealDates = new Set(state.meals.map((m) => m.log_date));
    const consistency = last7.map((d) => ({
      day: new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" }),
      trained: sessionDates.has(d) ? 1 : 0,
      logged: mealDates.has(d) ? 1 : 0,
    }));
    const weightSeries = [
      ...state.measurements
        .filter((m) => m.weight_kg)
        .map((m) => ({ date: m.log_date.slice(5), weight: Number(m.weight_kg) })),
    ];
    if (!weightSeries.length)
      weightSeries.push({ date: "start", weight: Number(state.profile.weight_kg) });

    const volumeByWeek = new Map<string, number>();
    for (const s of state.sessions) {
      const d = new Date(s.log_date + "T00:00:00");
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const k = monday.toISOString().slice(5, 10);
      volumeByWeek.set(k, (volumeByWeek.get(k) ?? 0) + Number(s.total_volume));
    }
    const volume = [...volumeByWeek.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([week, kg]) => ({ week, kg: Math.round(kg) }));

    const thisWeek = state.sessions.filter((s) => last7.includes(s.log_date));
    const prevVol = volume.length > 1 ? volume[volume.length - 2]!.kg : 0;
    const curVol = volume.length ? volume[volume.length - 1]!.kg : 0;
    const volumeDelta = prevVol ? ((curVol - prevVol) / prevVol) * 100 : 0;

    return {
      consistency,
      weightSeries,
      volume,
      summary: weeklySummary({
        sessions: thisWeek.map((s) => ({ log_date: s.log_date, total_volume: Number(s.total_volume) })),
        mealDays: last7.filter((d) => mealDates.has(d)).length,
        streak: state.streak,
        volumeDelta,
      }),
      trainedThisWeek: thisWeek.length,
      loggedDays: last7.filter((d) => mealDates.has(d)).length,
    };
  }, [state]);

  if (!state || !keypass || !data) return null;
  const trainer = getTrainer(state.profile.trainer_id);

  return (
    <>
      <Card className="flex items-start gap-3">
        <img src={trainer.image} alt={trainer.name} width={40} height={40} loading="lazy" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Weekly summary</p>
          <p className="mt-1 text-sm leading-relaxed">{data.summary}</p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Stat value={data.trainedThisWeek} label="Sessions / wk" />
        <Stat value={data.loggedDays} label="Food days / wk" />
        <Stat value={state.streak} label="Day streak" />
      </div>

      <SectionTitle
        action={
          <button onClick={() => setOpen(true)} className="press flex items-center gap-1 text-xs font-semibold text-primary">
            <Plus className="h-3.5 w-3.5" /> Log
          </button>
        }
      >
        Body weight
      </SectionTitle>
      <Card className="h-44 pr-3 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.weightSeries}>
            <defs>
              <linearGradient id="nf-w" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--lime)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--lime)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="weight" stroke="var(--lime)" strokeWidth={2.5} fill="url(#nf-w)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle>Training volume (kg lifted / week)</SectionTitle>
      <Card className="h-40 pr-3 pt-4">
        {data.volume.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.volume}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "var(--color-elevated)" }} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <RBar dataKey="kg" fill="var(--amber)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="grid h-full place-items-center text-sm text-muted-foreground">
            Complete a workout to see volume trends.
          </p>
        )}
      </Card>

      <SectionTitle>Consistency (last 7 days)</SectionTitle>
      <Card className="grid grid-cols-7 gap-1.5">
        {data.consistency.map((c, i) => (
          <div key={i} className="space-y-1 text-center">
            <div className={cn("h-8 rounded-lg", c.trained ? "energy-bg" : "bg-elevated")} />
            <div className={cn("h-2 rounded-full", c.logged ? "bg-primary/60" : "bg-elevated")} />
            <span className="text-[10px] text-muted-foreground">{c.day}</span>
          </div>
        ))}
      </Card>

      <SectionTitle>Personal records</SectionTitle>
      <Card className="space-y-2">
        {state.records.length ? (
          state.records
            .slice()
            .sort((a, b) => Number(b.est_1rm) - Number(a.est_1rm))
            .map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 border-t border-border pt-2 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.exercise}</p>
                  <p className="text-[11px] text-muted-foreground">{r.achieved_on}</p>
                </div>
                <p className="shrink-0 text-sm font-bold">
                  {Number(r.weight_kg)} kg × {r.reps}
                </p>
              </div>
            ))
        ) : (
          <p className="text-sm text-muted-foreground">No records yet. Complete a workout to set your baseline.</p>
        )}
      </Card>

      {open ? (
        <LogSheet
          onClose={() => setOpen(false)}
          onSave={async (weight, metrics, photo) => {
            await saveMeasurement({
              data: { keypass: keypass!, weight_kg: weight, metrics, photo_url: photo },
            });
            await refresh();
            setOpen(false);
            toast.success("Progress logged");
          }}
        />
      ) : null}
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Card className="p-3.5">
      <p className="text-xl font-bold">
        <AnimatedNumber value={value} />
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}

function LogSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (w: number | null, m: Record<string, number>, photo: string | null) => Promise<void>;
}) {
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="rise max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4 text-lg font-bold">Log body weight</p>
        <label className="mb-3 block rounded-2xl bg-elevated px-3 py-2">
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">Weight (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-transparent text-lg font-semibold outline-none"
            placeholder="—"
          />
        </label>
        <label className="press mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-xs font-semibold text-muted-foreground">
          <Camera className="h-4 w-4" />
          {photo ? "Photo attached" : "Add progress photo (optional)"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 900_000) {
                toast.error("Please choose an image under 900KB");
                return;
              }
              const reader = new FileReader();
              reader.onload = () => setPhoto(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </label>
        {photo ? (
          <img src={photo} alt="Progress" className="mt-3 h-40 w-full rounded-2xl object-cover" />
        ) : null}

        <button
          onClick={async () => {
            setBusy(true);
            await onSave(weight ? Number(weight) : null, {}, photo);
            setBusy(false);
          }}
          disabled={busy}
          className="press energy-bg mt-4 w-full rounded-full py-3 text-sm font-bold text-primary-foreground"
        >
          {busy ? "Saving…" : "Save entry"}
        </button>
      </div>
    </div>
  );
}
