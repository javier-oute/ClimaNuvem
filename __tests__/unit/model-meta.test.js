// Tests de model-meta.js: helpers puros e invariantes de integridad para atrapar errores al integrar un futuro modelo (v4).
const {
  CLASS_ORDER,
  RISK,
  RISK_COLORS,
  EXPECTED_CONFUSIONS,
  isExpectedConfusion,
  bandForConfidence,
  forecastTitleKey,
  RELIABILITY_HIGH,
  RELIABILITY_LOW,
  INVALID_CLASS,
} = require("@/lib/forecast/model-meta");

describe("isExpectedConfusion", () => {
  it("es simétrico: (a,b) == (b,a)", () => {
    expect(isExpectedConfusion("tormenta", "conveccion_desarrollo")).toBe(true);
    expect(isExpectedConfusion("conveccion_desarrollo", "tormenta")).toBe(true);
  });

  it("reconoce pares de confusión esperados de la matriz", () => {
    expect(
      isExpectedConfusion("niebla_stratus", "cubierto_precipitacion"),
    ).toBe(true);
    expect(isExpectedConfusion("cielo_despejado", "nubes_altas_medias")).toBe(
      true,
    );
    expect(isExpectedConfusion("tormenta", "cubierto_precipitacion")).toBe(
      true,
    );
  });

  it("devuelve false para un par NO esperado (inferencia incoherente)", () => {
    expect(isExpectedConfusion("tormenta", "cielo_despejado")).toBe(false);
    expect(isExpectedConfusion("niebla_stratus", "tormenta")).toBe(false);
    expect(isExpectedConfusion("lenticular_viento", "tormenta")).toBe(false);
  });

  it("una clase consigo misma no está en el grafo de confusión", () => {
    expect(isExpectedConfusion("tormenta", "tormenta")).toBe(false);
  });

  it("clases inexistentes devuelven false sin lanzar", () => {
    expect(isExpectedConfusion("foo", "bar")).toBe(false);
    expect(isExpectedConfusion("tormenta", "foo")).toBe(false);
  });
});

describe("bandForConfidence (cortes conservadores)", () => {
  it("expone los cortes esperados", () => {
    expect(RELIABILITY_HIGH).toBe(0.9);
    expect(RELIABILITY_LOW).toBe(0.7);
  });

  it("clasifica las fronteras exactas", () => {
    expect(bandForConfidence(1)).toBe("alta");
    expect(bandForConfidence(0.9)).toBe("alta"); // inclusivo
    expect(bandForConfidence(0.8999)).toBe("media");
    expect(bandForConfidence(0.7)).toBe("media"); // inclusivo
    expect(bandForConfidence(0.6999)).toBe("baja");
    expect(bandForConfidence(0)).toBe("baja");
  });

  it("tolera valores fuera de rango", () => {
    expect(bandForConfidence(1.5)).toBe("alta");
    expect(bandForConfidence(-0.2)).toBe("baja");
  });
});

describe("forecastTitleKey", () => {
  it("solo la banda alta usa el título firme; media/baja usan el dudoso", () => {
    for (const clase of CLASS_ORDER) {
      expect(forecastTitleKey(clase, "alta")).toBe(`alerts.${clase}.titulo`);
      expect(forecastTitleKey(clase, "media")).toBe(
        `alerts.${clase}.tituloDudoso`,
      );
      expect(forecastTitleKey(clase, "baja")).toBe(
        `alerts.${clase}.tituloDudoso`,
      );
    }
  });
});

describe("invariantes de integridad del modelo", () => {
  it("CLASS_ORDER tiene 8 clases únicas", () => {
    expect(CLASS_ORDER).toHaveLength(8);
    expect(new Set(CLASS_ORDER).size).toBe(8);
  });

  it("toda clase de CLASS_ORDER tiene nivel de riesgo en RISK", () => {
    for (const clase of CLASS_ORDER) {
      expect(RISK).toHaveProperty(clase);
      expect(typeof RISK[clase]).toBe("number");
    }
  });

  it("toda clase de CLASS_ORDER tiene color en RISK_COLORS", () => {
    for (const clase of CLASS_ORDER) {
      expect(RISK_COLORS).toHaveProperty(clase);
      expect(RISK_COLORS[clase]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("RISK y RISK_COLORS no tienen claves de más (mismas que CLASS_ORDER)", () => {
    const classes = [...CLASS_ORDER].sort();
    expect(Object.keys(RISK).sort()).toEqual(classes);
    expect(Object.keys(RISK_COLORS).sort()).toEqual(classes);
  });

  it("INVALID_CLASS es una clase válida con riesgo -1 (no es nube)", () => {
    expect(CLASS_ORDER).toContain(INVALID_CLASS);
    expect(RISK[INVALID_CLASS]).toBe(-1);
  });

  it("los niveles de riesgo de las clases meteorológicas están en 0..4", () => {
    for (const clase of CLASS_ORDER) {
      if (clase === INVALID_CLASS) continue;
      expect(RISK[clase]).toBeGreaterThanOrEqual(0);
      expect(RISK[clase]).toBeLessThanOrEqual(4);
    }
  });

  it("EXPECTED_CONFUSIONS solo referencia clases válidas de CLASS_ORDER", () => {
    for (const key of EXPECTED_CONFUSIONS) {
      const [a, b] = key.split("|");
      expect(CLASS_ORDER).toContain(a);
      expect(CLASS_ORDER).toContain(b);
    }
  });
});
