/** @type {import('eslint').Linter.FlatConfig[]} */
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.ts", "scripts/**", "wireframes/**"]
  },
  // Service Worker files (public/push/sw.js)
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        self: "readonly",
        clients: "readonly",
        caches: "readonly",
        registration: "readonly",
        addEventListener: "readonly",
        fetch: "readonly",
        console: "readonly"
      },
      sourceType: "script"
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ["**/*.{ts,tsx}"]
  })),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    plugins: { 
      react,
      'jsx-a11y': jsxA11y
    },
    rules: {
      // React
      "react/react-in-jsx-scope": "off",
      
      // TypeScript
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/prefer-promise-reject-errors": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "no-useless-escape": "off",
      
      // A11y (warnings only, not blocking)
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/heading-has-content": "warn",
      "jsx-a11y/html-has-lang": "warn",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/no-autofocus": "off", // Allow autofocus in modals
      "jsx-a11y/role-has-required-aria-props": "warn"
    }
  }
];

