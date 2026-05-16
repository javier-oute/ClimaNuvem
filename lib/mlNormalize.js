// Constantes de normalización ImageNet usadas durante el entrenamiento del modelo.
// Deben coincidir con las usadas en el pipeline de entrenamiento de Python.
export const IMAGENET_MEAN = [0.485, 0.456, 0.406];
export const IMAGENET_STD = [0.229, 0.224, 0.225];

/**
 * Convierte un buffer RGBA plano en Float32Array RGB normalizado con media/std ImageNet.
 *
 * El canal alpha (índice 3 de cada grupo de 4 bytes) se ignora.
 * La normalización aplica: output = (pixel/255.0 - MEAN[canal]) / STD[canal]
 *
 * @param {Uint8Array|number[]} rgbaData - Píxeles en formato RGBA plano, longitud = width*height*4
 * @param {number} [width=224]
 * @param {number} [height=224]
 * @returns {Float32Array} Buffer RGB normalizado, longitud = width*height*3
 */
export function normalizeRGBA(rgbaData, width = 224, height = 224) {
  const numPixels = width * height;
  const input = new Float32Array(numPixels * 3);
  for (let i = 0; i < numPixels; i++) {
    input[i * 3 + 0] =
      (rgbaData[i * 4 + 0] / 255.0 - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
    input[i * 3 + 1] =
      (rgbaData[i * 4 + 1] / 255.0 - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
    input[i * 3 + 2] =
      (rgbaData[i * 4 + 2] / 255.0 - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
  }
  return input;
}
