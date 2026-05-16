// Silenciar los 70+ console.log de producción durante los tests para output limpio.
// console.error se mantiene visible para diagnóstico de fallos.
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
};

// lib/supabase.ts importa estos módulos como side effects en el nivel de módulo.
// Si no se mockean antes de que se importe lib/supabase.ts, el proceso de Node falla
// porque estas librerías intentan acceder a APIs nativas de React Native.
jest.mock('react-native-url-polyfill/auto', () => {});
jest.mock('react-native-get-random-values', () => {});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));
