# Estado real del proyecto — ClimaNuvem

> Análisis técnico del estado **real** del código a fecha **2026-06-20**, hecho leyendo el árbol
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

> **Higiene aplicada (2026-06-20, en working tree, sin commitear).** Ya hechos varios puntos de la §4/§6:
> - `climanuvem.apk` (+ `*.apk`/`*.aab`) untrackeado y añadido a `.gitignore`.
> - Modelos sin uso (`climanuvem_v2.tflite`, `climanuvem_labels.txt`, `mejor_modelo.pt`) **untrackeados pero
>   conservados en disco** + `.gitignore`. El activo `climanuvem_v3.tflite` sigue versionado.
> - `services/communityMap.mock.js` (código muerto) **eliminado**.
> - `RECORD_AUDIO` retirado de `app.json` (`permissions: []`) — **requiere rebuild nativo** para surtir efecto.
>
> **Sigue pendiente** de la higiene: limpiar `console.*` de producción y analizar dependencias sin usar.

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
- **Tests.** 163 passing + 3 `it.todo` (166) en 9 suites, < 1 s. Cubren lógica pura (formato, normalización,
  evaluación de alerta, teléfono, username) e integración con Supabase mockeado.

---

## 3. Qué está incompleto o pendiente de cierre

- **Modelo v4 (definitivo).** v3 es el activo; v4 (cabeza MLP, SGD+Nesterov, RandAugment, etc.) está
  planificado pero no entrenado/integrado. Al integrarlo: sustituir el `.tflite`, **re-verificar el orden
  de labels** y **re-derivar los umbrales de `model-meta.js`** con la nueva matriz de confusión y tabla de
  calibración (el propio fichero lo advierte).
- **Mapa Fase 2 — verificación en dispositivo.** El backend y el front están escritos, pero el mapa es un
  **módulo nativo** (`react-native-maps`): requiere un build nativo reciente para probarlo de verdad
  (markers, RPC reales, expiración, reportes, Google Maps API key en Android). Es lo más importante a
  probar end-to-end antes de darlo por cerrado.
- **Datos históricos inconsistentes en `forecast_history`.** Quedan ~4 filas de prueba antiguas que
  guardan el *mensaje* de alerta en `forecast` en vez de la *clave de clase*. El historial lo tolera, pero
  conviene decidir (borrar filas de prueba / reasignar / dejar).
- **3 `it.todo`** pendientes en `__tests__/pending/known-bugs.test.js` (cobertura del pipeline `useModel`
  completo). No son bugs, es cobertura aún no escrita.

---

## 4. Qué puede romperse / riesgos técnicos

- **Modelo viejo trackeado y sin uso.** `assets/models/climanuvem_v2.tflite` ya no se carga (la app usa
  v3) pero sigue en el repo y en git. Riesgo bajo, pero es peso muerto y fuente de confusión (varios docs
  aún lo nombran como "activo"). `assets/models/mejor_modelo.pt` (checkpoint PyTorch) tampoco pinta nada en
  un repo de app móvil.
- **`climanuvem.apk` trackeado.** Ya **no** son ~13 MB (como decía la auditoría): hoy es un fichero de
  **191 B con un JSON de error de un build EAS fallido** (`GCS_FILE_NOT_FOUND`). Sigue trackeado y debería
  ir a `.gitignore`. Riesgo nulo funcional, pero es basura versionada.
- **`services/communityMap.mock.js` es código muerto.** Tras la Fase 2 ya **nadie lo importa** (solo se
  menciona en un comentario de `lib/communityMap.js`). Mantenerlo induce a error sobre qué capa de datos
  usa el mapa. Candidato a borrar (o a mover a `__mocks__`/dev si se quiere conservar para pruebas).
- **`console.*` en producción.** Persisten en ~20 ficheros de `app/`, `lib/`, `stores/`, `hooks/`,
  `components/` (deuda ya señalada en la auditoría). No rompe, pero ensucia logs y puede filtrar datos.
- **Permiso `RECORD_AUDIO` (Android) sin uso evidente** en `app.json`. La app no graba audio; conviene
  retirarlo para no pedir un permiso injustificado (mala señal de privacidad en review de tienda).
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
- **Conteo de tests obsoleto** en la doc (137 → real 163 + 3 todo).

---

## 6. Prioridades recomendadas (en orden)

1. **Probar el mapa Fase 2 end-to-end en dispositivo** (build nativo): publicar, ver pins propios/ajenos,
   detalle, reportar/ocultar, expiración 6 h, límite de 3, desactivar-compartir, Google Maps API key
   Android. Es lo único grande sin verificar en runtime.
2. **Higiene de repo (rápido y de bajo riesgo):** `.gitignore` para `climanuvem.apk`; decidir qué hacer
   con `climanuvem_v2.tflite` y `mejor_modelo.pt` (sacarlos del repo de app); borrar o reubicar
   `services/communityMap.mock.js`; retirar `RECORD_AUDIO` de `app.json`.
3. **Limpieza de `console.*`** de producción (o sustituir por un logger que se silencie en release).
4. **Cerrar el dataset y entrenar v4**; al integrarlo, re-verificar labels y **re-derivar los umbrales de
   `model-meta.js`**. Convertir los 3 `it.todo` en tests reales del pipeline.
5. **Decidir sobre las filas históricas inconsistentes** de `forecast_history`.
6. **Memoria del TFG:** el estado actual (modelo calibrado, alertas graduadas justificadas con métricas,
   mapa con privacidad por diseño) da material sólido para documentar decisiones técnicas.

---

## 7. Qué deberías decidir tú antes de seguir

- **¿v2.tflite y mejor_modelo.pt fuera del repo?** (recomendado sí; el `.pt` no es un asset de app).
- **¿Borramos `services/communityMap.mock.js`?** (es código muerto; recomendado borrar o mover a dev).
- **¿Consentimiento del mapa local por dispositivo o ligado a la cuenta?** Hoy es local; decidir si se
  acepta esa limitación para el TFG.
- **¿Qué hacemos con las filas de prueba inconsistentes** en `forecast_history`?
- **¿Activamos limpieza de `console.*` ya** o se deja para el cierre de junio?
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
