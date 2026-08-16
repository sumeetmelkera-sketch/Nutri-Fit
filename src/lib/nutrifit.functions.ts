import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  analyzeFoodText,
  checkNutritionAchievement,
  generateKeypass,
  loadState,
  normalizeKeypass,
  persistSession,
  requireProfile,
  rowToProfile,
  trainerReply,
} from "@/lib/nf/nutrifit.server";
import {
  computeTargets,
  todayISO,
  type Nutrition,
  type Plan,
  type SessionEntry,
} from "@/lib/nf/shared";

export const createProfile = createServerFn({ method: "POST" })
  .inputValidator((d: Record<string, unknown>) => d)
  .handler(async ({ data }) => {
    const base = {
      name: String(data["name"] ?? "Athlete").slice(0, 40),
      age: Number(data["age"] ?? 25),
      gender: String(data["gender"] ?? "male"),
      height_cm: Number(data["height_cm"] ?? 170),
      weight_kg: Number(data["weight_kg"] ?? 70),
      activity: String(data["activity"] ?? "moderate"),
      goal: String(data["goal"] ?? "maintain"),
      experience: String(data["experience"] ?? "beginner"),
      workout_days: (data["workout_days"] as string[]) ?? [],
      trainer_id: String(data["trainer_id"] ?? "aria"),
      avatar_id: String(data["avatar_id"] ?? "a1"),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targets = computeTargets(base as any);

    for (let attempt = 0; attempt < 5; attempt++) {
      const keypass = generateKeypass();
      const { data: row, error } = await supabaseAdmin
        .from("nf_profiles")
        .insert({ ...base, keypass, targets })
        .select("*")
        .single();
      if (!error && row) {
        await supabaseAdmin.from("nf_plans").insert({ profile_id: row.id, days: {} });
        return { keypass, profile: rowToProfile(row) };
      }
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    }
    throw new Error("Could not create your profile. Please try again.");
  });

export const restoreProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { keypass: string }) => d)
  .handler(async ({ data }) => {
    const profile = await requireProfile(data.keypass);
    return { keypass: normalizeKeypass(data.keypass), profile };
  });

export const getState = createServerFn({ method: "POST" })
  .inputValidator((d: { keypass: string }) => d)
  .handler(async ({ data }) => loadState(await requireProfile(data.keypass)));

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { keypass: string; patch: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    const profile = await requireProfile(data.keypass);
    const merged = { ...profile, ...data.patch };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targets = computeTargets(merged as any);
    const { data: row, error } = await supabaseAdmin
      .from("nf_profiles")
      .update({ ...data.patch, targets })
      .eq("id", profile.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return rowToProfile(row);
  });

export const analyzeMeal = createServerFn({ method: "POST" })
  .inputValidator((d: { keypass: string; text: string }) => d)
  .handler(async ({ data }) => {
    await requireProfile(data.keypass);
    return analyzeFoodText(data.text);
  });

export const saveMeal = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { keypass: string; meal_type: string; description: string; nutrition: Nutrition }) => d,
  )
  .handler(async ({ data }) => {
    const profile = await requireProfile(data.keypass);
    const { data: row, error } = await supabaseAdmin
      .from("nf_meals")
      .insert({
        profile_id: profile.id,
        meal_type: data.meal_type,
        description: data.description.slice(0, 400),
        nutrition: data.nutrition,
        log_date: todayISO(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const unlocked = await checkNutritionAchievement(profile);
    return { meal: row, unlocked };
  });

export const updateMeal = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      keypass: string;
      id: string;
      nutrition: Nutrition;
      meal_type: string;
      description?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const profile = await requireProfile(data.keypass);
    const { error } = await supabaseAdmin
      .from("nf_meals")
      .update({
        nutrition: data.nutrition as unknown as never,
        meal_type: data.meal_type,
        ...(data.description !== undefined
          ? { description: data.description.slice(0, 400) }
          : {}),
      })
      .eq("id", data.id)
      .eq("profile_id", profile.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMeal = createServerFn({ method: "POST" })
  .inputValidator((d: { keypass: string; id: string }) => d)
  .handler(async ({ data }) => {
    const profile = await requireProfile(data.keypass);
    const { error } = await supabaseAdmin
      .from("nf_meals")
      .delete()
      .eq("id", data.id)
      .eq("profile_id", profile.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const savePlan = createServerFn({ method: "POST" })
  .inputValidator((d: { keypass: string; days: Plan }) => d)
  .handler(async ({ data }) => {
    const profile = await requireProfile(data.keypass);
    const { error } = await supabaseAdmin
      .from("nf_plans")
      .upsert(
        {
          profile_id: profile.id,
          days: data.days as unknown as never,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const finishWorkout = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      keypass: string;
      day_key: string;
      title: string;
      duration_sec: number;
      entries: SessionEntry[];
    }) => d,
  )
  .handler(async ({ data }) => {
    const profile = await requireProfile(data.keypass);
    const result = await persistSession(profile, data);
    return { newPRs: result.newPRs, unlocked: result.unlocked, streak: result.streak };
  });

export const saveMeasurement = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      keypass: string;
      weight_kg: number | null;
      metrics: Record<string, number>;
      photo_url?: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    const profile = await requireProfile(data.keypass);
    const { error } = await supabaseAdmin.from("nf_measurements").insert({
      profile_id: profile.id,
      log_date: todayISO(),
      weight_kg: data.weight_kg,
      metrics: data.metrics,
      photo_url: data.photo_url ?? null,
    });
    if (error) throw new Error(error.message);
    if (data.weight_kg) {
      await supabaseAdmin
        .from("nf_profiles")
        .update({ weight_kg: data.weight_kg })
        .eq("id", profile.id);
    }
    return { ok: true };
  });

export const askTrainer = createServerFn({ method: "POST" })
  .inputValidator((d: { keypass: string; context: string; history: { role: string; content: string }[] }) => d)
  .handler(async ({ data }) => {
    await requireProfile(data.keypass);
    const reply = await trainerReply(data.context, data.history);
    return { reply };
  });
