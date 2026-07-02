import { ReliabilityRow } from "@/components/forecast/reliability-row";
import { useT } from "@/lib/i18n";
import { Text, View } from "react-native";

// Cuerpo común del detalle (historial y mapa) para compartir tipografía/estructura; las diferencias van por props.
export function ForecastDetailBody({
  identity,
  clase,
  band,
  forecastDisplay,
  forecastSizeClass = "text-2xl",
  recommendation,
  lowBand,
  description,
  descriptionLabel,
  placeName,
  dateText,
  extraLines,
  onLayoutInner,
}) {
  const t = useT();
  const meta = [dateText, ...(extraLines ?? [])].filter(Boolean);

  return (
    <>
      {/* Bloque superior: solo identidad + pronóstico se miden (onLayoutInner), lo visible en el snap colapsado. */}
      <View className="flex">
        <View onLayout={onLayoutInner}>
          {identity}
          {/* mt-6 (24px): espacio título→pronóstico. */}
          <Text
            className={`mt-6 text-center ${forecastSizeClass} font-bold text-slate-800 dark:text-zinc-100`}
          >
            {forecastDisplay || "-"}
          </Text>
        </View>
        {recommendation ? (
          <Text className="mt-3 text-center text-lg text-slate-600 dark:text-zinc-300">
            {recommendation}
          </Text>
        ) : null}
        <View className="mt-3 items-center">
          <ReliabilityRow clase={clase} band={band} />
        </View>
        {lowBand ? (
          <Text className="mt-3 text-center text-sm italic text-slate-500 dark:text-zinc-400">
            {t("alerts.tone.pocoFiable")}
          </Text>
        ) : null}
      </View>

      {/* Detalles: descripción + lugar + fecha (+ meta extra del mapa) */}
      <View className="flex gap-1">
        {description ? (
          <Text className="text-lg italic text-slate-600 dark:text-zinc-300 text-center">
            {descriptionLabel ? (
              <Text className="not-italic">{descriptionLabel}: </Text>
            ) : null}
            {description}
          </Text>
        ) : null}
        {placeName ? (
          <Text className="text-sm text-slate-600 dark:text-zinc-300 text-center">
            {placeName}
          </Text>
        ) : null}
        {meta.map((line, i) => (
          <Text
            key={i}
            className="text-sm text-slate-400 dark:text-zinc-500 text-center"
          >
            {line}
          </Text>
        ))}
      </View>
    </>
  );
}
