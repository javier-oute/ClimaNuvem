-- Seguridad (2026-06-25): endurecer el bucket 'forecast-images' (defensa en profundidad), igual que se
-- hizo con 'avatars' (M7, 20260617170842). Las políticas RLS controlan QUIÉN sube (cada usuario a su
-- carpeta {uid}/) pero NO QUÉ ni CUÁNTO: hoy 'forecast-images' acepta cualquier tamaño y cualquier MIME,
-- lo que permite a un usuario subir por API directa archivos enormes o contenido arbitrario (no-imagen)
-- en su carpeta, con posible abuso de almacenamiento/coste y de servirlo a la comunidad mientras esté
-- publicado. La app siempre sube JPEG (~cientos de KB); 10 MB es muy holgado y deja margen para PNG/WebP.

update storage.buckets
set file_size_limit = 10485760,  -- 10 MB en bytes
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'forecast-images';
