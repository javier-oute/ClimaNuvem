import { evaluateForecast } from "@/lib/forecast/evaluateForecast";
import { normalizeRGBA } from "@/lib/mlNormalize";
import * as ImageManipulator from "expo-image-manipulator";
import * as jpeg from "jpeg-js";
import { useEffect, useState } from "react";
import { useTensorflowModel } from "react-native-fast-tflite";

const IMG_SIZE = 224;
const RESIZE_SHORT_SIDE = 256; // Resize(256) + CenterCrop(224), igual que el eval del notebook

// Detecta el layout del tensor de entrada del modelo: [1,3,224,224] → NCHW (planar),
// cualquier otro 4-D → NHWC (intercalado). El export del notebook (ai_edge_torch) conserva
// la firma NCHW de PyTorch, mientras que un modelo TF clásico sería NHWC.
function inputLayout(model) {
  const shape = model?.inputs?.[0]?.shape;
  if (Array.isArray(shape) && shape.length === 4 && shape[1] === 3) {
    return "nchw";
  }
  return "nhwc";
}

export function useModel(imageUri) {
  const tflite = useTensorflowModel(
    require("../assets/models/climanuvem_v3.tflite"),
  );

  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tflite.state !== "loaded" || !imageUri) return;

    let cancelado = false;

    async function clasificar() {
      try {
        // 1. Replicar el preprocesado de evaluación: Resize(256 lado corto) + CenterCrop(224).
        const probe = await ImageManipulator.manipulateAsync(imageUri, [], {});
        const scale = RESIZE_SHORT_SIDE / Math.min(probe.width, probe.height);
        const rw = Math.round(probe.width * scale);
        const rh = Math.round(probe.height * scale);
        const originX = Math.floor((rw - IMG_SIZE) / 2);
        const originY = Math.floor((rh - IMG_SIZE) / 2);

        const resized = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            { resize: { width: rw, height: rh } },
            { crop: { originX, originY, width: IMG_SIZE, height: IMG_SIZE } },
          ],
          { format: ImageManipulator.SaveFormat.JPEG, base64: true },
        );

        // 2. Decodificar JPEG → píxeles RGBA
        const bytes = Uint8Array.from(atob(resized.base64), (c) =>
          c.charCodeAt(0),
        );
        const { data } = jpeg.decode(bytes, { useTArray: true });

        // 3. RGBA → Float32 normalizado (ImageNet) en el layout que espera el modelo
        const layout = inputLayout(tflite.model);
        const input = normalizeRGBA(data, IMG_SIZE, IMG_SIZE, { layout });

        // 4. Inferencia. El modelo ya incluye softmax + temperature scaling → probs calibradas.
        const outputs = await tflite.model.run([input]);
        const probs = Array.from(outputs[0]);

        // 5. Decisión de alerta a partir de TODA la distribución (no solo el top-1).
        if (!cancelado) {
          setResultado(evaluateForecast(probs));
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
