-- Fase 2 — Mapa comunitario: RPC SECURITY DEFINER.
-- Centralizan: snap de coordenadas (privacidad), límite de 3 activas, expiración, moderación y lectura.
-- search_path='' → todo cualificado (public.* para PostGIS, auth.uid()).

-- 1) Publicar: valida sesión + propiedad, snapea a ~2 km, fija expiración, marca el historial.
create or replace function public.publish_prediction(
  p_forecast_history_id uuid,
  p_lat double precision,
  p_lon double precision,
  p_forecast text,
  p_probability numeric,
  p_image_path text,
  p_place_name text default null,
  p_description text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_snap_lat double precision;
  v_snap_lon double precision;
  v_active int;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  -- el registro de historial debe pertenecer al usuario
  if not exists (
    select 1 from public.forecast_history fh
    where fh.id = p_forecast_history_id and fh.user_id = v_uid
  ) then
    raise exception 'forecast_history_not_owned';
  end if;

  -- la imagen debe estar en la carpeta del usuario
  if p_image_path is null or p_image_path not like (v_uid::text || '/%') then
    raise exception 'image_path_not_owned';
  end if;

  -- límite: máximo 3 publicaciones activas por usuario
  select count(*) into v_active
  from public.community_predictions cp
  where cp.user_id = v_uid and cp.expires_at > now() and cp.hidden_at is null;
  if v_active >= 3 then
    raise exception 'active_publications_limit_reached';
  end if;

  -- snap a rejilla ~2 km (redondeo a 2 decimales) → nunca se guarda la coord exacta
  v_snap_lat := round(p_lat::numeric, 2)::double precision;
  v_snap_lon := round(p_lon::numeric, 2)::double precision;

  insert into public.community_predictions
    (user_id, forecast_history_id, forecast, probability, location, place_name, description,
     image_path, published_at, expires_at)
  values
    (v_uid, p_forecast_history_id, p_forecast, p_probability,
     public.ST_SetSRID(public.ST_MakePoint(v_snap_lon, v_snap_lat), 4326)::public.geography,
     p_place_name, nullif(btrim(coalesce(p_description, '')), ''),
     p_image_path, now(), now() + interval '6 hours')
  returning id into v_id;

  -- marca durable "fue publicada" en el historial (solo la primera vez)
  update public.forecast_history
    set published_at = coalesce(published_at, now())
    where id = p_forecast_history_id;

  return v_id;
end;
$$;

-- 2) Despublicar: el autor o un admin.
create or replace function public.unpublish_prediction(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  delete from public.community_predictions cp
  where cp.id = p_id
    and (
      cp.user_id = v_uid
      or exists (select 1 from public.profiles p where p.id = v_uid and p.is_admin)
    );
end;
$$;

-- 3) Reportar: un reporte por usuario; al llegar a 3 se oculta.
create or replace function public.report_prediction(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.community_reports (prediction_id, reporter_id)
  values (p_id, v_uid)
  on conflict (prediction_id, reporter_id) do nothing;

  select count(*) into v_count from public.community_reports where prediction_id = p_id;

  update public.community_predictions
    set reported_count = v_count,
        hidden_at = case when v_count >= 3 then coalesce(hidden_at, now()) else hidden_at end
    where id = p_id;
end;
$$;

-- 4) Leer cercanas: radio 30 km + activas + no ocultas, con autor resuelto (join profiles).
create or replace function public.get_nearby_predictions(
  p_lat double precision,
  p_lon double precision
) returns table (
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
    and public.ST_DWithin(
      cp.location,
      public.ST_SetSRID(public.ST_MakePoint(p_lon, p_lat), 4326)::public.geography,
      30000
    )
  order by cp.published_at desc
  limit 200;
$$;

-- 5) Leer una por id (para el detalle).
create or replace function public.get_prediction_by_id(p_id uuid)
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
  where cp.id = p_id
    and cp.expires_at > now()
    and cp.hidden_at is null;
$$;

-- Permisos: solo usuarios autenticados.
revoke all on function public.publish_prediction(uuid, double precision, double precision, text, numeric, text, text, text) from public, anon;
grant execute on function public.publish_prediction(uuid, double precision, double precision, text, numeric, text, text, text) to authenticated;

revoke all on function public.unpublish_prediction(uuid) from public, anon;
grant execute on function public.unpublish_prediction(uuid) to authenticated;

revoke all on function public.report_prediction(uuid) from public, anon;
grant execute on function public.report_prediction(uuid) to authenticated;

revoke all on function public.get_nearby_predictions(double precision, double precision) from public, anon;
grant execute on function public.get_nearby_predictions(double precision, double precision) to authenticated;

revoke all on function public.get_prediction_by_id(uuid) from public, anon;
grant execute on function public.get_prediction_by_id(uuid) to authenticated;
