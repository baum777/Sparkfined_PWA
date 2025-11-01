/** @type {import('eslint').Linter.FlatConfig[]} */
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    plugins: { react },
    rules: {
      "react/react-in-jsx-scope": "off"
    }
  }
];

