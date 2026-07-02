// Tests de integración de lib/communityMap.js (mockea @/lib/supabase; escrituras/lecturas por RPC salvo unpublishAllMine).

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getSession: jest.fn() },
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

import { supabase } from "@/lib/supabase";
import {
  publishPrediction,
  unpublishPrediction,
  unpublishAllMine,
  reportPrediction,
  getActivePredictions,
  getPredictionById,
} from "@/lib/communityMap";

const MOCK_USER_ID = "user-uuid-abc123";

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── publishPrediction ────────────────────────────────────────────────────────

describe("publishPrediction", () => {
  const args = {
    forecastHistoryId: "fh-1",
    lat: 42.88,
    lon: -8.54,
    forecast: "tormenta",
    probability: 0.91,
    imagePath: `${MOCK_USER_ID}/photo.jpg`,
    placeName: "Santiago",
    description: "nubes negras",
  };

  it("invoca la RPC publish_prediction con TODOS los parámetros mapeados", async () => {
    supabase.rpc.mockResolvedValue({ data: "pub-uuid", error: null });

    const id = await publishPrediction(args);

    expect(id).toBe("pub-uuid");
    expect(supabase.rpc).toHaveBeenCalledWith("publish_prediction", {
      p_forecast_history_id: "fh-1",
      p_lat: 42.88,
      p_lon: -8.54,
      p_forecast: "tormenta",
      p_probability: 0.91,
      p_image_path: `${MOCK_USER_ID}/photo.jpg`,
      p_place_name: "Santiago",
      p_description: "nubes negras",
    });
  });

  it("aplica defaults null a placeName y description si no se pasan", async () => {
    supabase.rpc.mockResolvedValue({ data: "pub-uuid", error: null });

    await publishPrediction({
      forecastHistoryId: "fh-2",
      lat: 1,
      lon: 2,
      forecast: "cielo_despejado",
      probability: 0.99,
      imagePath: "p.jpg",
    });

    const payload = supabase.rpc.mock.calls[0][1];
    expect(payload.p_place_name).toBeNull();
    expect(payload.p_description).toBeNull();
  });

  it("relanza el error de la RPC (p. ej. límite de 3 activas)", async () => {
    const error = { message: "active_publications_limit_reached" };
    supabase.rpc.mockResolvedValue({ data: null, error });

    await expect(publishPrediction(args)).rejects.toBe(error);
  });
});

// ─── unpublishPrediction ──────────────────────────────────────────────────────

describe("unpublishPrediction", () => {
  it("invoca unpublish_prediction con p_id", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await unpublishPrediction("pub-1");

    expect(supabase.rpc).toHaveBeenCalledWith("unpublish_prediction", {
      p_id: "pub-1",
    });
  });

  it("relanza si la RPC falla", async () => {
    const error = { message: "RLS violation" };
    supabase.rpc.mockResolvedValue({ data: null, error });

    await expect(unpublishPrediction("pub-1")).rejects.toBe(error);
  });
});

// ─── reportPrediction ─────────────────────────────────────────────────────────

describe("reportPrediction", () => {
  it("invoca report_prediction con p_id", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await reportPrediction("pub-9");

    expect(supabase.rpc).toHaveBeenCalledWith("report_prediction", {
      p_id: "pub-9",
    });
  });

  it("relanza si la RPC falla", async () => {
    const error = { message: "already_reported" };
    supabase.rpc.mockResolvedValue({ data: null, error });

    await expect(reportPrediction("pub-9")).rejects.toBe(error);
  });
});

// ─── unpublishAllMine ─────────────────────────────────────────────────────────

describe("unpublishAllMine", () => {
  function mockDeleteBuilder(resolvedValue) {
    const builder = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue(resolvedValue),
    };
    return builder;
  }

  it("lanza not_authenticated si no hay sesión", async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(unpublishAllMine()).rejects.toThrow("not_authenticated");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("borra de community_predictions filtrando por user_id propio", async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: MOCK_USER_ID } } },
      error: null,
    });
    const builder = mockDeleteBuilder({ error: null });
    supabase.from.mockReturnValue(builder);

    await unpublishAllMine();

    expect(supabase.from).toHaveBeenCalledWith("community_predictions");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("user_id", MOCK_USER_ID);
  });

  it("relanza si el delete falla", async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: MOCK_USER_ID } } },
      error: null,
    });
    const error = { message: "delete failed" };
    supabase.from.mockReturnValue(mockDeleteBuilder({ error }));

    await expect(unpublishAllMine()).rejects.toBe(error);
  });
});

// ─── getActivePredictions ─────────────────────────────────────────────────────

describe("getActivePredictions", () => {
  it("devuelve las filas activas", async () => {
    const rows = [{ id: "a" }, { id: "b" }];
    supabase.rpc.mockResolvedValue({ data: rows, error: null });

    const result = await getActivePredictions();

    expect(result).toEqual(rows);
    expect(supabase.rpc).toHaveBeenCalledWith("get_active_predictions");
  });

  it("devuelve [] si data es null", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    expect(await getActivePredictions()).toEqual([]);
  });

  it("relanza si la RPC falla", async () => {
    const error = { message: "rpc error" };
    supabase.rpc.mockResolvedValue({ data: null, error });

    await expect(getActivePredictions()).rejects.toBe(error);
  });
});

// ─── getPredictionById ────────────────────────────────────────────────────────

describe("getPredictionById", () => {
  it("devuelve la primera fila del resultado", async () => {
    const row = { id: "pub-1", forecast: "tormenta" };
    supabase.rpc.mockResolvedValue({ data: [row], error: null });

    const result = await getPredictionById("pub-1");

    expect(result).toEqual(row);
    expect(supabase.rpc).toHaveBeenCalledWith("get_prediction_by_id", {
      p_id: "pub-1",
    });
  });

  it("devuelve null si no hay filas (caducó / oculta / no existe)", async () => {
    supabase.rpc.mockResolvedValue({ data: [], error: null });
    expect(await getPredictionById("x")).toBeNull();

    supabase.rpc.mockResolvedValue({ data: null, error: null });
    expect(await getPredictionById("x")).toBeNull();
  });

  it("relanza si la RPC falla", async () => {
    const error = { message: "rpc error" };
    supabase.rpc.mockResolvedValue({ data: null, error });

    await expect(getPredictionById("x")).rejects.toBe(error);
  });
});
