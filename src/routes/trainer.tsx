import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LogOut, Send } from "lucide-react";
import { toast } from "sonner";
import { Card, Screen, SectionTitle } from "@/components/nf/Shell";
import { askTrainer, updateProfile } from "@/lib/nutrifit.functions";
import { useMealsFor, useNutriFit } from "@/lib/nf/store";
import { TRAINERS, getTrainer } from "@/lib/nf/trainers";
import { todayISO } from "@/lib/nf/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trainer")({
  head: () => ({
    meta: [
      { title: "Your Trainer — NutriFit" },
      {
        name: "description",
        content:
          "Chat with your NutriFit trainer for guidance on training, nutrition and recovery based on your own logged data.",
      },
      { property: "og:title", content: "Your Trainer — NutriFit" },
      { property: "og:description", content: "Personalised coaching built on your real data." },
    ],
  }),
  component: () => (
    <Screen title="Trainer" subtitle="Guidance from your own data">
      <TrainerBody />
    </Screen>
  ),
});

type Msg = { role: "user" | "assistant"; content: string };

function TrainerBody() {
  const { state, keypass, refresh, signOut } = useNutriFit();
  const { totals } = useMealsFor();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [switching, setSwitching] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  if (!state || !keypass) return null;
  const { profile, sessions, records, streak } = state;
  const trainer = getTrainer(profile.trainer_id);

  const context = [
    `Your name is ${trainer.name}, a ${trainer.style}. Personality: ${trainer.personality}`,
    `Athlete: ${profile.name}, ${profile.age}y ${profile.gender}, ${profile.height_cm}cm, ${profile.weight_kg}kg.`,
    `Goal: ${profile.goal}. Experience: ${profile.experience}. Training days: ${profile.workout_days.join(", ") || "none set"}.`,
    `Daily targets: ${profile.targets.calories} kcal, ${profile.targets.protein}g protein.`,
    `Today so far: ${Math.round(totals.calories)} kcal, ${Math.round(totals.protein)}g protein.`,
    `Sessions logged: ${sessions.length}. Current streak: ${streak} days. PRs: ${records
      .slice(0, 6)
      .map((r) => `${r.exercise} ${r.weight_kg}kg x${r.reps}`)
      .join("; ") || "none yet"}.`,
    `Trained today: ${sessions.some((s) => s.log_date === todayISO()) ? "yes" : "not yet"}.`,
  ].join(" ");

  async function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: value }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await askTrainer({ data: { keypass: keypass!, context, history: next } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e) {
      toast.error((e as Error).message);
      setMessages(next);
    } finally {
      setBusy(false);
    }
  }

  async function chooseTrainer(id: string) {
    setSwitching(true);
    try {
      await updateProfile({ data: { keypass: keypass!, patch: { trainer_id: id } } });
      await refresh();
      setMessages([]);
      toast.success(`${getTrainer(id).name} is now your trainer`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSwitching(false);
    }
  }

  const prompts = [
    "How is my week going?",
    "What should I eat tonight?",
    "Am I getting enough protein?",
    "How do I add weight safely?",
  ];

  return (
    <>
      <Card className="flex items-center gap-3">
        <img
          src={trainer.image}
          alt={trainer.name}
          width={64}
          height={64}
          loading="lazy"
          className="h-16 w-16 rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <p className="text-lg font-bold">{trainer.name}</p>
          <p className="text-xs text-muted-foreground">{trainer.style}</p>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">{trainer.personality}</p>
        </div>
      </Card>

      <SectionTitle>Choose your trainer</SectionTitle>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {TRAINERS.map((t) => (
          <button
            key={t.id}
            disabled={switching}
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

      <SectionTitle>Conversation</SectionTitle>
      <Card className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ask about training, food or recovery — {trainer.name} answers using your logged data.
          </p>
        ) : null}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "rise max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              m.role === "user"
                ? "ml-auto bg-primary/15 text-foreground"
                : "bg-elevated text-foreground",
            )}
          >
            {m.content}
          </div>
        ))}
        {busy ? (
          <div className="w-24 rounded-2xl bg-elevated px-3.5 py-3">
            <div className="sheen h-1.5 rounded-full bg-border" />
          </div>
        ) : null}
        <div ref={endRef} />
      </Card>

      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="press rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="sticky bottom-24 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={`Message ${trainer.name}…`}
          maxLength={400}
          className="input-nf flex-1"
        />
        <button
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
          className="press energy-bg grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-primary-foreground disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <p className="pb-2 text-center text-[11px] text-muted-foreground">
        Guidance only — not medical advice.
      </p>

      <button
        onClick={signOut}
        className="press mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-xs font-semibold text-muted-foreground"
      >
        <LogOut className="h-3.5 w-3.5" /> Sign out / switch Keypass
      </button>
    </>
  );
}
