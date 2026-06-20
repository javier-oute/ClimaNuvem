-- Fase 2 — Mapa comunitario: limpieza física de publicaciones caducadas (pg_cron).
-- El filtro `expires_at > now()` en lectura ya garantiza que nadie ve caducadas; este job evita
-- que la tabla acumule filas viejas. Cada hora borra lo caducado hace > 1 h.

create extension if not exists pg_cron;

select cron.schedule(
  'cleanup_expired_community_predictions',
  '0 * * * *',
  $$ delete from public.community_predictions where expires_at < now() - interval '1 hour' $$
);
