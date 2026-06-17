-- M1b: La vista public_profiles se creó como SECURITY DEFINER (default), lo que el linter
-- marca como ERROR (0010). Como el mapa comunitario aún es mock (Fase 2) y nada consume la
-- vista todavía, la ponemos en security_invoker para no dejar un aviso de seguridad ERROR.
-- NOTA Fase 2: para que el mapa muestre avatar+nombre de OTROS usuarios habrá que exponer
-- ese subconjunto seguro de forma controlada (función SECURITY DEFINER que devuelva solo
-- columnas seguras, o snapshot de alias/avatar en la propia predicción). Decidir al implementar.
ALTER VIEW public.public_profiles SET (security_invoker = on);
