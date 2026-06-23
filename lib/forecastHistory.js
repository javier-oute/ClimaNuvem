import { dayRangeISO } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { deleteImage, getSignedImageUrl } from "@/stores/forecast.store.image";

async function fetchForecastHistory(from, to, search = "", day = null) {
  try {
    // Sesión local (no hace red ni lanza si aún no hay sesión, p. ej. durante el login).
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return []; // sin sesión todavía: no es un error, devolvemos vacío

    let query = supabase
      .from("forecast_history")
      .select(
        "id, name, forecast, probability, created_at, place_name, image_path, description, published_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (day) {
      const { startISO, endISO } = dayRangeISO(day);
      query = query.gte("created_at", startISO).lt("created_at", endISO);
    }

    const s = search.trim();
    if (s) {
      query = query.or(`name.ilike.%${s}%,place_name.ilike.%${s}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching forecast history:", error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error("Unexpected error fetching forecast history:", err);
    return [];
  }
}

// Devuelve un Map<forecast_history_id, community_prediction_id> con las publicaciones ACTIVAS del
// usuario entre los ids dados. La RLS (cp_select_active) ya filtra a activas y no ocultas, así que no
// hace falta filtrar por expiración aquí. Si falla, devuelve un Map vacío (el badge simplemente no sale).
async function fetchActivePublications(historyIds) {
  const map = new Map();
  if (!historyIds || historyIds.length === 0) return map;
  try {
    const { data, error } = await supabase
      .from("community_predictions")
      .select("id, forecast_history_id")
      .in("forecast_history_id", historyIds);
    if (error) throw error;
    for (const row of data ?? []) {
      map.set(row.forecast_history_id, row.id);
    }
  } catch (err) {
    console.error("Error obteniendo publicaciones activas:", err);
  }
  return map;
}

export async function fetchForecastHistoryWithSignedUrls(
  from,
  to,
  search = "",
  day = null,
) {
  const rows = await fetchForecastHistory(from, to, search, day);

  const activeMap = await fetchActivePublications(
    (rows ?? []).map((r) => r.id),
  );

  return await Promise.all(
    (rows ?? []).map(async (item) => {
      const isPublishedActive = activeMap.has(item.id);
      if (!item.image_path) {
        return { ...item, signedUrl: null, isPublishedActive };
      }
      try {
        const signedUrl = await getSignedImageUrl(item.image_path);
        return { ...item, signedUrl, isPublishedActive };
      } catch (err) {
        console.error(
          "Error obteniendo URL firmada para item id:",
          item.id,
          err,
        );
        return { ...item, signedUrl: null, isPublishedActive };
      }
    }),
  );
}

export async function fetchForecast({ id }) {
  try {
    // Sesión local (no hace red ni lanza si aún no hay sesión, p. ej. durante el login).
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return null; // sin sesión todavía: no es un error, devolvemos null

    const { data, error } = await supabase
      .from("forecast_history")
      .select(
        "id, name, forecast, probability, created_at, place_name, image_path, description, published_at",
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching forecast:", error);
      return null;
    }

    // Publicación activa de este registro (id para poder despublicar; null si no hay).
    const activeMap = await fetchActivePublications([data.id]);
    const communityPredictionId = activeMap.get(data.id) ?? null;
    const enriched = {
      ...data,
      communityPredictionId,
      isPublishedActive: communityPredictionId !== null,
    };

    if (enriched.image_path) {
      try {
        const signedUrl = await getSignedImageUrl(enriched.image_path);
        return { ...enriched, signedUrl };
      } catch (err) {
        console.error(
          "Error obteniendo URL firmada para forecast id:",
          id,
          err,
        );
        return { ...enriched, signedUrl: null };
      }
    }

    return enriched;
  } catch (err) {
    console.error("Unexpected error fetching forecast:", err);
    return null;
  }
}

export async function deleteForecast({ id, imagePath }) {
  try {
    const { error } = await supabase
      .from("forecast_history")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting forecast:", error);
      throw error;
    }

    if (imagePath) {
      try {
        await deleteImage(imagePath);
      } catch (err) {
        console.error(
          "Error deleting image for forecast id:",
          id,
          imagePath,
          err,
        );
        // No throw, seguimos con la eliminación del registro aunque falle la eliminación de la imagen
      }
    }
  } catch (err) {
    console.error("Unexpected error deleting forecast:", err);
    throw err;
  }
}
