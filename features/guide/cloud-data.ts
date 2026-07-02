// Datos no textuales de la guía (imágenes, categoría OMM, abreviatura, altitud, precipitación, riesgo); el texto vive en locales/*.guide.

export const CLOUD_KEYS = [
  "cirrus",
  "cirrocumulus",
  "cirrostratus",
  "altostratus",
  "altocumulus",
  "nimbostratus",
  "stratus",
  "stratocumulus",
  "cumulus",
  "cumulonimbus",
] as const;

export type CloudKey = (typeof CLOUD_KEYS)[number];
export type CloudCategory = "high" | "mid" | "low" | "vertical";

export function isCloudKey(x: unknown): x is CloudKey {
  return typeof x === "string" && (CLOUD_KEYS as readonly string[]).includes(x);
}

// Colores de la paleta de alertas del modelo (CLAUDE §5), por nivel de riesgo 0..4.
export const RISK_COLORS: Record<number, string> = {
  0: "#1D9E75", // sin riesgo (verde)
  1: "#378ADD", // posible cambio (azul)
  2: "#EF9F27", // precaución (naranja)
  3: "#E24B4A", // riesgo alto (rojo)
  4: "#7F77DD", // peligro / tormenta (violeta)
};

export interface CloudMeta {
  category: CloudCategory;
  abrev: string;
  riesgo: 0 | 1 | 2 | 3 | 4;
  riesgoColor: string;
}

const META: Record<CloudKey, Omit<CloudMeta, "riesgoColor">> = {
  cirrus: { category: "high", abrev: "Ci", riesgo: 1 },
  cirrocumulus: { category: "high", abrev: "Cc", riesgo: 1 },
  cirrostratus: { category: "high", abrev: "Cs", riesgo: 1 },
  altostratus: { category: "mid", abrev: "As", riesgo: 2 },
  altocumulus: { category: "mid", abrev: "Ac", riesgo: 1 },
  nimbostratus: { category: "mid", abrev: "Ns", riesgo: 2 },
  stratus: { category: "low", abrev: "St", riesgo: 2 },
  stratocumulus: { category: "low", abrev: "Sc", riesgo: 1 },
  cumulus: { category: "vertical", abrev: "Cu", riesgo: 2 },
  cumulonimbus: { category: "vertical", abrev: "Cb", riesgo: 4 },
};

// Manifiesto estático de imágenes (8 por género); el orden define el del carrusel.
const IMAGES: Record<CloudKey, number[]> = {
  cirrus: [
    require("../../assets/images/clouds/cirrus-01.jpg"),
    require("../../assets/images/clouds/cirrus-02.jpg"),
    require("../../assets/images/clouds/cirrus-03.jpg"),
    require("../../assets/images/clouds/cirrus-04.jpg"),
    require("../../assets/images/clouds/cirrus-05.jpg"),
    require("../../assets/images/clouds/cirrus-06.jpg"),
    require("../../assets/images/clouds/cirrus-07.jpg"),
    require("../../assets/images/clouds/cirrus-08.jpg"),
  ],
  cirrocumulus: [
    require("../../assets/images/clouds/cirrocumulus-01.jpg"),
    require("../../assets/images/clouds/cirrocumulus-02.jpeg"),
    require("../../assets/images/clouds/cirrocumulus-03.jpg"),
    require("../../assets/images/clouds/cirrocumulus-04.jpg"),
    require("../../assets/images/clouds/cirrocumulus-05.jpg"),
    require("../../assets/images/clouds/cirrocumulus-06.jpg"),
    require("../../assets/images/clouds/cirrocumulus-07.jpg"),
    require("../../assets/images/clouds/cirrocumulus-08.jpg"),
  ],
  cirrostratus: [
    require("../../assets/images/clouds/cirrostratus-01.jpeg"),
    require("../../assets/images/clouds/cirrostratus-02.jpeg"),
    require("../../assets/images/clouds/cirrostratus-03.jpeg"),
    require("../../assets/images/clouds/cirrostratus-04.jpeg"),
    require("../../assets/images/clouds/cirrostratus-05.jpeg"),
    require("../../assets/images/clouds/cirrostratus-06.jpeg"),
    require("../../assets/images/clouds/cirrostratus-07.jpg"),
    require("../../assets/images/clouds/cirrostratus-08.jpg"),
  ],
  altostratus: [
    require("../../assets/images/clouds/altostratus-01.jpeg"),
    require("../../assets/images/clouds/altostratus-02.jpg"),
    require("../../assets/images/clouds/altostratus-03.jpeg"),
    require("../../assets/images/clouds/altostratus-04.jpeg"),
    require("../../assets/images/clouds/altostratus-05.jpg"),
    require("../../assets/images/clouds/altostratus-06.jpg"),
    require("../../assets/images/clouds/altostratus-07.webp"),
    require("../../assets/images/clouds/altostratus-08.jpeg"),
  ],
  altocumulus: [
    require("../../assets/images/clouds/altocumulus-01.jpg"),
    require("../../assets/images/clouds/altocumulus-02.jpg"),
    require("../../assets/images/clouds/altocumulus-03.jpg"),
    require("../../assets/images/clouds/altocumulus-04.jpg"),
    require("../../assets/images/clouds/altocumulus-05.jpg"),
    require("../../assets/images/clouds/altocumulus-06.webp"),
    require("../../assets/images/clouds/altocumulus-07.jpg"),
    require("../../assets/images/clouds/altocumulus-08.jpeg"),
  ],
  nimbostratus: [
    require("../../assets/images/clouds/nimbostratus-01.jpg"),
    require("../../assets/images/clouds/nimbostratus-02.jpeg"),
    require("../../assets/images/clouds/nimbostratus-03.jpg"),
    require("../../assets/images/clouds/nimbostratus-04.jpeg"),
    require("../../assets/images/clouds/nimbostratus-05.jpeg"),
    require("../../assets/images/clouds/nimbostratus-06.jpeg"),
    require("../../assets/images/clouds/nimbostratus-07.jpg"),
    require("../../assets/images/clouds/nimbostratus-08.jpg"),
  ],
  stratus: [
    require("../../assets/images/clouds/stratus-01.jpeg"),
    require("../../assets/images/clouds/stratus-02.jpg"),
    require("../../assets/images/clouds/stratus-03.jpg"),
    require("../../assets/images/clouds/stratus-04.jpeg"),
    require("../../assets/images/clouds/stratus-05.jpeg"),
    require("../../assets/images/clouds/stratus-06.jpeg"),
    require("../../assets/images/clouds/stratus-07.jpeg"),
    require("../../assets/images/clouds/stratus-08.jpg"),
  ],
  stratocumulus: [
    require("../../assets/images/clouds/stratocumulus-01.jpg"),
    require("../../assets/images/clouds/stratocumulus-02.jpeg"),
    require("../../assets/images/clouds/stratocumulus-03.jpeg"),
    require("../../assets/images/clouds/stratocumulus-04.jpeg"),
    require("../../assets/images/clouds/stratocumulus-05.jpeg"),
    require("../../assets/images/clouds/stratocumulus-06.jpeg"),
    require("../../assets/images/clouds/stratocumulus-07.jpeg"),
    require("../../assets/images/clouds/stratocumulus-08.jpeg"),
  ],
  cumulus: [
    require("../../assets/images/clouds/cumulus-01.jpg"),
    require("../../assets/images/clouds/cumulus-02.jpg"),
    require("../../assets/images/clouds/cumulus-03.jpeg"),
    require("../../assets/images/clouds/cumulus-04.jpeg"),
    require("../../assets/images/clouds/cumulus-05.jpg"),
    require("../../assets/images/clouds/cumulus-06.jpg"),
    require("../../assets/images/clouds/cumulus-07.jpeg"),
    require("../../assets/images/clouds/cumulus-08.jpg"),
  ],
  cumulonimbus: [
    require("../../assets/images/clouds/cumulonimbus-01.jpg"),
    require("../../assets/images/clouds/cumulonimbus-02.jpg"),
    require("../../assets/images/clouds/cumulonimbus-03.jpeg"),
    require("../../assets/images/clouds/cumulonimbus-04.jpeg"),
    require("../../assets/images/clouds/cumulonimbus-05.webp"),
    require("../../assets/images/clouds/cumulonimbus-06.jpg"),
    require("../../assets/images/clouds/cumulonimbus-07.webp"),
    require("../../assets/images/clouds/cumulonimbus-08.jpg"),
  ],
};

export function getCloudImages(type: CloudKey): number[] {
  return IMAGES[type];
}

export function getCloudMeta(type: CloudKey): CloudMeta {
  const m = META[type];
  return { ...m, riesgoColor: RISK_COLORS[m.riesgo] };
}
