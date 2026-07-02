import { RISK_COLORS } from "@/lib/forecast/model-meta";
import { useT } from "@/lib/i18n";
import { Text, View } from "react-native";

// Fila de fiabilidad (punto de color + Alta/Media/Baja) que sustituye al porcentaje; se atenúa a gris en banda baja.
export function ReliabilityRow({ clase, band }) {
  const t = useT();
  if (!band) return null;

  const color =
    band === "baja" ? "#9CA3AF" : clase ? RISK_COLORS[clase] : "#314468";

  return (
    <View className="flex-row items-center gap-2">
      <View
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text className="text-sm text-slate-500 dark:text-zinc-400">
        {t("alerts.fiabilidad.label")}: {t(`alerts.fiabilidad.${band}`)}
      </Text>
    </View>
  );
}
