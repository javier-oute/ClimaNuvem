-- M3: Las funciones de trigger SECURITY DEFINER no deben ser invocables vía RPC.
-- Siguen ejecutándose como triggers (eso no se ve afectado por REVOKE EXECUTE).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_profile_email() FROM anon, authenticated, public;

-- handle_user_update() es huérfana: ningún trigger la referencia (solo sync_profile_email
-- está cableada a auth.users). Se elimina.
DROP FUNCTION IF EXISTS public.handle_user_update();
