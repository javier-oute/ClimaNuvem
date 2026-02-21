import { supabase } from "@/lib/supabase";
import { getSignedImageUrl } from "@/stores/forecast.store.image";

export async function fetchForecastHistory() {
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

export async function fetchForecastHistoryWithSignedUrls() {
  const rows = await fetchForecastHistory();

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
