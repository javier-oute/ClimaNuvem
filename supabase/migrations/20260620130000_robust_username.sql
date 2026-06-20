-- Username robusto: generación siempre válida y única en el registro + columna NOT NULL.
-- Reglas de formato: [a-zA-Z0-9_], longitud 3-30 (UNIQUE y CHECK >=3 ya existen).

-- 1) Helper: dado un texto deseado, devuelve un username válido y ÚNICO (nunca vacío).
create or replace function public.unique_username(desired text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  candidate text;
  i int := 0;
begin
  -- sanear: solo [a-zA-Z0-9_], en minúsculas
  base := lower(regexp_replace(coalesce(desired, ''), '[^a-zA-Z0-9_]', '', 'g'));
  if char_length(base) < 3 then
    base := 'user';
  end if;
  base := left(base, 24); -- margen para el sufijo (<= 30)

  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    i := i + 1;
    candidate := base || (floor(random() * 9000) + 1000)::int::text; -- sufijo de 4 dígitos
    if i > 20 then
      -- fallback prácticamente sin colisión
      candidate := left(base || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6), 30);
      exit;
    end if;
  end loop;

  return candidate;
end;
$$;

revoke all on function public.unique_username(text) from public, anon, authenticated;

-- 2) handle_new_user: username = proveedor -> prefijo email -> generado. Nunca NULL ni roto por colisión.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  computed_username text;
  computed_full_name text;
  computed_email text;
  computed_phone text;
begin
  -- username SIEMPRE válido y único (saneado, con sufijo si colisiona, nunca vacío)
  computed_username := public.unique_username(
    coalesce(
      new.raw_user_meta_data->>'username',
      case when new.email is not null then split_part(new.email, '@', 1) else null end
    )
  );

  computed_email := coalesce(new.email, new.raw_user_meta_data->>'email');
  computed_phone := coalesce(new.phone, new.raw_user_meta_data->>'phone');

  computed_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    nullif(
      trim(
        coalesce(new.raw_user_meta_data->>'given_name', '') || ' ' ||
        coalesce(new.raw_user_meta_data->>'family_name', '')
      ),
      ''
    ),
    null
  );

  insert into public.profiles (
    id, updated_at, username, full_name, avatar_url, website, email, phone
  )
  values (
    new.id,
    now(),
    computed_username,
    computed_full_name,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'website',
    computed_email,
    computed_phone
  )
  on conflict (id) do update set
    updated_at = now(),
    username   = coalesce(public.profiles.username, excluded.username),
    full_name  = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    website    = coalesce(excluded.website, public.profiles.website),
    email      = coalesce(excluded.email, public.profiles.email),
    phone      = coalesce(excluded.phone, public.profiles.phone);

  return new;
end;
$function$;

-- 3) Backfill defensivo: cualquier perfil sin username válido recibe uno generado.
update public.profiles
set username = public.unique_username(coalesce(username, 'user'))
where username is null or char_length(username) < 3;

-- 4) Reforzar "nunca vacío" a nivel BD.
alter table public.profiles alter column username set not null;
