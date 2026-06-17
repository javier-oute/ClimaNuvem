// features/profile/profile.api.js
import { supabase } from "@/lib/supabase";

export async function upsertProfile({
  userId,
  fullName,
  phone,
  username,
  avatarUrl,
}) {
  const updates = {
    id: userId,
    full_name: fullName?.trim() || null,
    phone: phone || null,
    username: username?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  // Solo tocamos avatar_url si se pasa explícitamente (incluido null para quitarlo).
  if (avatarUrl !== undefined) {
    updates.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(updates, { onConflict: "id" });

  if (error) {
    console.warn("No se pudo guardar:", error.message);
    throw error;
  }
}
