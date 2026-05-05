# TypeScript Configuration Setup

This document explains how TypeScript is configured across the monorepo — the shared
config package, how each app/package extends it, and the key decisions behind the setup.

For ESLint configuration, see [LINTING.md](./LINTING.md).

---

## Shared Config Package — `@genuin/typescript-config`

**Location:** `packages/typescript-config/`

All TypeScript configuration lives here. No app or package defines its own compiler
options from scratch — they extend one of three presets.

### Presets

| File                 | Extends     | Used by                              |
| -------------------- | ----------- | ------------------------------------ |
| `base.json`          | —           | Scripts, root config                 |
| `react-library.json` | `base.json` | `packages/ui`, `packages/components` |
| `nextjs.json`        | `base.json` | `apps/webapp`, `apps/legacy-webapp`  |

---

### `base.json`

Foundation for all configs. Sets strict TypeScript and ESM defaults.

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "moduleDetection": "force",
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": false
  }
}
```

Key decisions:

- `noUncheckedIndexedAccess` — array/object index access returns `T | undefined`, preventing silent runtime errors
- `isolatedModules` — required for transpile-only builds (Babel, esbuild, swc)
- `moduleDetection: "force"` — all files treated as modules, prevents accidental global scope leaks

---

### `react-library.json`

Extends `base.json`. Adds JSX support for library packages that ship React components.

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

`react-jsx` uses the automatic JSX runtime — no `import React` needed in component files.

---

### `nextjs.json`

Extends `base.json`. Overrides module system for Next.js bundler compatibility.

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

Key differences from `base.json`:

- `module: "ESNext"` + `moduleResolution: "Bundler"` — required by Next.js/webpack, not Node.js
- `jsx: "preserve"` — Next.js handles JSX transform itself
- `noEmit: true` — Next.js emits files, not `tsc`

---

## Per-Package Configuration

### `apps/webapp`

```json
{
  "extends": "@genuin/typescript-config/nextjs.json",
  "compilerOptions": {
    "types": ["react", "react-dom", "node"],
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@services/*": ["./src/services/*"],
      "auth": ["./auth"],
      "@genuin/ui": ["../../packages/ui/dist/types"],
      "@genuin/components": ["../../packages/components/dist/types"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", "next-env.d.ts", "types/next-auth.d.ts", ".next/types/**/*.ts"]
}
```

`@genuin/ui` and `@genuin/components` paths point to `dist/types` — compiled type declarations,
not source. This means you must run `pnpm build` in those packages before typechecking the webapp.

---

### `packages/ui`

```json
{
  "extends": "@genuin/typescript-config/react-library.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "composite": true,
    "incremental": true,
    "outDir": "dist/types",
    "rootDir": "src",
    "types": ["react", "react-dom", "node"],
    "paths": {
      "@genuin/ui": ["./src"],
      "@genuin/ui/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- `composite: true` + `incremental: true` — enables TypeScript project references and caching
- `outDir: "dist/types"` — where `.d.ts` files are emitted for downstream consumers

---

### `packages/components`

```json
{
  "extends": "@genuin/typescript-config/react-library.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "composite": true,
    "incremental": true,
    "outDir": "dist/types",
    "rootDir": "src",
    "paths": {
      "@genuin/components": ["./src/index.ts"],
      "@genuin/ui": ["../ui/src"],
      "@genuin/ui/*": ["../ui/src/*"]
    }
  },
  "references": [{ "path": "../ui" }]
}
```

`references` declares a project dependency on `packages/ui` — TypeScript uses this
for correct incremental build ordering.

---

### `packages/web-sdk`

```json
{
  "extends": "@genuin/typescript-config/base.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "sourceMap": true,
    "declaration": false,
    "declarationMap": false,
    "noEmit": false,
    "verbatimModuleSyntax": false,
    "paths": {
      "@genuin/ui": ["../ui/src"],
      "@genuin/components": ["../components/src"],
      "@/*": ["./src/*"]
    }
  },
  "references": [{ "path": "../ui" }, { "path": "../components" }]
}
```

Key differences from other packages:

- `declaration: false` — web-sdk ships a browser bundle, not an npm library
- `noEmit: false` — `tsc` is used for typecheck; Rollup handles the actual emit
- `verbatimModuleSyntax: false` — Rollup handles type-only import erasure
- `target: "ES2020"` — slightly wider browser compatibility than base `ES2022`

---

### `scripts/` (root)

```json
{
  "extends": "@genuin/typescript-config/base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node"],
    "noEmit": true
  },
  "include": ["./**/*.ts"]
}
```

---

## Path Aliases Summary

| Package               | Alias                | Resolves to                            |
| --------------------- | -------------------- | -------------------------------------- |
| `apps/webapp`         | `@/*`                | `./src/*`                              |
| `apps/webapp`         | `@genuin/ui`         | `../../packages/ui/dist/types`         |
| `apps/webapp`         | `@genuin/components` | `../../packages/components/dist/types` |
| `packages/components` | `@genuin/ui`         | `../ui/src`                            |
| `packages/web-sdk`    | `@genuin/ui`         | `../ui/src`                            |
| `packages/web-sdk`    | `@genuin/components` | `../components/src`                    |

`apps/webapp` points to compiled `dist/types` for shared packages.
All other packages resolve to source (`src`) directly.

---

## ESLint and TypeScript Integration

Type-aware linting (`parserOptions.project`) is enabled only in:

- `apps/webapp` — via `eslint.config.mjs` `parserOptions`
- `apps/legacy-webapp` — via `eslint.config.mjs` `parserOptions`

Other packages use standard linting without type resolution for performance.
See [LINTING.md](./LINTING.md) for full ESLint setup.

---

## Build Order

TypeScript project references enforce this build order:

```
packages/ui → packages/components → packages/web-sdk
                                  → apps/webapp
```

Run from root:

```sh
pnpm build          # builds all packages in dependency order via Turborepo
pnpm typecheck      # type-checks all packages
pnpm turbo clean    # clears all .tsbuildinfo and dist caches
```

---

## Adding a New Package

1. Create `tsconfig.json` extending the appropriate preset:
   - React library → `@genuin/typescript-config/react-library.json`
   - Next.js app → `@genuin/typescript-config/nextjs.json`
   - Node script → `@genuin/typescript-config/base.json`
2. Add `"typecheck": "tsc --noEmit"` to `package.json`
3. If the package depends on `packages/ui` or `packages/components`, add `"references"` entries
4. If other packages will consume your types, add `"composite": true` and set `"outDir": "dist/types"`

---

## Troubleshooting

| Symptom                                     | Cause                                    | Fix                                                      |
| ------------------------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| `Cannot find module '@genuin/ui'` in webapp | `packages/ui` not built                  | `pnpm --filter @genuin/ui build`                         |
| Stale type errors after changing a package  | Incremental cache out of date            | `pnpm turbo clean && pnpm build`                         |
| `moduleResolution` errors in new files      | Wrong preset for the context             | Use `bundler` for Vite/webpack, `NodeNext` for pure Node |
| `verbatimModuleSyntax` errors               | Type-only imports missing `type` keyword | Add `type` to import: `import type { Foo }`              |
