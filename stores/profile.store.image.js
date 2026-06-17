import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";

const BUCKET = "avatars";

// Nombre de archivo fijo por usuario: cada cambio sobrescribe (upsert) la foto
// anterior, así no se acumulan huérfanos en Storage.
export async function uploadAvatar({ uri, userId }) {
  const path = `${userId}/avatar.jpg`;

  const bytes = await new File(uri).bytes();

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "0",
  });

  if (error) throw error;

  return path;
}

export async function getAvatarSignedUrl(path, expiresIn = 60 * 10) {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data?.signedUrl ?? null;
}

export async function deleteAvatar(path) {
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) throw error;
}

// Resuelve el valor de profiles.avatar_url a una URL mostrable:
// - null/"" -> null (se usará el icono por defecto)
// - URL externa (OAuth, p.ej. Google) -> se muestra tal cual
// - path de Storage ("{uid}/avatar.jpg") -> se genera una URL firmada
export async function resolveAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  return getAvatarSignedUrl(avatarUrl);
}

// true si el valor guardado es un path de Storage (no una URL externa).
export function isStorageAvatarPath(avatarUrl) {
  return !!avatarUrl && !/^https?:\/\//i.test(avatarUrl);
}
