import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";

export async function uploadPhoto({ uri, userId }) {
  const bucket = "forecast-images";
  const fileName = `${Date.now()}.jpg`;
  const path = `${userId}/${fileName}`;

  const bytes = await new File(uri).bytes();

  console.log("UPLOAD path:", path);
  console.log("userId:", userId);

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) throw error;

  return path; // <-- esto lo guardas en la tabla
}
