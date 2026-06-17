-- M1: Cerrar fuga de PII en profiles + vista pública mínima para el mapa
-- Antes: política SELECT "Public profiles are viewable by everyone." USING (true)
-- exponía email/phone de todos los usuarios a cualquiera con la anon key.

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

-- Vista pública mínima: solo columnas seguras (sin email/phone). Corre como owner
-- (security_invoker desactivado) para exponer las columnas seguras de TODOS los perfiles,
-- destinada al mapa comunitario (mostrar avatar + nombre de quien publica).
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, username, full_name, avatar_url
  FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;
