import { RISK_COLORS } from "@/lib/forecast/model-meta";
import { useT } from "@/lib/i18n";
import { Text, View } from "react-native";

// Fila reutilizable de fiabilidad: punto de color de la clase + "Fiabilidad: Alta/Media/Baja".
// Sustituye al porcentaje en todas las pantallas (resultado en vivo, detalle, mapa, historial).
// El color es el de la clase (RISK_COLORS); se atenúa a gris cuando la banda es "baja" (poco fiable),
// igual que el resultado en vivo. La alineación la decide el contenedor padre.
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
