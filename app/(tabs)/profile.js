import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { useHeaderHeight } from "@react-navigation/elements";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconoUser } from "../../components/icons";
import "../../global.css";

function Field({ label, children }) {
  return (
    <View className="w-full">
      <Text className="mb-2 text-sm text-slate-500">{label}</Text>
      {children}
    </View>
  );
}

function normalizePhone(input) {
  // quita espacios/guiones/paréntesis y deja solo + y dígitos
  const s = (input ?? "").trim().replace(/[^\d+]/g, "");

  // si hay '+', que solo sea uno y al inicio
  if (s.startsWith("+")) return "+" + s.slice(1).replace(/\+/g, "");
  return s.replace(/\+/g, "");
}

function isValidPhoneSimple(input) {
  const p = normalizePhone(input);
  // + opcional y 9..15 dígitos (rango típico internacional)
  return /^\+?\d{9,15}$/.test(p);
}

function FieldPrueba({ label, value, onChangeText, isEditing, ...inputProps }) {
  return (
    <View className="w-full">
      <Text className="mb-2 text-sm text-slate-500">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={isEditing}
        showSoftInputOnFocus={isEditing}
        placeholderTextColor="#94a3b8"
        className={`rounded-xl border px-4 pb-3 pt-3 ${
          isEditing
            ? "border-slate-200 bg-white text-slate-900"
            : "border-slate-200 bg-gray-200 text-slate-500"
        }`}
        {...inputProps}
      />
    </View>
  );
}

function ReadRow({ label, value }) {
  return (
    <View className="w-full">
      <Text className="text-xs text-slate-500">{label}</Text>
      <View className="w-full rounded-xl border border-slate-200 px-4 py-3">
        <Text className="mt-1 text-base text-slate-900">{value ?? "—"}</Text>
      </View>
    </View>
  );
}

export default function Profile() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

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

      // luego guardas phoneToSave en Supabase
      const updates = {
        id: userId,
        full_name: fullName.trim() || null,
        phone: phoneToSave,
        username: username.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates, { onConflict: "id" });

      if (error) {
        // Evito Alert para no romper UX si prefieres otro sistema.
        // Si quieres, cámbialo por Alert.alert(...)
        console.warn("No se pudo guardar:", error.message);
        return;
      }

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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets
      >
        {/* Header */}
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

          {isSaveSuccess ? (
            <Text className="absolute -bottom-4 text-xs  text-green-500">
              Cambios guardados con éxito ✅
            </Text>
          ) : null}
        </View>

        <View className="px-20">
          {/* Contenido */}
          <View className="gap-4">
            <FieldPrueba
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
            <FieldPrueba
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              isEditing={isEditing}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              returnKeyType="next"
            />
            <FieldPrueba
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
              <TouchableOpacity
                onPress={onEdit}
                className="items-center rounded-xl bg-blue-900 py-4"
              >
                <Text className="text-base font-semibold text-white">
                  Editar perfil
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={onCancel}
                  disabled={isSaving}
                  className="flex-1 items-center rounded-xl border border-slate-300 py-4"
                >
                  <Text className="text-base font-semibold text-slate-900">
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onSave}
                  disabled={isSaving}
                  className={`flex-1 items-center rounded-xl py-4 ${
                    isSaving ? "bg-slate-400" : "bg-black"
                  }`}
                >
                  <Text className="text-base font-semibold text-white">
                    {isSaving ? "Guardando…" : "Guardar"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      {/* Barra inferior sticky */}
    </SafeAreaView>
  );
}
/*

          contentContainerStyle={{
            paddingBottom: 40 + insets.bottom, // importante: deja aire abajo
          }}

import { useAuthStore } from "@/stores/auth.store";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { IconoUser } from "../../components/icons";
import "../../global.css";

export default function Profile() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  // Si hay sesión y aún no tenemos profile, lo pedimos
  useEffect(() => {
    if (session && profile === undefined) {
      refreshProfile();
    }
  }, [session, profile, refreshProfile]);

  // Espera a que AuthBootstrap determine la sesión
  if (isLoading || session === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  // Si no hay sesión, fuera
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }


  console.log("Profile render", JSON.stringify({ profile }, null, 2));
  console.log(
    "Session render",
    JSON.stringify({ user: session?.user }, null, 2),
  );


  // ---- Datos ----
  const email = profile?.email ?? "—";

  const username = profile?.username ?? null;

  const fullName = profile?.full_name ?? "Sin nombre";

  const phone = profile?.phone ?? null;

  return (
    <View className="flex flex-1 items-center p-4 gap-4 bg-white">
      <View className="mt-16 p-6 bg-slate-400 rounded-full">
        <IconoUser size={64} />
      </View>

      <Text className="font-bold text-2xl p-4">{fullName}</Text>

      <View className="flex flex-row w-full bg-white rounded-xl py-4 px-6 shadow-sm">
        <Text className="text-xl font-semibold">Email:</Text>
        <Text className="flex-auto text-xl text-center">{email}</Text>
      </View>

      <View className="flex flex-row w-full bg-white rounded-xl py-4 px-6 shadow-sm">
        <Text className="text-xl font-semibold">Teléfono:</Text>
        <Text className="flex-auto text-xl text-center">{phone}</Text>
      </View>

      <View className="flex flex-row w-full bg-white rounded-xl py-4 px-6 shadow-sm">
        <Text className="text-xl font-semibold">Nombre de usuario:</Text>
        <Text className="flex-auto text-xl text-center">{username}</Text>
      </View>
    </View>
  );
}
*/
/*
import { Text, View } from "react-native";
import { IconoUser } from "../../components/icons";
import "../../global.css";
import { prueba_usuario_1 } from "../../mocks/prueba_objeto";

const user = prueba_usuario_1;

export default function Profile() {
  return (
    <View className="flex flex-1 items-center p-4 gap-4 bg-white">
      <View className="mt-16 p-6 bg-slate-400 rounded-full">
        <IconoUser size={64} />
      </View>
      <Text className="font-bold text-2xl p-4">{user.nombre}</Text>
      <View className="flex flex-row w-full bg-white rounded-xl py-4 px-6 shadow-sm">
        <Text className="text-xl font-semibold">Email:</Text>
        <Text className="flex-auto text-xl text-center">{user.email}</Text>
      </View>
      <View className="flex flex-row w-full bg-white rounded-xl py-4 px-6 shadow-sm">
        <Text className="text-xl font-semibold">Fecha de nacimiento:</Text>
        <Text className="flex-auto text-xl text-center">
          {user.fecha_nacimiento}
        </Text>
      </View>
    </View>
  );
}
*/
