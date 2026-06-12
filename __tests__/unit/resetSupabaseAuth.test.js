// Tests para lib/resetSupabaseAuth.ts — hardResetSupabaseAuth (fix C03).
// jest.setup.js ya mockea globalmente expo-secure-store y AsyncStorage.

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signOut: jest.fn().mockResolvedValue(undefined),
    },
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { supabase } from "@/lib/supabase";
import { hardResetSupabaseAuth } from "@/lib/resetSupabaseAuth";

const SUPABASE_AUTH_KEY = "sb-egefjrnnjyuazdoabebd-auth-token";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("hardResetSupabaseAuth", () => {
  it("llama a supabase.auth.signOut()", async () => {
    await hardResetSupabaseAuth();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it("borra la clave AES de SecureStore", async () => {
    await hardResetSupabaseAuth();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SUPABASE_AUTH_KEY);
  });

  it("[C03] borra el token cifrado de AsyncStorage", async () => {
    await hardResetSupabaseAuth();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SUPABASE_AUTH_KEY);
  });

  it("aún limpia el almacenamiento aunque signOut falle (token inválido)", async () => {
    supabase.auth.signOut.mockRejectedValueOnce(new Error("Invalid Refresh Token"));

    await hardResetSupabaseAuth();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SUPABASE_AUTH_KEY);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SUPABASE_AUTH_KEY);
  });
});
