import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  computeStreak,
  computeTargets,
  epley1rm,
  sumNutrition,
  todayISO,
  type Nutrition,
  type Profile,
  type SessionEntry,
  type Plan,
} from "./shared";

const KEYPASS_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateKeypass() {
  const bytes = new Uint8Array(11);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 11; i++) out += KEYPASS_ALPHABET[bytes[i]! % KEYPASS_ALPHABET.length];
  // Guarantee both letters and digits.
  if (!/[0-9]/.test(out)) out = out.slice(0, 10) + "7";
  if (!/[A-Z]/.test(out)) out = "K" + out.slice(1);
  return out;
}

export function normalizeKeypass(raw: string) {
  return (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
}

export async function requireProfile(keypass: string): Promise<Profile> {
  const kp = normalizeKeypass(keypass);
  if (kp.length !== 11) throw new Error("Invalid Keypass");
  const { data, error } = await supabaseAdmin
    .from("nf_profiles")
    .select("*")
    .eq("keypass", kp)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No NutriFit data found for that Keypass");
  return rowToProfile(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToProfile(r: any): Profile {
  return {
    id: r.id,
    name: r.name,
    age: Number(r.age),
    gender: r.gender,
    height_cm: Number(r.height_cm),
    weight_kg: Number(r.weight_kg),
    activity: r.activity,
    goal: r.goal,
    experience: r.experience,
    workout_days: r.workout_days ?? [],
    trainer_id: r.trainer_id,
    targets: r.targets?.calories
      ? r.targets
      : computeTargets({
          age: Number(r.age),
          gender: r.gender,
          height_cm: Number(r.height_cm),
          weight_kg: Number(r.weight_kg),
          activity: r.activity,
          goal: r.goal,
        }),
    created_at: r.created_at,
  };
}

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(messages: { role: string; content: string }[], jsonMode: boolean) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (res.status === 429) throw new Error("The trainer is busy right now. Try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 10) / 10) : fallback;
};

export async function analyzeFoodText(text: string): Promise<Nutrition> {
  const content = await callAI(
    [
      {
        role: "system",
        content:
          "You are a nutrition estimation engine. Given a free-text description of food eaten (any cuisine, including Indian foods like roti, dal, paneer), return ONLY JSON with realistic ESTIMATED totals for the whole description. Schema: {\"items\":[string],\"calories\":number,\"protein\":number,\"carbs\":number,\"fat\":number,\"fiber\":number,\"sugar\":number,\"satFat\":number,\"sodium\":number,\"micros\":[{\"name\":string,\"amount\":string}]}. Grams for macros, mg for sodium. micros: up to 5 notable micronutrients. Never refuse; always estimate.",
      },
      { role: "user", content: text.slice(0, 600) },
    ],
    true,
  );
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (m) parsed = JSON.parse(m[0]);
  }
  return {
    calories: num(parsed["calories"]),
    protein: num(parsed["protein"]),
    carbs: num(parsed["carbs"]),
    fat: num(parsed["fat"]),
    fiber: num(parsed["fiber"]),
    sugar: num(parsed["sugar"]),
    satFat: num(parsed["satFat"]),
    sodium: num(parsed["sodium"]),
    micros: Array.isArray(parsed["micros"])
      ? (parsed["micros"] as { name: string; amount: string }[]).slice(0, 6)
      : [],
    items: Array.isArray(parsed["items"]) ? (parsed["items"] as string[]).slice(0, 12) : [],
  };
}

export async function trainerReply(
  systemContext: string,
  history: { role: string; content: string }[],
) {
  return callAI(
    [
      {
        role: "system",
        content: `You are a personal fitness and nutrition coach inside the NutriFit app. ${systemContext}
Rules: keep replies under 70 words, practical and encouraging. Never diagnose medical conditions, never suggest extreme calorie restriction, unsafe loads, or training through pain — advise seeing a professional instead. Use the user's real data given above rather than inventing numbers.`,
      },
      ...history.slice(-12),
    ],
    false,
  );
}

/** Loads everything the app needs for a profile in one round trip. */
export async function loadState(profile: Profile) {
  const since = todayISO(-90);
  const [meals, plan, sessions, records, measurements, achievements] = await Promise.all([
    supabaseAdmin
      .from("nf_meals")
      .select("*")
      .eq("profile_id", profile.id)
      .gte("log_date", since)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("nf_plans").select("*").eq("profile_id", profile.id).maybeSingle(),
    supabaseAdmin
      .from("nf_sessions")
      .select("*")
      .eq("profile_id", profile.id)
      .order("log_date", { ascending: false })
      .limit(200),
    supabaseAdmin.from("nf_records").select("*").eq("profile_id", profile.id),
    supabaseAdmin
      .from("nf_measurements")
      .select("*")
      .eq("profile_id", profile.id)
      .order("log_date", { ascending: true }),
    supabaseAdmin.from("nf_achievements").select("code, earned_at").eq("profile_id", profile.id),
  ]);

  const sessionRows = sessions.data ?? [];
  const streak = computeStreak(
    sessionRows.map((s) => s.log_date as string),
    profile.workout_days,
  );

  return {
    profile,
    meals: meals.data ?? [],
    plan: (plan.data?.days ?? {}) as unknown as Plan,
    sessions: sessionRows,
    records: records.data ?? [],
    measurements: measurements.data ?? [],
    achievements: achievements.data ?? [],
    streak,
  };
}

export async function grantAchievements(profileId: string, codes: string[]) {
  if (!codes.length) return [];
  const rows = codes.map((code) => ({ profile_id: profileId, code }));
  const { data } = await supabaseAdmin
    .from("nf_achievements")
    .upsert(rows, { onConflict: "profile_id,code", ignoreDuplicates: true })
    .select("code");
  return (data ?? []).map((d) => d.code as string);
}

export async function persistSession(
  profile: Profile,
  input: { day_key: string; title: string; duration_sec: number; entries: SessionEntry[] },
) {
  const entries = input.entries
    .map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) }))
    .filter((e) => e.sets.length > 0);

  const totalVolume = entries.reduce(
    (sum, e) => sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );

  const { data: session, error } = await supabaseAdmin
    .from("nf_sessions")
    .insert({
      profile_id: profile.id,
      day_key: input.day_key,
      title: input.title,
      duration_sec: Math.max(0, Math.round(input.duration_sec)),
      total_volume: totalVolume,
      entries,
      log_date: todayISO(),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  // Personal records, computed by app logic (not AI).
  const { data: existing } = await supabaseAdmin
    .from("nf_records")
    .select("*")
    .eq("profile_id", profile.id);
  const byName = new Map((existing ?? []).map((r) => [r.exercise as string, r]));
  const newPRs: { exercise: string; weight: number; reps: number }[] = [];

  for (const e of entries) {
    let best = { weight: 0, reps: 0, orm: 0 };
    for (const s of e.sets) {
      const orm = epley1rm(s.weight, s.reps);
      if (orm > best.orm) best = { weight: s.weight, reps: s.reps, orm };
    }
    if (best.orm <= 0) continue;
    const prev = byName.get(e.name);
    if (!prev || best.orm > Number(prev.est_1rm)) {
      await supabaseAdmin.from("nf_records").upsert(
        {
          profile_id: profile.id,
          exercise: e.name,
          weight_kg: best.weight,
          reps: best.reps,
          est_1rm: best.orm,
          achieved_on: todayISO(),
        },
        { onConflict: "profile_id,exercise" },
      );
      if (prev) newPRs.push({ exercise: e.name, weight: best.weight, reps: best.reps });
    }
  }

  const { count } = await supabaseAdmin
    .from("nf_sessions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  const { data: allSessions } = await supabaseAdmin
    .from("nf_sessions")
    .select("log_date")
    .eq("profile_id", profile.id);
  const streak = computeStreak(
    (allSessions ?? []).map((s) => s.log_date as string),
    profile.workout_days,
  );

  const codes: string[] = ["first_workout"];
  if ((count ?? 0) >= 10) codes.push("ten_workouts");
  if (newPRs.length) codes.push("new_pb");
  if (streak >= 7) codes.push("streak_7");
  if (streak >= 30) codes.push("streak_30");
  const unlocked = await grantAchievements(profile.id, codes);

  return { session, newPRs, unlocked, streak, totalVolume };
}

export async function checkNutritionAchievement(profile: Profile) {
  const { data } = await supabaseAdmin
    .from("nf_meals")
    .select("nutrition")
    .eq("profile_id", profile.id)
    .eq("log_date", todayISO());
  const totals = sumNutrition((data ?? []).map((m) => m.nutrition as Nutrition));
  const t = profile.targets;
  if (
    totals.calories >= t.calories * 0.9 &&
    totals.calories <= t.calories * 1.1 &&
    totals.protein >= t.protein * 0.9
  ) {
    return grantAchievements(profile.id, ["nutrition_goal"]);
  }
  return [];
}
