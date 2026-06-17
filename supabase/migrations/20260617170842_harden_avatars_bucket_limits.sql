-- M7 (2026-06-17): Endurecimiento del bucket 'avatars' (defensa en profundidad).
-- Limita en el SERVIDOR el tamaño y los tipos MIME aceptados, independientemente del cliente.
-- Contexto: con la subida de avatar implementada, la app sube siempre JPEG ~512x512 (~50-100 KB)
-- vía hooks/profile/usePickAvatar.jsx + stores/profile.store.image.js. Las políticas RLS controlan
-- QUIÉN sube (cada usuario a su carpeta {uid}/) pero no QUÉ ni CUÁNTO; estos límites cierran el
-- abuso por API directa (vídeos / archivos enormes) sin afectar a ningún avatar legítimo.
-- 5 MB es holgado (≈30-100x el tamaño real) y deja margen para subir resolución o usar PNG/WebP.
update storage.buckets
set file_size_limit = 5242880,  -- 5 MB en bytes
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'avatars';
