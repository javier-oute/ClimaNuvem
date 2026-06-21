import { Text, View } from "react-native";

// Badge "Publicada" reutilizable (historial: lista y detalle).
//   active      → la predicción está publicada y activa en el mapa (azul).
//   wasPublished→ estuvo publicada pero ya no (gris atenuado).
//   size        → "sm" (lista, por defecto) | "lg" (detalle: pastilla y texto grandes).
// Si nunca se publicó, no renderiza nada.
export function PublishedBadge({ active, wasPublished, label, size = "sm" }) {
  if (!active && !wasPublished) return null;
  const pad = size === "lg" ? "px-3 py-1" : "px-2 py-0.5";
  const textSize = size === "lg" ? "text-xl" : "text-xs";
  return (
    <View
      className={`${pad} rounded-full ${active ? "bg-[#314468]" : "bg-[#b0aeaf]"}`}
    >
      <Text
        className={`${textSize} font-semibold ${active ? "text-white" : "text-white/70"}`}
      >
        {label}
      </Text>
    </View>
  );
}
