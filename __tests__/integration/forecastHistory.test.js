// Tests de integración para lib/forecastHistory.js
// Mockean @/lib/supabase y @/stores/forecast.store.image para no tocar red real.

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock("@/stores/forecast.store.image", () => ({
  getSignedImageUrl: jest.fn(),
  deleteImage: jest.fn(),
  uploadPhoto: jest.fn(),
}));

import { supabase } from "@/lib/supabase";
import { getSignedImageUrl, deleteImage } from "@/stores/forecast.store.image";
import {
  fetchForecastHistoryWithSignedUrls,
  fetchForecast,
  deleteForecast,
} from "@/lib/forecastHistory";

// ─── Helper: query builder thenable ──────────────────────────────────────────

// El cliente de Supabase devuelve objetos "thenable" (implementan .then()).
// Al hacer `const { data, error } = await query`, Jest necesita que el objeto
// se comporte como una Promise. Modelamos eso con .then() explícito.
function makeQueryBuilder(resolvedValue) {
  const builder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
    then: (resolve, reject) =>
      Promise.resolve(resolvedValue).then(resolve, reject),
  };
  return builder;
}

const MOCK_USER_ID = "user-uuid-abc123";

function mockAuth(userId = MOCK_USER_ID) {
  supabase.auth.getUser.mockResolvedValue({
    data: { user: { id: userId } },
    error: null,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── fetchForecastHistoryWithSignedUrls ───────────────────────────────────────

describe("fetchForecastHistoryWithSignedUrls", () => {
  describe("flujo exitoso", () => {
    it("retorna items con signedUrl cuando image_path existe", async () => {
      const fakeRows = [
        {
          id: "1",
          name: "Tormenta en Gredos",
          forecast: "tormenta",
          probability: 0.92,
          created_at: "2026-03-01T10:00:00Z",
          place_name: "Gredos",
          image_path: `${MOCK_USER_ID}/1234567890.jpg`,
        },
      ];
      mockAuth();
      supabase.from.mockReturnValue(
        makeQueryBuilder({ data: fakeRows, error: null }),
      );
      getSignedImageUrl.mockResolvedValue("https://cdn.example.com/signed-url");

      const result = await fetchForecastHistoryWithSignedUrls(0, 9);

      expect(result).toHaveLength(1);
      expect(result[0].signedUrl).toBe("https://cdn.example.com/signed-url");
      expect(getSignedImageUrl).toHaveBeenCalledWith(fakeRows[0].image_path);
    });

    it("retorna signedUrl: null para items sin image_path", async () => {
      const fakeRows = [
        {
          id: "2",
          name: "Sin foto",
          forecast: "cielo_despejado",
          probability: 0.99,
          created_at: "2026-03-02T10:00:00Z",
          place_name: null,
          image_path: null,
        },
      ];
      mockAuth();
      supabase.from.mockReturnValue(
        makeQueryBuilder({ data: fakeRows, error: null }),
      );

      const result = await fetchForecastHistoryWithSignedUrls(0, 9);

      expect(result[0].signedUrl).toBeNull();
      expect(getSignedImageUrl).not.toHaveBeenCalled();
    });

    it("retorna signedUrl: null si getSignedImageUrl lanza error (degrada graciosamente)", async () => {
      const fakeRows = [
        {
          id: "3",
          name: "URL rota",
          forecast: "niebla_stratus",
          probability: 0.75,
          created_at: "2026-03-03T10:00:00Z",
          place_name: null,
          image_path: `${MOCK_USER_ID}/broken.jpg`,
        },
      ];
      mockAuth();
      supabase.from.mockReturnValue(
        makeQueryBuilder({ data: fakeRows, error: null }),
      );
      getSignedImageUrl.mockRejectedValue(new Error("Storage error"));

      const result = await fetchForecastHistoryWithSignedUrls(0, 9);

      expect(result[0].signedUrl).toBeNull();
      // El error se swallow — no propaga
      expect(result).toHaveLength(1);
    });

    it("retorna array vacío si Supabase devuelve error de BD", async () => {
      mockAuth();
      supabase.from.mockReturnValue(
        makeQueryBuilder({
          data: null,
          error: { message: "DB connection error" },
        }),
      );

      const result = await fetchForecastHistoryWithSignedUrls(0, 9);

      expect(result).toEqual([]);
    });

    it("retorna array vacío si Supabase devuelve data null sin error", async () => {
      mockAuth();
      supabase.from.mockReturnValue(
        makeQueryBuilder({ data: null, error: null }),
      );

      const result = await fetchForecastHistoryWithSignedUrls(0, 9);

      expect(result).toEqual([]);
    });

    it("procesa múltiples items en paralelo generando URLs firmadas para cada uno", async () => {
      const fakeRows = [
        {
          id: "1",
          image_path: "u/a.jpg",
          name: "A",
          forecast: "tormenta",
          probability: 0.9,
          created_at: "2026-01-01T00:00:00Z",
          place_name: null,
        },
        {
          id: "2",
          image_path: "u/b.jpg",
          name: "B",
          forecast: "cielo_despejado",
          probability: 0.8,
          created_at: "2026-01-02T00:00:00Z",
          place_name: null,
        },
        {
          id: "3",
          image_path: null,
          name: "C",
          forecast: "niebla_stratus",
          probability: 0.7,
          created_at: "2026-01-03T00:00:00Z",
          place_name: null,
        },
      ];
      mockAuth();
      supabase.from.mockReturnValue(
        makeQueryBuilder({ data: fakeRows, error: null }),
      );
      getSignedImageUrl
        .mockResolvedValueOnce("https://url/a.jpg")
        .mockResolvedValueOnce("https://url/b.jpg");

      const result = await fetchForecastHistoryWithSignedUrls(0, 14);

      expect(result[0].signedUrl).toBe("https://url/a.jpg");
      expect(result[1].signedUrl).toBe("https://url/b.jpg");
      expect(result[2].signedUrl).toBeNull(); // sin image_path
      expect(getSignedImageUrl).toHaveBeenCalledTimes(2);
    });
  });

  describe("autenticación", () => {
    it("retorna array vacío si no hay usuario autenticado (user null)", async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await fetchForecastHistoryWithSignedUrls(0, 9);

      expect(result).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("retorna array vacío si getUser devuelve error", async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Auth error" },
      });

      const result = await fetchForecastHistoryWithSignedUrls(0, 9);

      expect(result).toEqual([]);
    });
  });

  describe("filtro por día (day)", () => {
    it("cuando se pasa day, el query builder recibe llamadas a .gte() y .lt()", async () => {
      mockAuth();
      const builder = makeQueryBuilder({ data: [], error: null });
      supabase.from.mockReturnValue(builder);

      await fetchForecastHistoryWithSignedUrls(
        0,
        9,
        "",
        new Date("2026-07-15"),
      );

      expect(builder.gte).toHaveBeenCalled();
      expect(builder.lt).toHaveBeenCalled();
    });

    it("sin day, .gte() y .lt() no se llaman", async () => {
      mockAuth();
      const builder = makeQueryBuilder({ data: [], error: null });
      supabase.from.mockReturnValue(builder);

      await fetchForecastHistoryWithSignedUrls(0, 9);

      expect(builder.gte).not.toHaveBeenCalled();
      expect(builder.lt).not.toHaveBeenCalled();
    });

    it("day=null equivale a sin filtro de día", async () => {
      mockAuth();
      const builder = makeQueryBuilder({ data: [], error: null });
      supabase.from.mockReturnValue(builder);

      await fetchForecastHistoryWithSignedUrls(0, 9, "", null);

      expect(builder.gte).not.toHaveBeenCalled();
    });
  });

  describe("filtro por búsqueda (search)", () => {
    it("con search no vacío, .or() se llama con el término", async () => {
      mockAuth();
      const builder = makeQueryBuilder({ data: [], error: null });
      supabase.from.mockReturnValue(builder);

      await fetchForecastHistoryWithSignedUrls(0, 9, "picos");

      expect(builder.or).toHaveBeenCalledWith(expect.stringContaining("picos"));
    });

    it("el filtro .or() incluye tanto name como place_name", async () => {
      mockAuth();
      const builder = makeQueryBuilder({ data: [], error: null });
      supabase.from.mockReturnValue(builder);

      await fetchForecastHistoryWithSignedUrls(0, 9, "gredos");

      const orArg = builder.or.mock.calls[0][0];
      expect(orArg).toContain("name.ilike");
      expect(orArg).toContain("place_name.ilike");
    });

    it("con search vacío, .or() no se llama", async () => {
      mockAuth();
      const builder = makeQueryBuilder({ data: [], error: null });
      supabase.from.mockReturnValue(builder);

      await fetchForecastHistoryWithSignedUrls(0, 9, "");

      expect(builder.or).not.toHaveBeenCalled();
    });

    it("con search de solo espacios (trim), .or() no se llama", async () => {
      mockAuth();
      const builder = makeQueryBuilder({ data: [], error: null });
      supabase.from.mockReturnValue(builder);

      await fetchForecastHistoryWithSignedUrls(0, 9, "   ");

      expect(builder.or).not.toHaveBeenCalled();
    });
  });

  describe("paginación", () => {
    it("pasa los parámetros from y to a .range()", async () => {
      mockAuth();
      const builder = makeQueryBuilder({ data: [], error: null });
      supabase.from.mockReturnValue(builder);

      await fetchForecastHistoryWithSignedUrls(15, 29);

      expect(builder.range).toHaveBeenCalledWith(15, 29);
    });
  });
});

// ─── fetchForecast ────────────────────────────────────────────────────────────

describe("fetchForecast", () => {
  // fetchForecast ahora resuelve el usuario autenticado (fix B01).
  beforeEach(() => {
    mockAuth();
  });

  it("retorna el forecast con signedUrl cuando tiene image_path", async () => {
    const fakeData = {
      id: "abc",
      name: "Tormenta Sierra",
      forecast: "tormenta",
      probability: 0.95,
      created_at: "2026-04-01T12:00:00Z",
      place_name: "Peñalara",
      image_path: `${MOCK_USER_ID}/photo.jpg`,
    };
    supabase.from.mockReturnValue(
      makeQueryBuilder({ data: fakeData, error: null }),
    );
    getSignedImageUrl.mockResolvedValue("https://signed.url/photo.jpg");

    const result = await fetchForecast({ id: "abc" });

    expect(result.signedUrl).toBe("https://signed.url/photo.jpg");
    expect(result.id).toBe("abc");
    expect(getSignedImageUrl).toHaveBeenCalledWith(fakeData.image_path);
  });

  it("retorna el forecast sin signedUrl cuando image_path es null", async () => {
    const fakeData = {
      id: "def",
      name: "Cielo despejado",
      forecast: "cielo_despejado",
      probability: 0.99,
      created_at: "2026-04-02T12:00:00Z",
      place_name: null,
      image_path: null,
    };
    supabase.from.mockReturnValue(
      makeQueryBuilder({ data: fakeData, error: null }),
    );

    const result = await fetchForecast({ id: "def" });

    expect(result).toEqual(fakeData); // no tiene signedUrl añadido
    expect(getSignedImageUrl).not.toHaveBeenCalled();
  });

  it("retorna null cuando Supabase devuelve error (registro no encontrado)", async () => {
    supabase.from.mockReturnValue(
      makeQueryBuilder({ data: null, error: { message: "No rows found" } }),
    );

    const result = await fetchForecast({ id: "nonexistent" });

    expect(result).toBeNull();
  });

  it("retorna el forecast con signedUrl: null si getSignedImageUrl falla", async () => {
    const fakeData = {
      id: "ghi",
      name: "Test",
      forecast: "tormenta",
      probability: 0.8,
      created_at: "2026-04-03T12:00:00Z",
      place_name: null,
      image_path: `${MOCK_USER_ID}/photo.jpg`,
    };
    supabase.from.mockReturnValue(
      makeQueryBuilder({ data: fakeData, error: null }),
    );
    getSignedImageUrl.mockRejectedValue(new Error("Storage unavailable"));

    const result = await fetchForecast({ id: "ghi" });

    expect(result.signedUrl).toBeNull();
    expect(result.id).toBe("ghi");
  });

  it("filtra por id en la query", async () => {
    const fakeData = {
      id: "xyz",
      name: "Test",
      forecast: "cielo_despejado",
      probability: 0.9,
      created_at: "2026-04-04T00:00:00Z",
      place_name: null,
      image_path: null,
    };
    const builder = makeQueryBuilder({ data: fakeData, error: null });
    supabase.from.mockReturnValue(builder);

    await fetchForecast({ id: "xyz" });

    expect(builder.eq).toHaveBeenCalledWith("id", "xyz");
  });

  // ─── Fix B01: defensa en profundidad con user_id ──────────────────────────
  it("[B01] llama a supabase.auth.getUser() para obtener el usuario autenticado", async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    supabase.from.mockReturnValue(builder);

    await fetchForecast({ id: "xyz" });

    expect(supabase.auth.getUser).toHaveBeenCalled();
  });

  it('[B01] filtra también por .eq("user_id", userId) además de por id', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    supabase.from.mockReturnValue(builder);

    await fetchForecast({ id: "xyz" });

    expect(builder.eq).toHaveBeenCalledWith("id", "xyz");
    expect(builder.eq).toHaveBeenCalledWith("user_id", MOCK_USER_ID);
  });

  it("[B01] retorna null si no hay usuario autenticado", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await fetchForecast({ id: "xyz" });

    expect(result).toBeNull();
  });
});

// ─── deleteForecast ───────────────────────────────────────────────────────────

describe("deleteForecast", () => {
  it("elimina el registro de BD y la imagen de Storage cuando ambos existen", async () => {
    supabase.from.mockReturnValue(makeQueryBuilder({ error: null }));
    deleteImage.mockResolvedValue(undefined);

    await deleteForecast({ id: "abc", imagePath: `${MOCK_USER_ID}/photo.jpg` });

    expect(supabase.from).toHaveBeenCalledWith("forecast_history");
    expect(deleteImage).toHaveBeenCalledWith(`${MOCK_USER_ID}/photo.jpg`);
  });

  it("elimina el registro aunque imagePath sea null (no llama a deleteImage)", async () => {
    supabase.from.mockReturnValue(makeQueryBuilder({ error: null }));

    await deleteForecast({ id: "abc", imagePath: null });

    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("lanza error cuando Supabase devuelve error al borrar", async () => {
    const dbError = { message: "Row not found or RLS violation" };
    supabase.from.mockReturnValue(makeQueryBuilder({ error: dbError }));

    await expect(
      deleteForecast({ id: "bad-id", imagePath: null }),
    ).rejects.toBeDefined();
  });

  it("NO relanza el error si deleteImage falla — el registro ya se eliminó", async () => {
    supabase.from.mockReturnValue(makeQueryBuilder({ error: null }));
    deleteImage.mockRejectedValue(new Error("Storage quota exceeded"));

    // deleteForecast swallow el error de Storage (comportamiento documentado y correcto)
    await expect(
      deleteForecast({ id: "abc", imagePath: `${MOCK_USER_ID}/photo.jpg` }),
    ).resolves.toBeUndefined();
  });

  it("filtra por id en la query de eliminación", async () => {
    const builder = makeQueryBuilder({ error: null });
    supabase.from.mockReturnValue(builder);

    await deleteForecast({ id: "target-id", imagePath: null });

    expect(builder.eq).toHaveBeenCalledWith("id", "target-id");
  });
});
