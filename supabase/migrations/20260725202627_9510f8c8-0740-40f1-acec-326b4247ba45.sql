-- Remove acesso default/public
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM public;

-- Garante revogação explícita para roles da API
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM anon, authenticated;

-- Concede apenas para roles internos que precisam executar a trigger
GRANT EXECUTE ON FUNCTION public.handle_new_auth_user() TO postgres, service_role, supabase_auth_admin;