# Linting & ESLint Setup for Genuin Monorepo

## Shared ESLint Configuration

- All ESLint plugins and dependencies are declared in the root `package.json`.
- The shared config is in `packages/eslint-config` and uses the [flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new).
- Each app/package has an `eslint.config.mjs` that re-exports the shared config:

  ```js
  export { default } from "../../packages/eslint-config/index.js";
  ```

````

---

## Migration & Advanced Usage (2025)

### Centralized ESLint Setup

- **All ESLint plugins and devDependencies are now managed in the root `package.json`.** Do not add ESLint-related dependencies to individual packages.
- **Flat config format** (`eslint.config.mjs`/`.js`) is used everywhere, with ESM syntax only.
- The shared config lives in `packages/eslint-config/` and is imported by each app/package.

### Type-Aware Linting

- **Type-aware linting (TypeScript project references) is enabled only for the webapp** (`apps/webapp/eslint.config.mjs`) for performance and compatibility. Other packages use standard linting.
- The webapp config uses `parserOptions.project` and `tsconfigRootDir` for correct type resolution.

### Prettier Integration

- The Prettier plugin is enabled in the webapp config for formatting warnings (not auto-fixes). This helps enforce code style without conflicting with Prettier's own CLI.

### Ignore Patterns

- The following are ignored from linting (see shared config for details):
  - `.next/**` (Next.js build output)
  - `eslint.config.*` (config files)
  - `*.config.ts` (build/config scripts)
  - `node_modules/**`, `dist/**`, and other standard build artifacts

### Plugin Compatibility

- **TanStack Query ESLint plugin v5.78.0** is now compatible with ESLint v9 and fully enabled.
- All query-related rules are active and will help catch common React Query usage mistakes.

### Adding Package-Specific Overrides

- To add custom rules for a package, import and spread the shared config in that package's `eslint.config.mjs`, then add your overrides:

  ```js
  import sharedConfig from '../../packages/eslint-config/index.js';
  export default [
    ...sharedConfig,
    // your overrides here
  ];
````

### Editor & CI Integration

- Use the VS Code ESLint extension for real-time feedback.
- Linting is included in the Turborepo pipeline and should be run before all commits/PRs.

### Temporary Suppression of Lint Warnings (2025)

- **TODO [eslint-migration]:** Most common warnings (unused vars, explicit `any`, import order, Prettier, etc.) are temporarily suppressed in both `apps/webapp/eslint.config.mjs` and `packages/ui/eslint.config.mjs` to enable a smooth migration.
- See each package's `eslint.config.mjs` for all suppressed rules and `TODO` comments.
- These rules should be re-enabled and cleaned up incrementally as part of future technical debt sprints. Prioritize re-enabling rules that impact code safety, maintainability, and public API quality in the UI library.

### Troubleshooting

- If you see type resolution errors, ensure you are using Node.js >=20.12 and have run `pnpm install` at the root.
- For cache issues, run `pnpm turbo clean`.

### References

- [ESLint Flat Config Docs](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrating-to-flat-config)
- [Prettier Plugin Docs](https://github.com/prettier/eslint-plugin-prettier)

---

(Adjust the path as needed for each package.)

- To add package-specific overrides, import and spread the shared config, then add your overrides:

  ```js
  import sharedConfig from "../../packages/eslint-config/index.js";
  export default [
    ...sharedConfig,
    // your overrides here
  ];
  ```

## Running Lint

- `pnpm lint` — Lints all packages and apps using the shared config.
- `pnpm lint:fix` — (if configured) Auto-fixes fixable issues.

## Editor Integration

For best results, use VS Code with the ESLint extension. The workspace includes `.vscode/settings.json` to enable linting in all relevant packages.

## Turbo Pipeline

Linting is included in the `turbo.json` pipeline for all packages.

## Maintenance

- Update plugins and rules in the root and `packages/eslint-config` only.
- # When adding a new package/app, add an `eslint.config.mjs` that re-exports the shared config.

# Linting & Formatting Setup for Genuin Monorepo

## Architecture

All ESLint rules are defined exclusively in `packages/eslint-config`. Apps and packages
import a preset from there and only add environment-specific config (parser project path,
globals, ignores, migration suppressions). **No app defines its own rules or imports
ESLint plugins directly.**

### Shared config structure

| File                                       | Purpose                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `packages/eslint-config/base.js`           | `@eslint/js`, `typescript-eslint`, `eslint-config-prettier`, Turbo plugin |
| `packages/eslint-config/react-internal.js` | React, React Hooks, `eslint-plugin-import`                                |
| `packages/eslint-config/next.js`           | Next.js, TanStack Query, React (for Next.js apps)                         |
| `packages/eslint-config/index.js`          | Composes all three in order: `[...base, ...reactInternal, ...next]`       |

Each sub-config is **self-contained** — `react-internal.js` and `next.js` do NOT
internally extend `base.js`. This prevents rule duplication.

---

## App / Package Configs

Each app/package has an `eslint.config.mjs` that does one of:

**Next.js apps** (`apps/webapp`, `apps/legacy-webapp`) — use the full preset:

```js
import sharedConfig from "../../packages/eslint-config/index.js";
import globals from "globals";

const tsconfigRootDir = new URL(".", import.meta.url).pathname;

export default [
  ...sharedConfig,
  { ignores: ["..."] },
  {
    languageOptions: {
      parserOptions: { project: "./tsconfig.json", tsconfigRootDir },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    rules: {
      // migration suppressions only — no rule definitions
    },
  },
];
```

**React library packages** (`packages/web-sdk`) — use base + react-internal only (no Next.js):

```js
import base from "../eslint-config/base.js";
import reactInternal from "../eslint-config/react-internal.js";

export default [...base, ...reactInternal, { ignores: ["dist/**"] }];
```

**UI/component packages** (`packages/ui`, `packages/components`) — use the full preset
with `@next/next` rules disabled (library packages don't need them):

```js
import sharedConfig from "../eslint-config/index.js";

export default [
  ...sharedConfig,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      // migration suppressions only
    },
  },
];
```

---

## Prettier Integration

Prettier is **not** run as an ESLint rule. The integration is:

1. `eslint-config-prettier` (included in `base.js`) — disables ESLint formatting rules
   that would conflict with Prettier
2. `prettier` CLI — runs separately via `pnpm format`

Do not add `eslint-plugin-prettier` to any config. It is redundant and slow.

### Prettier config

Root `.prettierrc.json` is the single source of truth. All packages inherit it.
Apps that use Tailwind CSS also add `prettier-plugin-tailwindcss` in their local
`.prettierrc.json`.

| Setting           | Value |
| ----------------- | ----- |
| `printWidth`      | 120   |
| `singleQuote`     | true  |
| `semi`            | false |
| `trailingComma`   | "es5" |
| `tabWidth`        | 2     |
| `bracketSameLine` | true  |
| `endOfLine`       | "lf"  |

---

## Running Lint & Format

```sh
pnpm lint              # Lint all packages via Turborepo
pnpm format            # Format all .ts, .tsx, .js, .mjs, .json, .md files

# Per-package
pnpm --filter @genuin/webapp lint
pnpm --filter @genuin/webapp lint:fix   # auto-fix
pnpm --filter @genuin/web-sdk lint
pnpm --filter @genuin/components lint
```

---

## Type-Aware Linting

Enabled only in `apps/webapp` and `apps/legacy-webapp` via `parserOptions.project`.
Other packages use standard (non-type-aware) linting for performance.

---

## TanStack Query Rules

`@tanstack/eslint-plugin-query` v5.78.0+ is compatible with ESLint v9.
All recommended rules are active via `packages/eslint-config/next.js`.
Do not suppress them.

---

## Temporary Suppressions (Migration TODOs)

Common warnings are suppressed in app configs with `// TODO(eslint-migration):` comments.
Re-enable them incrementally. Prioritise:

1. `react-hooks/rules-of-hooks` — safety rule
2. `@typescript-eslint/no-unused-vars` — code quality
3. `no-console` — production hygiene
4. `import/order` — consistency

---

## Adding a New Package

1. Create `eslint.config.mjs` importing the appropriate preset from `packages/eslint-config`
2. Add `"lint": "eslint ."` and `"format": "prettier --write ."` to `package.json`
3. Create `.prettierrc.json` (copy from root or another package)
4. Do **not** import any ESLint plugins directly — add rules to `packages/eslint-config` if needed

---

## Troubleshooting

- **Type resolution errors**: ensure Node.js ≥20.12 and run `pnpm install` at root
- **Cache issues**: run `pnpm turbo clean`
- **Verify no rule duplication**: `cd apps/webapp && pnpm exec eslint --print-config src/app/page.tsx`

## References

- [ESLint Flat Config Docs](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Prettier Docs](https://prettier.io/docs/en/configuration.html)
- [TanStack Query ESLint Plugin](https://tanstack.com/query/latest/docs/eslint/eslint-plugin-query)
