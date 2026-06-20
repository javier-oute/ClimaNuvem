# Base de datos — ClimaNuvem (Supabase)

Documentación del esquema **real** de la base de datos de ClimaNuvem tras la auditoría y
limpieza del 2026-06-16 (actualizada el **2026-06-17** con la implementación de la subida de
avatares: ver §6). Incluye tablas, relaciones, RLS, Storage, funciones/triggers, el
modelo de seguridad y un **registro de auditoría con todos los comandos ejecutados**.

- **Proyecto Supabase**: `javier-oute's ClimaNuvem-prueba` (`egefjrnnjyuazdoabebd`), región `eu-west-1`.
- **Motor**: PostgreSQL 17.6 + PostGIS 3.3.7.
- **Esquema gestionado por migraciones**: `supabase/migrations/` (antes se construía a mano por el dashboard).

> ⚠️ La seguridad de los datos de usuario recae **enteramente en RLS** (patrón estándar Supabase):
> los roles `anon` y `authenticated` tienen privilegios de tabla amplios, pero las políticas RLS
> son las que restringen filas. Cualquier tabla nueva en `public` **debe** llevar RLS habilitado.

---

## 1. Tabla `public.profiles`

Perfil de cada usuario (1:1 con `auth.users`). Lo crea automáticamente el trigger
`on_auth_user_created` al registrarse.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | **PK**. **FK → `auth.users(id)` ON DELETE CASCADE**. |
| `updated_at` | `timestamptz` | default `now()`; lo actualiza el trigger `profiles_set_updated_at`. |
| `username` | `text` | **UNIQUE**, CHECK `char_length(username) >= 3`. |
| `full_name` | `text` | nullable. |
| `avatar_url` | `text` | nullable. Puede guardar **dos formatos**: (a) URL externa de OAuth (Google/Apple, empieza por `http`) puesta al registrarse, o (b) **path de Storage** `{uid}/avatar.jpg` si el usuario sube su propia foto. La app distingue ambos con `resolveAvatarUrl` (§6). |
| `website` | `text` | nullable. Sin uso en la app (resto del quickstart). |
| `email` | `text` | nullable. **PII** — solo visible para el propio usuario. |
| `phone` | `text` | nullable. **PII** — solo visible para el propio usuario. |

**RLS** (habilitado):
- `profiles_select_own` — `SELECT` a `authenticated` con `(select auth.uid()) = id`. Cada usuario solo lee su propio perfil.
- `Users can insert their own profile.` — `INSERT`, `with_check ((select auth.uid()) = id)`.
- `Users can update own profile.` — `UPDATE`, `using ((select auth.uid()) = id)`.

**Uso en la app**: `stores/auth.store.ts` (`.select("*").eq("id", ownId)`) y
`features/profile/profile-api.js` (`upsertProfile` → `full_name`, `phone`, `username`). Nunca se
leen perfiles de otros usuarios.

---

## 2. Tabla `public.forecast_history`

Historial de predicciones guardadas por el usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | **PK**, default `gen_random_uuid()`. |
| `user_id` | `uuid` | **FK → `public.profiles(id)` ON DELETE CASCADE**. |
| `name` | `text` | CHECK no vacío **y `<= 120`**. Nombre que pone el usuario. |
| `created_at` | `timestamptz` | default `now()`. |
| `updated_at` | `timestamptz` | default `now()`; trigger `trg_forecast_history_set_updated_at`. |
| `forecast` | `text` | **clave de clase** del modelo (ej. `tormenta`). *Antes era `jsonb`; convertido a `text` en M6.* |
| `probability` | `numeric` | CHECK `0 <= probability <= 1`. |
| `place_name` | `text` | nullable, CHECK `<= 200`. |
| `location` | `geography(Point,4326)` | nullable. Coords GPS (solo si `source === "camera"`). SRID 4326. |
| `image_bucket` | `text` | default `'forecast-images'`. Forward-looking (multi-bucket). |
| `image_path` | `text` | nullable, CHECK no vacío si no nulo. Ruta en Storage `{uid}/{ts}.jpg`. |
| `image_taken_at` | `timestamptz` | nullable. Forward-looking (EXIF); la app aún no lo escribe. |
| `image_meta` | `jsonb` | default `'{}'`. Forward-looking (metadatos); la app aún no lo escribe. |
| `place_name_source` | `text` | default `'none'`, CHECK ∈ `{auto, user, none}`. |

**Índices**:
- `forecast_history_pkey` (PK sobre `id`).
- `forecast_history_user_created_idx` `(user_id, created_at DESC)` — usado por la paginación del historial.
- `forecast_history_location_gix` GIST sobre `location` — sin uso aún; **se conserva** para el filtro espacial `ST_DWithin` del mapa (Fase 2).
- *(eliminado en M6: `forecast_history_image_path_idx`, sin uso.)*

**RLS** (habilitado) — un único juego por acción, rol `authenticated`, con `(select auth.uid())`:
- `fh_select_own` / `fh_insert_own` / `fh_update_own` / `fh_delete_own`, todas con `user_id = (select auth.uid())`.

**Uso en la app**: `lib/forecastHistory.js` (fetch paginado, fetch detalle, delete) y
`stores/forecast.store.js` (`saveForecastWithPhoto`: sube imagen + INSERT).

---

## 3. Tabla `public.spatial_ref_sys`

Tabla de sistema de **PostGIS** (definiciones de sistemas de referencia espacial). No es de la app.
- RLS **off** (limitación de PostGIS; activarlo puede romper funciones espaciales).
- En M4b se **revocó** `INSERT/UPDATE/DELETE/TRUNCATE` a `anon`/`authenticated` (antes era escribible por cualquiera con la anon key); se conserva `SELECT`.

---

## 4. Vista `public.public_profiles`

Subconjunto **seguro** de `profiles` (`id`, `username`, `full_name`, `avatar_url`) — **sin email ni phone**.
Pensada para que el mapa comunitario muestre "avatar + nombre" de quien publica.
- `GRANT SELECT` a `authenticated`; `REVOKE` a `anon`.
- Actualmente `security_invoker = on` (M1b) → respeta el RLS de `profiles` (hoy devuelve solo la fila propia).
- **Fase 2 (pendiente)**: para mostrar datos de *otros* usuarios en el mapa habrá que exponer este
  subconjunto de forma controlada (función `SECURITY DEFINER` que devuelva solo columnas seguras, o
  guardar un snapshot de alias/avatar en la propia predicción). Decidir al implementar el mapa real.

---

## 5. Funciones y triggers

| Función | Tipo | Disparada por |
|---|---|---|
| `handle_new_user()` | `SECURITY DEFINER`, `search_path='public'` | trigger `on_auth_user_created` (AFTER INSERT en `auth.users`) → crea/upserta la fila en `profiles`. EXECUTE revocado de anon/authenticated (M3). |
| `sync_profile_email()` | `SECURITY DEFINER`, `search_path='public'` | trigger `on_auth_user_updated_email` (AFTER UPDATE OF email en `auth.users`) → sincroniza `profiles.email`. EXECUTE revocado (M3). |
| `set_updated_at()` | `search_path=''` (M4) | trigger `trg_forecast_history_set_updated_at` (BEFORE UPDATE). |
| `set_profiles_updated_at()` | `search_path=''` (M4) | trigger `profiles_set_updated_at` (BEFORE UPDATE). |

*(Eliminada en M3: `handle_user_update()` — era huérfana, ningún trigger la usaba.)*

---

## 6. Storage

Dos buckets **privados** (`public = false`): `forecast-images` (predicciones) y `avatars` (fotos de perfil).

### Límites de los buckets
| Bucket | `file_size_limit` | `allowed_mime_types` | Nota |
|---|---|---|---|
| `forecast-images` | sin límite (`null`) | sin límite (`null`) | — |
| `avatars` | **5 MB** (`5242880`) | **`image/jpeg, image/png, image/webp`** | Endurecido en M7 (2026-06-17). |

> El límite de `avatars` es **defensa en profundidad**: las políticas RLS controlan QUIÉN sube
> (cada usuario a su carpeta `{uid}/`) pero no QUÉ ni CUÁNTO. La app sube siempre JPEG ~512×512
> (~50-100 KB), así que 5 MB es holgado para cualquier avatar legítimo y a la vez corta abusos por
> API directa (vídeos / archivos enormes). MIME limitado a imágenes (nada de vídeo/PDF/etc.).

**Políticas `storage.objects`** (todas rol `authenticated`, aislamiento por carpeta `{uid}/`):
- `forecast-images`: `upload own` / `read own` / `update own` / `delete own` (con `name LIKE uid/%`).
- `avatars`: `avatars_insert_own` / `avatars_update_own` / `avatars_delete_own` (escritura solo en la
  carpeta propia) + `avatars_read_authenticated` (cualquier autenticado puede leer/firmar cualquier
  avatar → para el mapa Fase 2; **no** `anon`).

Acceso a imágenes siempre por **URL firmada** temporal (privadas).

### Subida de avatar (implementada 2026-06-17)
Flujo y módulos (front-end; backend ya estaba preparado):
- **`stores/profile.store.image.js`** — operaciones de Storage sobre el bucket `avatars`:
  - `uploadAvatar({ uri, userId })`: sube a `avatars/{userId}/avatar.jpg` con `upsert: true` y
    `cacheControl: "0"`. **Nombre de archivo fijo** → cada cambio sobrescribe el anterior, no se
    acumulan huérfanos. Devuelve el path, que se guarda en `profiles.avatar_url`.
  - `getAvatarSignedUrl(path, expiresIn=600)` / `deleteAvatar(path)`.
  - `resolveAvatarUrl(avatarUrl)`: si es `null` → `null`; si empieza por `http` (OAuth) → se usa tal
    cual; si es un path de Storage → genera URL firmada. `isStorageAvatarPath()` distingue ambos.
- **`hooks/profile/usePickAvatar.jsx`**: cámara/galería (`expo-image-picker`, recorte 1:1) +
  redimensión a 512×512 JPEG (`expo-image-manipulator`). No sube nada (guardado diferido).
- **`hooks/profile/useProfileForm.jsx`**: estado *staged* (`avatarUri`/`avatarAction`); la subida o el
  borrado en Storage ocurren **solo al pulsar Guardar** (Cancelar deja el avatar previo intacto).
- UI: `components/profile/profile-avatar.jsx` (círculo nítido + badge con lápiz en la esquina, solo en
  edición) y `components/profile/avatar-source-sheet.jsx` (bottom sheet Cámara/Galería/Quitar).

*(Eliminadas en M2: `"Anyone can upload an avatar."`, `"Avatar images are publicly accessible."`,
`"authenticated can upload to photos"` (bucket inexistente), `"TEMP allow authenticated uploads to forecast-images"`.)*

### Eliminación de cuenta (implementada 2026-06-17)
**Edge Function `delete-account`** (`supabase/functions/delete-account/index.ts`, `verify_jwt = true`):
borra de forma **completa e irreversible** la cuenta del usuario que la invoca.
1. Identifica al usuario por su JWT (cliente scoped + `getUser()`).
2. Con un cliente **`service_role`** (solo en el runtime; nunca en el cliente) borra, por lotes, todos
   los objetos de Storage del usuario en `forecast-images/{uid}/` **y** `avatars/{uid}/` (vía Storage API).
3. `auth.admin.deleteUser(uid)` → **cascada** a `profiles` → `forecast_history` y a todas las tablas
   `auth.*`. Orden Storage→auth (reintentable si fallara entre medias).
El cliente (`stores/auth.store.ts → deleteAccount`) la invoca con `supabase.functions.invoke`, limpia las
preferencias locales (`AsyncStorage` `climanuvem-settings`) + token cifrado (`hardResetSupabaseAuth`) y
redirige a login. UI: `components/profile/delete-account-modal.jsx` (confirmación escrita).

---

## 7. Extensiones, Realtime y modelo de seguridad

- **Extensiones instaladas**: `postgis`, `pgcrypto`, `uuid-ossp`, `pg_graphql`, `pg_stat_statements`, `supabase_vault`, `plpgsql`.
- **Realtime**: publicación **vacía** (la app no usa suscripciones en tiempo real).
- **GRANTs**: `anon`/`authenticated` tienen privilegios amplios de tabla; **RLS es la única barrera** de filas.

### Avisos del linter aceptados / conocidos (no son acciones pendientes)
Tras la limpieza, los advisors restantes son **inherentes a PostGIS/Supabase** o decisiones conscientes:
- `extension_in_public` (postgis en `public`): mover el schema es arriesgado. Se deja.
- `rls_disabled_in_public` (`spatial_ref_sys`): tabla de sistema PostGIS; escritura ya revocada (M4b).
- `*_security_definer_function_executable` (`st_estimatedextent`): función C de PostGIS; no se toca.
- `pg_graphql_*_table_exposed`: aviso genérico de descubribilidad GraphQL; RLS protege las filas.
  (Opcional: `REVOKE SELECT ... FROM anon` en `profiles`/`forecast_history` para silenciarlo.)
- `auth_leaked_password_protection`: la app usa solo OAuth (Apple/Google); opcional activarlo en el dashboard.

---

## 8. Huecos conocidos / decisiones pendientes (NO resueltos a propósito)

1. ~~**Imágenes huérfanas al borrar usuario**~~ → **RESUELTO (2026-06-17)**: la baja de cuenta se hace
   por la Edge Function `delete-account`, que borra `forecast-images/{uid}/` y `avatars/{uid}/` (Storage
   API) **antes** de eliminar el usuario auth (cascada BD). Ya no quedan huérfanos. (Único matiz: si una
   imagen se subiera por una vía que no pasara por la app, habría que volver a limpiarla; no aplica hoy.)
2. **Inconsistencia histórica en `forecast`**: 4 filas antiguas (datos de prueba) guardan el *mensaje*
   de alerta y la fila nueva guarda la *clave de clase*. El historial tolera ambos. Pendiente decidir:
   dejarlas, borrar las filas de prueba, o reasignarlas a una clase.

---

## 9. Fase 2 — Mapa comunitario (IMPLEMENTADO 2026-06-20)

Diseño completo en `../mapa-comunitario-fase2-diseño.md` y log en `../mapa-comunitario-implementacion-log.md`.
Migraciones `20260620120000…120600`. Resumen del esquema añadido:

### Tablas nuevas
- **`public.community_predictions`** — publicaciones del mapa. Columnas: `id`, `user_id` (FK→profiles,
  CASCADE), `forecast_history_id` (FK→forecast_history, CASCADE), `forecast` (CHECK 7 clases publicables),
  `probability` (0..1), `location` `geography(Point,4326)` **ya snapeada ~2 km** (nunca exacta),
  `place_name`, `description` (≤280), `image_path`, `published_at`, `expires_at` (=+6 h),
  `reported_count`, `hidden_at`, `created_at`. Índices: GIST(location), (expires_at), (user_id),
  (image_path), (forecast_history_id).
- **`public.community_reports`** — `id`, `prediction_id` (FK→community_predictions, CASCADE),
  `reporter_id` (FK→profiles, CASCADE), `created_at`, **UNIQUE(prediction_id, reporter_id)**.

### Columnas añadidas
- `public.profiles.is_admin boolean default false` — rol admin (se activa **manualmente en BD**).
- `public.forecast_history.description text` (≤280) — comentario del autor (también se ve en el mapa).
- `public.forecast_history.published_at timestamptz` — marca durable "fue publicada" (badge gris).

### RLS
- `community_predictions`: `cp_select_active` (SELECT authenticated: `expires_at>now() and hidden_at is null`);
  `cp_delete_own_or_admin` (DELETE: dueño o admin). **Sin INSERT/UPDATE directo** (solo RPC). `SELECT`
  revocado a `anon`.
- `community_reports`: `cr_select_admin` (solo admin lee). INSERT solo por RPC. `SELECT` revocado a `anon`.

### Funciones RPC (`SECURITY DEFINER`, `search_path=''`, EXECUTE solo `authenticated`)
- `publish_prediction(p_forecast_history_id, p_lat, p_lon, p_forecast, p_probability, p_image_path, p_place_name, p_description)`
  → valida sesión + propiedad del historial + propiedad de `image_path`; **límite 3 activas**; **snap**
  `round(·,2)`; inserta (`expires_at=now()+6h`); marca `forecast_history.published_at`. Devuelve uuid.
- `unpublish_prediction(p_id)` → borra si dueño o admin.
- `report_prediction(p_id)` → inserta reporte (`on conflict do nothing`); recuenta; **oculta a 3**.
- `get_nearby_predictions(p_lat, p_lon)` → `ST_DWithin(...,30000)` + activas/no ocultas + **join `profiles`**
  (username, avatar_url) + `is_mine`, `LIMIT 200`.
- `get_prediction_by_id(p_id)` → una fila (mismo join + filtros).

### Storage
- Política `forecast_images_read_if_published` en `storage.objects`: cualquier autenticado puede firmar una
  imagen de `forecast-images` **solo** si existe una publicación **activa y no oculta** que la referencia
  (acceso auto-expirable, sin copiar la imagen). El avatar del autor se sirve con la política existente
  `avatars_read_authenticated`.

### Limpieza y otros
- **`pg_cron`** habilitado; job horario `cleanup_expired_community_predictions` borra caducadas > 1 h
  (el filtro `expires_at>now()` en lectura es la barrera real; el cron solo limpia).
- Vista **`public_profiles` eliminada** (la identidad del autor se resuelve por RPC).
- `delete-account`: la cascada por FK (`community_predictions`/`community_reports` → profiles) basta; las
  imágenes del usuario ya las borra (`forecast-images/{uid}/`). Sin cambios necesarios.

### Advisors
Sin problemas nuevos críticos. Avisos esperables y aceptados: discoverability GraphQL (RLS protege filas;
`anon` revocado) y `authenticated_security_definer_function_executable` de las 5 RPC (intencionado: el
diseño requiere que `authenticated` las ejecute para hacer snap/join con privilegios de owner).

---

# Apéndice A — Registro de auditoría (todos los comandos ejecutados)

## A.1. Herramientas MCP de inspección (solo lectura)
- `list_projects`, `list_tables(public, storage, verbose)`, `list_migrations`, `list_extensions`,
  `list_edge_functions` (vacío), `get_advisors(security)` y `get_advisors(performance)` — antes y después de los cambios.

## A.2. Consultas SQL de análisis (solo lectura)

```sql
-- Conteo real de filas (la estimación de list_tables daba 0; era pg_class.reltuples sin ANALYZE)
select 'profiles' as t, count(*) from public.profiles
union all select 'forecast_history', count(*) from public.forecast_history
union all select 'storage.objects', count(*) from storage.objects
union all select 'storage.objects forecast-images', count(*) from storage.objects where bucket_id='forecast-images'
union all select 'storage.objects avatars', count(*) from storage.objects where bucket_id='avatars'
union all select 'auth.users', count(*) from auth.users;
-- Resultado: profiles=4, forecast_history=5, storage forecast-images=6 (5 imgs + 1 placeholder),
--            avatars=0, auth.users=4

-- Políticas RLS (public + storage)
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname in ('public','storage') order by tablename, cmd, policyname;

-- Triggers
select n.nspname as schema, c.relname as table, t.tgname as trigger, pg_get_triggerdef(t.oid) as def
from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
where not t.tgisinternal and n.nspname in ('public','auth') order by 1,2,3;

-- Definiciones de funciones
select p.proname, pg_get_function_identity_arguments(p.oid) as args, pg_get_functiondef(p.oid) as def
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
  ('handle_new_user','handle_user_update','sync_profile_email','set_updated_at','set_profiles_updated_at') order by 1;

-- Índices
select indexname, indexdef from pg_indexes
where schemaname='public' and tablename in ('profiles','forecast_history') order by tablename, indexname;

-- Buckets de Storage
select id, name, public, file_size_limit, allowed_mime_types, created_at from storage.buckets order by id;

-- Volcado de datos de forecast_history (tipo y contenido de forecast, etc.)
select id, user_id, name, jsonb_typeof(forecast) as forecast_kind, forecast::text as forecast_raw,
  probability, place_name, place_name_source, image_bucket, image_path, image_taken_at,
  image_meta::text, (location is not null) as has_location, created_at, updated_at
from public.forecast_history order by created_at;

-- Presencia de PII en profiles (sin volcar el valor)
select id, username, (full_name is not null) as has_name, (email is not null) as has_email,
  (phone is not null) as has_phone, (avatar_url is not null) as has_avatar,
  (website is not null) as has_website, updated_at from public.profiles order by updated_at;

-- Imágenes huérfanas vs registros (solo apareció un .emptyFolderPlaceholder)
with imgs as (select name from storage.objects where bucket_id='forecast-images'),
     recs as (select image_path from public.forecast_history where image_path is not null)
select 'orphan_storage' as kind, name as path from imgs where name not in (select image_path from recs)
union all select 'missing_storage', image_path from recs where image_path not in (select name from imgs);

-- Constraints (FK con acciones, checks)
select conrelid::regclass as table, conname, contype,
  case confdeltype when 'a' then 'NO ACTION' when 'r' then 'RESTRICT' when 'c' then 'CASCADE'
       when 'n' then 'SET NULL' when 'd' then 'SET DEFAULT' end as on_delete,
  pg_get_constraintdef(oid) as def
from pg_constraint where connamespace='public'::regnamespace
  and conrelid in ('public.profiles'::regclass,'public.forecast_history'::regclass)
order by conrelid::regclass::text, contype, conname;

-- GRANTs por rol
select table_schema, table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privs
from information_schema.role_table_grants
where (table_schema='public' and table_name in ('profiles','forecast_history','spatial_ref_sys'))
   or (table_schema='storage' and table_name='objects')
group by table_schema, table_name, grantee order by table_schema, table_name, grantee;

-- Flags de RLS + SRID de location
select c.relname as table, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced,
  postgis_typmod_srid(a.atttypmod) as location_srid, format_type(a.atttypid, a.atttypmod) as location_type
from pg_class c join pg_namespace n on n.oid=c.relnamespace and n.nspname='public'
left join pg_attribute a on a.attrelid=c.oid and a.attname='location'
where c.relname in ('profiles','forecast_history');

-- Pertenencia a publicaciones Realtime (resultado: vacío)
select pubname, schemaname, tablename from pg_publication_tables
where schemaname in ('public','storage') order by pubname, tablename;

-- Verificación post-migración (integridad de datos)
select id, pg_typeof(forecast) as type, forecast, probability from public.forecast_history order by created_at;
select 'profiles' t, count(*) from public.profiles
union all select 'forecast_history', count(*) from public.forecast_history;

-- (2026-06-17) Avatar: verificación de backend y de la migración M7
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id in ('avatars','forecast-images');
select policyname, cmd, roles::text from pg_policies
where schemaname='storage' and tablename='objects' and policyname like 'avatars%' order by policyname;
select column_name, data_type from information_schema.columns
where table_schema='public' and table_name='profiles' and column_name='avatar_url';
-- Resultado tras M7: avatars file_size_limit=5242880 (5 MB),
--                    allowed_mime_types={image/jpeg,image/png,image/webp}.
```

## A.3. Migraciones DDL aplicadas (en orden)

Cada una está en `supabase/migrations/<version>_<name>.sql`:

| Versión | Nombre | Qué hace |
|---|---|---|
| `20260616092030` | `tighten_profiles_rls_add_public_view` | RLS de `profiles` a solo-dueño + vista `public_profiles`. |
| `20260616092044` | `cleanup_storage_policies_and_secure_avatars` | Borra políticas Storage inseguras/huérfanas + políticas seguras de avatar. |
| `20260616092051` | `revoke_definer_rpc_drop_orphan_fn` | Revoca EXECUTE de funciones de trigger + borra `handle_user_update`. |
| `20260616092056` | `harden_trigger_fns_search_path` | `search_path=''` en `set_updated_at` y `set_profiles_updated_at`. |
| `20260616092103` | `lock_down_spatial_ref_sys` | Revoca escritura de anon/authenticated en `spatial_ref_sys`. |
| `20260616092111` | `consolidate_forecast_history_rls` | Un único juego de políticas RLS con `(select auth.uid())`. |
| `20260616092121` | `forecast_to_text_drop_unused_index` | `forecast` `jsonb→text` + borra índice `image_path_idx`. |
| `20260616092349` | `public_profiles_security_invoker` | Vista `public_profiles` a `security_invoker = on`. |
| `20260617170842` | `harden_avatars_bucket_limits` | Bucket `avatars`: `file_size_limit=5 MB` + MIME solo `image/jpeg,png,webp` (2026-06-17). |

## A.4. Comandos de shell ejecutados

```bash
npm run lint   # expo lint → sin errores
npx jest --watchAll=false --ci   # 8 suites, 150 passed + 3 todo (153 total), 0.6 s
```
(Nota: `npm test` a secas puede quedar a la espera; usar `--watchAll=false --ci` en CI/agentes.)

## A.5. Verificación final
- Advisors de **rendimiento**: limpio salvo `unused_index` en `forecast_history_location_gix` (INFO, conservado a propósito).
- Advisors de **seguridad**: resueltos todos los introducidos por la app; quedan solo los inherentes a PostGIS/Supabase (ver §7).
- Integridad: `forecast` ahora `text` con los 5 valores intactos; `profiles` sigue con 4 filas; conteos sin cambios.
