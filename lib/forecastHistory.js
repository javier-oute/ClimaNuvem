import { dayRangeISO } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { getSignedImageUrl } from "@/stores/forecast.store.image";

async function fetchForecastHistory(from, to, search = "", day = null) {
  try {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const userId = userRes.user?.id;
    if (!userId) throw new Error("No hay sesión iniciada");

    let query = supabase
      .from("forecast_history")
      .select(
        "id, name, forecast, probability, created_at, place_name, image_path",
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
      // query = query.ilike("name", `%${s}%`);
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

export async function fetchForecastHistoryWithSignedUrls(
  from,
  to,
  search = "",
  day = null,
) {
  const rows = await fetchForecastHistory(from, to, search, day);

  return await Promise.all(
    (rows ?? []).map(async (item) => {
      if (!item.image_path) {
        return { ...item, signedUrl: null };
      }
      try {
        const signedUrl = await getSignedImageUrl(item.image_path);
        return { ...item, signedUrl };
      } catch (err) {
        console.error(
          "Error obteniendo URL firmada para item id:",
          item.id,
          err,
        );
        return { ...item, signedUrl: null };
      }
    }),
  );
}

export async function fetchForecast({ id }) {
  try {
    const { data, error } = await supabase
      .from("forecast_history")
      .select(
        "id, name, forecast, probability, created_at, place_name, image_path",
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching forecast:", error);
      return null;
    }

    if (data?.image_path) {
      try {
        const signedUrl = await getSignedImageUrl(data.image_path);
        return { ...data, signedUrl };
      } catch (err) {
        console.error(
          "Error obteniendo URL firmada para forecast id:",
          id,
          err,
        );
        return { ...data, signedUrl: null };
      }
    }

    console.log("Forecast detail fetched, data:", data);

    return data;
  } catch (err) {
    console.error("Unexpected error fetching forecast:", err);
    return null;
  }
}

/*

async function fetchForecastHistory(from, to, search = "") {
  try {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const userId = userRes.user?.id;
    if (!userId) throw new Error("No hay sesión iniciada");

    const { data, error } = await supabase
      .from("forecast_history")
      .select(
        "id, name, forecast, probability, created_at, place_name, image_path",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

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

*/
