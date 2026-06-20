import { normalizeUsername, isValidUsername } from "@/utils/username";

// ─── normalizeUsername ────────────────────────────────────────────────────────

describe("normalizeUsername", () => {
  it("recorta espacios al inicio y final", () => {
    expect(normalizeUsername("  javier  ")).toBe("javier");
  });

  it("trata null/undefined como cadena vacía", () => {
    expect(normalizeUsername(null)).toBe("");
    expect(normalizeUsername(undefined)).toBe("");
  });
});

// ─── isValidUsername ──────────────────────────────────────────────────────────

describe("isValidUsername", () => {
  describe("válidos", () => {
    it("acepta letras, dígitos y guion bajo (3..30)", () => {
      expect(isValidUsername("abc")).toBe(true);
      expect(isValidUsername("Javier_123")).toBe(true);
      expect(isValidUsername("a".repeat(30))).toBe(true);
    });

    it("ignora espacios externos (los normaliza)", () => {
      expect(isValidUsername("  user_1  ")).toBe(true);
    });
  });

  describe("inválidos", () => {
    it("rechaza vacío o null", () => {
      expect(isValidUsername("")).toBe(false);
      expect(isValidUsername(null)).toBe(false);
    });

    it("rechaza menos de 3 caracteres", () => {
      expect(isValidUsername("ab")).toBe(false);
    });

    it("rechaza más de 30 caracteres", () => {
      expect(isValidUsername("a".repeat(31))).toBe(false);
    });

    it("rechaza caracteres no permitidos", () => {
      expect(isValidUsername("ja vier")).toBe(false);
      expect(isValidUsername("javier@")).toBe(false);
      expect(isValidUsername("josé")).toBe(false);
      expect(isValidUsername("user.name")).toBe(false);
    });
  });
});
