# AGENTS.md — Guía para agentes IA y desarrolladores

Guía operativa del repositorio **ClimaNuvem** (app móvil). Si eres un agente IA trabajando en este repo, lee esto antes de tocar nada.

> **Contexto ampliado del TFG** (modelo ML, dataset, literatura, planificación) vive **fuera de este repo**, en la carpeta padre del workspace (`../CLAUDE.md`, `../Ayuda/`, `../Revision.md`, `../Testing.md`, `../funcionalidad-mapa.md`, notebook de entrenamiento). Ese material NO está versionado aquí. Este AGENTS.md cubre lo operativo del código.

---

## 1. Qué es

ClimaNuvem es una app React Native / Expo (TFG, USC + HP SCDS) de seguridad para montañeros: clasifica fotos del cielo en **8 categorías de riesgo meteorológico** con un modelo EfficientNet-Lite0 (`.tflite`) ejecutado en dispositivo, y emite alertas accionables. Backend en Supabase (auth, DB, storage).

- **Código en inglés**, **UI/comentarios/mensajes en español**. Textos de usuario vía i18n (es/gl/en).
- Alias de imports: `@/` → raíz del repo (`tsconfig.json` + `jest.config.js`).

---

## 2. Git

- **Remoto:** `origin` → `github.com/javier-oute/ClimaNuvem`.
- **Este repo es la raíz de git.** La carpeta padre del workspace NO está versionada.
- Trabaja en ramas de feature (p. ej. `feature-mapa`). **No cambies de rama sin que te lo pidan.**
- No commitees secretos. `.env` está en `.gitignore` (usa `.env.example` si existe).
- Avisos: `climanuvem.apk` (~13 MB) está **trackeado por error** — es un artefacto de build que debería estar ignorado. `ios/` y `android/` están ignorados (proyecto prebuild).

---

## 3. Comandos

```bash
npm install            # dependencias

npm start              # Metro bundler (development build)
npm run ios            # expo run:ios (build nativo local)
npm run android        # expo run:android

npm run lint           # expo lint (ESLint + Prettier) — es el lint "oficial" del proyecto

npm test               # Jest: toda la suite
npm run test:unit      # solo unitarios
npm run test:integration
npm run test:coverage
npm run test:watch
```

- **No hay paso de `web` funcional** garantizado (la app depende de módulos nativos: tflite, maps, secure-store).
- `npm run lint` pasa limpio. Nota: `npx eslint .` directo reporta issues de Prettier/`no-undef` en ficheros de config/tests/servicios que el comando oficial NO audita; no los confundas con regresiones.
- Los tests **no** corren en EAS Build ni en `npm start`.

### EAS Build
- `development`: `developmentClient: true`, distribución interna, Android → APK.
- `preview`: distribución interna, Android → APK.
- `production`: `autoIncrement`.

> **⚠️ Tras instalar una dependencia nativa nueva** (p. ej. `react-native-maps`) hay que **reconstruir el binario** (`npm run ios/android` o `eas build`). Un `npm install` solo trae el JS; el módulo nativo no existirá en un build previo (error típico: `RNMapsAirModule could not be found`).

---

## 4. Estructura

```
app/                       Rutas (Expo Router, file-based)
  _layout.js               RootLayout (gesture handler, safe area, AuthBootstrap, applyStoredTheme)
  index.js                 Redirect según sesión
  (auth)/login.js          Login (Apple / Google / Invitado)
  (tabs)/
    _layout.js             Re-exporta _layout.android.js (default de plataforma)
    _layout.android.js     Tabs clásico + Tabs.Protected (guard por sesión)
    _layout.ios.js         NativeTabs (hidden={!session})
    home/index.js          Home (video fondo + botones + acceso a ayuda)
    guide.js               Guía de nubes (tab PÚBLICA)
    history/index.js       Historial paginado
    map.js                 Mapa comunitario (tab PROTEGIDA, Fase 1 mock)
    profile.js             Perfil + preferencias (idioma/tema) + logout
  forecast-screen.js       Resultado de inferencia (BottomSheet)
  [id].js                  Detalle de predicción guardada
  cloud/[type].tsx         Detalle de un género de nube
  map-prediction/[id].js   Detalle de predicción comunitaria
  help.js                  Cómo fotografiar correctamente
components/                UI (buttons, icons, forecast/, profile/, guide/, social-auth-buttons/)
hooks/                     useModel (inferencia), useTomarFoto, useCargarImagen, useShareForecast, profile/
stores/                    auth.store.ts, forecast.store.js, forecast.store.image.js, settings.store.js
lib/                       supabase, forecastHistory, format, location, savePhotos, i18n, mlNormalize, resetSupabaseAuth
features/                  profile/profile-api.js, guide/cloud-data.ts
services/                  communityMap.mock.js (mock del mapa; reemplazar por lib/ en Fase 2)
locales/                   es.js (fuente de verdad), gl.js, en.js
utils/                     phone.js
providers/                 AuthBootstrap.tsx
assets/models/             climanuvem_v2.tflite (ACTIVO) + climanuvem_labels.txt + mejor_modelo.pt
__tests__/                 unit/ · integration/ · pending/
```

---

## 5. Módulos clave (cómo funcionan)

- **Auth** (`stores/auth.store.ts` + `providers/AuthBootstrap.tsx`): `session === undefined` significa "inicializando" → NUNCA redirijas con `undefined`. Sesión cifrada (AES-256) en `LargeSecureStore` (`lib/supabase.ts`) porque supera el límite de SecureStore. Hard reset en `lib/resetSupabaseAuth.ts`.
- **Inferencia** (`hooks/useModel.jsx`): resize 224×224 → `jpeg.decode` → `normalizeRGBA` (ImageNet, `lib/mlNormalize.js`) → `tflite.model.run` → 8 probabilidades. **El array `CLASES` DEBE coincidir con el orden de `assets/models/climanuvem_labels.txt`.** Si re-entrenas el modelo, verifica ese orden. `ALERTAS` (colores) está inline en el hook; los textos de alerta vienen de `locales/*.alerts`.
- **Historial/Storage** (`lib/forecastHistory.js`, `stores/forecast.store*.js`): imágenes privadas en bucket `forecast-images`, acceso solo por URLs firmadas (10 min). `saveForecastWithPhoto` sube imagen → inserta fila (y borra la imagen si el INSERT falla).
- **Avatar de perfil** (`stores/profile.store.image.js`, `hooks/profile/usePickAvatar.jsx`, `components/profile/{profile-avatar,avatar-source-sheet}.jsx`): foto de perfil en bucket privado `avatars` (límite 5 MB + MIME `image/jpeg,png,webp`), guardado **diferido** (se sube solo al pulsar Guardar; Cancelar no toca Storage). `avatar_url` puede ser una URL externa de OAuth (`http…`) o un path de Storage (`{uid}/avatar.jpg`); `resolveAvatarUrl` lo distingue. Requiere `BottomSheetModalProvider` en `app/_layout.js`.
- **Eliminar cuenta** (`stores/auth.store.ts → deleteAccount`, `components/profile/delete-account-modal.jsx`, **Edge Function** `supabase/functions/delete-account/index.ts`): hard delete irreversible. La Edge Function (con `service_role`, nunca en el cliente; `verify_jwt`) borra Storage `forecast-images/{uid}/` + `avatars/{uid}/` y luego `auth.admin.deleteUser` → cascada a `profiles`/`forecast_history`/`auth.*`. El cliente confirma con palabra escrita, limpia local y va a login.
- **i18n + tema** (`lib/i18n.js`, `stores/settings.store.js`): ver §6.
- **Mapa** (`app/(tabs)/map.js`, `services/communityMap.mock.js`): Fase 1, datos mock. Fase 2 (Supabase + PostGIS) pendiente — ver `../funcionalidad-mapa.md`.
- **Base de datos** (Supabase Postgres + PostGIS): esquema documentado en **`docs/database.md`** y gestionado por **migraciones** en `supabase/migrations/`. Tablas: `profiles` (1:1 con `auth.users`) y `forecast_history`. Reglas al tocar la BD: (1) **toda tabla nueva en `public` lleva RLS** — la seguridad recae 100% en RLS; (2) acceso por usuario con `user_id = (select auth.uid())`; (3) Storage aislado por carpeta `{uid}/` y servido por URL firmada; (4) **nunca expongas PII** (`email`/`phone`) a otros usuarios — usa la vista `public_profiles` para datos públicos; (5) aplica cambios como migración (no a mano por el dashboard).

---

## 6. Convenciones (síguelas al añadir código)

- **Estilos:** solo NativeWind (`className`), salvo valores dinámicos en runtime (`style={{}}`). Color primario `#314468`, gris `#b0aeaf`. Patrón de botón: `flex-row items-center justify-between rounded-3xl {bg} px-6 py-4 shadow-sm active:opacity-75`.
- **i18n:** todo texto visible va a `locales/{es,gl,en}.js` y se consume con `useT()` (reactivo). Fuera de React usa `t()`. Nunca hardcodees strings de UI. `es.js` es la referencia.
- **Modo oscuro:** todo contenedor/texto lleva variante `dark:`. Paleta: fondos `dark:bg-zinc-900`/`zinc-800`, textos `dark:text-zinc-100`/`zinc-400`, separadores `dark:bg-zinc-700`. Para color de iconos en runtime: `useColorScheme()` de `nativewind`.
- **Platform-specific:** Expo resuelve `.ios.*` / `.android.*` automáticamente (tabs, botón Apple, etc.).
- **Bottom sheets** (`@gorhom/bottom-sheet`): snap points dinámicos con `onLayout`, `index={1}`, `enableDynamicSizing={false}`; constantes de offset distintas por plataforma.
- **Imágenes:** `require()` estáticos (Metro no admite `require` dinámico). El manifiesto de la guía vive en `features/guide/cloud-data.ts`.
- **Código comentado al final de ficheros:** son referencias históricas. NO lo borres salvo que se pida explícitamente.

---

## 7. Tests

- Jest + `jest-expo`, entorno Node. Config: `jest.config.js` (alias `@/`, `collectCoverageFrom`), mocks nativos en `jest.setup.js`.
- Estado: **137 passing + 3 `it.todo`** en `__tests__/{unit,integration,pending}`.
- Cubren lógica pura e integración con Supabase mockeado (`lib/format`, `lib/mlNormalize`, `utils/phone`, `lib/forecastHistory`, `stores/forecast.store`).
- **Fuera de alcance actual:** tests de componentes (requieren `@testing-library/react-native` + mocks de Expo Router/NativeWind/BottomSheet), `useModel` completo, `LargeSecureStore`, E2E.
- Al corregir un bug con `it.todo` pendiente, conviértelo en test activo. Detalle en `../Testing.md`.

---

## 8. Estado y pendientes (junio 2026)

- **Modelo:** sigue activo `climanuvem_v2.tflite`. v3 (83.96%) y v4 definitivo pendientes de integrar (sustituir `.tflite` + revisar labels).
- **Alertas graduadas por confianza:** NO implementado (`useModel` solo toma top-1).
- **Mapa Fase 2 (backend):** pendiente.
- **Deuda técnica (`../Revision.md`):** `console.*` en producción, `climanuvem.apk` trackeado, permiso `RECORD_AUDIO` sin uso, deps sin usar.
- **Implementado recientemente:** i18n (es/gl/en), modo oscuro, guía de nubes, pantalla de ayuda, mapa Fase 1 (mock), suite de tests, y fixes de auditoría (C01/C02/C03/B01/DATE01).

---

## 9. Flujo de trabajo recomendado para un agente

1. Comprueba rama y estado (`git status`, `git branch`). No cambies de rama sin permiso.
2. Lee los ficheros que vas a tocar y el módulo relacionado de §5.
3. Respeta convenciones de §6 (i18n + dark + NativeWind).
4. Antes de commitear: `npm run lint` y `npm test`.
5. Commits pequeños y descritos; no incluyas builds/logs/caché/temporales.
