import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";

export async function uploadPhoto({ uri, userId }) {
  const bucket = "forecast-images";
  const fileName = `${Date.now()}.jpg`;
  const path = `${userId}/${fileName}`;

  const bytes = await new File(uri).bytes();

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) throw error;

  return path;
}

export async function getSignedImageUrl(path, expiresIn = 60 * 10) {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from("forecast-images")
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data?.signedUrl ?? null;
}

export async function deleteImage(path) {
  if (!path) return;

  const bucket = "forecast-images";

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) throw error;
}
