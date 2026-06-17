-- M5: Consolidar las políticas RLS duplicadas de forecast_history en un único juego por acción,
-- rol authenticated, con (select auth.uid()) para evitar re-evaluación por fila.
DROP POLICY IF EXISTS "fh_select_own" ON public.forecast_history;
DROP POLICY IF EXISTS "fh_insert_own" ON public.forecast_history;
DROP POLICY IF EXISTS "fh_update_own" ON public.forecast_history;
DROP POLICY IF EXISTS "fh_delete_own" ON public.forecast_history;
DROP POLICY IF EXISTS "read own forecast history" ON public.forecast_history;
DROP POLICY IF EXISTS "insert own forecast history" ON public.forecast_history;

CREATE POLICY "fh_select_own" ON public.forecast_history
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "fh_insert_own" ON public.forecast_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "fh_update_own" ON public.forecast_history
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "fh_delete_own" ON public.forecast_history
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));
