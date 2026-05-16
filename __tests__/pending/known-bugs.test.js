// Tests pendientes para bugs conocidos de la auditoría (Revision.md)
// Cada describe documenta un hallazgo con su impacto y el fix requerido.
// Los it.todo() aparecen en el output de `jest --verbose` como recordatorio visible.
// Cuando se corrija un bug, mover los it.todo() a los archivos de test activos.

// ─── [C01] Variable imagePath shadowed — cleanup nunca ejecuta ────────────────
//
// ARCHIVO: stores/forecast.store.js, función saveForecastWithPhoto()
// DESCRIPCIÓN: `let imagePath = null` (outer, línea ~23) queda shadowed por
//   `const imagePath = await uploadPhoto(...)` (inner, dentro del try).
//   El bloque catch evalúa `if (imagePath)` sobre la outer, que siempre es null,
//   por lo que la llamada a deleteImage queda comentada o nunca se alcanza.
// IMPACTO: Cuando el INSERT a Supabase falla tras subir la imagen, la imagen
//   queda huérfana en Storage → coste económico acumulado + inconsistencia de datos.
// FIX: Cambiar `const imagePath = await uploadPhoto(...)` por
//   `imagePath = await uploadPhoto(...)` (asignar a la outer).
//   Descomentar y corregir la llamada a deleteImage en el catch.

describe("[C01] Variable imagePath shadowed — limpieza de Storage", () => {
  it.todo(
    "cuando el INSERT falla, deleteImage se llama con la ruta correcta de la imagen subida",
  );
  it.todo(
    "cuando el INSERT falla y deleteImage también lanza, saveForecastWithPhoto aún relanza el error original del INSERT",
  );
  it.todo(
    "cuando el INSERT tiene éxito, deleteImage NO se llama (no hay rollback en flujo exitoso)",
  );
});

// ─── [C02] Probabilidad mostrada sin formatear en el historial ────────────────
//
// ARCHIVO: app/(tabs)/history/index.js (o componente de item del historial)
// DESCRIPCIÓN: La probabilidad se muestra como `{item.probability}%` directamente.
//   Con item.probability = 0.78, el usuario ve "0.78%" en lugar de "78%".
//   La función `formatProbability` en lib/format.js hace la conversión correcta
//   pero no se usa aquí.
// IMPACTO: Los montañeros ven valores incomprensibles (0.92%) en lugar de
//   porcentajes legibles (92%). Afecta a toda la lista de historial y a la
//   pantalla de detalle.
// FIX: Reemplazar `{item.probability}%` por `{formatProbability(item.probability)}%`
//   en todos los componentes que muestran probabilidad del historial.
// NOTA: Tests de componentes requieren @testing-library/react-native (Fase 2).

describe("[C02] Probabilidad sin formatear en historial", () => {
  it.todo(
    'el item de historial muestra "92%" cuando probability=0.92, no "0.92%"',
  );
  it.todo(
    "el item de historial usa formatProbability() para todos los valores de probability",
  );
});

// ─── [C03] hardResetSupabaseAuth no borra AsyncStorage ───────────────────────
//
// ARCHIVO: lib/resetSupabaseAuth.ts
// DESCRIPCIÓN: La función hardResetSupabaseAuth() solo borra la clave de
//   SecureStore (la clave AES) y llama a supabase.auth.signOut(). No borra
//   el valor cifrado en AsyncStorage. Si el token de sesión estaba en AsyncStorage
//   bajo la clave esperada, podría ser leído en el siguiente arranque.
// IMPACTO: Posible persistencia de sesión tras logout en escenario de "Invalid
//   Refresh Token" → fuga de datos de sesión (hallazgo de seguridad).
// FIX: Añadir `await AsyncStorage.removeItem(ASYNC_STORAGE_KEY)` antes de
//   retornar. La clave de AsyncStorage es `sb-${SUPABASE_PROJECT_ID}-auth-token`
//   o equivalente según la implementación de LargeSecureStore.
// NOTA: Tests requieren mockear expo-secure-store + AsyncStorage + supabase.auth.signOut.

describe("[C03] hardResetSupabaseAuth no limpia AsyncStorage", () => {
  it.todo(
    "hardResetSupabaseAuth llama a AsyncStorage.removeItem con la clave del token cifrado",
  );
  it.todo(
    "hardResetSupabaseAuth llama a SecureStore.deleteItemAsync con la clave AES",
  );
  it.todo("hardResetSupabaseAuth llama a supabase.auth.signOut()");
});

// ─── [DATE01] dayRangeISO usa hora local, no UTC ─────────────────────────────
//
// ARCHIVO: lib/format.js, función dayRangeISO(day)
// DESCRIPCIÓN: `setHours(0,0,0,0)` aplica medianoche en la zona horaria local
//   del dispositivo, no en UTC. En España en verano (UTC+2), `2026-07-15T00:00`
//   local = `2026-07-14T22:00Z`. El filtro de Supabase (`gte`/`lt`) usa UTC,
//   por lo que las entradas entre 00:00 y 02:00 del día filtrado quedan excluidas.
// IMPACTO: El filtro por fecha puede "perder" registros de las primeras 2 horas
//   del día durante el horario de verano. Afecta a usuarios en zonas UTC+X.
// FIX (opción A): Usar `Date.UTC(year, month, day, 0, 0, 0, 0)` para construir
//   los límites en UTC.
// FIX (opción B): Usar una librería de fechas con soporte de zona horaria.
// NOTA: El test actual en format.test.js está marcado con [DATE01-DOC] y
//   documenta el comportamiento actual sin verificar UTC explícitamente.

describe("[DATE01] dayRangeISO timezone bug", () => {
  it.todo(
    "startISO y endISO corresponden a medianoche UTC del día dado, no a hora local",
  );
  it.todo(
    "en zona UTC+2, el rango del día 2026-07-15 es 2026-07-15T00:00:00Z a 2026-07-16T00:00:00Z",
  );
  it.todo(
    "el filtro de Supabase incluye registros creados entre 00:00 y 02:00 hora local en verano",
  );
});

// ─── [B01] fetchForecast sin filtro user_id ───────────────────────────────────
//
// ARCHIVO: lib/forecastHistory.js, función fetchForecast({ id })
// DESCRIPCIÓN: La query a `forecast_history` filtra solo por `id`, sin añadir
//   `.eq('user_id', userId)`. Si las RLS (Row Level Security) de Supabase no están
//   correctamente configuradas, o si hay un bug en las políticas, un usuario
//   podría acceder a forecasts de otro usuario conociendo su UUID.
// IMPACTO: Potencial exposición de datos de otros usuarios. Bajo riesgo si RLS
//   está bien configurado, pero defensiva-programación requiere el filtro.
// FIX: Añadir `.eq('user_id', userId)` a la query de fetchForecast, obteniendo
//   el userId de `supabase.auth.getUser()` igual que en fetchForecastHistoryWithSignedUrls.
// NOTA: Los tests actuales de fetchForecast en forecastHistory.test.js no verifican
//   este filtro porque la función no lo implementa actualmente.

describe("[B01] fetchForecast sin filtro user_id", () => {
  it.todo(
    "fetchForecast llama a supabase.auth.getUser() para obtener el userId del usuario autenticado",
  );
  it.todo(
    'fetchForecast añade .eq("user_id", userId) a la query además de .eq("id", id)',
  );
});

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
