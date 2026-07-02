// Cobertura del mapeo de clases del pipeline ML: la lógica pura vive en evaluateForecast.js y se testea allí (antes A02 it.todo).

const { evaluateForecast } = require("@/lib/forecast/evaluateForecast");
const { CLASS_ORDER } = require("@/lib/forecast/model-meta");

// Vector de 8 probabilidades en el orden de CLASS_ORDER a partir de {clase: prob}.
function vec(map) {
  const explicit = Object.values(map).reduce((a, b) => a + b, 0);
  const rest = Math.max(0, 1 - explicit);
  const missing = CLASS_ORDER.filter((c) => !(c in map));
  const fill = missing.length ? rest / missing.length : 0;
  return CLASS_ORDER.map((c) => (c in map ? map[c] : fill));
}

describe("[A02] mapeo de clases del pipeline ML (vía evaluateForecast)", () => {
  it("retorna la clase con mayor probabilidad como top-1 (clase/confianza)", () => {
    const d = evaluateForecast(
      vec({ tormenta: 0.7, conveccion_desarrollo: 0.2, cielo_despejado: 0.05 }),
    );
    expect(d.clase).toBe("tormenta");
    expect(d.confianza).toBeCloseTo(0.7, 5);
  });

  it("retorna correctamente la segunda clase más probable (clase2/conf2/margin)", () => {
    const d = evaluateForecast(
      vec({ tormenta: 0.7, conveccion_desarrollo: 0.2, cielo_despejado: 0.05 }),
    );
    expect(d.clase2).toBe("conveccion_desarrollo");
    expect(d.conf2).toBeCloseTo(0.2, 5);
    expect(d.margin).toBeCloseTo(0.5, 5);
  });

  it("el resultado tiene la estructura esperada y todasLasProbs respeta CLASS_ORDER", () => {
    const d = evaluateForecast(
      vec({ tormenta: 0.95, conveccion_desarrollo: 0.03 }),
    );

    // Forma del resultado actual (sustituye al antiguo {clase,confianza,alerta,todasLasProbs}).
    expect(d).toEqual(
      expect.objectContaining({
        clase: expect.any(String),
        confianza: expect.any(Number),
        clase2: expect.any(String),
        conf2: expect.any(Number),
        margin: expect.any(Number),
        reliability: expect.any(String),
        messageBand: expect.any(String),
        riskLevel: expect.any(Number),
        tone: expect.any(String),
        action: expect.any(String),
        todasLasProbs: expect.any(Array),
      }),
    );

    // todasLasProbs mantiene el orden de CLASS_ORDER (no ordenado por probabilidad).
    expect(d.todasLasProbs.map((p) => p.clase)).toEqual(CLASS_ORDER);
    expect(d.todasLasProbs).toHaveLength(8);
    const suma = d.todasLasProbs.reduce((a, p) => a + p.prob, 0);
    expect(suma).toBeCloseTo(1, 5);
  });

  it("empates: con dos clases iguales elige una de las dos como top-1 de forma estable", () => {
    const d = evaluateForecast(
      vec({ tormenta: 0.4, conveccion_desarrollo: 0.4 }),
    );
    expect(["tormenta", "conveccion_desarrollo"]).toContain(d.clase);
    expect(["tormenta", "conveccion_desarrollo"]).toContain(d.clase2);
    expect(d.clase).not.toBe(d.clase2);
  });
});
