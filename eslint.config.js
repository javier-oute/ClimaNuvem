// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier/flat");
const prettierPlugin = require("eslint-plugin-prettier");

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
    ignores: ["dist/**"],
  },
]);
