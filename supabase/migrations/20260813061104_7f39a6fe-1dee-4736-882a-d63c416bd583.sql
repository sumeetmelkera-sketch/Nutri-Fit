
CREATE TABLE public.nf_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keypass TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INT NOT NULL DEFAULT 25,
  gender TEXT NOT NULL DEFAULT 'male',
  height_cm NUMERIC NOT NULL DEFAULT 170,
  weight_kg NUMERIC NOT NULL DEFAULT 70,
  activity TEXT NOT NULL DEFAULT 'moderate',
  goal TEXT NOT NULL DEFAULT 'maintain',
  experience TEXT NOT NULL DEFAULT 'beginner',
  workout_days TEXT[] NOT NULL DEFAULT '{}',
  trainer_id TEXT NOT NULL DEFAULT 'aria',
  targets JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.nf_profiles TO service_role;
ALTER TABLE public.nf_profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.nf_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.nf_profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  meal_type TEXT NOT NULL DEFAULT 'breakfast',
  description TEXT NOT NULL,
  nutrition JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX nf_meals_profile_date_idx ON public.nf_meals(profile_id, log_date);
GRANT ALL ON public.nf_meals TO service_role;
ALTER TABLE public.nf_meals ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.nf_plans (
  profile_id UUID NOT NULL PRIMARY KEY REFERENCES public.nf_profiles(id) ON DELETE CASCADE,
  days JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.nf_plans TO service_role;
ALTER TABLE public.nf_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.nf_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.nf_profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  day_key TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT 'Workout',
  duration_sec INT NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  entries JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX nf_sessions_profile_date_idx ON public.nf_sessions(profile_id, log_date);
GRANT ALL ON public.nf_sessions TO service_role;
ALTER TABLE public.nf_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.nf_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.nf_profiles(id) ON DELETE CASCADE,
  exercise TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  reps INT NOT NULL DEFAULT 0,
  est_1rm NUMERIC NOT NULL DEFAULT 0,
  achieved_on DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, exercise)
);
GRANT ALL ON public.nf_records TO service_role;
ALTER TABLE public.nf_records ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.nf_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.nf_profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  weight_kg NUMERIC,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX nf_measurements_profile_idx ON public.nf_measurements(profile_id, log_date);
GRANT ALL ON public.nf_measurements TO service_role;
ALTER TABLE public.nf_measurements ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.nf_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.nf_profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, code)
);
GRANT ALL ON public.nf_achievements TO service_role;
ALTER TABLE public.nf_achievements ENABLE ROW LEVEL SECURITY;
