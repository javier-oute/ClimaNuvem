import { normalizeRGBA, IMAGENET_MEAN, IMAGENET_STD } from "@/lib/mlNormalize";

// Valores de referencia calculados manualmente con la fórmula:
// output = (pixel/255.0 - MEAN[canal]) / STD[canal]
//
// Píxel negro (R=0, G=0, B=0):
//   R: (0/255 - 0.485) / 0.229 = -0.485/0.229 ≈ -2.11790
//   G: (0/255 - 0.456) / 0.224 = -0.456/0.224 ≈ -2.03571
//   B: (0/255 - 0.406) / 0.225 = -0.406/0.225 ≈ -1.80444
//
// Píxel blanco (R=255, G=255, B=255):
//   R: (1.0 - 0.485) / 0.229 = 0.515/0.229  ≈ +2.24891
//   G: (1.0 - 0.456) / 0.224 = 0.544/0.224  ≈ +2.42857
//   B: (1.0 - 0.406) / 0.225 = 0.594/0.225  ≈ +2.64000

// ─── Constantes exportadas ────────────────────────────────────────────────────

describe("constantes exportadas", () => {
  it("IMAGENET_MEAN tiene los 3 valores correctos de ImageNet", () => {
    expect(IMAGENET_MEAN).toEqual([0.485, 0.456, 0.406]);
  });

  it("IMAGENET_STD tiene los 3 valores correctos de ImageNet", () => {
    expect(IMAGENET_STD).toEqual([0.229, 0.224, 0.225]);
  });
});

// ─── Dimensiones del output ───────────────────────────────────────────────────

describe("normalizeRGBA — dimensiones del resultado", () => {
  it("un píxel 1×1 produce Float32Array de longitud 3", () => {
    const rgba = new Uint8Array([128, 64, 32, 255]);
    const result = normalizeRGBA(rgba, 1, 1);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(3);
  });

  it("imagen 224×224 (default) produce Float32Array de longitud 150528", () => {
    const rgba = new Uint8Array(224 * 224 * 4).fill(128);
    const result = normalizeRGBA(rgba);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(224 * 224 * 3); // 150528
  });

  it("imagen 2×2 produce Float32Array de longitud 12", () => {
    const rgba = new Uint8Array(2 * 2 * 4).fill(0);
    const result = normalizeRGBA(rgba, 2, 2);
    expect(result.length).toBe(12);
  });

  it("imagen 1×3 produce Float32Array de longitud 9", () => {
    const rgba = new Uint8Array(1 * 3 * 4).fill(100);
    const result = normalizeRGBA(rgba, 1, 3);
    expect(result.length).toBe(9);
  });
});

// ─── Normalización: píxel negro ───────────────────────────────────────────────

describe("normalizeRGBA — píxel negro (R=0, G=0, B=0)", () => {
  let result;

  beforeEach(() => {
    const rgba = new Uint8Array([0, 0, 0, 255]);
    result = normalizeRGBA(rgba, 1, 1);
  });

  it("canal R normalizado ≈ -2.1179", () => {
    const expected = (0 / 255.0 - 0.485) / 0.229;
    expect(result[0]).toBeCloseTo(expected, 3);
  });

  it("canal G normalizado ≈ -2.0357", () => {
    const expected = (0 / 255.0 - 0.456) / 0.224;
    expect(result[1]).toBeCloseTo(expected, 3);
  });

  it("canal B normalizado ≈ -1.8044", () => {
    const expected = (0 / 255.0 - 0.406) / 0.225;
    expect(result[2]).toBeCloseTo(expected, 3);
  });
});

// ─── Normalización: píxel blanco ──────────────────────────────────────────────

describe("normalizeRGBA — píxel blanco (R=255, G=255, B=255)", () => {
  let result;

  beforeEach(() => {
    const rgba = new Uint8Array([255, 255, 255, 255]);
    result = normalizeRGBA(rgba, 1, 1);
  });

  it("canal R normalizado ≈ +2.2489", () => {
    const expected = (255 / 255.0 - 0.485) / 0.229;
    expect(result[0]).toBeCloseTo(expected, 3);
  });

  it("canal G normalizado ≈ +2.4286", () => {
    const expected = (255 / 255.0 - 0.456) / 0.224;
    expect(result[1]).toBeCloseTo(expected, 3);
  });

  it("canal B normalizado ≈ +2.6400", () => {
    const expected = (255 / 255.0 - 0.406) / 0.225;
    expect(result[2]).toBeCloseTo(expected, 3);
  });
});

// ─── Normalización: píxel gris medio ─────────────────────────────────────────

describe("normalizeRGBA — píxel gris (R=128, G=128, B=128)", () => {
  it("produce valores entre los extremos de negro y blanco", () => {
    const rgba = new Uint8Array([128, 128, 128, 255]);
    const result = normalizeRGBA(rgba, 1, 1);

    const blackR = (0 / 255.0 - 0.485) / 0.229;
    const whiteR = (255 / 255.0 - 0.485) / 0.229;

    expect(result[0]).toBeGreaterThan(blackR);
    expect(result[0]).toBeLessThan(whiteR);
  });
});

// ─── Normalización: píxel con valor de media ImageNet ────────────────────────

describe("normalizeRGBA — píxel con valor ≈ media ImageNet", () => {
  it("canal R normaliza a ≈ 0 cuando pixel ≈ MEAN[0]*255", () => {
    // 0.485 * 255 ≈ 123.675 → redondeamos a 124
    const r = Math.round(IMAGENET_MEAN[0] * 255);
    const rgba = new Uint8Array([r, 128, 128, 255]);
    const result = normalizeRGBA(rgba, 1, 1);
    // Tolerancia laxa por redondeo de byte
    expect(Math.abs(result[0])).toBeLessThan(0.05);
  });
});

// ─── Canal alpha ignorado ─────────────────────────────────────────────────────

describe("normalizeRGBA — canal alpha ignorado", () => {
  it("mismo RGB con alpha=255 y alpha=0 produce idéntico output", () => {
    const rgba255 = new Uint8Array([200, 100, 50, 255]);
    const rgba0 = new Uint8Array([200, 100, 50, 0]);

    const r255 = normalizeRGBA(rgba255, 1, 1);
    const r0 = normalizeRGBA(rgba0, 1, 1);

    expect(r255[0]).toBeCloseTo(r0[0], 5);
    expect(r255[1]).toBeCloseTo(r0[1], 5);
    expect(r255[2]).toBeCloseTo(r0[2], 5);
  });

  it("alpha=128 produce el mismo resultado que alpha=0", () => {
    const rgba128 = new Uint8Array([80, 160, 240, 128]);
    const rgba0 = new Uint8Array([80, 160, 240, 0]);

    const r128 = normalizeRGBA(rgba128, 1, 1);
    const r0 = normalizeRGBA(rgba0, 1, 1);

    expect(r128[0]).toBeCloseTo(r0[0], 5);
  });
});

// ─── Consistencia multi-píxel ─────────────────────────────────────────────────

describe("normalizeRGBA — procesamiento multi-píxel", () => {
  it("procesa múltiples píxeles independientemente (negro y blanco)", () => {
    // Imagen 2×1: píxel negro + píxel blanco
    const rgba = new Uint8Array([
      0,
      0,
      0,
      255, // píxel 0: negro
      255,
      255,
      255,
      255, // píxel 1: blanco
    ]);
    const result = normalizeRGBA(rgba, 2, 1);

    const expectedBlackR = (0 / 255.0 - 0.485) / 0.229;
    const expectedWhiteR = (255 / 255.0 - 0.485) / 0.229;

    expect(result[0]).toBeCloseTo(expectedBlackR, 3); // píxel 0, canal R
    expect(result[3]).toBeCloseTo(expectedWhiteR, 3); // píxel 1, canal R
  });

  it("los canales de píxeles adyacentes no se mezclan", () => {
    // Píxel 0: rojo puro. Píxel 1: verde puro.
    const rgba = new Uint8Array([
      255,
      0,
      0,
      255, // R puro
      0,
      255,
      0,
      255, // G puro
    ]);
    const result = normalizeRGBA(rgba, 2, 1);

    const redR = (255 / 255.0 - 0.485) / 0.229;
    const redG = (0 / 255.0 - 0.456) / 0.224;
    const greenR = (0 / 255.0 - 0.485) / 0.229;
    const greenG = (255 / 255.0 - 0.456) / 0.224;

    expect(result[0]).toBeCloseTo(redR, 3); // píxel 0, R
    expect(result[1]).toBeCloseTo(redG, 3); // píxel 0, G
    expect(result[3]).toBeCloseTo(greenR, 3); // píxel 1, R
    expect(result[4]).toBeCloseTo(greenG, 3); // píxel 1, G
  });
});
