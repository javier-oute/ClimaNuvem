// Fuente única de verdad del modelo de clasificación y de la lógica de alertas.
//
// Todos los umbrales y el grafo de confusabilidad se DERIVAN de métricas reales del
// modelo (test set n=1965, ver Ayuda/matrices_confusion.png, analisis_confianza.png y
// calibracion_reliability.png). Si se reentrena el modelo (v4), hay que re-derivar
// estas constantes con su matriz de confusión y su tabla de calibración.
//
// Métricas de referencia del modelo actual (climanuvem_v3.tflite):
//   Top-1 acc 82.1% · Top-2 acc 94.8% · Macro-F1 0.806 · ECE 0.036 (bien calibrado, T≈0.95)
//   Calibración por banda: <0.5→44% · 0.5–0.7→58% · 0.7–0.8→76% · 0.8–0.9→89% · 0.9–1.0→96%
//   Confianza mediana: aciertos 0.903 / errores 0.612 (solo 17/352 errores >0.9)

// Orden EXACTO de assets/models/climanuvem_v3_labels.txt (alfabético del export).
// INVARIANTE: debe coincidir con la salida del .tflite. Verificado por test.
export const CLASS_ORDER = [
  "cielo_despejado",
  "conveccion_desarrollo",
  "cubierto_precipitacion",
  "foto_invalida",
  "lenticular_viento",
  "niebla_stratus",
  "nubes_altas_medias",
  "tormenta",
];

// Nivel de riesgo en montaña 0..4 (CLAUDE §5). foto_invalida no tiene riesgo (no es nube).
export const RISK = {
  foto_invalida: -1,
  cielo_despejado: 0,
  nubes_altas_medias: 1,
  lenticular_viento: 2,
  cubierto_precipitacion: 2,
  niebla_stratus: 2,
  conveccion_desarrollo: 3,
  tormenta: 4,
};

// Paleta de alerta por clase (color de la UI). Coincide con la guía (cloud-data.ts).
export const RISK_COLORS = {
  cielo_despejado: "#1D9E75",
  nubes_altas_medias: "#378ADD",
  lenticular_viento: "#EF9F27",
  cubierto_precipitacion: "#EF9F27",
  niebla_stratus: "#EF9F27",
  conveccion_desarrollo: "#E24B4A",
  tormenta: "#7F77DD",
  foto_invalida: "#888888",
};

// Grafo de confusabilidad ESPERADA, derivado de la matriz de confusión normalizada:
// pares con confusión ≥ ~0.05 en alguna dirección (confusiones "benignas" entre clases
// meteorológicamente vecinas). Que el top-1 y el top-2 sean uno de estos pares es lo
// NORMAL del modelo; que NO lo sean indica una inferencia incoherente (ver evaluateForecast).
//
//   tormenta↔conveccion 0.21/0.13 · niebla↔cubierto 0.20/0.15 · cubierto→nubes_altas 0.15
//   cielo→conveccion 0.08 · cielo→nubes_altas 0.07 · tormenta→cubierto 0.12 · nubes_altas→cubierto 0.06
const EXPECTED_CONFUSION_PAIRS = [
  ["cielo_despejado", "conveccion_desarrollo"],
  ["cielo_despejado", "nubes_altas_medias"],
  ["conveccion_desarrollo", "cubierto_precipitacion"],
  ["conveccion_desarrollo", "tormenta"],
  ["cubierto_precipitacion", "nubes_altas_medias"],
  ["cubierto_precipitacion", "niebla_stratus"],
  ["tormenta", "cubierto_precipitacion"],
];

function pairKey(a, b) {
  return [a, b].sort().join("|");
}

export const EXPECTED_CONFUSIONS = new Set(
  EXPECTED_CONFUSION_PAIRS.map(([a, b]) => pairKey(a, b)),
);

export function isExpectedConfusion(a, b) {
  return EXPECTED_CONFUSIONS.has(pairKey(a, b));
}

// ── Umbrales (todos justificados con datos reales del modelo) ──────────────────────

// Fiabilidad por banda de confianza (top-1). Cortes CONSERVADORES elegidos sobre la calibración
// empírica para no alarmar de más (el usuario prefiere suavizar las predicciones):
//   ≥0.90  → banda 0.9–1.0 (96% de acierto): muy fiable, aviso "en firme", % visible.
//   0.70–0.90 → bandas 0.7–0.8 (76%) y 0.8–0.9 (89%): fiabilidad media, tono medido, % visible.
//   <0.70 → bandas <0.5 (44%) y 0.5–0.7 (58%): poco fiable, máximo suavizado, % oculto.
export const RELIABILITY_HIGH = 0.9;
export const RELIABILITY_LOW = 0.7;

// Banda de confianza a partir de la probabilidad del top-1. Función pura, reutilizable por la UI
// (resultado en vivo e historial/detalle, recalculando la banda desde la probabilidad guardada).
export function bandForConfidence(conf) {
  if (conf >= RELIABILITY_HIGH) return "alta";
  if (conf >= RELIABILITY_LOW) return "media";
  return "baja";
}

// Clave i18n del título según la banda: firme en alta confianza, dudoso (expresa incertidumbre)
// en media y baja. Reutilizada por el resultado en vivo y por historial/detalle/mapa.
export function forecastTitleKey(clase, band) {
  const variant = band === "alta" ? "titulo" : "tituloDudoso";
  return `alerts.${clase}.${variant}`;
}

// Margen top1-top2 por debajo del cual la predicción se considera AMBIGUA entre dos
// clases vecinas (p. ej. tormenta 0.55 / conveccion 0.40 → margen 0.15).
export const AMBIGUOUS_MARGIN = 0.15;

// Suavizado por 2ª clase: si la clase ganadora es bastante más grave que la 2ª (diferencia de
// riesgo >= 2 niveles) y la 2ª tiene probabilidad apreciable, el modelo "duda hacia abajo". En ese
// caso se baja un escalón de banda SOLO el mensaje (no la fiabilidad ni el %), para no sobreactuar.
// El mínimo (0.10) es deliberadamente bajo: basta con que la 2ª clase tenga algo de presencia para
// suavizar el mensaje cuando la ganadora es mucho más grave (más prudente con la 2ª opción).
export const SECOND_CLASS_SOFTEN_RISK_GAP = 2;
export const SECOND_CLASS_SOFTEN_MIN = 0.1;

// Por debajo de esta confianza la predicción es prácticamente no fiable (banda <0.5 ≈ 44%).
export const RETAKE_CONF = 0.45;

// Margen por debajo del cual un par NO esperado (incoherente) se trata como "repetir foto".
// Ampliado a 0.35: p. ej. tormenta 0.64 / cielo_despejado 0.36 (margen 0.28, par no esperado) →
// pedir repetir foto en lugar de mostrar una alerta con dos clases muy reñidas.
export const INCOHERENT_MARGIN = 0.35;

// Confianza mínima para tratar un top-1 = foto_invalida como decisión firme ("no analizable").
// Los errores de foto_invalida son de baja confianza (media 0.536), así que por encima de
// este umbral la decisión es fiable (F1 de la clase = 0.97).
export const INVALID_MIN_CONF = 0.6;

export const INVALID_CLASS = "foto_invalida";
