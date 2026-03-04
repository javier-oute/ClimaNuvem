import { EditableField } from "@/components/editableField";
import {
  CancelProfileButton,
  EditProfileButton,
  LogOutButton,
} from "@/components/profile/profile-buttons";
import { useProfileForm } from "@/hooks/profile/useProfileForm";
import { useAuthStore } from "@/stores/auth.store";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { SaveButton } from "../../components/buttons";
import { UserIcon } from "../../components/icons";
import "../../global.css";

export default function Profile() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const signOut = useAuthStore((s) => s.signOut);

  const userId = session?.user?.id ?? null;
  const email = session?.user?.email ?? "—";

  //const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log("[Profile] MOUNT");
    return () => console.log("[Profile] UNMOUNT");
  }, []);

  useEffect(() => {
    if (session && profile === undefined) {
      refreshProfile();
    }
  }, [session, profile, refreshProfile]);

  const {
    isEditing,
    isSaving,
    isSaveSuccess,
    fullName,
    phone,
    username,
    setFullName,
    setPhone,
    setUsername,
    displayName,
    onEdit,
    onCancel,
    onSave,
  } = useProfileForm({
    userId,
    profile,
    refreshProfile,
  });

  const showFullScreenLoader =
    isLoading || session === undefined || profile === undefined;

  console.log("[Profile]", {
    isLoading,
    sessionState:
      session === undefined ? "undefined" : session ? "set" : "null",
    profileState:
      profile === undefined ? "undefined" : profile ? "set" : "null",
  });

  if (showFullScreenLoader) {
    return (
      <View className="flex-1 bg-white">
        <KeyboardAvoidingView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
          }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ActivityIndicator />
        </KeyboardAvoidingView>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="flex items-center mb-6">
          <View className="rounded-full bg-slate-400 p-6">
            <UserIcon size={64} />
          </View>

          <Text className="mt-4 text-3xl font-bold">{displayName}</Text>
          <Text className="mt-1 mb-2 text-slate-500">{email}</Text>

          {isEditing ? (
            <Text className="absolute -bottom-4 text-xs  text-slate-500">
              Editando perfil…
            </Text>
          ) : null}

          {isSaveSuccess && !isEditing ? (
            <Text className="absolute -bottom-4 text-xs  text-green-500">
              Cambios guardados con éxito ✅
            </Text>
          ) : null}
        </View>

        <View className="flex items-center">
          {/* Contenido */}
          <View className="gap-4">
            <EditableField
              label="Nombre completo"
              value={fullName}
              onChangeText={setFullName}
              isEditing={isEditing}
              returnKeyType="next"
              autoComplete="name"
              textContentType="name"
              autoCapitalize="words"
              maxLength={20}
              placeholder="Ej: Javier Oute"
            />
            <EditableField
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              isEditing={isEditing}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              returnKeyType="next"
              placeholder="Ej: +34 612 345 678"
            />
            <EditableField
              label="Nombre de usuario"
              value={username}
              onChangeText={setUsername}
              isEditing={isEditing}
              returnKeyType="done"
              autoComplete="username"
              textContentType="username"
              autoCapitalize="none"
              maxLength={30}
              placeholder="Ej: sara_garcia"
            />
          </View>

          <View className="flex w-80 items-center justify-center mt-8">
            {!isEditing ? (
              <EditProfileButton onPress={onEdit} />
            ) : (
              <View className="flex-row gap-3">
                <CancelProfileButton onCancel={onCancel} isSaving={isSaving} />
                <SaveButton onSave={onSave} isSaving={isSaving} />
              </View>
            )}

            <View className="h-px w-56 bg-slate-400 my-6" />

            <LogOutButton signOut={signOut} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
/*

<SafeAreaView style={{ flex: 1 }} edges={["top"]}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: 24,
        paddingBottom: 24,
      }}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="never"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      //automaticallyAdjustKeyboardInsets
    >

      </ScrollView>

import { IconoUser } from "@/components/icons";
import { ProfileField } from "@/components/profile/profileField";
import { upsertProfile } from "@/features/profile/profile-api";
import "@/global.css";
import { useAuthStore } from "@/stores/auth.store";
import { isValidPhoneSimple, normalizePhone } from "@/utils/phone";
import { useHeaderHeight } from "@react-navigation/elements";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Profile() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const signOut = useAuthStore((s) => s.signOut);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(null); // null | true | false

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");

  const userId = session?.user?.id ?? null;
  const email = session?.user?.email ?? "—";

  const headerHeight = useHeaderHeight();

  // 1) Si hay sesión y el profile aún no se ha pedido/cargado, lo pedimos
  useEffect(() => {
    if (session && profile === undefined) {
      refreshProfile();
    }
  }, [session, profile, refreshProfile]);

  // 2) Cargar formulario desde profile (callback estable)
  const loadFormFromProfile = useCallback(() => {
    setFullName(profile?.full_name ?? "Desconocido");
    setPhone(profile?.phone ?? "");
    setUsername(profile?.username ?? "");
  }, [profile]);

  // 3) Cuando llegue profile (o cambie), inicializa el formulario si NO estás editando
  useEffect(() => {
    if (!isEditing && profile !== undefined) {
      loadFormFromProfile();
    }
  }, [profile, isEditing, loadFormFromProfile]);

  useEffect(() => {
    if (isSaveSuccess === true) {
      clearTimeout();
      setTimeout(() => setIsSaveSuccess(null), 2000);
      return () => clearTimeout();
    }
  }, [isSaveSuccess]);

  const displayName = useMemo(() => {
    const name = (profile?.full_name ?? "").trim();
    return name.length ? name : "Sin nombre";
  }, [profile]);

  const showFullScreenLoader =
    isLoading || session === undefined || profile === undefined;

  const onEdit = useCallback(() => {
    loadFormFromProfile();
    setIsEditing(true);
  }, [loadFormFromProfile]);

  const onCancel = useCallback(() => {
    Keyboard.dismiss();
    loadFormFromProfile();
    setIsEditing(false);
  }, [loadFormFromProfile]);

  const onSave = useCallback(async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const rawPhone = phone; // tu state
      if (rawPhone.trim() && !isValidPhoneSimple(rawPhone)) {
        Alert.alert("Teléfono inválido", "Usa formato tipo +34 600 123 456");
        return;
      }

      const phoneToSave = rawPhone.trim() ? normalizePhone(rawPhone) : null;

      upsertProfile({
        userId,
        fullName,
        phone: phoneToSave,
        username,
      });

      await refreshProfile();
      setIsEditing(false);
      Keyboard.dismiss();
      setIsSaveSuccess(true);
    } finally {
      setIsSaving(false);
    }
  }, [userId, fullName, phone, username, refreshProfile]);

  // Loader a pantalla completa (mientras no sabemos estado / o no llegó profile)
  if (showFullScreenLoader) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  // Sin sesión -> fuera
  if (!session) {
    //return <Redirect href="/(auth)/login" />;
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      automaticallyAdjustKeyboardInsets
    >
      {/* Header }
      <View className="items-center mb-8">
        <View className="rounded-full bg-slate-400 p-6">
          <IconoUser size={64} />
        </View>

        <Text className="mt-4 text-3xl font-bold">{displayName}</Text>
        <Text className="mt-1 mb-2 text-slate-500">{email}</Text>

        {isEditing ? (
          <Text className="absolute -bottom-4 text-xs  text-slate-500">
            Editando perfil…
          </Text>
        ) : null}

        {isSaveSuccess && !isEditing ? (
          <Text className="absolute -bottom-4 text-xs  text-green-500">
            Cambios guardados con éxito ✅
          </Text>
        ) : null}
      </View>

      <View className="px-20">
        {/* Contenido }
        <View className="gap-4">
          <ProfileField
            label="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
            isEditing={isEditing}
            returnKeyType="next"
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            maxLength={20}
          />
          <ProfileField
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            isEditing={isEditing}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            returnKeyType="next"
          />
          <ProfileField
            label="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
            isEditing={isEditing}
            returnKeyType="done"
            autoComplete="username"
            textContentType="username"
            autoCapitalize="none"
            maxLength={15}
          />
        </View>
        <View className="mt-12">
          {!isEditing ? (
            <Pressable
              onPress={onEdit}
              className="items-center rounded-xl bg-blue-900 py-4 active:opacity-50 "
            >
              <Text className="text-base font-semibold text-white">
                Editar perfil
              </Text>
            </Pressable>
          ) : (
            <View className="flex-row gap-3">
              <Pressable
                onPress={onCancel}
                disabled={isSaving}
                className="flex-1 items-center rounded-xl border border-slate-300 py-4 active:opacity-50"
              >
                <Text className="text-base font-semibold text-slate-900">
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={onSave}
                disabled={isSaving}
                className="flex-1 items-center rounded-xl py-4 active:opacity-50 bg-blue-900"
              >
                <Text className="text-base font-semibold text-white">
                  {isSaving ? "Guardando…" : "Guardar"}
                </Text>
              </Pressable>
            </View>
          )}
          <View className="h-px bg-slate-400 my-8" />
          {/* LINEA DIVISORIA }
          <Pressable
            onPress={signOut}
            className="items-center rounded-xl bg-black py-4 active:opacity-50 "
          >
            <Text className="text-base font-semibold text-white">
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
*/
