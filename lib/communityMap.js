import { supabase } from "@/lib/supabase";

// Capa de datos del mapa comunitario (Fase 2) sobre las RPC SECURITY DEFINER; las filas vienen ya normalizadas.

// Publica una predicción del historial; el snap, el límite de 3 activas y la expiración a 6 h los aplica el servidor.
export async function publishPrediction({
  forecastHistoryId,
  lat,
  lon,
  forecast,
  probability,
  imagePath,
  placeName = null,
  description = null,
}) {
  const { data, error } = await supabase.rpc("publish_prediction", {
    p_forecast_history_id: forecastHistoryId,
    p_lat: lat,
    p_lon: lon,
    p_forecast: forecast,
    p_probability: probability,
    p_image_path: imagePath,
    p_place_name: placeName,
    p_description: description,
  });
  if (error) throw error;
  return data; // uuid de la publicación
}

// Despublica (borra) una publicación propia (o cualquiera si el usuario es admin).
export async function unpublishPrediction(id) {
  const { error } = await supabase.rpc("unpublish_prediction", { p_id: id });
  if (error) throw error;
}

// Despublica todas las publicaciones del usuario (la RLS restringe a las propias); no toca Storage.
export async function unpublishAllMine() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("community_predictions")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

// Reporta una publicación. Un reporte por usuario; al llegar a 3 se oculta automáticamente.
export async function reportPrediction(id) {
  const { error } = await supabase.rpc("report_prediction", { p_id: id });
  if (error) throw error;
}

// Todas las predicciones activas (sin filtro de distancia con pocos usuarios); la ubicación solo centra la vista.
export async function getActivePredictions() {
  const { data, error } = await supabase.rpc("get_active_predictions");
  if (error) throw error;
  return data ?? [];
}

// Una publicación por id (para el detalle). null si no existe / caducó / está oculta.
export async function getPredictionById(id) {
  const { data, error } = await supabase.rpc("get_prediction_by_id", {
    p_id: id,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}
