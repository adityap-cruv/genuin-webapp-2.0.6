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
- When adding a new package/app, add an `eslint.config.mjs` that re-exports the shared config.
