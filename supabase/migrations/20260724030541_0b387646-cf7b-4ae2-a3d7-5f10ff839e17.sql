-- Perfis por client_session_id (sem auth ainda; migrate p/ user_id quando auth chegar)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_session_id TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  fitness_goal TEXT,
  fitness_level TEXT,
  weekly_frequency INT,
  available_equipment TEXT[] NOT NULL DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis acessíveis por client_session_id" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Métricas diárias
CREATE TABLE public.daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_session_id TEXT NOT NULL,
  date DATE NOT NULL,
  steps INT NOT NULL DEFAULT 0,
  calories INT NOT NULL DEFAULT 0,
  water_liters NUMERIC(4,2) NOT NULL DEFAULT 0,
  active_minutes INT NOT NULL DEFAULT 0,
  distance_km NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_session_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_metrics TO anon, authenticated;
GRANT ALL ON public.daily_metrics TO service_role;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Métricas diárias acessíveis por client_session_id" ON public.daily_metrics FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER daily_metrics_set_updated_at
BEFORE UPDATE ON public.daily_metrics
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Conquistas
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_session_id TEXT NOT NULL,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (client_session_id, achievement_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO anon, authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conquistas acessíveis por client_session_id" ON public.user_achievements FOR ALL USING (true) WITH CHECK (true);