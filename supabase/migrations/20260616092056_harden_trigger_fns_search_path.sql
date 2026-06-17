-- M4: Fijar search_path en las funciones de trigger (solo usan now() de pg_catalog).
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.set_profiles_updated_at() SET search_path = '';
