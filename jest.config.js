/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",

  // Node es suficiente para tests de funciones puras e integración con mocks.
  testEnvironment: "node",

  testMatch: ["**/__tests__/**/*.test.[jt]s", "**/__tests__/**/*.test.[jt]sx"],

  // Resolver el alias @/ -> raíz del proyecto (igual que tsconfig paths)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Extendemos el transformIgnorePatterns de jest-expo para incluir módulos
  // adicionales que pueden publicarse como ESM (nativewind, zustand v5).
  // El patrón de jest-expo ya incluye expo, @expo, react-native, @react-native.
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|nativewind|zustand|@supabase))",
    "/node_modules/react-native-reanimated/plugin/",
  ],

  // Archivos que se ejecutan DESPUÉS de que Jest inicializa el entorno de test.
  // Nota: jest-expo usa `setupFiles` (ANTES del entorno) para su propia config.
  // Nosotros usamos `setupFilesAfterEnv` para mocks globales de módulos nativos.
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Cobertura sobre la lógica crítica testeada (pura + capa de datos).
  collectCoverageFrom: [
    "lib/format.js",
    "lib/mlNormalize.js",
    "lib/forecast/model-meta.js",
    "lib/forecast/evaluateForecast.js",
    "lib/forecastHistory.js",
    "lib/communityMap.js",
    "stores/forecast.store.js",
    "stores/profile.store.image.js",
    "stores/settings.store.js",
    "utils/phone.js",
    "utils/username.js",
  ],

  verbose: true,
};
