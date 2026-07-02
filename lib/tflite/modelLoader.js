import { loadTensorflowModel } from "react-native-fast-tflite";

// Carga del modelo TFLite una sola vez y compartida: fast-tflite congela JS ~1-2 s, por eso se precarga al arrancar.

let modelPromise = null;

// Idempotente: la primera llamada inicia la carga; las siguientes devuelven la misma promesa (una única instancia).
export function preloadModel() {
  if (!modelPromise) {
    modelPromise = loadTensorflowModel(
      require("../../assets/models/climanuvem_v3.tflite"),
    );
  }
  return modelPromise;
}

// Devuelve la instancia (pre)cargada del modelo; si el preload ya terminó, resuelve de inmediato.
export function getModel() {
  return preloadModel();
}
