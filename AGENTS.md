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
- Avisos: `climanuvem.apk` (un fichero de **191 B con un JSON de error** de un build EAS fallido), `assets/models/climanuvem_v2.tflite` (sustituido por v3), `assets/models/climanuvem_labels.txt` y `assets/models/mejor_modelo.pt` (checkpoint PyTorch, no es asset de app) están **en `.gitignore` y ya DESTRACKEADOS** (`git rm --cached` hecho): siguen en disco pero **fuera del repo**. Verificado con `git ls-files`: lo único versionado en `assets/models/` es `climanuvem_v3.tflite` + `climanuvem_v3_labels.txt` (el activo). `ios/` y `android/` están ignorados (proyecto prebuild).
- **Rama de trabajo actual:** `feature-mapa` (mapa comunitario Fase 2).

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
    history/index.js       Historial paginado (recarga al enfocar para refrescar badges)
    map.js                 Mapa comunitario (tab PROTEGIDA, Fase 2 real con Supabase)
    profile.js             Perfil + preferencias (idioma/tema) + compartir-en-mapa + logout
  forecast-screen.js       Resultado de inferencia + publicar en mapa (BottomSheet)
  [id].js                  Detalle de predicción guardada (+ despublicar del mapa)
  cloud/[type].tsx         Detalle de un género de nube
  map-prediction/[id].js   Detalle de predicción comunitaria (+ reportar)
  help.js                  Cómo fotografiar correctamente
components/                UI (buttons, icons, forecast/, profile/, guide/, map/, history/, social-auth-buttons/)
hooks/                     useModel (inferencia), useTomarFoto, useCargarImagen, useShareForecast, profile/
stores/                    auth.store.ts, forecast.store.js, forecast.store.image.js, profile.store.image.js, settings.store.js
lib/                       supabase, forecastHistory, format, location, savePhotos, i18n, mlNormalize, resetSupabaseAuth,
                           communityMap (capa de datos del mapa Fase 2), mapConsent (avisos de consentimiento),
                           forecast/{evaluateForecast,model-meta} (decisión de alerta)
features/                  profile/profile-api.js, guide/cloud-data.ts
                           (carpeta services/ eliminada en la higiene 2026-06-20: el mock del mapa ya no existe; usar lib/communityMap.js)
locales/                   es.js (fuente de verdad), gl.js, en.js
utils/                     phone.js, username.js
providers/                 AuthBootstrap.tsx
supabase/                  migrations/ (esquema versionado), functions/delete-account/ (Edge Function)
assets/models/             climanuvem_v3.tflite (ACTIVO) + climanuvem_v3_labels.txt
                           climanuvem_v2.tflite + climanuvem_labels.txt (OBSOLETO, sin uso) + mejor_modelo.pt (PyTorch, no-asset)
__tests__/                 unit/ · integration/ · pending/
```

---

## 5. Módulos clave (cómo funcionan)

- **Auth** (`stores/auth.store.ts` + `providers/AuthBootstrap.tsx`): `session === undefined` significa "inicializando" → NUNCA redirijas con `undefined`. Sesión cifrada (AES-256) en `LargeSecureStore` (`lib/supabase.ts`) porque supera el límite de SecureStore. Hard reset en `lib/resetSupabaseAuth.ts`.
- **Inferencia** (`hooks/useModel.jsx`): modelo activo **`climanuvem_v3.tflite`**. Pipeline fiel al eval del notebook: Resize(256 lado corto) + CenterCrop(224) → `jpeg.decode` → `normalizeRGBA` (ImageNet, `lib/mlNormalize.js`, con detección de layout NCHW/NHWC) → `tflite.model.run` → 8 probabilidades (el modelo ya lleva softmax + temperature scaling → probs calibradas). El **orden de clases** y todos los umbrales viven en `lib/forecast/model-meta.js` (`CLASS_ORDER`, `RISK`, `RISK_COLORS`). **`CLASS_ORDER` DEBE coincidir con `assets/models/climanuvem_v3_labels.txt`** (invariante verificada por test). Si re-entrenas (v4): sustituye el `.tflite`, re-verifica labels y **re-deriva los umbrales de `model-meta.js`** con la nueva matriz de confusión y calibración.
- **Decisión de alerta** (`lib/forecast/evaluateForecast.js`, función PURA): usa **toda la distribución softmax** (no solo el top-1). Calcula banda de fiabilidad (`alta/media/baja`), suaviza el mensaje un escalón si la 2ª clase es bastante menos grave, y manda **"repetir foto"** si el top-1 es `foto_invalida` firme o si la inferencia es incoherente (par top1/top2 no esperado + confianza baja). **El top-1 SIEMPRE manda; nunca se escala la alerta a la 2ª clase.** Los textos por banda están en `locales/*.alerts`; los colores en `RISK_COLORS`.
- **Historial/Storage** (`lib/forecastHistory.js`, `stores/forecast.store*.js`): imágenes privadas en bucket `forecast-images`, acceso solo por URLs firmadas (10 min). `saveForecastWithPhoto` sube imagen → inserta fila (y borra la imagen si el INSERT falla).
- **Avatar de perfil** (`stores/profile.store.image.js`, `hooks/profile/usePickAvatar.jsx`, `components/profile/{profile-avatar,avatar-source-sheet}.jsx`): foto de perfil en bucket privado `avatars` (límite 5 MB + MIME `image/jpeg,png,webp`), guardado **diferido** (se sube solo al pulsar Guardar; Cancelar no toca Storage). `avatar_url` puede ser una URL externa de OAuth (`http…`) o un path de Storage (`{uid}/avatar.jpg`); `resolveAvatarUrl` lo distingue. Requiere `BottomSheetModalProvider` en `app/_layout.js`.
- **Eliminar cuenta** (`stores/auth.store.ts → deleteAccount`, `components/profile/delete-account-modal.jsx`, **Edge Function** `supabase/functions/delete-account/index.ts`): hard delete irreversible. La Edge Function (con `service_role`, nunca en el cliente; `verify_jwt`) borra Storage `forecast-images/{uid}/` + `avatars/{uid}/` y luego `auth.admin.deleteUser` → cascada a `profiles`/`forecast_history`/`auth.*`. El cliente confirma con palabra escrita, limpia local y va a login.
- **i18n + tema** (`lib/i18n.js`, `stores/settings.store.js`): ver §6. **Idioma por defecto: gallego (`gl`)**; tema por defecto claro.
- **Mapa comunitario — Fase 2 REAL** (`app/(tabs)/map.js`, `lib/communityMap.js`, `lib/mapConsent.js`): backend Supabase + PostGIS en producción (el antiguo mock `services/communityMap.mock.js` fue eliminado en la higiene 2026-06-20). `lib/communityMap.js` envuelve las RPC `SECURITY DEFINER`: `publishPrediction`, `unpublishPrediction`, `unpublishAllMine`, `reportPrediction`, `getActivePredictions`, `getPredictionById`. El servidor aplica **snap de coordenadas ~2 km** (privacidad), **límite de 3 activas**, **expiración 6 h** y moderación (oculta a 3 reportes). **Sin filtro de distancia** (decisión 2026-06-21, pocos usuarios): `getActivePredictions()` devuelve **todas** las publicaciones activas; la ubicación solo centra el mapa, no filtra. Antes era `getNearbyPredictions(lat, lon)` con radio de 30 km (`ST_DWithin`), reintroducible si crece la base de usuarios (ver `docs/database.md` §9). **Consentimiento** versionado por dispositivo en `settings.store` (`mapPublishConsentVersion`); el aviso (`promptMapPublishConsent`) se reutiliza al pulsar "Publicar" y al activar el ajuste. Al desactivar "compartir en el mapa" (`promptMapPublishDisable` + `unpublishAllMine`) se borran todas las publicaciones del usuario. Esquema en `docs/database.md` §9.
- **Base de datos** (Supabase Postgres + PostGIS): esquema documentado en **`docs/database.md`** y gestionado por **migraciones** en `supabase/migrations/`. Tablas: `profiles` (1:1 con `auth.users`), `forecast_history`, y **`community_predictions` / `community_reports`** (Fase 2). Reglas al tocar la BD: (1) **toda tabla nueva en `public` lleva RLS** — la seguridad recae 100% en RLS; (2) acceso por usuario con `user_id = (select auth.uid())`; (3) Storage aislado por carpeta `{uid}/` y servido por URL firmada; (4) **nunca expongas PII** (`email`/`phone`) a otros usuarios — la identidad pública del autor en el mapa se resuelve dentro de las RPC `SECURITY DEFINER` (la vista `public_profiles` fue **eliminada** en la Fase 2); (5) escrituras de tablas sensibles (mapa) solo por RPC, no INSERT/UPDATE directo; (6) aplica cambios como migración (no a mano por el dashboard).

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
- Estado: **224 passing, 0 `it.todo`** en **13 suites** de `__tests__/{unit,integration,pending}` (< 1 s). Los 3 antiguos `it.todo` (cobertura del mapeo de clases del pipeline) se **convirtieron en tests reales** sobre `evaluateForecast` (`__tests__/pending/known-bugs.test.js`).
- Cubren lógica pura e integración con Supabase mockeado: `lib/format`, `lib/mlNormalize`, `lib/forecast/{evaluateForecast,model-meta}`, `utils/phone`, `utils/username`, `lib/forecastHistory`, `stores/{forecast.store,settings.store}`, `stores/profile.store.image`, `lib/resetSupabaseAuth`, `lib/communityMap`, `saveForecastWithPhoto`.
- **Fuera de alcance actual:** tests de componentes (requieren `@testing-library/react-native` + mocks de Expo Router/NativeWind/BottomSheet), `useModel` completo, `LargeSecureStore`, E2E.
- Al corregir un bug con `it.todo` pendiente, conviértelo en test activo. Detalle en `../Testing.md`.

---

## 8. Estado y pendientes (2026-06-22)

> Análisis de estado realista y completo en **`docs/estado-proyecto.md`**. **Se asume `climanuvem_v3.tflite`
> como modelo FINAL del TFG**: el cierre es solidez + pruebas en dispositivo + higiene + demo, no entrenar otro modelo.

**Hecho (verificado en código):**
- **Modelo v3** activo (`climanuvem_v3.tflite`) con preprocesado de evaluación fiel y probs calibradas.
- **Alertas graduadas por confianza** (`lib/forecast/*`): bandas de fiabilidad, suavizado por 2ª clase, "repetir foto".
- **Mapa comunitario Fase 2** (backend Supabase real): publicar/despublicar/reportar, snap de coords, expiración 6 h, límite 3, consentimiento versionado, moderación, sin filtro de distancia. **Probado en dispositivo (2026-06-22): OK.**
- **Username robusto** (registro vía `unique_username`/`handle_new_user` + validación en el editor).
- **Visor de foto a pantalla completa** (`components/fullscreen-image-viewer.jsx`) con pista "Toca para ampliar", aviso de privacidad en el mapa, tarjetas de guía con cuadre estable, mensaje de carga descriptivo.
- i18n (es/gl/en, default gallego), modo oscuro, guía de nubes, ayuda (ampliada: presentación de la app + mockups), avatar de perfil, baja de cuenta (Edge Function), suite de tests (224).

**Pendiente (cierre/demo):**
- **Pasada de UX en iOS y Android** de todos los flujos (foto→resultado→guardar/publicar/compartir, invitado, historial, mapa, perfil/avatar, baja) buscando textos sin traducir y estados de error.
- **`console.*`** en producción (~90 ocurrencias en 21 ficheros): limpiar o sustituir por un logger silenciable en release.
- Decidir sobre filas históricas inconsistentes de `forecast_history` (mensaje vs clave de clase).
- Auditar dependencias sin imports en el código (candidatas: `react-native-url-polyfill`, `@react-navigation/bottom-tabs`, `react-native-web`/`react-dom` —solo web—; verificar antes de quitar, algunas pueden ser transitivas o de entry).

**Higiene ya aplicada (verificada):**
- `services/communityMap.mock.js` (código muerto) → **eliminado** (la carpeta `services/` ya no existe).
- `RECORD_AUDIO` retirado de `app.json` (`permissions: []`). **Requiere rebuild nativo** para surtir efecto.
- `climanuvem.apk`, `climanuvem_v2.tflite`, `climanuvem_labels.txt`, `mejor_modelo.pt` → en `.gitignore` y **destrackeados** (`git rm --cached` hecho; siguen en disco, fuera del repo).
- Los 3 `it.todo` del pipeline `useModel` → **convertidos en tests reales** (224 passing, 0 todo).

---

## 9. Flujo de trabajo recomendado para un agente

1. Comprueba rama y estado (`git status`, `git branch`). No cambies de rama sin permiso.
2. Lee los ficheros que vas a tocar y el módulo relacionado de §5.
3. Respeta convenciones de §6 (i18n + dark + NativeWind).
4. Antes de commitear: `npm run lint` y `npm test`.
5. Commits pequeños y descritos; no incluyas builds/logs/caché/temporales.
