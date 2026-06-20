-- Fase 2 — Mapa comunitario: eliminar la vista public_profiles.
-- La identidad del autor se resuelve ahora por la RPC get_nearby_predictions / get_prediction_by_id
-- (join a profiles dentro de SECURITY DEFINER), así que la vista ya no se usa.

drop view if exists public.public_profiles;
