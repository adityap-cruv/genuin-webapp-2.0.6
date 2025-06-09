# UI Package Path Resolution Guide (Monorepo)

This document describes the recommended approach for resolving and using relative paths for the `@genuin/ui` package and its consumers (`@genuin/components`, `webapp`, and `web-sdk`) in the Genuin monorepo. Follow these steps to ensure consistent, reliable, and maintainable imports across all packages.

---

## 1. UI Package (`packages/ui`) Path Configuration

- Ensure `tsconfig.json` in `packages/ui` defines clear path aliases:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@icons/*": ["./src/icons/*"]
    }
  }
}
```

- Use barrel exports (`index.ts`) in each component directory for clean imports.
- In `package.json`, use the `exports` field to expose components:

```jsonc
"exports": {
  ".": "./src/index.ts",
  "./button": "./src/components/button/index.ts",
  "./avatar": "./src/components/avatar/index.ts",
  // ...other components
}
```

---



## 2. Components Package (`packages/components`) Path Configuration

- Define path aliases in `packages/components/tsconfig.json` for internal imports, following atomic design structure:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@templates/*": ["./src/templates/*"],
      "@pages/*": ["./src/page/*"],
      "@organisms/*": ["./src/organisms/*"],
      "@molecules/*": ["./src/molecules/*"],
      "@atoms/*": ["./src/atoms/*"],
      "@hooks/*": ["./src/react-query/*"],
      "@types/*": ["./src/types/*"],
      "@context/*": ["./src/context/*"],
      "@lib/*": ["./src/lib/*"]
    }
  }
}
```

- Use these aliases for all internal imports:

```ts
// GOOD: Use path aliases
import { Feed } from "@templates/feed";
import { Actions } from "@molecules/actions";
import { useFeedContext } from "@templates/feed/context";
import type { PostDetailsType } from "@hooks/api/feed/schema";
import type { CommunityUserRole } from "@types/post";

// BAD: Don't use relative paths
import { Feed } from "../../templates/feed";
// BAD: Don't use src/ paths - these won't work when consumed by other packages
import { Actions } from "src/molecules/actions";
```

- Mark components with React hooks as Client Components:

```ts
// For components using React hooks
"use client";

import { Feed } from "@templates/feed";

export function Component() {
  // ...
}
```

---

## 3. Consuming Packages (`components`, `webapp`, `web-sdk`) Path Configuration

- In each consumer's `tsconfig.json`, add path aliases for the UI and components packages:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@genuin/ui": ["../../packages/ui/src"],
      "@genuin/ui/*": ["../../packages/ui/src/*"],
      "@genuin/components": ["../../packages/components/src"],
      "@genuin/components/*": ["../../packages/components/src/*"]
    }
  }
}
```

- Always use workspace protocol for internal dependencies in `package.json`:

```jsonc
"@genuin/ui": "workspace:*",
"@genuin/components": "workspace:*"
```

---


## 3. Import Patterns

**Preferred Approach (to be used everywhere):**

- Always import specific components directly from their subpath for optimal tree-shaking and clarity:

```ts
import { Button } from "@genuin/ui/button";
import { Loader } from "@genuin/ui/loader";
```

> **Note:** This is now the required import style for all consuming packages (`components`, `webapp`, `web-sdk`).

**Do not** use relative imports like `../../ui` or import everything from the main entry point in production code.

---

---



## 4. Build Tool Configuration

### Next.js (webapp)
- In `next.config.js`:

```js
const nextConfig = {
  transpilePackages: ["@genuin/ui", "@genuin/components"],
  experimental: {
    optimizePackageImports: ["@genuin/ui", "@genuin/components"]
  },
  // Add webpack config for resolving path aliases in external packages
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Make Next.js aware of the components package's aliases if needed
      "@templates": require('path').resolve(__dirname, '../../packages/components/src/templates'),
      "@pages": require('path').resolve(__dirname, '../../packages/components/src/page'),
      "@organisms": require('path').resolve(__dirname, '../../packages/components/src/organisms'),
      "@molecules": require('path').resolve(__dirname, '../../packages/components/src/molecules'),
      // Add other aliases as needed
    };
    return config;
  }
};
```

### Rollup (web-sdk)
- Ensure Rollup resolves UI package imports correctly, e.g.:

```js
resolve({
  extensions: [".js", ".jsx", ".ts", ".tsx"],
  preferBuiltins: false,
  dedupe: ["react", "react-dom"],
  // Add alias configuration for components packages
  alias: {
    "@templates": path.resolve(__dirname, "../../packages/components/src/templates"),
    "@pages": path.resolve(__dirname, "../../packages/components/src/page"),
    // Add other aliases as needed
  }
})
```

### Rollup (web-sdk)
- Ensure Rollup resolves UI package imports correctly, e.g.:

```js
resolve({
  extensions: [".js", ".jsx", ".ts", ".tsx"],
  preferBuiltins: false,
  dedupe: ["react", "react-dom"],
})
```

---


## 5. General Best Practices

- Never use relative paths like `../../ui` or `../../templates` in consumer packages; always use the package alias.
- Use barrel exports for maintainability.
- Keep all internal imports within packages using path aliases (like `@templates/feed`).
- For components with React hooks, mark them with `"use client";` directive.
- Run `pnpm install` after any changes to dependencies or path configs.
- Test imports in all consuming packages after changes.

---



## 6. Example Usage

```tsx
// Inside UI package
import { cn } from "@lib/utils";

// Inside Components package
import { Feed } from "@templates/feed";
import { GenericDetails } from "@organisms/generic-details";
import { useFeedContext } from "@templates/feed/context";
import type { PostDetailsType } from "@hooks/api/feed/schema";

// Inside webapp
import { Button } from "@genuin/ui/button";
import { Home } from "@genuin/components/page/home/home";

export function Example() {
  return (
    <div>
      <Button>Click</Button>
      <Home />
    </div>
  );
}
```

---


## 7. Troubleshooting

- If imports fail, check:
  - Path aliases in all `tsconfig.json` files
  - `exports` field in `ui/package.json`
  - That you ran `pnpm install` after changes
  - That your IDE recognizes the monorepo structure
  - In Next.js, you may need webpack config to resolve external package aliases
- For build issues, ensure `transpilePackages` and `optimizePackageImports` are set in Next.js config.
- For components package imports in consuming packages, ensure webpack alias resolution is properly configured.

---

## 8. References
- [MONOREPO_CONVERSION.md](../MONOREPO_CONVERSION.md)
- [TAILWIND_V4_MIGRATION_GUIDE.md](../TAILWIND_V4_MIGRATION_GUIDE.md)
- [UPGRADE_GUIDE.md](../UPGRADE_GUIDE.md)

---

---



## Progress Log

- [x] UI package (`packages/ui`) path aliases and exports updated
- [x] All internal imports in UI package use preferred subpath import style
- [x] Storybook for UI package tested and working with new import style
- [x] Update `packages/components` to use preferred subpath imports from `@genuin/ui` (already in use and verified)
- [ ] Update `packages/components/tsconfig.json` with all required atomic design path aliases
- [ ] Scan all components package files for `src/` imports and replace with path aliases
- [ ] Add "use client" directive to all components using React hooks
- [ ] Test the components package to ensure all imports resolve correctly
- [ ] Update webpack configuration in consuming packages to resolve components path aliases
- [ ] Update `webapp` and `web-sdk` to use preferred subpath imports from `@genuin/ui` and `@genuin/components`

_Keep this document up to date as the monorepo evolves._
