import { LockIcon } from "@/components/icons";
import { RISK_COLORS } from "@/lib/forecast/model-meta";
import { useT } from "@/lib/i18n";
import { useColorScheme } from "nativewind";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Color del pin propio (fuente única); en Android usa un magenta cuyo tono no colisiona con el azul de Vigilancia.
export const OWN_PIN_COLOR = Platform.OS === "android" ? "#D11FA3" : "#314468";

// Niveles de riesgo 0..4 con su color; la leyenda agrupa por color (5 entradas únicas).
const RISK_ROWS = [
  { level: 0, color: RISK_COLORS.cielo_despejado },
  { level: 1, color: RISK_COLORS.nubes_altas_medias },
  { level: 2, color: RISK_COLORS.lenticular_viento },
  { level: 3, color: RISK_COLORS.conveccion_desarrollo },
  { level: 4, color: RISK_COLORS.tormenta },
];

// En Android el pin usa solo el tono del color; la leyenda lo reconstruye a plena saturación para casar con el pin real.
function toPinColor(hex) {
  if (Platform.OS !== "android") return hex;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }
  // HSV(h, 1, 1) → RGB (color puro del tono, imita defaultMarker de Google)
  const c = 1;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let rr = 0;
  let gg = 0;
  let bb = 0;
  if (h < 60) [rr, gg, bb] = [c, x, 0];
  else if (h < 120) [rr, gg, bb] = [x, c, 0];
  else if (h < 180) [rr, gg, bb] = [0, c, x];
  else if (h < 240) [rr, gg, bb] = [0, x, c];
  else if (h < 300) [rr, gg, bb] = [x, 0, c];
  else [rr, gg, bb] = [c, 0, x];
  const to = (n) => `0${Math.round(n * 255).toString(16)}`.slice(-2);
  return `#${to(rr)}${to(gg)}${to(bb)}`;
}

function LegendRow({ color, label }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        style={{ backgroundColor: toPinColor(color) }}
        className="h-2.5 w-2.5 rounded-full"
      />
      <Text className="text-[11px] text-slate-700 dark:text-zinc-200">
        {label}
      </Text>
    </View>
  );
}

// Overlay fijo arriba-izquierda: leyenda + aviso de privacidad, con maxWidth y sin interceptar gestos del mapa.
export function MapLegend() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  // El color del candado se fija en runtime para casar con el texto (slate-700 / dark:zinc-200).
  const lockColor = colorScheme === "dark" ? "#e4e4e7" : "#334155";

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 12,
        maxWidth: 190,
      }}
      className="gap-2"
    >
      {/* Leyenda de colores: por nivel de riesgo (5) + el color de las publicaciones propias. */}
      <View className="gap-1 rounded-xl bg-white/90 dark:bg-zinc-800/90 px-2.5 py-2 shadow-sm">
        {RISK_ROWS.map((row) => (
          <LegendRow
            key={row.level}
            color={row.color}
            label={t(`guide.detail.riesgo.${row.level}`)}
          />
        ))}
        <LegendRow
          color={OWN_PIN_COLOR}
          label={t("community.yourPublications")}
        />
      </View>

      {/* Aviso de privacidad: las coordenadas se publican con snap (~2 km), no exactas. */}
      <View className="flex-row items-start gap-1.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 px-2.5 py-2 shadow-sm">
        <LockIcon size={12} color={lockColor} />
        <Text className="flex-1 text-[11px] text-slate-700 dark:text-zinc-200">
          {t("community.locationApproxNotice")}
        </Text>
      </View>
    </View>
  );
}
