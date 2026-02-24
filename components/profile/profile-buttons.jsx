import { Pressable, Text } from "react-native";

export function EditProfileButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center rounded-xl bg-blue-900 py-4 active:opacity-50 "
    >
      <Text className="text-base font-semibold text-white">Editar perfil</Text>
    </Pressable>
  );
}

export function CancelProfileButton({ onCancel, isSaving }) {
  return (
    <Pressable
      onPress={onCancel}
      disabled={isSaving}
      className="flex-1 items-center rounded-xl border border-slate-300 py-4 active:opacity-50"
    >
      <Text className="text-base font-semibold text-slate-900">Cancelar</Text>
    </Pressable>
  );
}

export function SaveProfileButton({ onSave, isSaving }) {
  return (
    <Pressable
      onPress={onSave}
      disabled={isSaving}
      className="flex-1 items-center rounded-xl py-4 active:opacity-50 bg-blue-900"
    >
      <Text className="text-base font-semibold text-white">
        {isSaving ? "Guardando…" : "Guardar"}
      </Text>
    </Pressable>
  );
}

export function LogOutButton({ signOut }) {
  return (
    <Pressable
      onPress={signOut}
      className="items-center rounded-xl bg-black py-4 active:opacity-50 "
    >
      <Text className="text-base font-semibold text-white">Cerrar sesión</Text>
    </Pressable>
  );
}
