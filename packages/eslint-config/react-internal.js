import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * ESLint configuration for React library packages.
 * Extends base — do not include base, js.configs.recommended, or tseslint here.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
      import: pluginImport,
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {},
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          // CSS side-effect imports (e.g. "swiper/css", "foo.css") must be last.
          pathGroups: [
            { pattern: "**/*.css", group: "index", position: "after" },
            { pattern: "*/css", group: "index", position: "after" },
            { pattern: "*/css/**", group: "index", position: "after" },
          ],
          // Allow external CSS packages (e.g. swiper/css) to match pathGroups.
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc" },
          warnOnUnassignedImports: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    },
  },
];
