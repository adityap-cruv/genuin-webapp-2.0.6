# Done-Definition Checklist

Run from the **repo root** with **pnpm** (never npm/yarn). Every command below must
PASS before a change is considered done. Scope `--filter <pkg>` to the package you
touched when a full run is unnecessary, but the gates themselves must be green.

## 0. Install / prepare (first run, or after dependency or style changes)

```bash
pnpm install          # installs deps; runs husky install, patches openplayerjs,
                      # installs Playwright browsers, and prebuilds package styles
```

- `packages/ui` and `packages/components` run `build:styles` on preinstall. If `gencl:`
  Tailwind utilities silently no-op, rebuild prebuilt CSS:
  ```bash
  pnpm --filter @genuin/ui build:styles
  pnpm --filter @genuin/components build:styles
  # or run the watchers while developing:
  pnpm --filter @genuin/ui dev:styles
  pnpm --filter @genuin/components dev:styles
  ```

## 1. Typecheck (TypeScript strict, all packages except legacy-webapp)

```bash
pnpm typecheck        # turbo run typecheck --filter=!./apps/legacy-webapp
```

## 2. Lint (ESLint 9 flat config, all packages except legacy-webapp)

```bash
pnpm lint             # turbo run lint --filter=!./apps/legacy-webapp
```

## 3. Format

```bash
pnpm format           # prettier --write "**/*.{ts,tsx,js,mjs,json,md}"
```

`pnpm format` WRITES changes. Run it, then re-stage; confirm `git status` shows only
intended formatting. (lint-staged + Husky also enforce Prettier on commit.)

## 4. Unit / component tests

```bash
pnpm --filter @genuin/ui test            # runs BOTH jest && vitest run (packages/ui)
# packages/components defines no test script (story-driven Vitest only).
```

## 5. Build (Turborepo standalone + library builds)

```bash
pnpm build            # turbo run build across apps + packages
pnpm check-build      # chunk-size gate (scripts/check-chunk-size.js) — CI fails on oversized client chunks
```

Web SDK environment builds (only when you touched `packages/web-sdk`):
```bash
pnpm --filter @genuin/web-sdk validate   # typecheck && build
pnpm --filter @genuin/web-sdk build:qa   # or build:prod (validate:env + syncVersion + genai-sdk + vite)
```

## 6. E2E / integration tests (Playwright) — when the change affects a user flow

```bash
pnpm test             # fans out: @genuin/web-sdk + @genuin/webapp Playwright suites
# scoped:
pnpm --filter @genuin/webapp test        # playwright test (app on :4005, mock server :4006)
pnpm --filter @genuin/web-sdk test       # playwright test (MSW-mocked)
```

Playwright requires its browsers (installed by `pnpm install` postinstall) and a
running/served target. Select elements by `data-testid` or ARIA role; no
`page.waitForTimeout()`.

## 7. Dependency hygiene (when you changed dependencies)

```bash
pnpm deps:validate    # syncpack list-mismatches + depcheck (unused)
```

## 8. Manual UI / runtime verification

- Web app: `pnpm dev:web` → http://localhost:4005; click through the affected route, check
  both light and `[data-mode="dark"]`. If running the webapp package directly, run
  `pnpm --filter @genuin/webapp styles:build` first so `@genuin/*/styles` CSS artifacts exist.
- Web SDK: `pnpm dev:sdk` → exercise the embed in the served test page; verify
  `window.genuin.init(...)` mounts the placement/embed and the player/feed renders.
- Storybook (for `packages/ui` / `packages/components` changes):
  `pnpm --filter @genuin/ui storybook` (:6006) / `pnpm --filter @genuin/components storybook` (:6005).
- Hierarchical tree dev surface (for `packages/hierarchical-tree` changes): run its
  `src/dev/` Vite surface and confirm Page artifacts render across breakpoints.
- **Video anywhere?** Confirm it is served by the Genuin Web SDK (placement/embed +
  `window.genuin.init`) per the `web-sdk-video-embed-skill` skill — never a plain `<video>`.

---

**Do not finalize until every check passes.**
