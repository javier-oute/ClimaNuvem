import { useT } from "@/lib/i18n";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useColorScheme } from "nativewind";
import { forwardRef, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconoCamera, IconoImage, TrashIcon } from "../icons";

function SheetRow({ icon, label, onPress, danger }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-2xl px-2 py-3 active:opacity-60"
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          danger ? "bg-[#E24B4A]" : "bg-[#314468]"
        }`}
      >
        {icon}
      </View>
      <Text
        className={`text-base font-medium ${
          danger ? "text-[#E24B4A]" : "text-slate-800 dark:text-zinc-100"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Bottom sheet de origen del avatar (Cámara/Galería/Quitar); el padre lo controla por ref.
export const AvatarSourceSheet = forwardRef(function AvatarSourceSheet(
  { hasAvatar, onCamera, onGallery, onRemove },
  ref,
) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  // Cierra el sheet y dispara la acción.
  const handle = (fn) => () => {
    ref?.current?.dismiss();
    fn?.();
  };

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: isDark ? "#52525b" : "#cbd5e1" }}
      backgroundStyle={{ backgroundColor: isDark ? "#27272a" : "#ffffff" }}
    >
      <BottomSheetView
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        <View className="px-6 pt-1 pb-2">
          <Text className="mb-2 text-center text-base font-semibold text-slate-900 dark:text-zinc-100">
            {t("profile.avatar.sheetTitle")}
          </Text>
          <SheetRow
            icon={<IconoCamera />}
            label={t("profile.avatar.camera")}
            onPress={handle(onCamera)}
          />
          <SheetRow
            icon={<IconoImage />}
            label={t("profile.avatar.gallery")}
            onPress={handle(onGallery)}
          />
          {hasAvatar && (
            <SheetRow
              icon={<TrashIcon />}
              label={t("profile.avatar.remove")}
              onPress={handle(onRemove)}
              danger
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
