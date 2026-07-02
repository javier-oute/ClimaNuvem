import { useT } from "@/lib/i18n";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

// Modal de borrado de cuenta: exige teclear la palabra de confirmación; gestiona su carga/error.
export function DeleteAccountModal({ visible, onClose, onConfirm }) {
  const t = useT();
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const confirmWord = t("profile.deleteAccount.confirmWord");
  const canDelete = text.trim().toUpperCase() === confirmWord.toUpperCase();

  const handleClose = () => {
    if (isDeleting) return; // no cerrar mientras borra
    setText("");
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!canDelete || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm(); // en éxito navega a login (no hace falta cerrar)
    } catch {
      setError(t("profile.deleteAccount.error"));
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View className="w-full rounded-3xl bg-white p-6 shadow-lg dark:bg-zinc-800">
          <Text className="text-xl font-bold text-slate-900 dark:text-zinc-100">
            {t("profile.deleteAccount.modalTitle")}
          </Text>
          <Text className="mt-3 text-sm leading-5 text-slate-600 dark:text-zinc-400">
            {t("profile.deleteAccount.modalWarning")}
          </Text>

          <Text className="mt-5 text-sm font-medium text-slate-700 dark:text-zinc-300">
            {t("profile.deleteAccount.confirmPrompt")}
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            editable={!isDeleting}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={t("profile.deleteAccount.placeholder")}
            placeholderTextColor="#94a3b8"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 pb-3 pt-3 text-slate-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />

          {error ? (
            <Text className="mt-3 text-sm text-[#E24B4A]">{error}</Text>
          ) : null}

          <View className="mt-6 gap-3">
            <Pressable
              onPress={handleClose}
              disabled={isDeleting}
              className="w-full items-center justify-center rounded-2xl border border-slate-300 py-4 active:opacity-75 dark:border-zinc-600"
            >
              <Text className="text-center text-base font-semibold text-slate-700 dark:text-zinc-200">
                {t("profile.deleteAccount.cancel")}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={!canDelete || isDeleting}
              className={`w-full flex-row items-center justify-center rounded-2xl py-4 active:opacity-75 ${
                canDelete && !isDeleting ? "bg-[#E24B4A]" : "bg-[#b0aeaf]"
              }`}
            >
              {isDeleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-base font-semibold text-white">
                  {t("profile.deleteAccount.confirm")}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
