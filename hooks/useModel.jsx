import * as ImageManipulator from "expo-image-manipulator";
import * as jpeg from "jpeg-js";
import { useEffect, useState } from "react";
import { useTensorflowModel } from "react-native-fast-tflite";

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
  cielo_despejado: {
    color: "#1D9E75",
    titulo: "Cielo despejado",
    mensaje: "Sin riesgos meteorológicos. Buenas condiciones.",
  },
  nubes_altas_medias: {
    color: "#378ADD",
    titulo: "Nubes altas o medias",
    mensaje: "Posible cambio de tiempo. Monitoriza el cielo.",
  },
  lenticular_viento: {
    color: "#EF9F27",
    titulo: "Viento fuerte en altura",
    mensaje: "Nubes lenticulares detectadas. Viento intenso en cumbres.",
  },
  cubierto_precipitacion: {
    color: "#EF9F27",
    titulo: "Riesgo de precipitación",
    mensaje: "Cielo cubierto. Posible lluvia o nieve próxima.",
  },
  niebla_stratus: {
    color: "#E24B4A",
    titulo: "Niebla o stratus bajo",
    mensaje: "Visibilidad reducida. Riesgo de desorientación.",
  },
  conveccion_desarrollo: {
    color: "#E24B4A",
    titulo: "Convección en desarrollo",
    mensaje: "Nubes de tormenta formándose. Considera descender.",
  },
  tormenta: {
    color: "#7F77DD",
    titulo: "⚠️ PELIGRO — Tormenta",
    mensaje: "Tormenta activa. Busca refugio inmediatamente.",
  },
  foto_invalida: {
    color: "#888888",
    titulo: "Foto no válida",
    mensaje: "No se puede analizar esta imagen. Intenta con otra foto.",
  },
};

// Normalización ImageNet — igual que durante el entrenamiento
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

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
        // El modelo fue entrenado con mean=[0.485,0.456,0.406] std=[0.229,0.224,0.225]
        // Sin esta normalización las predicciones serán incorrectas
        const input = new Float32Array(224 * 224 * 3);
        for (let i = 0; i < 224 * 224; i++) {
          input[i * 3 + 0] = (data[i * 4 + 0] / 255.0 - MEAN[0]) / STD[0];
          input[i * 3 + 1] = (data[i * 4 + 1] / 255.0 - MEAN[1]) / STD[1];
          input[i * 3 + 2] = (data[i * 4 + 2] / 255.0 - MEAN[2]) / STD[2];
        }

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
