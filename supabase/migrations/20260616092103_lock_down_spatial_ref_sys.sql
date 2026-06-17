-- M4b: spatial_ref_sys (tabla de referencia PostGIS) tenía RLS off y anon/authenticated
-- con privilegios de escritura → cualquiera con la anon key podía alterarla/vaciarla.
-- Revocamos escritura conservando SELECT (PostGIS solo necesita leer desde estos roles).
-- No activamos RLS para no interferir con PostGIS.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.spatial_ref_sys FROM anon, authenticated;
