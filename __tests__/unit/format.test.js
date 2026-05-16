import {
  formatProbability,
  dayRangeISO,
  formatDateTimeWithWeekday,
} from "@/lib/format";

// ─── formatProbability ────────────────────────────────────────────────────────

describe("formatProbability", () => {
  describe("conversión básica float→porcentaje entero", () => {
    it("convierte 0.78 en 78", () => {
      expect(formatProbability(0.78)).toBe(78);
    });

    it("convierte 1.0 en 100", () => {
      expect(formatProbability(1.0)).toBe(100);
    });

    it("convierte 0.0 en 0", () => {
      expect(formatProbability(0.0)).toBe(0);
    });

    it("convierte 0.5 en 50", () => {
      expect(formatProbability(0.5)).toBe(50);
    });

    it("redondea 0.995 a 100", () => {
      expect(formatProbability(0.995)).toBe(100);
    });

    it("redondea 0.004 a 0", () => {
      expect(formatProbability(0.004)).toBe(0);
    });

    it("redondea 0.255 a 26 (Math.round de 25.5)", () => {
      expect(formatProbability(0.255)).toBe(26);
    });

    it("convierte 0.9832 en 98", () => {
      expect(formatProbability(0.9832)).toBe(98);
    });
  });

  describe("clamp de valores fuera de rango", () => {
    it("clampea valores > 1 a 100", () => {
      expect(formatProbability(1.5)).toBe(100);
    });

    it("clampea valores < 0 a 0", () => {
      expect(formatProbability(-0.3)).toBe(0);
    });

    it("clampea exactamente 2 a 100", () => {
      expect(formatProbability(2)).toBe(100);
    });

    it("clampea -100 a 0", () => {
      expect(formatProbability(-100)).toBe(0);
    });
  });

  describe("entradas inválidas defensivas", () => {
    it("retorna 0 para null", () => {
      expect(formatProbability(null)).toBe(0);
    });

    it("retorna 0 para undefined", () => {
      expect(formatProbability(undefined)).toBe(0);
    });

    it("retorna 0 para NaN", () => {
      expect(formatProbability(NaN)).toBe(0);
    });

    it("retorna 0 para string vacío", () => {
      expect(formatProbability("")).toBe(0);
    });

    it('parsea string numérico "0.8" como 80', () => {
      expect(formatProbability("0.8")).toBe(80);
    });

    it('parsea string "1" como 100', () => {
      expect(formatProbability("1")).toBe(100);
    });
  });

  // Documenta el bug C02: lo que el componente hace actualmente en history/index.js:256
  describe("[C02-REGRESION] item.probability mostrado directo en lugar de formatProbability", () => {
    it('usar {item.probability}% directo con 0.78 produce "0.78%" no "78%"', () => {
      const rawValue = 0.78;
      const buggedDisplay = `${rawValue}%`;
      const correctDisplay = `${formatProbability(rawValue)}%`;

      expect(buggedDisplay).toBe("0.78%"); // así está actualmente (incorrecto)
      expect(correctDisplay).toBe("78%"); // así debería estar
      expect(buggedDisplay).not.toBe(correctDisplay); // confirma divergencia
    });

    it('usar {item.probability}% con 0.9832 produce "0.9832%" no "98%"', () => {
      const rawValue = 0.9832;
      expect(`${rawValue}%`).toBe("0.9832%");
      expect(`${formatProbability(rawValue)}%`).toBe("98%");
    });
  });
});

// ─── dayRangeISO ──────────────────────────────────────────────────────────────

describe("dayRangeISO", () => {
  describe("estructura del resultado", () => {
    it("retorna un objeto con startISO y endISO", () => {
      const result = dayRangeISO(new Date("2026-01-15"));
      expect(result).toHaveProperty("startISO");
      expect(result).toHaveProperty("endISO");
    });

    it("startISO y endISO son strings ISO válidos (parseables)", () => {
      const { startISO, endISO } = dayRangeISO(new Date("2026-01-15"));
      expect(() => new Date(startISO)).not.toThrow();
      expect(() => new Date(endISO)).not.toThrow();
      expect(new Date(startISO).toString()).not.toBe("Invalid Date");
      expect(new Date(endISO).toString()).not.toBe("Invalid Date");
    });

    it("startISO es anterior a endISO", () => {
      const { startISO, endISO } = dayRangeISO(new Date("2026-06-10"));
      expect(new Date(startISO).getTime()).toBeLessThan(
        new Date(endISO).getTime(),
      );
    });
  });

  describe("rango de exactamente 24 horas", () => {
    it("endISO - startISO = 86400000 ms en verano", () => {
      const { startISO, endISO } = dayRangeISO(new Date("2026-07-15"));
      const diff = new Date(endISO).getTime() - new Date(startISO).getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000);
    });

    it("endISO - startISO = 86400000 ms en invierno", () => {
      const { startISO, endISO } = dayRangeISO(new Date("2026-01-20"));
      const diff = new Date(endISO).getTime() - new Date(startISO).getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000);
    });

    it("el rango funciona en fin de mes (31 enero)", () => {
      const { startISO, endISO } = dayRangeISO(new Date("2026-01-31"));
      const diff = new Date(endISO).getTime() - new Date(startISO).getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000);
    });

    it("el rango funciona en fin de año (31 diciembre)", () => {
      const { startISO, endISO } = dayRangeISO(new Date("2025-12-31"));
      const diff = new Date(endISO).getTime() - new Date(startISO).getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe("acepta diferentes tipos de entrada", () => {
    it("acepta un objeto Date", () => {
      const { startISO } = dayRangeISO(new Date("2026-03-15"));
      expect(typeof startISO).toBe("string");
    });

    it("acepta un string ISO de fecha", () => {
      const { startISO } = dayRangeISO("2026-03-15");
      expect(typeof startISO).toBe("string");
    });

    it("acepta un timestamp numérico", () => {
      const ts = new Date("2026-03-15").getTime();
      const { startISO } = dayRangeISO(ts);
      expect(typeof startISO).toBe("string");
    });
  });

  // [DATE01] Bug potencial: dayRangeISO usa hora LOCAL no UTC.
  // En España UTC+2 (verano), las 00:00 local = 22:00 UTC del día anterior.
  // Esto puede hacer que predicciones de madrugada no aparezcan al filtrar por fecha.
  describe("[DATE01-DOC] comportamiento de timezone documentado (bug potencial)", () => {
    it("startISO tiene la forma de string ISO válido con sufijo Z (UTC)", () => {
      const { startISO } = dayRangeISO(new Date("2026-07-15"));
      expect(startISO).toMatch(/Z$/);
    });

    it("NOTA: setHours(0,0,0,0) aplica hora local, no UTC — ver hallazgo DATE01", () => {
      // Este test documenta el comportamiento, no que sea correcto.
      // En un entorno con TZ=Europe/Madrid (UTC+2 verano), el resultado del
      // startISO para el 15-Jul-2026 sería '2026-07-14T22:00:00.000Z', no
      // '2026-07-15T00:00:00.000Z'. El filtro de Supabase perdería las
      // predicciones hechas entre las 00:00 y las 01:59:59 hora local.
      //
      // FIX recomendado: construir el rango en UTC usando la zona horaria
      // del usuario como referencia semántica (Temporal.PlainDate o similar).
      const { startISO } = dayRangeISO(new Date("2026-07-15"));
      expect(startISO).toBeTruthy(); // solo verifica que existe, sin asumir valor UTC
    });
  });
});

// ─── formatDateTimeWithWeekday ────────────────────────────────────────────────

describe("formatDateTimeWithWeekday", () => {
  describe("entradas nulas o vacías → objeto de fallback", () => {
    const FALLBACK = { fecha: "-", hora: "-", dia: "-", texto: "-" };

    it("retorna el objeto de fallback para null", () => {
      expect(formatDateTimeWithWeekday(null)).toEqual(FALLBACK);
    });

    it("retorna el objeto de fallback para undefined", () => {
      expect(formatDateTimeWithWeekday(undefined)).toEqual(FALLBACK);
    });

    it("retorna el objeto de fallback para string vacío", () => {
      expect(formatDateTimeWithWeekday("")).toEqual(FALLBACK);
    });
  });

  describe("estructura del resultado con fecha válida", () => {
    const iso = "2026-02-21T10:00:00.000Z";

    it("retorna las 5 propiedades esperadas", () => {
      const result = formatDateTimeWithWeekday(iso);
      expect(result).toHaveProperty("dia");
      expect(result).toHaveProperty("fecha");
      expect(result).toHaveProperty("hora");
      expect(result).toHaveProperty("capitalizedDay");
      expect(result).toHaveProperty("texto");
    });

    it("capitalizedDay tiene la primera letra en mayúscula", () => {
      const { capitalizedDay } = formatDateTimeWithWeekday(iso);
      expect(capitalizedDay.length).toBeGreaterThan(0);
      expect(capitalizedDay[0]).toBe(capitalizedDay[0].toUpperCase());
    });

    it("texto incluye la fecha formateada", () => {
      const { texto, fecha } = formatDateTimeWithWeekday(iso);
      expect(texto).toContain(fecha);
    });

    it("texto incluye la hora formateada", () => {
      const { texto, hora } = formatDateTimeWithWeekday(iso);
      expect(texto).toContain(hora);
    });

    it("texto incluye el separador ·", () => {
      const { texto } = formatDateTimeWithWeekday(iso);
      expect(texto).toContain("·");
    });
  });

  describe("formato de los valores", () => {
    const iso = "2026-02-21T10:00:00.000Z";

    it("fecha tiene formato DD/MM/YYYY (2 dígitos/2 dígitos/4 dígitos)", () => {
      const { fecha } = formatDateTimeWithWeekday(iso);
      expect(fecha).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it("hora tiene formato HH:MM (24h, 2 dígitos:2 dígitos)", () => {
      const { hora } = formatDateTimeWithWeekday(iso);
      expect(hora).toMatch(/^\d{2}:\d{2}$/);
    });

    it("dia es un string no vacío", () => {
      const { dia } = formatDateTimeWithWeekday(iso);
      expect(typeof dia).toBe("string");
      expect(dia.length).toBeGreaterThan(0);
    });
  });

  describe("acepta parámetros opcionales de locale y timezone", () => {
    it("funciona con timezone UTC", () => {
      const result = formatDateTimeWithWeekday(
        "2026-03-15T12:00:00.000Z",
        "es-ES",
        "UTC",
      );
      expect(result.fecha).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(result.hora).toBe("12:00");
    });
  });
});
