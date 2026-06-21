/*
import { supabase } from "@/lib/supabase";
import { Text } from "@react-navigation/elements";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
//import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect } from "react";
import { Alert, TouchableOpacity } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
  const onSignInButtonPress = useCallback(async () => {
    try {
      // Works in Expo Go (exp://.../--/google-auth) and in builds (your-scheme://google-auth)
      const redirectTo = Linking.createURL("google-auth");

      // ✅ HTTPS redirect para Expo Go (proxy)
      //const redirectTo = AuthSession.getRedirectUrl("google-auth");

      console.log("redirectTo:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          //queryParams: { prompt: "consent" }, // optional
        },
      });

      console.log("redirectTo:", redirectTo);
      console.log("OAuth URL:", data?.url);
      console.log("OAuth error:", error);

      if (error) throw error;
      if (!data?.url) throw new Error("No OAuth URL returned.");

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
        {
          showInRecents: true,
        },
      );

      if (result.type !== "success") return;

      const { params, errorCode } = QueryParams.getQueryParams(result.url);
      if (errorCode) throw new Error(errorCode);

      const access_token = params?.access_token as string | undefined;
      const refresh_token = params?.refresh_token as string | undefined;

      if (!access_token || !refresh_token) {
        throw new Error("Missing access_token or refresh_token.");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) throw sessionError;
    } catch (e: any) {
      Alert.alert("No se pudo iniciar sesión", e?.message ?? "Error");
      console.error("Google OAuth error:", e);
    }
  }, []);

  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <TouchableOpacity
      onPress={onSignInButtonPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbdbdb",
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 15,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: "https://developers.google.com/identity/images/g-logo.png",
        }}
        style={{ width: 24, height: 24, marginRight: 10 }}
      />
      <Text style={{ fontSize: 16, color: "#757575", fontWeight: "500" }}>
        Sign in with Google
      </Text>
    </TouchableOpacity>
  );
}
*/
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";

import { expo } from "@/app.json";
import { useT } from "@/lib/i18n";
import { Text } from "@react-navigation/elements";
import { Image } from "expo-image";
//import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
  const t = useT();
  function extractParamsFromUrl(url: string) {
    const parsedUrl = new URL(url);
    const hash = parsedUrl.hash.substring(1); // Remove the leading '#'
    const params = new URLSearchParams(hash);

    return {
      access_token: params.get("access_token"),
      expires_in: parseInt(params.get("expires_in") || "0"),
      refresh_token: params.get("refresh_token"),
      token_type: params.get("token_type"),
      provider_token: params.get("provider_token"),
      code: params.get("code"),
    };
  }

  async function onSignInButtonPress() {
    console.debug("onSignInButtonPress - start");
    const res = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${expo.scheme}://google-auth`,
        queryParams: { prompt: "consent" },
        skipBrowserRedirect: true,
      },
    });

    const googleOAuthUrl = res.data.url;

    if (!googleOAuthUrl) {
      console.error("no oauth url found!");
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(
      googleOAuthUrl,
      `${expo.scheme}://google-auth`,
      { showInRecents: true },
    ).catch((err) => {
      console.error("onSignInButtonPress - openAuthSessionAsync - error", {
        err,
      });
      console.log(err);
    });

    console.debug("onSignInButtonPress - openAuthSessionAsync - result", {
      result,
    });

    if (result && result.type === "success") {
      console.debug("onSignInButtonPress - openAuthSessionAsync - success");
      const params = extractParamsFromUrl(result.url);
      console.debug("onSignInButtonPress - openAuthSessionAsync - success", {
        params,
      });

      if (params.access_token && params.refresh_token) {
        console.debug("onSignInButtonPress - setSession");
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        console.debug("onSignInButtonPress - setSession - success", {
          data,
          error,
        });
        //router.replace("/(tabs)/home");
        return;
      } else {
        console.error("onSignInButtonPress - setSession - failed");
        // sign in/up failed
      }
    } else if (
      result &&
      (result.type === "cancel" || result.type === "dismiss")
    ) {
      // El usuario cerró/canceló el navegador: acción legítima, no es un error.
      return;
    } else {
      console.error("onSignInButtonPress - openAuthSessionAsync - failed");
    }
  }

  // to warm up the browser
  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <TouchableOpacity
      onPress={onSignInButtonPress}
      style={{
        width: 240,
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbdbdb",
        borderRadius: 6,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2, // For Android shadow
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: "https://developers.google.com/identity/images/g-logo.png",
        }}
        style={{ width: 14, height: 14, marginRight: 5 }}
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 14,
          color: "#757575",
          fontWeight: "500",
        }}
      >
        {t("login.google")}
      </Text>
    </TouchableOpacity>
  );
}
