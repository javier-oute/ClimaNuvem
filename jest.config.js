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

  // Extiende transformIgnorePatterns de jest-expo con módulos ESM extra (nativewind, zustand v5).
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|nativewind|zustand|@supabase))",
    "/node_modules/react-native-reanimated/plugin/",
  ],

  // Archivos ejecutados tras inicializar el entorno (setupFilesAfterEnv) para mocks globales de módulos nativos.
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
