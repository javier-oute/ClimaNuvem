import { supabase } from "@/lib/supabase";

// Capa de datos del mapa comunitario (Fase 2). Envuelve las RPC SECURITY DEFINER de Supabase.
// Las filas que devuelven las RPC ya vienen normalizadas:
// { id, forecast, probability, lat, lon, place_name, description, image_path,
//   published_at, expires_at, author_username, author_avatar_url, is_mine }

// Publica una predicción ya guardada en el historial. El snap de coordenadas (privacidad), el límite
// de 3 activas y la expiración a 6 h los aplica el servidor. Devuelve el id de la publicación.
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

// Despublica TODAS las publicaciones del usuario (al desactivar "compartir en el mapa").
// La RLS (cp_delete_own_or_admin) restringe el borrado a las filas propias, así que el filtro por
// user_id es seguro. No toca Storage: la imagen es la misma del historial (no es huérfana).
export async function unpublishAllMine() {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const userId = userRes.user?.id;
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

// Predicciones activas dentro de 30 km de (lat, lon). Devuelve [] si falla o no hay.
export async function getNearbyPredictions(lat, lon) {
  const { data, error } = await supabase.rpc("get_nearby_predictions", {
    p_lat: lat,
    p_lon: lon,
  });
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
