// Tests de integración para stores/forecast.store.js — saveForecastWithPhoto
// Incluye documentación del bug C01 (variable imagePath shadowed → cleanup nunca se ejecuta).

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock("@/stores/forecast.store.image", () => ({
  uploadPhoto: jest.fn(),
  deleteImage: jest.fn(),
  deletePhoto: jest.fn(),
}));

import { supabase } from "@/lib/supabase";
import { uploadPhoto, deleteImage } from "@/stores/forecast.store.image";
import { saveForecastWithPhoto } from "@/stores/forecast.store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeInsertBuilder(resolvedValue) {
  return {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
  };
}

const MOCK_ASSET = { uri: "file:///camera/photo.jpg" };
const MOCK_USER_ID = "user-uuid-test-abc";
const MOCK_IMG_PATH = `${MOCK_USER_ID}/1234567890.jpg`;

function mockSession(userId = MOCK_USER_ID) {
  supabase.auth.getSession.mockResolvedValue({
    data: { session: { user: { id: userId } } },
    error: null,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Flujo exitoso ────────────────────────────────────────────────────────────

describe("saveForecastWithPhoto — flujo exitoso", () => {
  it("retorna el registro insertado cuando todo tiene éxito", async () => {
    const mockRow = {
      id: "row-1",
      name: "Tormenta en Picos",
      forecast: "tormenta",
      probability: 0.92,
      image_path: MOCK_IMG_PATH,
    };
    mockSession();
    uploadPhoto.mockResolvedValue(MOCK_IMG_PATH);
    supabase.from.mockReturnValue(
      makeInsertBuilder({ data: mockRow, error: null }),
    );

    const result = await saveForecastWithPhoto({
      asset: MOCK_ASSET,
      name: "Tormenta en Picos",
      forecast: "tormenta",
      probability: 0.92,
      coords: { latitude: 43.19, longitude: -4.96 },
      placeName: "Picos de Europa",
      placeNameSource: "geocoder",
    });

    expect(result).toEqual(mockRow);
    expect(uploadPhoto).toHaveBeenCalledWith({
      uri: MOCK_ASSET.uri,
      userId: MOCK_USER_ID,
    });
  });

  it('llama a supabase.from("forecast_history").insert con todos los campos', async () => {
    const mockRow = { id: "row-2" };
    mockSession();
    uploadPhoto.mockResolvedValue(MOCK_IMG_PATH);
    const insertBuilder = makeInsertBuilder({ data: mockRow, error: null });
    supabase.from.mockReturnValue(insertBuilder);

    await saveForecastWithPhoto({
      asset: MOCK_ASSET,
      name: "Niebla",
      forecast: "niebla_stratus",
      probability: 0.8,
      coords: null,
      placeName: null,
      placeNameSource: null,
    });

    expect(supabase.from).toHaveBeenCalledWith("forecast_history");
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: MOCK_USER_ID,
        name: "Niebla",
        forecast: "niebla_stratus",
        probability: 0.8,
        image_path: MOCK_IMG_PATH,
        location: null, // coords es null
      }),
    );
  });

  it("construye locationWkt correcto con POINT(lon lat) cuando coords existe", async () => {
    const mockRow = { id: "row-3" };
    mockSession();
    uploadPhoto.mockResolvedValue(MOCK_IMG_PATH);
    const insertBuilder = makeInsertBuilder({ data: mockRow, error: null });
    supabase.from.mockReturnValue(insertBuilder);

    await saveForecastWithPhoto({
      asset: MOCK_ASSET,
      name: "Cumbre",
      forecast: "cielo_despejado",
      probability: 0.99,
      coords: { latitude: 43.366, longitude: -5.851 },
      placeName: "Oviedo",
      placeNameSource: "geocoder",
    });

    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        // Nota: el orden es POINT(longitud latitud), no (lat lon)
        location: "POINT(-5.851 43.366)",
      }),
    );
  });

  it("location es null cuando coords es null", async () => {
    const mockRow = { id: "row-4" };
    mockSession();
    uploadPhoto.mockResolvedValue(MOCK_IMG_PATH);
    const insertBuilder = makeInsertBuilder({ data: mockRow, error: null });
    supabase.from.mockReturnValue(insertBuilder);

    await saveForecastWithPhoto({
      asset: MOCK_ASSET,
      name: "X",
      forecast: "tormenta",
      probability: 0.5,
      coords: null,
      placeName: null,
      placeNameSource: null,
    });

    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ location: null }),
    );
  });
});

// ─── Errores de autenticación ─────────────────────────────────────────────────

describe("saveForecastWithPhoto — errores de autenticación", () => {
  it('lanza "No hay sesión iniciada" si session es null', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(
      saveForecastWithPhoto({
        asset: MOCK_ASSET,
        name: "X",
        forecast: "tormenta",
        probability: 0.9,
        coords: null,
        placeName: null,
        placeNameSource: null,
      }),
    ).rejects.toThrow("No hay sesión iniciada");

    expect(uploadPhoto).not.toHaveBeenCalled();
  });

  it("relanza el error de sesión si getSession devuelve error", async () => {
    const sessError = { message: "Token expired" };
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: sessError,
    });

    await expect(
      saveForecastWithPhoto({
        asset: MOCK_ASSET,
        name: "X",
        forecast: "tormenta",
        probability: 0.9,
        coords: null,
        placeName: null,
        placeNameSource: null,
      }),
    ).rejects.toBeDefined();

    expect(uploadPhoto).not.toHaveBeenCalled();
  });
});

// ─── Errores en uploadPhoto ───────────────────────────────────────────────────

describe("saveForecastWithPhoto — errores en uploadPhoto", () => {
  it("lanza si uploadPhoto falla y no llama a supabase.from()", async () => {
    mockSession();
    uploadPhoto.mockRejectedValue(new Error("Storage quota exceeded"));

    await expect(
      saveForecastWithPhoto({
        asset: MOCK_ASSET,
        name: "X",
        forecast: "tormenta",
        probability: 0.9,
        coords: null,
        placeName: null,
        placeNameSource: null,
      }),
    ).rejects.toThrow("Storage quota exceeded");

    expect(supabase.from).not.toHaveBeenCalled();
  });
});

// ─── Errores en INSERT ────────────────────────────────────────────────────────

describe("saveForecastWithPhoto — errores en INSERT de Supabase", () => {
  it("lanza si el INSERT devuelve error", async () => {
    mockSession();
    uploadPhoto.mockResolvedValue(MOCK_IMG_PATH);
    supabase.from.mockReturnValue(
      makeInsertBuilder({ data: null, error: { message: "RLS violation" } }),
    );

    await expect(
      saveForecastWithPhoto({
        asset: MOCK_ASSET,
        name: "X",
        forecast: "tormenta",
        probability: 0.9,
        coords: null,
        placeName: null,
        placeNameSource: null,
      }),
    ).rejects.toBeDefined();
  });

  // ─── Bug C01 (CORREGIDO): limpieza de imagen huérfana ─────────────────────
  //
  // Antes, saveForecastWithPhoto() redeclaraba `const imagePath` dentro del try,
  // ensombreciendo la `let imagePath = null` externa que el catch evalúa. El fix
  // asigna a la variable externa y llama a deleteImage(imagePath) en el catch.
  // Estos tests verifican el comportamiento correcto.

  it("[C01] cuando el INSERT falla tras subir la foto, deleteImage borra la imagen huérfana", async () => {
    mockSession();
    uploadPhoto.mockResolvedValue(MOCK_IMG_PATH);
    supabase.from.mockReturnValue(
      makeInsertBuilder({ data: null, error: { message: "Insert failed" } }),
    );

    await expect(
      saveForecastWithPhoto({
        asset: MOCK_ASSET,
        name: "X",
        forecast: "tormenta",
        probability: 0.9,
        coords: null,
        placeName: null,
        placeNameSource: null,
      }),
    ).rejects.toBeDefined();

    expect(deleteImage).toHaveBeenCalledWith(MOCK_IMG_PATH);
  });

  it("[C01] si el INSERT falla y deleteImage también lanza, se relanza el error original del INSERT", async () => {
    mockSession();
    uploadPhoto.mockResolvedValue(MOCK_IMG_PATH);
    supabase.from.mockReturnValue(
      makeInsertBuilder({ data: null, error: { message: "RLS violation" } }),
    );
    deleteImage.mockRejectedValue(new Error("Storage unavailable"));

    await expect(
      saveForecastWithPhoto({
        asset: MOCK_ASSET,
        name: "X",
        forecast: "tormenta",
        probability: 0.9,
        coords: null,
        placeName: null,
        placeNameSource: null,
      }),
    ).rejects.toEqual({ message: "RLS violation" });

    expect(deleteImage).toHaveBeenCalledWith(MOCK_IMG_PATH);
  });

  it("[C01] en flujo exitoso NO se llama a deleteImage (no hay rollback)", async () => {
    mockSession();
    uploadPhoto.mockResolvedValue(MOCK_IMG_PATH);
    supabase.from.mockReturnValue(
      makeInsertBuilder({ data: { id: "row-ok" }, error: null }),
    );

    await saveForecastWithPhoto({
      asset: MOCK_ASSET,
      name: "X",
      forecast: "tormenta",
      probability: 0.9,
      coords: null,
      placeName: null,
      placeNameSource: null,
    });

    expect(deleteImage).not.toHaveBeenCalled();
  });
});
