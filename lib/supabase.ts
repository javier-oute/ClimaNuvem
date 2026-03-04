import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as aesjs from "aes-js";
import * as SecureStore from "expo-secure-store";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

// As Expo's SecureStore does not support values larger than 2048
// bytes, an AES-256 key is generated and stored in SecureStore, while
// it is used to encrypt/decrypt values stored in AsyncStorage.
class LargeSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));

    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1),
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    await SecureStore.setItemAsync(
      key,
      aesjs.utils.hex.fromBytes(encryptionKey),
    );

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      return encryptionKeyHex;
    }

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1),
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    try {
      const encrypted = await AsyncStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = await this._decrypt(key, encrypted);
      if (!decrypted) {
        // Si falta la key o está corrupto, limpiamos para no “colgar”
        await this.removeItem(key);
        return null;
      }

      return decrypted;
    } catch (e) {
      console.warn("[LargeSecureStore] getItem failed, clearing:", key, e);
      await this.removeItem(key);
      return null;
    }
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key: string, value: string) {
    try {
      const encrypted = await this._encrypt(key, value);
      await AsyncStorage.setItem(key, encrypted);
    } catch (e) {
      console.warn("[LargeSecureStore] setItem failed:", key, e);
      // Si falla guardar sesión, mejor no dejar basura
      await this.removeItem(key);
    }
  }
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
    "https://egefjrnnjyuazdoabebd.supabase.co",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    "sb_publishable_PpFIPbJwlGtqvfwoHyV4yg_J9BSSaXH",
  {
    auth: {
      storage: new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

/*
import { createClient } from "@supabase/supabase-js";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    //console.debug("getItem", { key, getItemAsync });
    return getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (value.length > 2048) {
      console.warn(
        "Value being stored in SecureStore is larger than 2048 bytes and it may not be stored successfully. In a future SDK version, this call may throw an error.",
      );
    }
    return setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return deleteItemAsync(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
    "https://egefjrnnjyuazdoabebd.supabase.co",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    "sb_publishable_PpFIPbJwlGtqvfwoHyV4yg_J9BSSaXH",
  {
    auth: {
      storage: new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
*/
