import { supabase } from "@/lib/supabase";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";

type Props = React.ComponentProps<
  typeof AppleAuthentication.AppleAuthenticationButton
>;

export default function AppleSignInButton(props: Props) {
  return (
    <AppleAuthentication.AppleAuthenticationButton
      {...props}
      onPress={onApplePress}
    />
  );
}

async function onApplePress() {
  try {
    // 1) Abre el popup nativo de Apple
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // 2) Apple devuelve un identityToken (JWT). Supabase lo usa para crear sesión.
    if (!credential.identityToken) {
      throw new Error("Apple no devolvió identityToken (cancelado o fallo).");
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
      // nonce: si lo generas y lo envías en signInAsync, también pásalo aquí
    });

    if (error) throw error;

    // 3) IMPORTANTE: Apple NO incluye el nombre en el token; solo lo da 1ª vez y hay que guardarlo tú.
    if (credential.fullName?.givenName || credential.fullName?.familyName) {
      const full_name =
        `${credential.fullName?.givenName ?? ""} ${credential.fullName?.familyName ?? ""}`.trim();

      await supabase.auth.updateUser({
        data: {
          full_name,
          given_name: credential.fullName?.givenName ?? null,
          family_name: credential.fullName?.familyName ?? null,
        },
      });
    }

    // 4) Navegación (mejor replace para que no vuelva a Login con back)
    router.replace("/(tabs)/home");
  } catch (e: any) {
    if (e?.code === "ERR_REQUEST_CANCELED") {
      // El usuario canceló -> no es un error real
      return;
    }
    console.error("Apple sign-in error:", e);
  }
}
