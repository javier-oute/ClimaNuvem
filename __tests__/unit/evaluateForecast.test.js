// Tests de la lógica de alertas por confianza (evaluateForecast.js).
const fs = require("fs");
const path = require("path");

const { evaluateForecast } = require("@/lib/forecast/evaluateForecast");
const {
  CLASS_ORDER,
  bandForConfidence,
  forecastTitleKey,
  RELIABILITY_HIGH,
  RELIABILITY_LOW,
} = require("@/lib/forecast/model-meta");

// Construye un vector de 8 probabilidades desde {clase: prob}; el resto reparte la masa restante.
function vec(map) {
  const explicit = Object.values(map).reduce((a, b) => a + b, 0);
  const rest = Math.max(0, 1 - explicit);
  const missing = CLASS_ORDER.filter((c) => !(c in map));
  const fill = missing.length ? rest / missing.length : 0;
  return CLASS_ORDER.map((c) => (c in map ? map[c] : fill));
}

describe("invariante de orden de clases", () => {
  it("CLASS_ORDER coincide exactamente con climanuvem_v3_labels.txt", () => {
    const labelsPath = path.join(
      __dirname,
      "../../assets/models/climanuvem_v3_labels.txt",
    );
    const labels = fs
      .readFileSync(labelsPath, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    expect(labels).toEqual(CLASS_ORDER);
  });
});

describe("validación de entrada", () => {
  it("lanza si el vector no tiene 8 probabilidades", () => {
    expect(() => evaluateForecast([0.5, 0.5])).toThrow();
    expect(() => evaluateForecast(null)).toThrow();
  });
});

describe("bandForConfidence (cortes conservadores 0.90 / 0.70)", () => {
  it("clasifica las bandas según los cortes", () => {
    expect(RELIABILITY_HIGH).toBe(0.9);
    expect(RELIABILITY_LOW).toBe(0.7);
    expect(bandForConfidence(0.95)).toBe("alta");
    expect(bandForConfidence(0.9)).toBe("alta");
    expect(bandForConfidence(0.89)).toBe("media");
    expect(bandForConfidence(0.7)).toBe("media");
    expect(bandForConfidence(0.69)).toBe("baja");
    expect(bandForConfidence(0.5)).toBe("baja");
  });
});

describe("forecastTitleKey (firme en alta, dudoso en media/baja)", () => {
  it("solo la banda alta usa el título firme", () => {
    expect(forecastTitleKey("tormenta", "alta")).toBe("alerts.tormenta.titulo");
    expect(forecastTitleKey("tormenta", "media")).toBe(
      "alerts.tormenta.tituloDudoso",
    );
    expect(forecastTitleKey("tormenta", "baja")).toBe(
      "alerts.tormenta.tituloDudoso",
    );
  });
});

describe("predicción clara", () => {
  it("tormenta 0.95 → normal, fiabilidad alta, el top-1 manda", () => {
    const d = evaluateForecast(
      vec({
        tormenta: 0.95,
        conveccion_desarrollo: 0.02,
        cubierto_precipitacion: 0.01,
      }),
    );
    expect(d.clase).toBe("tormenta");
    expect(d.reliability).toBe("alta");
    expect(d.messageBand).toBe("alta");
    expect(d.tone).toBe("normal");
    expect(d.action).toBe("show");
    expect(d.riskLevel).toBe(4);
  });

  it("cielo_despejado 0.90 con nubes_altas 0.05 → normal, sin suavizado", () => {
    const d = evaluateForecast(
      vec({ cielo_despejado: 0.9, nubes_altas_medias: 0.05 }),
    );
    expect(d.clase).toBe("cielo_despejado");
    expect(d.reliability).toBe("alta");
    expect(d.tone).toBe("normal");
  });
});

describe("sin escalado: el top-1 nunca se sustituye por la clase grave del top-2", () => {
  it("conveccion 0.50 / tormenta 0.38 → sigue siendo conveccion (no escala a tormenta)", () => {
    const d = evaluateForecast(
      vec({ conveccion_desarrollo: 0.5, tormenta: 0.38 }),
    );
    expect(d.clase).toBe("conveccion_desarrollo");
    expect(d.riskLevel).toBe(3); // riesgo de conveccion, no de tormenta
    expect(d.tone).toBe("normal");
    expect(d.action).toBe("show");
  });
});

describe("suavizado del mensaje por 2ª clase (sin tocar la fiabilidad)", () => {
  it("tormenta 0.72 / cielo 0.24 → fiabilidad media pero mensaje baja a 'baja'", () => {
    const d = evaluateForecast(vec({ tormenta: 0.72, cielo_despejado: 0.24 }));
    expect(d.clase).toBe("tormenta");
    expect(d.reliability).toBe("media");
    expect(d.messageBand).toBe("baja"); // RISK gap 4 y conf2 ≥0.20 → un escalón más suave
    expect(d.tone).toBe("normal");
  });

  it("no suaviza si la 2ª clase tiene poca probabilidad (conf2 < 0.10)", () => {
    const d = evaluateForecast(vec({ tormenta: 0.88, cielo_despejado: 0.08 }));
    expect(d.reliability).toBe("media");
    expect(d.messageBand).toBe("media");
  });

  it("suaviza con la 2ª clase justo en el umbral (conf2 = 0.10)", () => {
    const d = evaluateForecast(vec({ tormenta: 0.8, cielo_despejado: 0.1 }));
    expect(d.reliability).toBe("media");
    expect(d.messageBand).toBe("baja");
  });

  it("no suaviza si la diferencia de riesgo es pequeña (< 2 niveles)", () => {
    const d = evaluateForecast(
      vec({ cubierto_precipitacion: 0.75, nubes_altas_medias: 0.22 }),
    );
    expect(d.reliability).toBe("media");
    expect(d.messageBand).toBe("media");
    expect(d.tone).toBe("normal");
  });
});

describe("clases vecinas reñidas (sin caso especial de ambigüedad)", () => {
  it("niebla 0.50 / cubierto 0.42 → se muestra normal (par esperado), sin repetir foto", () => {
    const d = evaluateForecast(
      vec({ niebla_stratus: 0.5, cubierto_precipitacion: 0.42 }),
    );
    expect(d.tone).toBe("normal");
    expect(d.action).toBe("show");
    expect(d.clase).toBe("niebla_stratus");
    expect(d.reliability).toBe("baja"); // confianza baja → trato suave por banda
  });
});

describe("inferencia incoherente → repetir foto", () => {
  it("tormenta 0.45 / cielo 0.40 (par no esperado, reñido) → retake", () => {
    const d = evaluateForecast(vec({ tormenta: 0.45, cielo_despejado: 0.4 }));
    expect(d.action).toBe("retake");
    expect(d.tone).toBe("reintentar");
  });

  it("tormenta 0.64 / cielo 0.36 (par no esperado, margen 0.28 < 0.35) → retake", () => {
    const d = evaluateForecast(vec({ tormenta: 0.64, cielo_despejado: 0.36 }));
    expect(d.action).toBe("retake");
    expect(d.tone).toBe("reintentar");
  });

  it("confianza baja con par no esperado → retake aunque el margen sea amplio", () => {
    const d = evaluateForecast(
      vec({ cielo_despejado: 0.42, lenticular_viento: 0.1 }),
    );
    expect(d.confianza).toBeLessThan(0.45);
    expect(d.action).toBe("retake");
  });

  it("alta confianza con par no esperado NO se manda a repetir", () => {
    const d = evaluateForecast(vec({ tormenta: 0.95, cielo_despejado: 0.03 }));
    expect(d.action).toBe("show");
    expect(d.clase).toBe("tormenta");
  });
});

describe("foto_invalida", () => {
  it("foto_invalida 0.80 → invalida + retake", () => {
    const d = evaluateForecast(vec({ foto_invalida: 0.8 }));
    expect(d.tone).toBe("invalida");
    expect(d.action).toBe("retake");
    expect(d.clase).toBe("foto_invalida");
  });

  it("foto_invalida floja 0.45 → reintentar (foto_invalida top-1 siempre se repite)", () => {
    const d = evaluateForecast(
      vec({ foto_invalida: 0.45, cielo_despejado: 0.4 }),
    );
    expect(d.tone).toBe("reintentar");
    expect(d.action).toBe("retake");
  });

  it("foto_invalida floja con margen amplio (0.55 / 0.20) también se repite", () => {
    const d = evaluateForecast(
      vec({ foto_invalida: 0.55, cielo_despejado: 0.2 }),
    );
    expect(d.action).toBe("retake");
    expect(d.tone).toBe("reintentar");
  });
});
