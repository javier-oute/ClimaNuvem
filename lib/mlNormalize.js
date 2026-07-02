// Constantes de normalización ImageNet del entrenamiento; deben coincidir con el pipeline de Python.
export const IMAGENET_MEAN = [0.485, 0.456, 0.406];
export const IMAGENET_STD = [0.229, 0.224, 0.225];

// Convierte un buffer RGBA plano en Float32Array RGB normalizado (media/std ImageNet); layout nhwc por defecto o nchw según el tensor del modelo.
export function normalizeRGBA(
  rgbaData,
  width = 224,
  height = 224,
  options = {},
) {
  const { layout = "nhwc" } = options;
  const numPixels = width * height;
  const input = new Float32Array(numPixels * 3);

  if (layout === "nchw") {
    // Planos separados: primero todos los R, luego G, luego B.
    const gOffset = numPixels;
    const bOffset = numPixels * 2;
    for (let i = 0; i < numPixels; i++) {
      input[i] =
        (rgbaData[i * 4 + 0] / 255.0 - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
      input[gOffset + i] =
        (rgbaData[i * 4 + 1] / 255.0 - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
      input[bOffset + i] =
        (rgbaData[i * 4 + 2] / 255.0 - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
    }
    return input;
  }

  // nhwc (intercalado)
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
