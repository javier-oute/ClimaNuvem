import { supabase } from "@/lib/supabase";
import { deleteImage, uploadPhoto } from "@/stores/forecast.store.image";

export async function saveForecastWithPhoto({
  asset, // el asset que devuelve abrirCamara()
  name,
  forecast,
  probability,
  coords,
  placeName,
  placeNameSource,
  description = null, // texto libre opcional; también se muestra en el mapa si se publica
}) {
  // 1) usuario logueado
  const {
    data: { session },
    error: sessErr,
  } = await supabase.auth.getSession();
  if (sessErr) throw sessErr;

  const userId = session?.user?.id;
  if (!userId) throw new Error("No hay sesión iniciada");

  let imagePath = null;

  try {
    // 3) subir foto
    imagePath = await uploadPhoto({ uri: asset.uri, userId });

    const locationWkt = coords
      ? `POINT(${coords.longitude} ${coords.latitude})`
      : null;

    // 5) insertar en tabla
    const { data, error } = await supabase
      .from("forecast_history")
      .insert({
        user_id: userId,
        name,
        forecast,
        probability,
        place_name: placeName,
        place_name_source: placeNameSource,
        location: locationWkt,
        image_path: imagePath,
        description: description?.trim() ? description.trim() : null,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    // Si la foto se subió pero el INSERT falló, borra la imagen huérfana de Storage.
    if (imagePath) {
      try {
        await deleteImage(imagePath);
      } catch (cleanupErr) {
        console.error(
          "No se pudo borrar la foto subida tras fallo:",
          cleanupErr,
        );
      }
    }
    throw err;
  }
}
