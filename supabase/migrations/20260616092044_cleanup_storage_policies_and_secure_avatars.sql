-- M2: Limpiar políticas de Storage inseguras/huérfanas y dejar avatares seguros (por-usuario).
-- Borrar políticas del quickstart e huérfanas.
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "authenticated can upload to photos" ON storage.objects;
DROP POLICY IF EXISTS "TEMP allow authenticated uploads to forecast-images" ON storage.objects;

-- Avatares seguros: subida/edición/borrado solo en la carpeta propia {uid}/...
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND name LIKE ((select auth.uid())::text || '/%'));

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND name LIKE ((select auth.uid())::text || '/%'))
  WITH CHECK (bucket_id = 'avatars' AND name LIKE ((select auth.uid())::text || '/%'));

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND name LIKE ((select auth.uid())::text || '/%'));

-- Lectura: cualquier usuario autenticado puede leer/firmar cualquier avatar (para el mapa),
-- pero NO anon → no es público. Bucket sigue privado; se sirve por URL firmada.
CREATE POLICY "avatars_read_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');
