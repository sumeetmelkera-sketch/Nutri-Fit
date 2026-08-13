import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getState } from "@/lib/nutrifit.functions";
import {
  sumNutrition,
  todayISO,
  type AchievementRow,
  type Meal,
  type Measurement,
  type Nutrition,
  type PersonalRecord,
  type Plan,
  type Profile,
  type WorkoutSession,
} from "./shared";

const KEY = "nutrifit.keypass";

export function readKeypass() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function writeKeypass(kp: string | null) {
  if (typeof window === "undefined") return;
  if (kp) window.localStorage.setItem(KEY, kp);
  else window.localStorage.removeItem(KEY);
}

type StateShape = {
  profile: Profile;
  meals: Meal[];
  plan: Plan;
  sessions: WorkoutSession[];
  records: PersonalRecord[];
  measurements: Measurement[];
  achievements: AchievementRow[];
  streak: number;
};

type Ctx = {
  keypass: string | null;
  ready: boolean;
  state: StateShape | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signIn: (kp: string) => void;
  signOut: () => void;
};

const NutriFitContext = createContext<Ctx | null>(null);

export function NutriFitProvider({ children }: { children: React.ReactNode }) {
  const [keypass, setKeypass] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const qc = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    setKeypass(readKeypass());
    setReady(true);
  }, []);

  const query = useQuery({
    queryKey: ["nf-state", keypass],
    enabled: !!keypass,
    queryFn: async () => (await getState({ data: { keypass: keypass! } })) as unknown as StateShape,
    staleTime: 10_000,
  });

  const signIn = useCallback(
    (kp: string) => {
      writeKeypass(kp);
      setKeypass(kp);
      qc.invalidateQueries({ queryKey: ["nf-state"] });
    },
    [qc],
  );

  const signOut = useCallback(() => {
    writeKeypass(null);
    setKeypass(null);
    qc.clear();
    router.navigate({ to: "/welcome" });
  }, [qc, router]);

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["nf-state"] });
  }, [qc]);

  const value = useMemo<Ctx>(
    () => ({
      keypass,
      ready,
      state: (query.data as StateShape | undefined) ?? null,
      loading: query.isLoading,
      error: query.error ? (query.error as Error).message : null,
      refresh,
      signIn,
      signOut,
    }),
    [keypass, ready, query.data, query.isLoading, query.error, refresh, signIn, signOut],
  );

  return <NutriFitContext.Provider value={value}>{children}</NutriFitContext.Provider>;
}

export function useNutriFit() {
  const ctx = useContext(NutriFitContext);
  if (!ctx) throw new Error("useNutriFit must be used inside NutriFitProvider");
  return ctx;
}

export function useMealsFor(date = todayISO()) {
  const { state } = useNutriFit();
  const meals = (state?.meals ?? []).filter((m) => m.log_date === date);
  const totals: Nutrition = sumNutrition(meals.map((m) => m.nutrition));
  return { meals, totals };
}

export function useAction<TInput, TResult>(fn: (args: { data: TInput }) => Promise<TResult>) {
  const { refresh } = useNutriFit();
  return useMutation({
    mutationFn: (input: TInput) => fn({ data: input }),
    onSuccess: () => refresh(),
  });
}
