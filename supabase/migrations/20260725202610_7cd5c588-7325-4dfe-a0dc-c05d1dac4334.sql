-- has_role só precisa ler o próprio papel do usuário; SECURITY INVOKER é suficiente.
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SECURITY INVOKER;

-- handle_new_auth_user é trigger do Supabase Auth; não deve ser executada pela API pública.
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM anon, authenticated;