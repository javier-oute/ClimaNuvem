-- Fase 2 — Mapa comunitario: endurecimiento.
-- Las tablas del mapa son solo para usuarios autenticados; anon nunca las usa.
-- Revocar SELECT de anon silencia la discoverability GraphQL y endurece (RLS ya protege las filas).
revoke select on public.community_predictions from anon;
revoke select on public.community_reports from anon;
