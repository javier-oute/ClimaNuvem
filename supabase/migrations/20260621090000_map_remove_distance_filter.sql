-- Fase 2 — Mapa comunitario: eliminar el filtro de distancia.
-- Decisión (2026-06-21): mientras haya pocos usuarios no tiene sentido ocultar publicaciones por
-- distancia; se mostrarían demasiado pocas (o ninguna). Se muestran TODAS las activas (no caducadas,
-- no ocultas). La ubicación del usuario ya solo sirve para CENTRAR el mapa, no para filtrar datos.
-- Cuando crezca la base de usuarios se podrá reintroducir el filtro espacial (ST_DWithin) recuperando
-- la lógica de get_nearby_predictions de la migración 20260620120200.

drop function if exists public.get_nearby_predictions(double precision, double precision);

create or replace function public.get_active_predictions()
returns table (
  id uuid,
  forecast text,
  probability numeric,
  lat double precision,
  lon double precision,
  place_name text,
  description text,
  image_path text,
  published_at timestamptz,
  expires_at timestamptz,
  author_username text,
  author_avatar_url text,
  is_mine boolean
)
language sql
security definer
set search_path = ''
as $$
  select
    cp.id, cp.forecast, cp.probability,
    public.ST_Y(cp.location::public.geometry) as lat,
    public.ST_X(cp.location::public.geometry) as lon,
    cp.place_name, cp.description, cp.image_path, cp.published_at, cp.expires_at,
    p.username, p.avatar_url, (cp.user_id = auth.uid()) as is_mine
  from public.community_predictions cp
  join public.profiles p on p.id = cp.user_id
  where cp.expires_at > now()
    and cp.hidden_at is null
  order by cp.published_at desc
  limit 200;
$$;

revoke all on function public.get_active_predictions() from public, anon;
grant execute on function public.get_active_predictions() to authenticated;
