-- Seguridad (2026-06-25): prevenir ESCALADA DE PRIVILEGIOS vía profiles.is_admin.
--
-- La política UPDATE de profiles ("Users can update own profile" con USING auth.uid()=id) restringe la
-- FILA pero NO las COLUMNAS, así que un usuario autenticado podría auto-asignarse is_admin con una
-- petición directa a PostgREST (PATCH /rest/v1/profiles?id=eq.<su_uid> { "is_admin": true }), aunque el
-- cliente nunca lo envíe. Un admin puede borrar/ocultar publicaciones del mapa y leer community_reports,
-- así que esto es escalada real.
--
-- Defensa: trigger BEFORE INSERT/UPDATE que fuerza is_admin a un valor seguro salvo que el llamante ya
-- sea admin. No lanza error ni bloquea el resto de columnas (radio de impacto = solo la columna is_admin).
-- Las operaciones internas (SQL editor / service_role, sin JWT de usuario → auth.uid() null) NO se
-- restringen, para poder activar admin manualmente en BD (como documenta docs/database.md).

create or replace function public.guard_profile_is_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_caller_is_admin boolean;
begin
  -- Contexto interno (sin JWT de usuario): no se restringe.
  if v_uid is null then
    return new;
  end if;

  v_caller_is_admin := exists (
    select 1 from public.profiles p where p.id = v_uid and p.is_admin
  );
  if v_caller_is_admin then
    return new;
  end if;

  -- Usuario normal: nunca puede conceder/quitar admin.
  if tg_op = 'INSERT' then
    new.is_admin := false;
  elsif tg_op = 'UPDATE' then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_is_admin on public.profiles;
create trigger profiles_guard_is_admin
  before insert or update on public.profiles
  for each row execute function public.guard_profile_is_admin();

-- Es una función de trigger: no debe ser invocable como RPC vía PostgREST. El trigger sigue
-- disparándose igual (no depende de EXECUTE). Evita exponerla en la API (lint 0028/0029).
revoke all on function public.guard_profile_is_admin() from public, anon, authenticated;
