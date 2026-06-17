import { EditableField } from "@/components/editableField";
import { AvatarSourceSheet } from "@/components/profile/avatar-source-sheet";
import { DeleteAccountModal } from "@/components/profile/delete-account-modal";
import {
  CancelProfileButton,
  DeleteAccountButton,
  EditProfileButton,
  LogOutButton,
} from "@/components/profile/profile-buttons";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import usePickAvatar from "@/hooks/profile/usePickAvatar";
import { useProfileForm } from "@/hooks/profile/useProfileForm";
import { useT } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useSettingsStore } from "@/stores/settings.store";
import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SaveButton } from "../../components/buttons";
import "../../global.css";

function SettingRow({ label, options, value, onChange }) {
  return (
    <View className="rounded-2xl shadow-sm">
      <View className="flex-row items-center justify-between bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden px-4 py-3">
        <Text className="text-base font-medium text-slate-700 dark:text-zinc-300">
          {label}
        </Text>
        <View className="flex-row bg-slate-200 dark:bg-zinc-700 rounded-xl p-1 gap-1">
          {options.map(({ key, label: optLabel }) => (
            <Pressable
              key={key}
              onPress={() => onChange(key)}
              className={`px-3 py-1.5 rounded-lg active:opacity-75 ${value === key ? "bg-[#314468]" : ""}`}
            >
              <Text
                className={`text-sm font-medium ${value === key ? "text-white" : "text-slate-600 dark:text-zinc-400"}`}
              >
                {optLabel}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function Profile() {
  const t = useT();
  const insets = useSafeAreaInsets();

  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const language = useSettingsStore((s) => s.language);
  const theme = useSettingsStore((s) => s.theme);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const userId = session?.user?.id ?? null;
  const email = session?.user?.email ?? "—";

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
    avatarUri,
    avatarAction,
    stageAvatar,
    stageRemoveAvatar,
    displayName,
    onEdit,
    onCancel,
    onSave,
  } = useProfileForm({
    userId,
    profile,
    refreshProfile,
  });

  const { pickFromCamera, pickFromGallery } = usePickAvatar();
  const avatarSheetRef = useRef(null);

  const onCamera = async () => {
    const uri = await pickFromCamera();
    if (uri) stageAvatar(uri);
  };
  const onGallery = async () => {
    const uri = await pickFromGallery();
    if (uri) stageAvatar(uri);
  };

  // ¿Hay algún avatar que mostrar/quitar? (staged nuevo, o guardado y no marcado para quitar)
  const hasAvatar =
    avatarAction === "set" ||
    (avatarAction !== "remove" && !!profile?.avatar_url);

  const showFullScreenLoader =
    isLoading || session === undefined || profile === undefined;

  if (showFullScreenLoader) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="bg-white dark:bg-zinc-900"
    >
      {/* Header fijo — no forma parte del scroll */}
      <View
        className="items-center bg-white dark:bg-zinc-900"
        style={{
          paddingTop: Math.max(insets.top, 24) + 16,
          paddingHorizontal: 32,
          paddingBottom: 24,
        }}
      >
        <ProfileAvatar
          avatarUrl={avatarAction === "remove" ? null : profile?.avatar_url}
          stagedUri={avatarUri}
          isEditing={isEditing}
          isSaving={isSaving}
          onPressEdit={() => avatarSheetRef.current?.present()}
        />
        <Text className="mt-4 text-3xl font-bold text-slate-900 dark:text-zinc-100">
          {displayName}
        </Text>
        <Text className="mt-1 text-slate-500 dark:text-zinc-400">{email}</Text>
        {isEditing && (
          <Text className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
            {t("profile.editing")}
          </Text>
        )}
        {isSaveSuccess && !isEditing && (
          <Text className="mt-2 text-xs text-green-500">
            {t("profile.saved")}
          </Text>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingBottom: Platform.OS === "ios" ? 24 : insets.bottom + 24,
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        {/* Campos de perfil */}
        <View className="gap-4">
          <EditableField
            label={t("profile.fullName")}
            value={fullName}
            onChangeText={setFullName}
            isEditing={isEditing}
            returnKeyType="next"
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            maxLength={50}
            placeholder={t("profile.fullNamePlaceholder")}
          />
          <EditableField
            label={t("profile.phone")}
            value={phone}
            onChangeText={setPhone}
            isEditing={isEditing}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            returnKeyType="next"
            placeholder={t("profile.phonePlaceholder")}
          />
          <EditableField
            label={t("profile.username")}
            value={username}
            onChangeText={setUsername}
            isEditing={isEditing}
            returnKeyType="done"
            autoComplete="username"
            textContentType="username"
            autoCapitalize="none"
            maxLength={30}
            placeholder={t("profile.usernamePlaceholder")}
          />
        </View>

        {/* Botones editar / guardar */}
        <View className="mt-8">
          {!isEditing ? (
            <EditProfileButton onPress={onEdit} />
          ) : (
            <View className="flex-row gap-3">
              <CancelProfileButton onCancel={onCancel} isSaving={isSaving} />
              <SaveButton onSave={onSave} isSaving={isSaving} />
            </View>
          )}
        </View>

        {/* Preferencias */}
        <View className="h-px bg-slate-200 dark:bg-zinc-700 my-8" />
        <Text className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-4">
          {t("settings.title")}
        </Text>
        <View className="gap-3">
          <SettingRow
            label={t("settings.language")}
            value={language}
            onChange={setLanguage}
            options={[
              { key: "es", label: t("settings.langEs") },
              { key: "gl", label: t("settings.langGl") },
              { key: "en", label: t("settings.langEn") },
            ]}
          />
          <SettingRow
            label={t("settings.theme")}
            value={theme}
            onChange={setTheme}
            options={[
              { key: "light", label: t("settings.themeLight") },
              { key: "dark", label: t("settings.themeDark") },
              { key: "system", label: t("settings.themeSystem") },
            ]}
          />
        </View>

        {/* Cerrar sesión */}
        <View className="h-px bg-slate-200 dark:bg-zinc-700 my-8" />
        <LogOutButton signOut={signOut} />

        {/* Eliminar cuenta */}
        <View className="h-px bg-slate-200 dark:bg-zinc-700 my-8" />
        <DeleteAccountButton onPress={() => setShowDeleteModal(true)} />
      </ScrollView>

      <AvatarSourceSheet
        ref={avatarSheetRef}
        hasAvatar={hasAvatar}
        onCamera={onCamera}
        onGallery={onGallery}
        onRemove={stageRemoveAvatar}
      />

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteAccount}
      />
    </KeyboardAvoidingView>
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
