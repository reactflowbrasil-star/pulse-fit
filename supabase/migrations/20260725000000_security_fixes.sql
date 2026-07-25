
-- 1. Fix Critical: Data exposure in legacy tables (Always True RLS)
-- workout_sessions
DROP POLICY IF EXISTS "Sessões acessíveis por client_session_id" ON public.workout_sessions;
CREATE POLICY "Users can manage their own workout sessions"
  ON public.workout_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- profiles
-- Assume id is auth.uid() as seen in wa-link.functions.ts
DROP POLICY IF EXISTS "Perfis acessíveis por client_session_id" ON public.profiles;
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- daily_metrics (add user_id if missing and secure)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'daily_metrics' AND column_name = 'user_id') THEN
    ALTER TABLE public.daily_metrics ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Métricas diárias acessíveis por client_session_id" ON public.daily_metrics;
CREATE POLICY "Users can manage their own daily metrics"
  ON public.daily_metrics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_achievements (add user_id if missing and secure)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_achievements' AND column_name = 'user_id') THEN
    ALTER TABLE public.user_achievements ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Conquistas acessíveis por client_session_id" ON public.user_achievements;
CREATE POLICY "Users can manage their own achievements"
  ON public.user_achievements FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Revoke public/anon access to sensitive tables
REVOKE ALL ON public.workout_sessions FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.daily_metrics FROM anon;
REVOKE ALL ON public.user_achievements FROM anon;
REVOKE ALL ON public.whatsapp_verifications FROM anon;

-- 3. Fix Warning: Function permissions (Security Definer)
-- Revoke from PUBLIC (which includes all roles)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC;

-- Grant back only to necessary roles
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
-- handle_new_auth_user is a trigger, it doesn't need explicit grants to roles.

-- 4. Fix Warning: WhatsApp verification codes ownership
-- Set default user_id to auth.uid()
ALTER TABLE public.whatsapp_verifications ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Ensure policy is restrictive (already was, but reinforcing)
DROP POLICY IF EXISTS "Users manage own wa verifications" ON public.whatsapp_verifications;
CREATE POLICY "Users can manage their own whatsapp verifications"
  ON public.whatsapp_verifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Extra: Secure app_users from anonymous access and tighten grants
REVOKE ALL ON public.app_users FROM anon;
REVOKE INSERT ON public.app_users FROM authenticated; -- Created by trigger
