-- Fase 2 — Mapa comunitario: RLS.
-- La seguridad recae en RLS (patrón Supabase). Inserts/updates van SOLO por RPC SECURITY DEFINER.

alter table public.community_predictions enable row level security;

-- Lectura: solo publicaciones activas y no ocultas (también protege el acceso directo con la anon key).
drop policy if exists cp_select_active on public.community_predictions;
create policy cp_select_active
  on public.community_predictions for select to authenticated
  using (expires_at > now() and hidden_at is null);

-- Borrado: el autor puede despublicar; un admin puede retirar cualquiera.
drop policy if exists cp_delete_own_or_admin on public.community_predictions;
create policy cp_delete_own_or_admin
  on public.community_predictions for delete to authenticated
  using (
    user_id = (select auth.uid())
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin)
  );

-- Sin INSERT ni UPDATE directos: el snap de coordenadas y el contador/ocultar los gestionan las RPC.

alter table public.community_reports enable row level security;

-- Solo un admin puede leer reportes (revisión). El INSERT va por la RPC report_prediction.
drop policy if exists cr_select_admin on public.community_reports;
create policy cr_select_admin
  on public.community_reports for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
