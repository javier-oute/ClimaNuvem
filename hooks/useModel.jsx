import * as ImageManipulator from "expo-image-manipulator";
import * as jpeg from "jpeg-js";
import { useEffect, useState } from "react";
import { useTensorflowModel } from "react-native-fast-tflite";
import { normalizeRGBA } from "@/lib/mlNormalize";

// Orden exacto del climanuvem_labels.txt generado por el modelo
const CLASES = [
  "cielo_despejado",
  "conveccion_desarrollo",
  "cubierto_precipitacion",
  "foto_invalida",
  "lenticular_viento",
  "niebla_stratus",
  "nubes_altas_medias",
  "tormenta",
];

const ALERTAS = {
  cielo_despejado: { color: "#1D9E75" },
  nubes_altas_medias: { color: "#378ADD" },
  lenticular_viento: { color: "#EF9F27" },
  cubierto_precipitacion: { color: "#EF9F27" },
  niebla_stratus: { color: "#E24B4A" },
  conveccion_desarrollo: { color: "#E24B4A" },
  tormenta: { color: "#7F77DD" },
  foto_invalida: { color: "#888888" },
};

// Normalización ImageNet — constantes y función en lib/mlNormalize.js

export function useModel(imageUri) {
  const tflite = useTensorflowModel(
    require("../assets/models/climanuvem_v2.tflite"),
  );

  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tflite.state !== "loaded" || !imageUri) return;

    let cancelado = false;

    async function clasificar() {
      try {
        // 1. Redimensionar a 224×224 y obtener base64
        const resized = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 224, height: 224 } }],
          { format: ImageManipulator.SaveFormat.JPEG, base64: true },
        );

        // 2. Decodificar JPEG → píxeles RGBA
        const bytes = Uint8Array.from(atob(resized.base64), (c) =>
          c.charCodeAt(0),
        );
        const { data } = jpeg.decode(bytes, { useTArray: true });

        // 3. RGBA → Float32 con normalización ImageNet
        // Constantes IMAGENET_MEAN y IMAGENET_STD definidas en lib/mlNormalize.js
        const input = normalizeRGBA(data, 224, 224);

        // 4. Inferencia
        const outputs = await tflite.model.run([input]);
        const probs = Array.from(outputs[0]);

        // 5. Clase ganadora y segunda mejor para mostrar al usuario
        const indexados = probs.map((p, i) => ({ p, i }));
        indexados.sort((a, b) => b.p - a.p);

        const clase = CLASES[indexados[0].i];
        const confianza = indexados[0].p;
        const clase2 = CLASES[indexados[1].i];
        const conf2 = indexados[1].p;

        if (!cancelado) {
          setResultado({
            clase,
            confianza,
            clase2,
            conf2,
            alerta: ALERTAS[clase],
            todasLasProbs: CLASES.map((c, i) => ({ clase: c, prob: probs[i] })),
          });
        }
      } catch (e) {
        if (!cancelado) setError(e.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    clasificar();
    return () => {
      cancelado = true;
    };
  }, [imageUri, tflite.state, tflite.model]);

  return { resultado, cargando, error };
}
