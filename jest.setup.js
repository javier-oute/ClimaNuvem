// Silencia los console.log de producción en los tests; console.error se mantiene visible.
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
};

// lib/supabase.ts importa estos módulos como side effects; hay que mockearlos antes o Node falla al acceder a APIs nativas.
jest.mock("react-native-url-polyfill/auto", () => {});
jest.mock("react-native-get-random-values", () => {});

// react-native-keyboard-controller no existe en Node: se usa el mock oficial del paquete.
jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest"),
);

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));
