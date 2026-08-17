import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Card, Screen, SectionTitle } from "@/components/nf/Shell";
import { askTrainer } from "@/lib/nutrifit.functions";
import { useMealsFor, useNutriFit } from "@/lib/nf/store";
import { getTrainer } from "@/lib/nf/trainers";
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
  const { state, keypass } = useNutriFit();
  const { totals } = useMealsFor();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
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

      <p className="pb-6 text-center text-[11px] text-muted-foreground">
        Guidance only — not medical advice.
      </p>

    </>
  );
}
