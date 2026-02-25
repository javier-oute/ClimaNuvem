import { Pressable, Text } from "react-native";
import { CancelIcon, EditIcon, SaveIcon, SignOutIcon } from "../icons";

export function EditProfileButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      //className="items-center rounded-xl bg-blue-900 py-4 active:opacity-50 "
      className="flex-row items-center justify-between w-full rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <Text className="text-base font-semibold text-white">Editar perfil</Text>
      <EditIcon />
    </Pressable>
  );
}

export function CancelProfileButton({ onCancel, isSaving }) {
  return (
    <Pressable
      onPress={onCancel}
      disabled={isSaving}
      //className="flex-1 items-center rounded-xl border border-slate-300 py-4 active:opacity-50"
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#b0aeaf] px-6 py-4 shadow-sm active:opacity-75"
    >
      <Text className="text-base font-semibold text-white">Cancelar</Text>
      <CancelIcon />
    </Pressable>
  );
}

export function SaveProfileButton({ onSave, isSaving }) {
  return (
    <Pressable
      onPress={onSave}
      disabled={isSaving}
      //className="flex-1 items-center rounded-xl py-4 active:opacity-50 bg-blue-900"
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <Text className="text-base font-semibold text-white">
        {isSaving ? "Guardando…" : "Guardar"}
      </Text>
      <SaveIcon />
    </Pressable>
  );
}

export function LogOutButton({ signOut }) {
  return (
    <Pressable
      onPress={signOut}
      //className="items-center rounded-xl bg-black py-4 active:opacity-50 "
      className="flex-row items-center justify-between w-full rounded-3xl bg-black px-6 py-4 shadow-sm active:opacity-75"
    >
      <Text className="text-base font-semibold text-white">Cerrar sesión</Text>
      <SignOutIcon />
    </Pressable>
  );
}
