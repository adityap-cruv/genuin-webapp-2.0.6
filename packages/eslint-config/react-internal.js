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
        // Explicit project glob: the resolver's own tsconfig lookup walks up
        // from `process.cwd()`, not from each linted file's directory. ESLint
        // is invoked both from the repo root (root `pnpm lint-staged`) and from
        // an individual package dir (`pnpm --filter <pkg> lint`) — cover the
        // tsconfig depth for both: "./tsconfig.json" (cwd = package dir),
        // "*/tsconfig.json" (cwd = repo root, package one level down), and
        // "*/*/tsconfig.json" (cwd = repo root, package two levels down, e.g.
        // apps/webapp or a future nested package).
        typescript: {
          project: ["tsconfig.json", "*/tsconfig.json", "*/*/tsconfig.json"],
          noWarnOnMultipleProjects: true,
        },
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
      // Force every lazy/dynamic-import boundary through <SafeSuspense> (which
      // pairs Suspense with a AppErrorBoundary) so a failed chunk can't unwind
      // to the React root and blank the embed. This targets the JSX element
      // (both `<Suspense>` and `<React.Suspense>`) — the actual render is what
      // matters, and unlike an import-name ban it doesn't false-positive on
      // `import * as React`. Intentional bare-Suspense sites (the wrapper itself,
      // or a parent that already drives chunk-retry) opt out with an explanatory
      // `// eslint-disable-next-line no-restricted-syntax` comment.
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='Suspense']",
          message:
            "Use <SafeSuspense> (@genuin/components/molecules/error/safe-suspense), not bare <Suspense>. " +
            "If a parent already contains chunk-load failures, opt out with an explanatory eslint-disable.",
        },
        {
          selector: "JSXMemberExpression[property.name='Suspense']",
          message: "Use <SafeSuspense>, not React.Suspense.",
        },
      ],
    },
  },
  {
    // The SafeSuspense wrapper itself must render the real <Suspense>.
    // Storybook stories are never shipped in the SDK bundle, so a bare
    // <Suspense> there can't blank a production embed — exempt them too.
    files: ["**/molecules/error/safe-suspense.tsx", "**/*.stories.tsx", "**/*.stories.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];
