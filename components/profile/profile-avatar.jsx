import { resolveAvatarUrl } from "@/stores/profile.store.image";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { PencilIcon, UserIcon } from "../icons";

const SIZE = 112; // diámetro del círculo del avatar
const BADGE = 34; // diámetro del badge de la esquina

// Header del avatar: preview staged > avatar guardado > icono; en edición muestra un badge con lápiz.
export function ProfileAvatar({
  avatarUrl, // valor guardado en profiles.avatar_url
  stagedUri, // preview local (aún sin subir) | null
  isEditing,
  isSaving,
  onPressEdit,
}) {
  const [resolvedUrl, setResolvedUrl] = useState(null);

  useEffect(() => {
    let alive = true;
    resolveAvatarUrl(avatarUrl)
      .then((url) => {
        if (alive) setResolvedUrl(url);
      })
      .catch(() => {
        if (alive) setResolvedUrl(null);
      });
    return () => {
      alive = false;
    };
  }, [avatarUrl]);

  const displaySource = stagedUri ?? resolvedUrl;

  const content = (
    // Contenedor sin overflow oculto para que el badge pueda asomar en la esquina.
    <View style={{ width: SIZE, height: SIZE }}>
      <View
        style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2 }}
        className="items-center justify-center overflow-hidden bg-slate-400 dark:bg-zinc-700"
      >
        {displaySource ? (
          <Image
            source={{ uri: displaySource }}
            style={{ width: SIZE, height: SIZE }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <UserIcon size={56} />
        )}
      </View>

      {isEditing && (
        <View
          style={{ width: BADGE, height: BADGE, borderRadius: BADGE / 2 }}
          className="absolute bottom-0 right-0 items-center justify-center border-2 border-white bg-[#314468] shadow-sm dark:border-zinc-900"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <PencilIcon size={16} />
          )}
        </View>
      )}
    </View>
  );

  // Raíz siempre Pressable para que la Image no se remonte al alternar edición; solo se activa la interacción en edición.
  return (
    <Pressable
      onPress={onPressEdit}
      disabled={!isEditing || isSaving}
      className={isEditing ? "active:opacity-75" : ""}
      accessibilityRole={isEditing ? "button" : undefined}
    >
      {content}
    </Pressable>
  );
}
