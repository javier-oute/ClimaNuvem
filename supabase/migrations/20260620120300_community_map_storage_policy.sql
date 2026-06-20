-- Fase 2 — Mapa comunitario: acceso a la foto de publicaciones activas.
-- Permite a cualquier autenticado firmar la imagen de forecast-images SOLO mientras exista una
-- publicación activa (no expirada, no oculta) que la referencia. Acceso auto-expirable, sin copiar.

drop policy if exists "forecast_images_read_if_published" on storage.objects;
create policy "forecast_images_read_if_published"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'forecast-images'
    and exists (
      select 1 from public.community_predictions cp
      where cp.image_path = storage.objects.name
        and cp.expires_at > now()
        and cp.hidden_at is null
    )
  );
