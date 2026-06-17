// Lógica de alertas basada en la distribución completa de probabilidades del modelo.
// Función PURA (sin React ni dependencias nativas) → 100% testeable.
//
// Aprovecha toda la salida softmax (no solo el top-1) para matizar la alerta según:
//   1. fiabilidad   — banda de confianza del top-1 (calibración empírica del modelo). Gobierna el
//                     título (firme/dudoso), el color, el % visible y el aviso de poca fiabilidad.
//   2. mensaje      — banda del MENSAJE, igual a la fiabilidad pero suavizada un escalón si la
//                     2ª clase es bastante menos grave (el modelo "duda hacia abajo")
//   3. incoherencia — top-1 y top-2 sin relación y modelo inseguro → pedir repetir la foto
//
// NOTA: el escalado de seguridad (elevar la alerta a la clase grave del top-2) se eliminó a
// propósito. El top-1 SIEMPRE manda; la 2ª clase solo suaviza el mensaje. Tampoco se menciona la
// 2ª clase: cuando el modelo duda entre dos clases vecinas la confianza es siempre baja, así que
// el caso recibe el trato suave de la banda baja (título dudoso, gris, sin %, aviso poco fiable).
//
// Ver lib/forecast/model-meta.js para el origen numérico de cada umbral.

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

/**
 * @typedef {Object} ForecastDecision
 * @property {string} clase            clase ganadora (top-1) — la que se muestra y se guarda
 * @property {number} confianza        probabilidad del top-1 (0..1)
 * @property {string} clase2           segunda clase (top-2)
 * @property {number} conf2            probabilidad del top-2 (0..1)
 * @property {number} margin           confianza - conf2
 * @property {"alta"|"media"|"baja"} reliability  banda de confianza (fiabilidad y visibilidad del %)
 * @property {"alta"|"media"|"baja"} messageBand  banda del texto de recomendación (puede ir un paso más suave)
 * @property {number} riskLevel        nivel de riesgo 0..4 de la clase ganadora
 * @property {"normal"|"reintentar"|"invalida"} tone
 * @property {"show"|"retake"} action  qué debe hacer la UI
 * @property {{clase: string, prob: number}[]} todasLasProbs  ordenado por CLASS_ORDER
 */

const BAND_ORDER = ["alta", "media", "baja"];

// Baja la banda un escalón (alta→media→baja); baja se queda en baja.
function stepDownBand(band) {
  const i = BAND_ORDER.indexOf(band);
  return BAND_ORDER[Math.min(i + 1, BAND_ORDER.length - 1)];
}

/**
 * @param {number[]} probs  vector softmax, longitud = CLASS_ORDER.length, mismo orden
 * @returns {ForecastDecision}
 */
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

  // Suavizado por 2ª clase: si la ganadora es bastante más grave que la 2ª y la 2ª tiene
  // probabilidad apreciable, el mensaje baja un escalón (más prudente). No afecta a la fiabilidad
  // ni al %. Nunca endurece (no hay escalado).
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

  // 1. foto_invalida: si es el top-1, nunca se muestra como predicción meteorológica.
  //    Firme (≥0.60) → "no analizable"; floja → "imagen poco clara". Siempre se pide repetir.
  if (clase === INVALID_CLASS) {
    const tone = confianza >= INVALID_MIN_CONF ? "invalida" : "reintentar";
    return { ...base, tone, action: "retake" };
  }

  // 2. Inferencia incoherente: el top-1 y el top-2 no son una confusión esperada por la
  //    matriz y, además, o están reñidos o la confianza es muy baja → repetir foto.
  const expected = isExpectedConfusion(clase, clase2);
  if (!expected && (margin < INCOHERENT_MARGIN || confianza < RETAKE_CONF)) {
    return { ...base, tone: "reintentar", action: "retake" };
  }

  // 3. Predicción que se muestra. Sin tono "ambiguo": si el modelo dudaba entre dos clases
  //    vecinas, la confianza es baja y ya recibe el trato suave de esa banda.
  return { ...base, tone: "normal", action: "show" };
}
