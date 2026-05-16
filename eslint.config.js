// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier/flat");
const prettierPlugin = require("eslint-plugin-prettier");
const globals = require("globals");

module.exports = defineConfig([
  expoConfig,
  prettierConfig, // equivalente a extends: ["prettier"] (desactiva reglas que chocan)
  {
    plugins: { prettier: prettierPlugin }, // equivalente a plugins: ["prettier"]
    rules: {
      "prettier/prettier": "error", // equivalente a rules: { "prettier/prettier": "error" }
    },
  },
  {
    files: ["__tests__/**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      "import/first": "off", // jest.mock() debe ir antes de los imports (patrón obligatorio)
    },
  },
  {
    ignores: ["dist/**"],
  },
]);
