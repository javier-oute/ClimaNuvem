// Lógica pura de alertas a partir de la distribución softmax completa (el top-1 siempre manda; la 2ª clase solo suaviza el mensaje). Umbrales en model-meta.js.

import {
  bandForConfidence,
  CLASS_ORDER,
  INCOHERENT_MARGIN,
  INVALID_CLASS,
  INVALID_MIN_CONF,
  isExpectedConfusion,
  RETAKE_CONF,
  RISK,
  SECOND_CLASS_SOFTEN_MIN,
  SECOND_CLASS_SOFTEN_RISK_GAP,
} from "./model-meta";

// ForecastDecision: clase/confianza (top-1), clase2/conf2 (top-2), margin, reliability, messageBand, riskLevel 0..4, tone y action de UI, y todasLasProbs (orden CLASS_ORDER).

const BAND_ORDER = ["alta", "media", "baja"];

// Baja la banda un escalón (alta→media→baja); baja se queda en baja.
function stepDownBand(band) {
  const i = BAND_ORDER.indexOf(band);
  return BAND_ORDER[Math.min(i + 1, BAND_ORDER.length - 1)];
}

// probs: vector softmax de longitud CLASS_ORDER.length, en el mismo orden. Devuelve una ForecastDecision.
export function evaluateForecast(probs) {
  if (!Array.isArray(probs) || probs.length !== CLASS_ORDER.length) {
    throw new Error(
      `evaluateForecast: se esperaban ${CLASS_ORDER.length} probabilidades, ` +
        `recibidas ${Array.isArray(probs) ? probs.length : typeof probs}`,
    );
  }

  // top-1 y top-2
  const sorted = probs
    .map((p, i) => ({ clase: CLASS_ORDER[i], prob: Number(p) || 0 }))
    .sort((a, b) => b.prob - a.prob);

  const clase = sorted[0].clase;
  const confianza = sorted[0].prob;
  const clase2 = sorted[1].clase;
  const conf2 = sorted[1].prob;
  const margin = confianza - conf2;

  const reliability = bandForConfidence(confianza);

  // Suavizado por 2ª clase: si la ganadora es mucho más grave que la 2ª (con prob apreciable), baja un escalón solo el mensaje (nunca endurece).
  const softenBySecond =
    RISK[clase] - RISK[clase2] >= SECOND_CLASS_SOFTEN_RISK_GAP &&
    conf2 >= SECOND_CLASS_SOFTEN_MIN;
  const messageBand = softenBySecond ? stepDownBand(reliability) : reliability;

  const todasLasProbs = CLASS_ORDER.map((c, i) => ({
    clase: c,
    prob: Number(probs[i]) || 0,
  }));

  const base = {
    clase,
    confianza,
    clase2,
    conf2,
    margin,
    reliability,
    messageBand,
    riskLevel: RISK[clase],
    todasLasProbs,
  };

  // foto_invalida como top-1: nunca se muestra; firme (≥0.60) "no analizable", floja "poco clara"; siempre repetir.
  if (clase === INVALID_CLASS) {
    const tone = confianza >= INVALID_MIN_CONF ? "invalida" : "reintentar";
    return { ...base, tone, action: "retake" };
  }

  // Inferencia incoherente (par top-1/top-2 no esperado y, además, reñido o de baja confianza) → repetir foto.
  const expected = isExpectedConfusion(clase, clase2);
  if (!expected && (margin < INCOHERENT_MARGIN || confianza < RETAKE_CONF)) {
    return { ...base, tone: "reintentar", action: "retake" };
  }

  // Predicción que se muestra (sin tono ambiguo: la duda entre clases vecinas ya cae en banda baja).
  return { ...base, tone: "normal", action: "show" };
}
