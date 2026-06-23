import { UserIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { Link } from "expo-router";
import { Pressable, Text } from "react-native";

export default function GuestButton({ href = "/(tabs)/home" }) {
  const t = useT();
  return (
    <Link href={href} replace asChild>
      <Pressable className="flex flex-row justify-between items-center w-60 rounded-3xl bg-[#b0aeaf] px-5 py-2 shadow-sm active:opacity-75">
        <UserIcon />
        <Text numberOfLines={1} className="text-white text-sm font-semibold">
          {t("login.guest")}
        </Text>
      </Pressable>
    </Link>
  );
}

//
