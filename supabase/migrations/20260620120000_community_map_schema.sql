-- Fase 2 — Mapa comunitario: esquema base.
-- Tablas community_predictions + community_reports, columnas nuevas en profiles/forecast_history.

-- Rol admin (se activa manualmente en BD; ver docs/database.md).
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- forecast_history: descripción del autor (también visible en historial) + marca durable "fue publicada".
alter table public.forecast_history
  add column if not exists description text
    check (description is null or char_length(description) <= 280);
alter table public.forecast_history
  add column if not exists published_at timestamptz;

-- Publicaciones del mapa comunitario.
create table if not exists public.community_predictions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  forecast_history_id uuid not null references public.forecast_history(id) on delete cascade,
  forecast            text not null check (forecast in (
    'cielo_despejado','nubes_altas_medias','lenticular_viento',
    'cubierto_precipitacion','niebla_stratus','conveccion_desarrollo','tormenta')),
  probability         numeric not null check (probability >= 0 and probability <= 1),
  location            geography(Point, 4326) not null,   -- YA SNAPEADA (~2 km), nunca exacta
  place_name          text check (place_name is null or char_length(place_name) <= 200),
  description         text check (description is null or char_length(description) <= 280),
  image_path          text not null check (char_length(btrim(image_path)) > 0),
  published_at        timestamptz not null default now(),
  expires_at          timestamptz not null,
  reported_count      integer not null default 0,
  hidden_at           timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists community_predictions_location_gix on public.community_predictions using gist (location);
create index if not exists community_predictions_expires_idx   on public.community_predictions (expires_at);
create index if not exists community_predictions_user_idx       on public.community_predictions (user_id);
create index if not exists community_predictions_image_idx      on public.community_predictions (image_path);
create index if not exists community_predictions_fh_idx         on public.community_predictions (forecast_history_id);

-- Reportes de moderación (un reporte por usuario y publicación).
create table if not exists public.community_reports (
  id            uuid primary key default gen_random_uuid(),
  prediction_id uuid not null references public.community_predictions(id) on delete cascade,
  reporter_id   uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (prediction_id, reporter_id)
);
