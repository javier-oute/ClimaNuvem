# CLAUDE.md

Guía para Claude Code y otros agentes IA trabajando en este repositorio.

👉 **La guía operativa canónica de este repo está en [`AGENTS.md`](./AGENTS.md).** Léela antes de tocar nada (estructura, comandos, tests, convenciones de i18n/tema/NativeWind, módulos clave y avisos importantes).

## Resumen rápido

- **ClimaNuvem**: app React Native / Expo (TFG, USC + HP SCDS). Clasifica fotos del cielo en 8 categorías de riesgo meteorológico con un modelo EfficientNet-Lite0 (`.tflite`) on-device. Backend Supabase.
- **Repo git:** raíz aquí (`ClimaNuvem-prueba/`), remoto `github.com/javier-oute/ClimaNuvem`. La carpeta padre del workspace NO está versionada.
- **Idiomas:** código en inglés; UI en español vía i18n (es/gl/en, `lib/i18n.js` + `locales/*`).
- **Comandos:** `npm start` · `npm run ios|android` · `npm run lint` · `npm test`.
- **No cambies de rama** sin que te lo pidan. **No commitees secretos** ni artefactos de build.

## Contexto ampliado del TFG (fuera de este repo)

El contexto completo del proyecto (modelo ML, dataset, literatura, planificación, auditoría, suite de tests) vive en la carpeta **padre** del workspace, sin versionar:

- `../CLAUDE.md` — documento de contexto exhaustivo del proyecto.
- `../Ayuda/` — material de referencia (clasificación de nubes, contexto).
- `../Revision.md` — auditoría técnica (41 hallazgos).
- `../Testing.md` — documentación de la suite de tests.
- `../funcionalidad-mapa.md` — plan del mapa comunitario (Fase 1/2).

Si trabajas solo con el repo clonado desde GitHub, no tendrás esos ficheros: usa `AGENTS.md`.
