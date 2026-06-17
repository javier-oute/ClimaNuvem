-- M6: forecast guardaba un escalar JSON string; lo pasamos a text (más claro y correcto).
-- USING forecast #>> '{}' extrae el texto del escalar jsonb, preservando el valor.
ALTER TABLE public.forecast_history
  ALTER COLUMN forecast TYPE text USING forecast #>> '{}';

-- Índice sin uso (ninguna consulta filtra por image_path).
DROP INDEX IF EXISTS public.forecast_history_image_path_idx;
