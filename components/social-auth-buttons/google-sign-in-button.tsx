import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";

import { expo } from "@/app.json";
import { useT } from "@/lib/i18n";
import { Text } from "@react-navigation/elements";
import { Image } from "expo-image";
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
    });

    if (result && result.type === "success") {
      const params = extractParamsFromUrl(result.url);

      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
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
        style={{ width: 17, height: 17, marginRight: 7 }}
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 16,
          color: "#757575",
          fontWeight: "600",
        }}
      >
        {t("login.google")}
      </Text>
    </TouchableOpacity>
  );
}
