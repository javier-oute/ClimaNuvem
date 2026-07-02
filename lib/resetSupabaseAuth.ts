import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Prefijo del proyecto (se ve en logs: sb-XXXX-auth-token).
const SUPABASE_AUTH_KEY = "sb-egefjrnnjyuazdoabebd-auth-token";

export async function hardResetSupabaseAuth() {
  // 1) Intentar cerrar sesión en supabase (puede fallar si el token es inválido)
  try {
    await supabase.auth.signOut();
  } catch {}

  // Borrar el token persistido: LargeSecureStore guarda la clave AES en SecureStore y el valor cifrado en AsyncStorage; hay que borrar ambos.
  try {
    await SecureStore.deleteItemAsync(SUPABASE_AUTH_KEY);
  } catch {}
  try {
    await AsyncStorage.removeItem(SUPABASE_AUTH_KEY);
  } catch {}

  // Si en el futuro haces chunking, aquí borrarías también las partes.
}
