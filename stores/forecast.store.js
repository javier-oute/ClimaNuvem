import { getCoordsOrThrow } from "@/lib/location";
import { supabase } from "@/lib/supabase";
import { uploadPhoto } from "@/stores/forecast.store.image";

export async function saveForecastWithPhoto({
  asset, // el asset que devuelve abrirCamara()
  name,
  forecast,
  probability,
}) {
  // 1) usuario logueado
  const {
    data: { session },
    error: sessErr,
  } = await supabase.auth.getSession();
  if (sessErr) throw sessErr;

  const userId = session?.user?.id;
  if (!userId) throw new Error("No hay sesión iniciada");

  // 2) ubicación (expo-location)
  const { coords, places } = await getCoordsOrThrow();
  const p = places?.[0];
  // 3) subir foto
  const imagePath = await uploadPhoto({ uri: asset.uri, userId });

  // 4) convertir coords a WKT POINT(lon lat)
  const locationWkt = `POINT(${coords.longitude} ${coords.latitude})`;

  // 5) insertar en tabla
  const { data, error } = await supabase
    .from("forecast_history")
    .insert({
      user_id: userId,
      name,
      forecast,
      probability,
      place_name: p
        ? [p.city || p.subregion, p.region].filter(Boolean).join(", ")
        : null,
      location: locationWkt,
      image_path: imagePath,
    })
    .select()
    .single();

  if (error) throw error;

  console.log("Registro guardado con foto, datos devueltos por Supabase:");

  return data;
}
