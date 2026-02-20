// features/profile/useProfileForm.js
import { upsertProfile } from "@/features/profile/profile-api";
import { isValidPhoneSimple, normalizePhone } from "@/utils/phone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard } from "react-native";

export function useProfileForm({ userId, profile, refreshProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");

  const timeoutRef = useRef(null);

  const loadFormFromProfile = useCallback(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setUsername(profile?.username ?? "");
  }, [profile]);

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
    return name.length ? name : "Sin nombre";
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
      // Validación simple de teléfono
      if (phone.trim() && !isValidPhoneSimple(phone)) {
        Alert.alert("Teléfono inválido", "Usa formato tipo +34 600 123 456");
        return;
      }

      const phoneToSave = phone.trim() ? normalizePhone(phone) : null;

      await upsertProfile({
        userId,
        fullName,
        phone: phoneToSave,
        username,
      });

      await refreshProfile();
      setIsEditing(false);
      Keyboard.dismiss();
      setIsSaveSuccess(true);
    } catch (e) {
      Alert.alert("No se pudo guardar", e?.message ?? "Error");
    } finally {
      setIsSaving(false);
    }
  }, [userId, phone, fullName, username, refreshProfile]);

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

    // computed
    displayName,

    // actions
    onEdit,
    onCancel,
    onSave,
    loadFormFromProfile,
  };
}
