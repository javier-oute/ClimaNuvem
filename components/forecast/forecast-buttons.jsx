import { Pressable, Text } from "react-native";
import { ChevronLeftIcon, SaveIcon, ShareIcon, TrashIcon } from "../icons";

export function DiscardForecastButton({ onDiscard }) {
  return (
    <Pressable
      onPress={onDiscard}
      //className="flex-1 items-center rounded-xl border border-slate-300 py-4 active:opacity-50"
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#b0aeaf] px-6 py-4 shadow-sm active:opacity-75"
    >
      <ChevronLeftIcon />
      <Text className="text-base font-semibold text-white">Descartar</Text>
    </Pressable>
  );
}

export function SaveForecastButton({ onSave, isSaving }) {
  return (
    <Pressable
      onPress={onSave}
      //className="flex-1 items-center rounded-xl py-4 active:opacity-50 bg-blue-900"
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <SaveIcon />
      <Text className="text-base font-semibold text-white">
        {isSaving ? "Guardando…" : "Guardar"}
      </Text>
    </Pressable>
  );
}

export function DeleteForecastButton({ isDeleting, onDelete }) {
  return (
    <Pressable
      onPress={onDelete}
      //className="flex-1 items-center rounded-xl border border-slate-300 py-4 active:opacity-50"
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-black px-6 py-4 shadow-sm active:opacity-75"
    >
      <TrashIcon />
      <Text className="text-base font-semibold text-white">
        {isDeleting ? "Eliminando..." : "Eliminar"}
      </Text>
    </Pressable>
  );
}

export function ShareForecastButton({ onShare }) {
  return (
    <Pressable
      onPress={onShare}
      //className="flex-1 items-center rounded-xl border border-slate-300 py-4 active:opacity-50"
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <ShareIcon />
      <Text className="text-base font-semibold text-white">Compartir</Text>
    </Pressable>
  );
}
