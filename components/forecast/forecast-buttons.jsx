import { useT } from "@/lib/i18n";
import { Pressable, Text } from "react-native";
import {
  ChevronLeftIcon,
  PublishIcon,
  ReportIcon,
  SaveIcon,
  ShareIcon,
  TrashIcon,
} from "../icons";

export function DiscardForecastButton({ onDiscard }) {
  const t = useT();
  return (
    <Pressable
      onPress={onDiscard}
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#b0aeaf] px-6 py-4 shadow-sm active:opacity-75"
    >
      <ChevronLeftIcon />
      <Text className="text-base font-semibold text-white">
        {t("buttons.discard")}
      </Text>
    </Pressable>
  );
}

export function SaveForecastButton({ onSave, isSaving }) {
  const t = useT();
  return (
    <Pressable
      onPress={onSave}
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <SaveIcon />
      <Text className="text-base font-semibold text-white">
        {isSaving ? t("buttons.saving") : t("buttons.save")}
      </Text>
    </Pressable>
  );
}

export function DeleteForecastButton({ isDeleting, onDelete }) {
  const t = useT();
  return (
    <Pressable
      onPress={onDelete}
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#E24B4A] px-6 py-4 shadow-sm active:opacity-75"
    >
      <TrashIcon />
      <Text className="text-base font-semibold text-white">
        {isDeleting ? t("buttons.deleting") : t("buttons.delete")}
      </Text>
    </Pressable>
  );
}

export function ShareForecastButton({ onShare }) {
  const t = useT();
  return (
    <Pressable
      onPress={onShare}
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#b0aeaf] px-6 py-4 shadow-sm active:opacity-75"
    >
      <ShareIcon />
      <Text className="text-base font-semibold text-white">
        {t("buttons.share")}
      </Text>
    </Pressable>
  );
}

export function PublishForecastButton({ onPublish, isPublishing }) {
  const t = useT();
  return (
    <Pressable
      onPress={onPublish}
      disabled={isPublishing}
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <PublishIcon />
      <Text className="text-base font-semibold text-white">
        {isPublishing ? t("buttons.publishing") : t("buttons.publish")}
      </Text>
    </Pressable>
  );
}

// Botón a ancho completo para despublicar desde el detalle de historial.
export function UnpublishForecastButton({ onUnpublish, isUnpublishing }) {
  const t = useT();
  return (
    <Pressable
      onPress={onUnpublish}
      disabled={isUnpublishing}
      className="flex-1 flex-row items-center justify-center gap-3 rounded-3xl bg-[#b0aeaf] px-6 py-4 shadow-sm active:opacity-75"
    >
      <PublishIcon />
      <Text className="text-base font-semibold text-white">
        {isUnpublishing ? t("buttons.unpublishing") : t("buttons.unpublish")}
      </Text>
    </Pressable>
  );
}

// Botón para reportar una publicación ajena (detalle del mapa).
export function ReportForecastButton({ onReport }) {
  const t = useT();
  return (
    <Pressable
      onPress={onReport}
      className="flex-1 flex-row items-center justify-center gap-3 rounded-3xl bg-[#E24B4A] px-6 py-4 shadow-sm active:opacity-75"
    >
      <ReportIcon />
      <Text className="text-base font-semibold text-white">
        {t("buttons.report")}
      </Text>
    </Pressable>
  );
}
