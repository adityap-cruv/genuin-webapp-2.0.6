import js from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import tanstackQuery from "@tanstack/eslint-plugin-query";

import baseConfig from "./base.js";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 */
export default [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      "@next/next": pluginNext,
      "@tanstack/query": tanstackQuery,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
      ...tanstackQuery.configs.recommended.rules,
      // Custom rules ported from old .eslintrc.json
      "@typescript-eslint/no-unused-vars": "error",
      "react/no-unknown-property": [
        "error",
        {
          ignore: ["fetchPriority"],
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "no-console": "warn",
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      // Prettier formatting as warning (optional, since config-prettier disables formatting rules)
      // If you want Prettier errors as warnings in editor, uncomment below:
      // "prettier/prettier": ["warn", { "endOfLine": "auto" }],
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  // Add ignore patterns for config files
  {
    ignores: [
      "dist/**",
      "postcss.config.js",
      "next.config.js",
      ".next/**",
      "eslint.config.*",
      "*.config.ts",
    ],
  },
];
