import { loadTensorflowModel } from "react-native-fast-tflite";

// Carga del modelo TFLite UNA sola vez y compartida en toda la app.
//
// `react-native-fast-tflite` carga el modelo de forma síncrona en el hilo de JS
// (leer el .tflite + construir el intérprete congela JS ~1-2 s). Si esto ocurre
// al montar la pantalla de pronóstico, el spinner no se llega a pintar hasta que
// termina. Solución: precargar el modelo antes (al arrancar la app, diferido) y
// reutilizar SIEMPRE la misma instancia → montar la pantalla ya no dispara nada
// pesado y el "cargando" aparece al instante.

let modelPromise = null;

// Idempotente: la primera llamada inicia la carga; las siguientes devuelven la
// MISMA promesa (una única instancia del intérprete en memoria, sin recargas).
export function preloadModel() {
  if (!modelPromise) {
    modelPromise = loadTensorflowModel(
      require("../../assets/models/climanuvem_v3.tflite"),
    );
  }
  return modelPromise;
}

// Devuelve la instancia (pre)cargada del modelo. Si el preload ya terminó, la
// promesa resuelve de inmediato (sin bloqueo en el montaje de la pantalla).
export function getModel() {
  return preloadModel();
}
