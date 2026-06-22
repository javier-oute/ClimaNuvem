# Estado real del proyecto — ClimaNuvem

> Análisis técnico del estado **real** del código a fecha **2026-06-22**, hecho leyendo el árbol
> completo (app, hooks, stores, lib, features, services, supabase, tests y documentación). Su objetivo
> es dar una visión realista —no optimista— de qué está hecho, qué está a medias, qué puede romperse y
> qué conviene priorizar. Complementa a `AGENTS.md` (guía operativa) y `docs/database.md` (esquema BD).

---

## 1. Resumen ejecutivo

ClimaNuvem está **más avanzado de lo que decía su documentación**. Dos hitos grandes que la doc daba por
pendientes están de hecho **implementados y en uso**:

1. **Modelo v3 + alertas graduadas por confianza.** La app ya no usa `climanuvem_v2.tflite` ni la lógica
   "solo top-1": usa `climanuvem_v3.tflite` con un preprocesado de evaluación fiel (Resize 256 lado corto
   + CenterCrop 224, detección de layout NCHW/NHWC) y un motor de decisión de alerta basado en **toda la
   distribución softmax** (`lib/forecast/evaluateForecast.js` + `lib/forecast/model-meta.js`), con bandas
   de fiabilidad calibradas, suavizado por 2ª clase y detección de inferencias incoherentes ("repetir foto").
2. **Mapa comunitario Fase 2 (backend Supabase real).** Ya no es un mock: hay tablas
   `community_predictions` / `community_reports`, RPCs `SECURITY DEFINER`, RLS, política de Storage
   auto-expirable, `pg_cron` de limpieza, snap de coordenadas por privacidad, límite de 3 publicaciones
   activas, expiración a 6 h, reportes/moderación, consentimiento versionado por dispositivo, y flujos de
   publicar / despublicar / desactivar-compartir.

El estado es **sólido para un TFG**. Los riesgos pendientes son sobre todo de **higiene** (artefactos
trackeados, modelo viejo sin usar, documentación desincronizada) y de **cierre** (modelo v4 definitivo,
pruebas en dispositivo del mapa Fase 2, decisiones de UX/privacidad).

> **Higiene — estado real a 2026-06-22 (verificado con `git ls-files`).**
> - ✅ **Hecho y commiteado:** `services/communityMap.mock.js` (código muerto) **eliminado** (la carpeta
>   `services/` ya no existe); `RECORD_AUDIO` retirado de `app.json` (`permissions: []`, **requiere rebuild
>   nativo** para surtir efecto); username robusto implementado (migración `robust_username` + `utils/username.js`).
> - ✅ **Artefactos destrackeados (ya resuelto):** `climanuvem.apk`, `climanuvem_v2.tflite`,
>   `climanuvem_labels.txt` y `mejor_modelo.pt` están en `.gitignore` y **ya NO se versionan** (`git rm
>   --cached` hecho). Verificado: `git ls-files` solo lista `climanuvem_v3.tflite` + `climanuvem_v3_labels.txt`
>   en `assets/models/`. Los ficheros siguen en disco (peso local: `v2.tflite` ~13 MB, `mejor_modelo.pt`
>   ~13 MB) pero fuera del repo.
> - ✅ **Tests:** los 3 antiguos `it.todo` se convirtieron en tests reales → **224 passing, 0 todo** (13 suites).
> - ⏳ **Pendiente:** limpiar `console.*` de producción (~90 ocurrencias en 21 ficheros) y auditar dependencias sin usar.

---

## 2. Qué está bien (hecho y coherente)

- **Autenticación.** Apple / Google / invitado, sesión cifrada AES-256 en `LargeSecureStore`, hard reset
  ante "Invalid Refresh Token", invariante `session === undefined` respetada en `index.js`. Robusto.
- **Pipeline de inferencia (v3).** `hooks/useModel.jsx` reproduce el preprocesado de evaluación del
  notebook y delega la normalización (`lib/mlNormalize.js`) y la decisión (`lib/forecast/*`) en funciones
  **puras y testeadas**. El orden de clases está aislado en `model-meta.js` con invariante verificada por
  test contra `climanuvem_v3_labels.txt`.
- **Alertas graduadas.** Diseño cuidado: bandas de fiabilidad (`alta/media/baja`) derivadas de la
  calibración empírica, % oculto en banda baja, título "firme vs dudoso", suavizado por 2ª clase, y
  "repetir foto" para foto inválida o inferencia incoherente. Todos los umbrales están justificados con
  métricas reales del modelo y centralizados en un único fichero.
- **Mapa comunitario Fase 2.** La seguridad está bien planteada: escrituras solo por RPC `SECURITY
  DEFINER`, RLS que solo deja ver publicaciones activas/no ocultas, coordenadas snapeadas en servidor
  (nunca exactas), identidad del autor resuelta dentro de la RPC (sin exponer PII), acceso a la foto por
  política de Storage que caduca con la publicación. Consentimiento versionado y reutilizado por los dos
  flujos (publicar y ajuste).
- **Privacidad / RLS.** Perfiles solo-dueño, PII (`email`/`phone`) nunca expuesta, Storage aislado por
  carpeta `{uid}/` y servido por URL firmada, baja de cuenta por Edge Function con `service_role` que
  limpia Storage antes de la cascada. Auditoría documentada en `docs/database.md`.
- **i18n + tema.** Tres idiomas (es/gl/en, **por defecto gallego**), modo claro/oscuro persistido. La
  convención (todo texto a `locales/*`, todo contenedor con `dark:`) se respeta en las pantallas nuevas.
- **Tests.** 164 passing + 3 `it.todo` (167) en 9 suites, < 1 s. Cubren lógica pura (formato, normalización,
  evaluación de alerta, teléfono, username) e integración con Supabase mockeado.

---

## 3. Qué está incompleto o pendiente de cierre

- **Modelo v4 (definitivo).** v3 es el activo; v4 (cabeza MLP, SGD+Nesterov, RandAugment, etc.) está
  planificado pero no entrenado/integrado. Al integrarlo: sustituir el `.tflite`, **re-verificar el orden
  de labels** y **re-derivar los umbrales de `model-meta.js`** con la nueva matriz de confusión y tabla de
  calibración (el propio fichero lo advierte).
- ~~**Mapa Fase 2 — verificación en dispositivo.**~~ → **HECHO (2026-06-22): probado en dispositivo y
  funciona correctamente.** Markers, RPC reales, publicar/despublicar/reportar y Google Maps en Android
  verificados en runtime. Deja de ser el riesgo abierto principal.
- **Datos históricos inconsistentes en `forecast_history`.** Quedan ~4 filas de prueba antiguas que
  guardan el *mensaje* de alerta en `forecast` en vez de la *clave de clase*. El historial lo tolera, pero
  conviene decidir (borrar filas de prueba / reasignar / dejar).
- ~~**3 `it.todo`** pendientes~~ → **resuelto**: `__tests__/pending/known-bugs.test.js` ya contiene 5
  tests reales sobre `evaluateForecast` (mapeo de clases del pipeline). Suite total: **224 passing, 0 todo**.

---

## 4. Qué puede romperse / riesgos técnicos

- ~~**Modelos/apk viejos trackeados**~~ → **resuelto**: `climanuvem_v2.tflite`, `climanuvem_labels.txt`,
  `mejor_modelo.pt` y `climanuvem.apk` (191 B, JSON de error de un build EAS fallido) están en `.gitignore`
  y **destrackeados** (`git ls-files` solo versiona `climanuvem_v3.tflite` + `_labels`). Siguen en disco
  como peso local (~13 MB cada `.tflite`/`.pt`) pero ya no en el repo. Conviene borrarlos de disco si no se necesitan.
- **`console.*` en producción.** Persisten **~90 ocurrencias en 21 ficheros** de `app/`, `lib/`, `stores/`,
  `hooks/`, `components/`, `providers/`, `features/`. No rompe, pero ensucia logs y puede filtrar datos.
- ~~**Permiso `RECORD_AUDIO`**~~ → **resuelto** en `app.json` (`permissions: []`); requiere rebuild nativo
  para que surta efecto en el binario.
- **`unpublishAllMine` borra por cliente con filtro `user_id`.** Es seguro porque la RLS
  `cp_delete_own_or_admin` restringe el borrado a filas propias; el filtro es solo una optimización. Quien
  lo mantenga debe saber que **la barrera real es la RLS**, no el `.eq("user_id", …)` del cliente.
- **Consentimiento del mapa es por dispositivo (local), no por cuenta.** Es una decisión conocida (flag en
  `settings.store`, versionado). Implica que el consentimiento no viaja entre dispositivos y que
  "desactivar compartir" borra publicaciones pero el otro dispositivo no se entera del cambio de flag.
  Aceptable para un TFG, pero conviene tenerlo documentado como decisión, no como bug.

---

## 5. Duplicado / desfasado

- **Documentación desincronizada (lo más importante).** Antes de esta revisión, `AGENTS.md`, `README.md`
  y el `CLAUDE.md` del workspace describían modelo **v2**, alertas **solo top-1** y mapa **Fase 1 mock** —
  todo desfasado respecto al código. `docs/database.md` sí recogía la Fase 2 en su §9, pero su §4 seguía
  describiendo la vista `public_profiles` como existente cuando la migración `20260620120400` la **elimina**
  (contradicción interna). Esta revisión corrige esos documentos.
- **Bloques de código comentado al final de varios ficheros** (p. ej. `forecast-screen.js`): son
  referencias históricas marcadas como "no borrar" por convención. No es deuda urgente, pero hace los
  ficheros más largos y difíciles de leer.
- **Conteo de tests**: real **224 passing, 0 `it.todo`** en 13 suites a 2026-06-22 (la doc previa decía 164/167).
- **Funcionalidades de UI recientes ya integradas** (no estaban en la versión previa de este doc): visor de
  foto a pantalla completa con pista "Toca para ampliar" (`components/fullscreen-image-viewer.jsx`, usado en
  forecast + detalles), aviso de privacidad bajo la leyenda del mapa, tarjetas de la guía más bajas con
  cuadre estable de imagen, y mensaje de carga descriptivo ("Analizando tu foto del cielo…"). Username
  robusto (registro + editor) cerrado.

---

## 6. Prioridades recomendadas (en orden)

> **Modelo:** se asume **v3 como modelo final** del TFG. El foco de cierre es **solidez, pruebas en
> dispositivo, higiene y demo/memoria**, NO entrenar otro modelo. (Si en el futuro hubiera un v4, el
> procedimiento de integración sigue documentado en §3/`model-meta.js`, pero no es un paso de cierre.)

1. **Probar el mapa Fase 2 end-to-end en dispositivo** (build nativo): publicar, ver pins propios/ajenos,
   detalle, reportar/ocultar, expiración 6 h, límite de 3, desactivar-compartir, Google Maps API key
   Android. Es lo único grande sin verificar en runtime y lo que más riesgo aporta a la demo.
2. **Pasada de UX para la demo:** recorrer los flujos completos (foto→resultado→guardar/publicar/compartir,
   invitado, historial, mapa, perfil/avatar, baja de cuenta) en iOS y Android buscando textos sin traducir,
   estados de error y casos límite.
3. **Limpieza de `console.*`** de producción (~90 ocurrencias en 21 ficheros) o sustituir por un logger
   silenciable en release. (Único frente de deuda de código que queda.)
4. **Decidir sobre las filas históricas inconsistentes** de `forecast_history`.
5. **Memoria del TFG:** el estado actual (modelo v3 calibrado, alertas graduadas justificadas con métricas,
   mapa con privacidad por diseño, baja de cuenta y RLS auditada) da material sólido para documentar
   decisiones técnicas.

> **Ya resuelto desde la revisión anterior** (no rehacer): higiene git (`git rm --cached` de apk/modelos
> viejos), `RECORD_AUDIO`, mock del mapa, y los 3 `it.todo` (hoy tests reales → 224 passing).

---

## 7. Qué deberías decidir tú antes de seguir

- **¿Consentimiento del mapa local por dispositivo o ligado a la cuenta?** Hoy es local; decidir si se
  acepta esa limitación para el TFG.
- **¿Qué hacemos con las filas de prueba inconsistentes** en `forecast_history`?
- **¿Activamos limpieza de `console.*` ya** o se deja para el cierre de junio?
- **¿Borramos de disco** `v2.tflite`/`mejor_modelo.pt`/`climanuvem.apk`? (ya fuera del repo; solo ocupan local).
- **Privacidad del mapa:** confirmar que el snap ~2 km, la expiración 6 h y el límite de 3 son los valores
  finales (hoy fijados en las RPC del servidor).

---

## 8. Referencias

- `AGENTS.md` — guía operativa del repo (estructura, comandos, módulos, convenciones).
- `docs/database.md` — esquema Supabase completo (tablas, RLS, Storage, RPC, auditoría, Fase 2).
- `lib/forecast/model-meta.js` — fuente de verdad de clases, riesgos, colores y umbrales de alerta.
- Workspace padre (sin versionar): `../CLAUDE.md` (contexto TFG), `../Testing.md`, `../Revision.md`,
  `../mapa-comunitario-fase2-diseño.md`, `../mapa-comunitario-implementacion-log.md`.
</content>
</invoke>
