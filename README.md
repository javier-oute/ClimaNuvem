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
| Backend | Supabase (Auth, Postgres, Storage) |
| Inferencia ML | `react-native-fast-tflite` (EfficientNet-Lite0 `.tflite`) |
| Mapas | `react-native-maps` |
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
stores/       Zustand: auth, forecast, settings (idioma/tema)
lib/          supabase, forecastHistory, format, location, i18n, mlNormalize, ...
features/     profile-api, guide/cloud-data
services/     mock del mapa comunitario (Fase 1)
locales/      es / gl / en
assets/       modelo .tflite, vídeos, imágenes
__tests__/    unit · integration · pending
```

Detalle completo de arquitectura, flujos y módulos en **[`AGENTS.md`](./AGENTS.md)**.

---

## Las 8 clases de riesgo

`foto_invalida` · `cielo_despejado` · `nubes_altas_medias` · `lenticular_viento` · `cubierto_precipitacion` · `niebla_stratus` · `conveccion_desarrollo` · `tormenta`

El modelo clasifica **decisiones del montañero** (no nubes según la taxonomía OMM). En caso de duda entre `conveccion_desarrollo` y `tormenta`, el diseño escala siempre a la alerta más grave.

---

## Builds (EAS)

| Perfil | Notas |
|---|---|
| `development` | dev client, distribución interna, Android → APK |
| `preview` | distribución interna, Android → APK |
| `production` | `autoIncrement` de versión |

---

## Estado del proyecto (junio 2026)

- ✅ Auth (Apple / Google / invitado), inferencia on-device, historial, perfil.
- ✅ i18n (es/gl/en), modo oscuro, guía de nubes, pantalla de ayuda.
- ✅ Suite de tests (137 passing).
- 🟡 Mapa comunitario: Fase 1 (datos mock); backend Supabase pendiente.
- ⏳ Modelo v4 definitivo y alertas graduadas por confianza: pendientes.

Autor: Javier Outeiriño Cortés.
