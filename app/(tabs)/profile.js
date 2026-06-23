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
import { unpublishAllMine } from "@/lib/communityMap";
import { useT } from "@/lib/i18n";
import {
  promptMapPublishConsent,
  promptMapPublishDisable,
} from "@/lib/mapConsent";
import { alertPermissionBlocked } from "@/lib/permissions";
import * as Location from "expo-location";
import { useAuthStore } from "@/stores/auth.store";
import {
  CURRENT_MAP_CONSENT_VERSION,
  useSettingsStore,
} from "@/stores/settings.store";
import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const mapConsentVersion = useSettingsStore((s) => s.mapPublishConsentVersion);
  const setMapPublishConsent = useSettingsStore((s) => s.setMapPublishConsent);
  const mapConsentGranted = mapConsentVersion === CURRENT_MAP_CONSENT_VERSION;

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
          paddingBottom: Platform.OS === "ios" ? 24 : insets.bottom,
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
          <SettingRow
            label={t("settings.mapConsent")}
            value={mapConsentGranted ? "on" : "off"}
            onChange={(key) => {
              // "Sí" muestra el MISMO aviso que el flujo de "Publicar" (el helper concede el
              // consentimiento al aceptar). "No" avisa de que se borrarán las publicaciones del mapa;
              // solo al confirmar y borrar con éxito se retira el consentimiento.
              if (key === "on") {
                if (!mapConsentGranted) {
                  // Tras conceder el consentimiento, aseguramos el permiso de ubicación
                  // (hace falta para publicar): la primera vez se pide el diálogo del SO y,
                  // si se deniega (o ya estaba denegado de forma permanente), se ofrece abrir Ajustes.
                  promptMapPublishConsent({
                    t,
                    onAccept: async () => {
                      const perm =
                        await Location.getForegroundPermissionsAsync();
                      if (perm.status === "granted") return;

                      let status = perm.status;
                      if (perm.canAskAgain) {
                        ({ status } =
                          await Location.requestForegroundPermissionsAsync());
                      }

                      if (status !== "granted") {
                        alertPermissionBlocked({
                          t,
                          title: t("settings.locationNeededTitle"),
                          message: t("settings.locationNeededMsg"),
                        });
                      }
                    },
                  });
                }
                return;
              }
              if (!mapConsentGranted) return; // ya estaba en "No"
              promptMapPublishDisable({
                t,
                onConfirm: async () => {
                  try {
                    await unpublishAllMine();
                    setMapPublishConsent(null);
                  } catch (e) {
                    Alert.alert(
                      t("settings.mapConsentDisableError"),
                      e?.message ?? "Error",
                    );
                  }
                },
              });
            }}
            options={[
              { key: "on", label: t("settings.mapConsentOn") },
              { key: "off", label: t("settings.mapConsentOff") },
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
