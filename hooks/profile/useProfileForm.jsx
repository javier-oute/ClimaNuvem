// features/profile/useProfileForm.js
import { upsertProfile } from "@/features/profile/profile-api";
import { t } from "@/lib/i18n";
import {
  deleteAvatar,
  isStorageAvatarPath,
  uploadAvatar,
} from "@/stores/profile.store.image";
import { isValidPhoneSimple, normalizePhone } from "@/utils/phone";
import { isValidUsername } from "@/utils/username";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard } from "react-native";

export function useProfileForm({ userId, profile, refreshProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");

  // Avatar staged (no se sube hasta "Guardar"):
  // avatarUri = URI local de preview | null
  // avatarAction = "none" (sin cambios) | "set" (nueva foto) | "remove" (quitar)
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarAction, setAvatarAction] = useState("none");

  const timeoutRef = useRef(null);

  const resetAvatarStaging = useCallback(() => {
    setAvatarUri(null);
    setAvatarAction("none");
  }, []);

  const stageAvatar = useCallback((uri) => {
    setAvatarUri(uri);
    setAvatarAction("set");
  }, []);

  const stageRemoveAvatar = useCallback(() => {
    setAvatarUri(null);
    setAvatarAction("remove");
  }, []);

  const loadFormFromProfile = useCallback(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setUsername(profile?.username ?? "");
    resetAvatarStaging();
  }, [profile, resetAvatarStaging]);

  // Inicializa/actualiza el formulario cuando llega profile (si no editas)
  useEffect(() => {
    if (!isEditing && profile !== undefined) {
      loadFormFromProfile();
    }
  }, [profile, isEditing, loadFormFromProfile]);

  // Auto-ocultar mensaje de éxito
  useEffect(() => {
    if (!isSaveSuccess) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsSaveSuccess(false), 2000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isSaveSuccess]);

  const displayName = useMemo(() => {
    const name = (profile?.full_name ?? "").trim();
    return name.length ? name : t("profile.noName");
  }, [profile]);

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
      // Validación de username: obligatorio y con formato válido (no vacío)
      if (!isValidUsername(username)) {
        Alert.alert(
          t("profile.usernameInvalidTitle"),
          t("profile.usernameInvalidMsg"),
        );
        return;
      }

      // Validación simple de teléfono
      if (phone.trim() && !isValidPhoneSimple(phone)) {
        Alert.alert(t("profile.invalidPhone"), t("profile.invalidPhoneMsg"));
        return;
      }

      const phoneToSave = phone.trim() ? normalizePhone(phone) : null;

      // Resolver el avatar (diferido): solo se toca Storage al guardar.
      let avatarUrl; // undefined = no tocar avatar_url
      try {
        if (avatarAction === "set" && avatarUri) {
          avatarUrl = await uploadAvatar({ uri: avatarUri, userId });
        } else if (avatarAction === "remove") {
          if (isStorageAvatarPath(profile?.avatar_url)) {
            await deleteAvatar(profile.avatar_url);
          }
          avatarUrl = null;
        }
      } catch (e) {
        Alert.alert(t("profile.avatar.uploadError"), e?.message ?? "Error");
        return;
      }

      await upsertProfile({
        userId,
        fullName,
        phone: phoneToSave,
        username,
        avatarUrl,
      });

      await refreshProfile();
      resetAvatarStaging();
      setIsEditing(false);
      Keyboard.dismiss();
      setIsSaveSuccess(true);
    } catch (e) {
      // 23505 = unique_violation → el username ya está en uso
      if (e?.code === "23505") {
        Alert.alert(
          t("profile.usernameTakenTitle"),
          t("profile.usernameTakenMsg"),
        );
      } else {
        Alert.alert(t("profile.saveError"), e?.message ?? "Error");
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    userId,
    phone,
    fullName,
    username,
    refreshProfile,
    avatarAction,
    avatarUri,
    profile,
    resetAvatarStaging,
  ]);

  return {
    // estados UI
    isEditing,
    isSaving,
    isSaveSuccess,

    // form
    fullName,
    phone,
    username,
    setFullName,
    setPhone,
    setUsername,

    // avatar staged
    avatarUri,
    avatarAction,
    stageAvatar,
    stageRemoveAvatar,

    // computed
    displayName,

    // actions
    onEdit,
    onCancel,
    onSave,
    loadFormFromProfile,
  };
}
