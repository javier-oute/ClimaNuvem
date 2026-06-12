// Tests pendientes para bugs conocidos de la auditoría (Revision.md).
//
// Los hallazgos C01, C02, C03, B01 y DATE01 YA están corregidos y cubiertos por
// tests activos:
//   - C01  → __tests__/integration/saveForecastWithPhoto.test.js
//   - C02  → fix aplicado en app/(tabs)/history/index.js (usa formatProbability,
//            ya cubierta en __tests__/unit/format.test.js; falta test de componente).
//   - C03  → __tests__/unit/resetSupabaseAuth.test.js
//   - B01  → __tests__/integration/forecastHistory.test.js
//   - DATE01 → __tests__/unit/format.test.js
//
// Queda pendiente A02 (refactor + cobertura del pipeline ML), que requiere
// @testing-library/react-native y mocks de módulos nativos (Fase 2).

// ─── [A02] useModel difícil de testear — cobertura de pipeline ML ────────────
//
// ARCHIVO: hooks/useModel.jsx
// DESCRIPCIÓN: El hook useModel() es un hook de React que mezcla estado (useState,
//   useTensorflowModel), side effects (useEffect) y lógica de negocio (normalización,
//   inferencia, mapeo de clases). La normalización ImageNet ya fue extraída a
//   lib/mlNormalize.js (testeable), pero el pipeline completo no se puede testear
//   sin mockear: react-native-fast-tflite, expo-image-manipulator, jpeg-js, y
//   @react-native-community/hooks.
// IMPACTO: La lógica de mapeo de clases (índice → nombre de clase → alerta) y el
//   manejo de errores del pipeline quedan sin cobertura de tests.
// FIX (Fase 2): Extraer a funciones puras: mapearClase(probs) y mapearAlerta(clase).
//   Mockear useTensorflowModel para testear el hook con renderHook de RNTL.
// NOTA: Requiere @testing-library/react-native + mocks de módulos nativos (Fase 2).

describe("[A02] useModel — cobertura del pipeline ML", () => {
  it.todo(
    "mapearClase(probs) retorna el índice y nombre de la clase con mayor probabilidad",
  );
  it.todo(
    "mapearClase(probs) retorna correctamente la segunda clase más probable",
  );
  it.todo(
    "el pipeline completo con imagen real retorna estructura { clase, confianza, alerta, todasLasProbs }",
  );
});
