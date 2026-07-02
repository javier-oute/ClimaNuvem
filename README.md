# ClimaNuvem 🌥️

App móvil de **seguridad para montañeros**. Toma una foto del cielo y un modelo de visión por computador (EfficientNet-Lite0, ejecutado **en el dispositivo**) la clasifica en **8 categorías de riesgo meteorológico**, emitiendo una alerta accionable en tiempo real.

Proyecto de **TFG** (Ingeniería Informática, Universidad de Santiago de Compostela) en colaboración con **HP SCDS Data Science Observatory**.

> Para trabajar en el código como agente IA o desarrollador, lee **[`AGENTS.md`](./AGENTS.md)** (guía operativa: estructura, módulos, convenciones, tests y avisos).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React Native 0.81 + Expo SDK ~54 (New Architecture) |
| Routing | Expo Router 6 (file-based, typed routes) |
| Estilos | NativeWind v4 + Tailwind v3 (con modo oscuro) |
| Estado | Zustand v5 (auth, forecast, settings) |
| Backend | Supabase (Auth, Postgres + PostGIS, Storage, Edge Functions, RPC) |
| Inferencia ML | `react-native-fast-tflite` (EfficientNet-Lite0 `climanuvem_v3.tflite`, probs calibradas) |
| Mapas | `react-native-maps` (mapa comunitario Fase 2, backend Supabase real) |
| i18n | propio (`lib/i18n.js`), es / gl / en |
| Tests | Jest + jest-expo |

---

## Puesta en marcha

Requisitos: Node, Xcode (iOS) y/o Android Studio. La app usa módulos nativos (tflite, maps, secure-store), por lo que necesita un **development build** (no funciona en Expo Go).

```bash
npm install

# Variables de entorno (prefijo EXPO_PUBLIC_), en .env:
#   EXPO_PUBLIC_SUPABASE_URL=...
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
#   EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID=...

npm run ios        # build + simulador iOS
npm run android    # build + emulador/dispositivo Android
npm start          # Metro bundler (con un dev build ya instalado)
```

> Tras instalar una dependencia **nativa** nueva hay que reconstruir el binario (`npm run ios/android` o `eas build`).

---

## Comandos

```bash
npm run lint            # ESLint + Prettier (expo lint)
npm test                # toda la suite de tests
npm run test:unit       # solo unitarios
npm run test:integration
npm run test:coverage
npm run test:watch
```

---

## Estructura

```
app/          Rutas (Expo Router): home, guide, history, map, profile, forecast, detalles, help
components/   UI reutilizable (botones, iconos, forecast, profile, guide, social-auth)
hooks/        useModel (inferencia ML), foto/galería, share, profile
stores/       Zustand: auth, forecast, settings (idioma/tema/consentimiento mapa)
lib/          supabase, forecastHistory, format, location, i18n, mlNormalize,
              communityMap (mapa Fase 2), mapConsent, forecast/ (alertas graduadas), ...
features/     profile-api, guide/cloud-data
supabase/     migrations/ (esquema versionado), functions/ (Edge Functions)
locales/      es / gl / en (por defecto gallego)
assets/       modelo climanuvem_v3.tflite, vídeos, imágenes
__tests__/    unit · integration · pending
```

Detalle completo de arquitectura, flujos y módulos en **[`AGENTS.md`](./AGENTS.md)**.

---

## Las 8 clases de riesgo

`foto_invalida` · `cielo_despejado` · `nubes_altas_medias` · `lenticular_viento` · `cubierto_precipitacion` · `niebla_stratus` · `conveccion_desarrollo` · `tormenta`

El modelo clasifica **decisiones del montañero** (no nubes según la taxonomía OMM). La alerta se gradúa
con **toda la distribución de probabilidad** (bandas de fiabilidad calibradas, no solo el top-1): en
detecciones poco fiables se suaviza el mensaje y se oculta el %, y ante una foto inválida o una inferencia
incoherente se pide repetir la foto. El top-1 siempre manda (la alerta nunca se escala a la 2ª clase).

---

## Builds (EAS)

| Perfil | Notas |
|---|---|
| `development` | dev client, distribución interna, Android → APK |
| `preview` | distribución interna, Android → APK |
| `production` | `autoIncrement` de versión |

---

## Estado del proyecto (2026-06-22)

- ✅ Auth (Apple / Google / invitado), inferencia on-device (modelo **v3, final**), historial, perfil + avatar, baja de cuenta.
- ✅ **Alertas graduadas por confianza** (bandas de fiabilidad calibradas, "repetir foto").
- ✅ i18n (es/gl/en), modo oscuro, guía de nubes, pantalla de ayuda (ampliada con presentación de la app + mockups), visor de foto a pantalla completa.
- ✅ **Mapa comunitario Fase 2** (backend Supabase real: publicar/despublicar/reportar, privacidad por snap de coords, expiración 6 h). **Probado en dispositivo (2026-06-22): funciona correctamente.**
- ✅ Username robusto (registro + editor). Suite de tests (**224 passing**, 13 suites).
- 🎯 Cierre/demo: pasada de UX en iOS/Android y limpieza de `console.*`; el resto es pulido de bajo riesgo.
- 🧹 Higiene: mock del mapa eliminado, `RECORD_AUDIO` retirado, apk/modelos viejos **destrackeados** (`git rm --cached`) y **logs de depuración (`console.log`/`debug`) eliminados** (se conservan los `console.error`/`warn` de manejo de error). Pendiente menor: auditoría de deps sin usar.

> Análisis de estado completo y realista en **[`docs/estado-proyecto.md`](./docs/estado-proyecto.md)**.

Autor: Javier Outeiriño Cortés.

---

## Licencia

ClimaNuvem se publica bajo un esquema **no comercial**: se permite su uso, estudio y modificación con fines no comerciales, pero **no su explotación comercial**.

- **Código fuente** (esta aplicación): [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) — ver el fichero [`LICENSE`](./LICENSE). Copyright © 2026 Javier Outeiriño Cortés.
- **Memoria y documentación del TFG**: [Creative Commons Atribución-NoComercial 4.0 (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).
- **Modelo entrenado** (`.tflite`): se distribuye con la aplicación para uso no comercial y queda sujeto a las condiciones de los datos con los que fue entrenado.
- **Datos y dependencias de terceros**: los conjuntos de datos utilizados (GLOBE Observer, muestra pública del IMGW-PIB, etc.) y las dependencias de software conservan **sus propias licencias y condiciones de uso**.

Esto implica que ClimaNuvem **no es** software libre/open source en sentido formal. No constituye asesoramiento jurídico.
