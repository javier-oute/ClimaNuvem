// Fuente única de verdad del modelo y de la lógica de alertas: umbrales y grafo de confusión derivados de métricas reales (test n=1965); re-derivar al reentrenar (v4).

// Orden EXACTO de climanuvem_v3_labels.txt (alfabético). INVARIANTE: debe coincidir con la salida del .tflite (verificado por test).
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

// Grafo de confusabilidad ESPERADA (matriz de confusión normalizada): que top-1/top-2 sea uno de estos pares es lo normal; si no, la inferencia es incoherente.
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

// Fiabilidad por banda de confianza del top-1, con cortes conservadores sobre la calibración empírica (≥0.90 alta, 0.70–0.90 media, <0.70 baja).
export const RELIABILITY_HIGH = 0.9;
export const RELIABILITY_LOW = 0.7;

// Banda de confianza a partir de la prob del top-1 (función pura, reutilizada por la UI para recalcular desde la prob guardada).
export function bandForConfidence(conf) {
  if (conf >= RELIABILITY_HIGH) return "alta";
  if (conf >= RELIABILITY_LOW) return "media";
  return "baja";
}

// Clave i18n del título según la banda: firme en alta confianza, dudoso en media y baja.
export function forecastTitleKey(clase, band) {
  const variant = band === "alta" ? "titulo" : "tituloDudoso";
  return `alerts.${clase}.${variant}`;
}

// Margen top1-top2 por debajo del cual la predicción se considera ambigua entre dos clases vecinas.
export const AMBIGUOUS_MARGIN = 0.15;

// Suavizado por 2ª clase: si la ganadora es >=2 niveles de riesgo más grave y la 2ª tiene prob apreciable (>=0.10), baja un escalón solo el mensaje.
export const SECOND_CLASS_SOFTEN_RISK_GAP = 2;
export const SECOND_CLASS_SOFTEN_MIN = 0.1;

// Por debajo de esta confianza la predicción es prácticamente no fiable (banda <0.5 ≈ 44%).
export const RETAKE_CONF = 0.45;

// Margen por debajo del cual un par no esperado (incoherente) se trata como "repetir foto" (ampliado a 0.35).
export const INCOHERENT_MARGIN = 0.35;

// Confianza mínima para tratar foto_invalida como decisión firme ("no analizable"); sus errores son de baja confianza (media 0.536).
export const INVALID_MIN_CONF = 0.6;

export const INVALID_CLASS = "foto_invalida";
