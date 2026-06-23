import { useT } from "@/lib/i18n";
import { Pressable, Text } from "react-native";
import { CancelIcon, EditIcon, SignOutIcon, TrashIcon } from "../icons";

export function EditProfileButton({ onPress }) {
  const t = useT();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between w-full rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <EditIcon />
      <Text className="text-base font-semibold text-white">
        {t("buttons.editProfile")}
      </Text>
    </Pressable>
  );
}

export function CancelProfileButton({ onCancel, isSaving }) {
  const t = useT();
  return (
    <Pressable
      onPress={onCancel}
      disabled={isSaving}
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#b0aeaf] px-6 py-4 shadow-sm active:opacity-75"
    >
      <CancelIcon />
      <Text className="text-base font-semibold text-white">
        {t("buttons.cancel")}
      </Text>
    </Pressable>
  );
}
export function LogOutButton({ signOut }) {
  const t = useT();
  return (
    <Pressable
      onPress={signOut}
      className="flex-row items-center justify-between w-full rounded-3xl bg-black dark:bg-zinc-800 px-6 py-4 shadow-sm active:opacity-75"
    >
      <SignOutIcon />
      <Text className="text-base font-semibold text-white">
        {t("buttons.signOut")}
      </Text>
    </Pressable>
  );
}

export function DeleteAccountButton({ onPress }) {
  const t = useT();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between w-full rounded-3xl bg-[#E24B4A] px-6 py-4 shadow-sm active:opacity-75"
    >
      <TrashIcon />
      <Text className="text-base font-semibold text-white">
        {t("profile.deleteAccount.button")}
      </Text>
    </Pressable>
  );
}
