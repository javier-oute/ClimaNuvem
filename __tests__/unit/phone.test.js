import { normalizePhone, isValidPhoneSimple } from "@/utils/phone";

// ─── normalizePhone ───────────────────────────────────────────────────────────

describe("normalizePhone", () => {
  describe("elimina separadores comunes", () => {
    it("elimina espacios", () => {
      expect(normalizePhone("612 345 678")).toBe("612345678");
    });

    it("elimina guiones", () => {
      expect(normalizePhone("612-345-678")).toBe("612345678");
    });

    it("elimina paréntesis", () => {
      expect(normalizePhone("(612) 345 678")).toBe("612345678");
    });

    it("elimina puntos", () => {
      expect(normalizePhone("612.345.678")).toBe("612345678");
    });

    it("combina todos los tipos de separadores", () => {
      expect(normalizePhone("+34 (612) 345-678")).toBe("+34612345678");
    });
  });

  describe("manejo del prefijo +", () => {
    it("conserva el + inicial", () => {
      expect(normalizePhone("+34612345678")).toBe("+34612345678");
    });

    it("elimina + adicionales manteniendo el inicial", () => {
      expect(normalizePhone("+34+612+345678")).toBe("+34612345678");
    });

    it("no añade + si no estaba en el input", () => {
      expect(normalizePhone("612345678")).toBe("612345678");
    });

    it("elimina + interior sin + inicial", () => {
      expect(normalizePhone("34+612345678")).toBe("34612345678");
    });
  });

  describe("entradas edge case", () => {
    it("retorna string vacío para null", () => {
      expect(normalizePhone(null)).toBe("");
    });

    it("retorna string vacío para undefined", () => {
      expect(normalizePhone(undefined)).toBe("");
    });

    it("retorna string vacío para string vacío", () => {
      expect(normalizePhone("")).toBe("");
    });

    it("elimina espacios de inicio y fin antes de procesar", () => {
      expect(normalizePhone("  612345678  ")).toBe("612345678");
    });

    it("solo + y sin dígitos → solo devuelve +", () => {
      expect(normalizePhone("+")).toBe("+");
    });
  });
});

// ─── isValidPhoneSimple ───────────────────────────────────────────────────────

describe("isValidPhoneSimple", () => {
  describe("números válidos", () => {
    it("acepta número español sin prefijo (9 dígitos)", () => {
      expect(isValidPhoneSimple("612345678")).toBe(true);
    });

    it("acepta número con prefijo internacional +34", () => {
      expect(isValidPhoneSimple("+34612345678")).toBe(true);
    });

    it("acepta número de 15 dígitos (máximo internacional)", () => {
      expect(isValidPhoneSimple("+123456789012345")).toBe(true);
    });

    it("acepta número con espacios (normalización interna)", () => {
      expect(isValidPhoneSimple("+34 612 345 678")).toBe(true);
    });

    it("acepta número de 9 dígitos exactos (mínimo sin prefijo)", () => {
      expect(isValidPhoneSimple("123456789")).toBe(true);
    });

    it("acepta número de 10 dígitos", () => {
      expect(isValidPhoneSimple("6123456789")).toBe(true);
    });

    it("acepta número con guiones que tras normalize queda válido", () => {
      expect(isValidPhoneSimple("612-345-678")).toBe(true);
    });
  });

  describe("números inválidos", () => {
    it("rechaza número de 8 dígitos (demasiado corto)", () => {
      expect(isValidPhoneSimple("12345678")).toBe(false);
    });

    it("rechaza número de 16 dígitos (demasiado largo)", () => {
      expect(isValidPhoneSimple("+1234567890123456")).toBe(false);
    });

    it("rechaza string vacío", () => {
      expect(isValidPhoneSimple("")).toBe(false);
    });

    it("rechaza null", () => {
      expect(isValidPhoneSimple(null)).toBe(false);
    });

    it("rechaza undefined", () => {
      expect(isValidPhoneSimple(undefined)).toBe(false);
    });

    it("rechaza string con solo letras", () => {
      expect(isValidPhoneSimple("abcdefghi")).toBe(false);
    });

    it("rechaza string con solo separadores", () => {
      expect(isValidPhoneSimple("--- ---")).toBe(false);
    });

    it("rechaza prefijo + solo sin dígitos", () => {
      expect(isValidPhoneSimple("+")).toBe(false);
    });
  });
});
