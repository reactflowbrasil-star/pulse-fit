-- ============================================================
-- 1) Triggers de updated_at para tabelas que possuem a coluna
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'app_users',
    'atividades_diarias',
    'daily_metrics',
    'exercise_catalog',
    'profiles',
    'treinos',
    'whatsapp_config',
    'whatsapp_messages',
    'whatsapp_sessions',
    'workout_sessions'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'updated_at'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.triggers
      WHERE trigger_schema = 'public' AND event_object_table = t AND trigger_name = t || '_updated_at'
    ) THEN
      EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t || '_updated_at', t);
    END IF;
  END LOOP;
END;
$$;

-- ============================================================
-- 2) Vincular tabelas legadas ao auth.users e tornar client_session_id opcional
-- ============================================================

-- profiles: adiciona user_id, torna client_session_id opcional
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ALTER COLUMN client_session_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- workout_sessions: adiciona user_id, torna client_session_id opcional
ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ALTER COLUMN client_session_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);

-- user_achievements: adiciona user_id, torna client_session_id opcional
ALTER TABLE public.user_achievements
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ALTER COLUMN client_session_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- daily_metrics: adiciona user_id, torna client_session_id opcional
ALTER TABLE public.daily_metrics
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ALTER COLUMN client_session_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_id ON public.daily_metrics(user_id);

-- whatsapp_messages: adiciona user_id para futura vinculação
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON public.whatsapp_messages(user_id);

-- whatsapp_sessions: adiciona user_id para futura vinculação
ALTER TABLE public.whatsapp_sessions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON public.whatsapp_sessions(user_id);

-- ============================================================
-- 3) Garantir GRANTs padrão em todas as tabelas tocadas
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sessions TO authenticated;
GRANT ALL ON public.workout_sessions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_metrics TO authenticated;
GRANT ALL ON public.daily_metrics TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_sessions TO authenticated;
GRANT ALL ON public.whatsapp_sessions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_config TO authenticated;
GRANT ALL ON public.whatsapp_config TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividades_diarias TO authenticated;
GRANT ALL ON public.atividades_diarias TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.treinos TO authenticated;
GRANT ALL ON public.treinos TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_verifications TO authenticated;
GRANT ALL ON public.whatsapp_verifications TO service_role;

GRANT SELECT ON public.exercise_catalog TO authenticated;
GRANT SELECT ON public.exercise_catalog TO anon;
GRANT ALL ON public.exercise_catalog TO service_role;

-- ============================================================
-- 4) Atualizar políticas de RLS
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Perfis acessíveis por client_session_id" ON public.profiles;
DROP POLICY IF EXISTS "Usuário lê seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuário atualiza seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admin lê todos os perfis" ON public.profiles;
CREATE POLICY "Usuário lê seu próprio perfil" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuário atualiza seu próprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin lê todos os perfis" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- workout_sessions
DROP POLICY IF EXISTS "Sessões acessíveis por client_session_id" ON public.workout_sessions;
DROP POLICY IF EXISTS "Usuário gerencia suas sessões" ON public.workout_sessions;
DROP POLICY IF EXISTS "Admin lê todas as sessões" ON public.workout_sessions;
CREATE POLICY "Usuário gerencia suas sessões" ON public.workout_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin lê todas as sessões" ON public.workout_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_achievements
DROP POLICY IF EXISTS "Conquistas acessíveis por client_session_id" ON public.user_achievements;
DROP POLICY IF EXISTS "Usuário vê suas conquistas" ON public.user_achievements;
CREATE POLICY "Usuário vê suas conquistas" ON public.user_achievements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- daily_metrics
DROP POLICY IF EXISTS "Métricas diárias acessíveis por client_session_id" ON public.daily_metrics;
DROP POLICY IF EXISTS "Usuário gerencia suas métricas diárias" ON public.daily_metrics;
CREATE POLICY "Usuário gerencia suas métricas diárias" ON public.daily_metrics FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- atividades_diarias
DROP POLICY IF EXISTS "Users manage own atividades" ON public.atividades_diarias;
CREATE POLICY "Users manage own atividades" ON public.atividades_diarias FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- treinos
DROP POLICY IF EXISTS "Users manage own treinos" ON public.treinos;
CREATE POLICY "Users manage own treinos" ON public.treinos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- whatsapp_verifications
DROP POLICY IF EXISTS "Users manage own wa verifications" ON public.whatsapp_verifications;
CREATE POLICY "Users manage own wa verifications" ON public.whatsapp_verifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- whatsapp_messages
DROP POLICY IF EXISTS "Admin gerencia mensagens" ON public.whatsapp_messages;
CREATE POLICY "Admin gerencia mensagens" ON public.whatsapp_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- whatsapp_sessions
DROP POLICY IF EXISTS "Admin gerencia sessões WhatsApp" ON public.whatsapp_sessions;
CREATE POLICY "Admin gerencia sessões WhatsApp" ON public.whatsapp_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- whatsapp_config
DROP POLICY IF EXISTS "Admin gerencia configuração WhatsApp" ON public.whatsapp_config;
CREATE POLICY "Admin gerencia configuração WhatsApp" ON public.whatsapp_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 5) Garantir RLS habilitado
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_catalog ENABLE ROW LEVEL SECURITY;