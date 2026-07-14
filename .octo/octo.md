# Octo Instructions — Genuin Webapp + Web SDK Monorepo

Single source of truth for working in this repository. All base instructions live in
this file; reusable procedures live in `.octo/skills/` (indexed in
`.octo/skills/README.md`). Secrets references (if any) live in `.octo/env.toml`.

> **⚠ ALWAYS-ON MANDATORY SKILLS — check these FIRST, before any other skill.** Four
> skills are non-negotiable; apply each whenever its trigger appears:
> 1. **`web-sdk-video-embed-skill`** — any time output must show **video anywhere**
>    (clip/reel/feed/carousel/contextual feed). Mount a Genuin Web SDK placement/embed;
>    never a plain `<video>`/`VideoPlayer`/`VideoPage`/`PlayerSwiper`.
> 2. **`hierarchical-tree`** — any time you create or change a **page, route, homepage,
>    landing surface, hero/section layout, destination page, or major UI surface**. First
>    decide whether it should use the Hierarchical Layout System; emit a Page artifact only
>    when that system applies.
> 3. **`hierarchical-theme`** — any time a **publisher palette / theming** is introduced
>    or changed (`.theme-<slug>` + `ThemeName`).
> 4. **`frontend-patterns`** — any time you create or modify **React/Next UI**,
>    components, hooks, pages, forms, or styling. Reuse existing components first; create
>    new components only when no existing component fits.
> Full triggers in §6 and `.octo/skills/README.md`.

> **Scope note (do not be misled).** A file at `/Users/ajayvaswani/Downloads/CLAUDE.md`
> describes **"Genuin Brand Control Center (BCC)"** — a *different* project (Next.js
> **Pages** Router, Bootstrap/SCSS, Zustand, npm). It sits outside this repo and **does
> not apply here.** The authoritative rules for THIS repo are `.claude/CLAUDE.md`
> (Turborepo + pnpm + Next.js 15 **App Router** + React 19 + Tailwind v4), which this
> document merges and extends.

---

## 1. Overview

This is the **Genuin** web monorepo: a Next.js + React video-community platform plus an
embeddable Web SDK, sharing one component architecture across different delivery methods.
Managed with **Turborepo** + **pnpm workspaces** (`apps/*`, `packages/*`).

**Big picture**

- **Apps** (`apps/`): `webapp` (the current Next.js 15 App Router, SSR-first web app) and
  `legacy-webapp` (older app, kept building but excluded from root lint/typecheck).
- **Distributable SDKs** (`packages/`): `web-sdk` (embeddable video-feed widget, Vite
  bundle injected via a loader `<script>`) and `genai` (`@genuin/genai-sdk`, embeddable AI
  chat widget). Both consume the shared component layers.
- **Shared component layers** follow **Atomic Design**:
  - **Atoms** → `packages/ui` (`@genuin/ui`)
  - **Molecules / Organisms** → `packages/components` (`@genuin/components`)
  - **Templates / Pages** → `apps/webapp`
- **Supporting packages**: `hierarchical-tree` (renders serialized Page layout artifacts),
  `analytics` (framework-agnostic analytics client), `tailwind-config`, `eslint-config`,
  `typescript-config` (shared configs).
- A shared package feeds **both** the webapp and the SDKs, so changing one affects every
  delivery format.

**Core stack:** Next.js 15 (App Router, Server Components by default) · React 19 ·
TypeScript 5.8 strict · Node ≥ 20 (target **20.12.0**) · pnpm 8.15.3 · Tailwind CSS v4 ·
TanStack Query v5 · Zustand (client state) · NextAuth v5 (webapp/legacy) · Radix UI ·
Playwright (E2E) · Jest + Vitest (unit, in `packages/ui`) · Storybook v9 · Vite (SDK
builds) · Sentry + RudderStack (observability/analytics) · DOMPurify (HTML sanitization).

---

## 2. Component & architecture map

Atomic design placement: atoms → `packages/ui`, molecules/organisms → `packages/components`,
app & pages → `apps/webapp`. Never cross-import between the two apps.

### apps/

| Area | Purpose | Conventions / key details |
|---|---|---|
| `apps/webapp` (`@genuin/webapp`) | Current Next.js 15 App Router web app for the Genuin video community (videos, groups, communities, profiles); white-label/brand theming; NextAuth v5 auth; SSR-first. | App Router with **Server Components by default**, async layouts/pages. `src/` layout: `app/(site)/(new)/...` routes, `app/(api)/api/...` route handlers, `components/{ui,common,layouts,custom,embed,providers}`, `lib/{api,stores,utils,hooks,schemas}`, `services/{analytics,wallet-handler}`. Path aliases `@/*`, `@components`, `@lib`, `@hooks`, `@services`, `@genuin/{ui,components}`. State: Zustand (persisted `genuin-options`, local-storage) + TanStack Query v5 (staleTime ~30s dynamic / ~180s static). Data: axios `instance.ts` with Bearer + `x-brand-id` interceptors. Build: `next build` → standalone (critters critical CSS), `assetPrefix=/next2` in prod, `transpilePackages: [@genuin/components, @genuin/ui]`. Dev on **:4005** (`env-cmd` + `--turbo`). Tests: **Playwright** in `tests/e2e/` (app :4005, mock server :4006), `test2doc` `.mdx` reporter. Files kebab-case. |
| `apps/legacy-webapp` (`@genuin/legacy-webapp`) | Older Genuin frontend, still built but **excluded from root lint & typecheck** (`--filter=!./apps/legacy-webapp`). | Same stack family (Next 15 App Router, React 19, Tailwind v4, NextAuth v5 beta, Zustand + Immer, TanStack Query, Axios, Rudderstack, Sentry, FingerprintJS). Route groups `(site)`, `(embed)`, `(api)`. ESLint flat config with many migration rules suppressed. **No test suite.** dev `:4005`, start `:4000`. Do not hold new code to this app's relaxed bar — it is legacy. |

### packages/ — shared layers & SDKs

| Package | Role | Conventions / key details |
|---|---|---|
| `packages/ui` (`@genuin/ui`) | **Atoms** — UI primitive library (40+ components) on Radix UI + Tailwind v4 + CVA. | `PascalCase` components; per-component files `[c].tsx`, `[c].test.tsx`, `[c].stories.tsx`, `[c].doc.mdx`, `index.ts`. Tailwind **`gencl:`** prefix; CSS shipped via `./styles` → `dist/index.css`. `forwardRef`, Radix `Slot` for `asChild`; **no `React.FC`**. `cn`/`clsx`/`twMerge` in `lib/utils.ts`; `sanitize.ts` (DOMPurify); shadow-DOM utils for SDK contexts. Theme via CSS-variable `ThemeProvider` (`ThemeName` union in `theme-provider.tsx`). Tests: **Jest + Vitest** (`test: jest && vitest run`) + Storybook v9 (a11y addon). Large explicit per-component exports map (no single barrel). |
| `packages/components` (`@genuin/components`) | **Molecules / Organisms** — shared business components (feed/embed players, comments, cards, modals, top-bar, side-bar, search…). | React 19, `"use client"` where interactive; Tailwind `gencl:`; PascalCase components in kebab-case folders. State via Context (`Analytics`, `Auth`, `BaseContext`, `Embed`, `Link`, `PlayerImpl`) + TanStack Query v5 hooks. Built with `tsc --build` (published **as source**, `composite: true`). Storybook on **:6005**. Depends on `@genuin/ui` and `@genuin/genai-sdk`. **No package test script** (story-driven Vitest only). |
| `packages/web-sdk` (`@genuin/web-sdk`) | Embeddable browser **video-feed SDK** — the `window.genuin` global. Vite bundle + loader. | TS + React 19 (JSX only). Class-singleton core (`GenuinSDK`, `EventManager`, `ErrorHandler`, `TokenManager`, `ThemeManager`) in `src/core/`; SDK in `src/sdk/` (`genuin-sdk.ts`, `embed-root.tsx`). **Config contract: `src/type.ts` (`ConfigByUser`)**; global in `src/index.ts`. Styles wrapped in **`.gen-sdk-class`**; shadow-DOM isolation; lazy CSS. **Env-specific builds** (`build`/`build:qa`/`build:prod`) via `cross-env` + `env-cmd` (`.env.<stage>`), `validate:env`, `syncVersion` (currently **v2.0.6**), builds `genai-sdk` first. Outputs `dist/gen_sdk(.min).js` + `genuin-loader.js`. Tests: **Playwright** (`tests/e2e/`, MSW mocks). Publishes to S3 / Oracle / CloudFront, purges Bunny CDN. CDN: `https://media.<env>.begenuin.com/sdk/<version>/gen_sdk.min.js`. |
| `packages/genai` (`@genuin/genai-sdk`) | Embeddable **AI chat widget** SDK (page/dialog/floater/web-sdk views, markdown, carousel embeds). | Tailwind v4 with **`gai:`** prefix (postcss-prefixwrap on `.genai-sdk-container`). React 19, Vite multi-entry. Global `window.GenAISDK.init/destroy`. **`src/components/Chat/CarousalEmbed.tsx` is the canonical reference for the web-sdk video embed** (see the mandatory skill). Context providers via `AppProviders`; RudderStack analytics. No test runner. |
| `packages/hierarchical-tree` (`@genuin/hierarchical-tree`) | Runtime walker that **validates + renders serialized Page layout artifacts** with breakpoint support. | `PageRenderer` (`use client` for ResizeObserver) + `defaultUiRenderers` / `defaultSlotRenderers` registries; **Zod schema is the single source of truth** (`src/schema.ts`). Breakpoint picking = largest `minWidth ≤ width`, atomic re-render keyed on breakpoint id. SDK-agnostic: emits embed-target elements for **`video` slots** (resolved props `placementId`/`styleId`/`apiKey`/`elementId`) — the host mounts the Web SDK there. Tests: Vitest + jsdom + RTL. Standalone `src/dev/` Vite QA surface. |
| `packages/analytics` (`@genuin/analytics`) | Framework-agnostic analytics client (multi-provider, queue, middleware, optional React bindings). | `AnalyticsClient` orchestrates `EventQueue`/`PayloadMerger`/`EventValidator`/`MiddlewareChain`; provider pattern (Rudderstack, Console, `BaseProvider`); React `useAnalytics`/`useTrack`/`useIdentify`/`usePage`. ESM, NodeNext, multiple entrypoints (`.`, `./react`, `./middleware`, `./types`). Type-check only (no build/dist step). |
| `packages/tailwind-config` (`@genuin/tailwind-config`) | Shared **Tailwind v4** config + per-publisher themes. | CSS-first: `shared-styles.css` (`@import tailwindcss prefix(gencl)`, typography/spacing/breakpoints, custom utils like `.gencl:flex-center`/`.gencl:scrollbar-none`) and `themes.css` (`.theme-<slug>` blocks: genuin, iheart, mcclatchy, us-weekly, artitech, planet-fitness, harley-davidson). Dual tokens `--gencl-primary-*` + `--gencl-color-primary-*` to re-resolve v4's once-evaluated `@theme`. Consumed by `ui`, `components`, `hierarchical-tree`. New palettes via the `hierarchical-theme` skill. |
| `packages/eslint-config` (`@genuin/eslint-config`) | Shared **ESLint 9 flat** configs. | Modular exports: `./base`, `./library` (base + React), `./next-js` (base + React + Next + TanStack Query), `./react-internal`. Prettier-compatible; import ordering enforced; unused vars are errors (`_`-prefix opts out); private package. |
| `packages/typescript-config` (`@genuin/typescript-config`) | Shared **tsconfig** presets. | `base.json` (strict ES2022, `noUncheckedIndexedAccess`, `isolatedModules`, NodeNext), `nextjs.json` (ESNext + Bundler, `jsx: preserve`, `noEmit`), `react-library.json` (`jsx: react-jsx`). Config-only. |

### scripts/ (root utilities)

`check-chunk-size.js` (CI bundle gate, `pnpm check-build`), `check-node-version.js`,
`check-lighthouse.js` / `run-lighthouse.sh`, `generate-theme-ramp.mjs`,
`postinstall-patch-openplayerjs.js`, `validate-dependencies.ts`,
`validate-page-artifact.mjs` (+ worker), `player/`.

### Documentation map

- `docs.md` (root) — index of every doc; read it before guessing a path.
- `.claude/CLAUDE.md` — authoritative project rules (merged into this file).
- `.claude/docs/ai-context.md` — React 19 / Next 15 / Tailwind v4 patterns, env vars, per-package specifics, common issues.
- `.claude/codebase-map.md` — living, team-shared codebase knowledge (read before broad search; append non-obvious findings).
- `docs/` — `setup/` (NODE_VERSION, LINTING, TSCONFIG, DEPENDENCY_MANAGEMENT), `architecture/`, `migrations/` (TAILWIND_V4_MIGRATION_GUIDE), `upgrades/`, `hierarchical/`, `plans/`.
- `apps/webapp/UPGRADE_GUIDE.md`, `packages/web-sdk/README.md` (+ its `docs/`).

---

## 3. Package manager & setup

**pnpm only** (`pnpm@8.15.3`); the lockfile is `pnpm-lock.yaml`. Never use npm or yarn at
the root. **Node ≥ 20**, target **20.12.0** (`.nvmrc`). Always run from the repo root.

```bash
pnpm install          # deps + husky install + openplayerjs patch + Playwright browsers + style prebuild
pnpm dev              # all dev servers (turbo run dev)
pnpm dev:web          # webapp + ui/components style watchers (webapp on :4005)
pnpm dev:sdk          # web-sdk + style watchers
pnpm build            # turbo run build (standalone + library builds)
pnpm typecheck        # turbo run typecheck (excludes legacy-webapp)
pnpm lint             # turbo run lint (excludes legacy-webapp)
pnpm format           # prettier --write across the repo
pnpm test             # web-sdk + webapp Playwright suites (via concurrently)
```

**Octo preview rule:** Webapp preview must start from the repo root with `pnpm dev:web`
whenever possible. If the preview runner invokes the webapp package directly, run
`pnpm --filter @genuin/webapp styles:build` first, then start `pnpm --filter @genuin/webapp dev`
or `pnpm --filter @genuin/webapp dev:turbo`. The imports `@genuin/ui/styles` and
`@genuin/components/styles` are exported CSS build artifacts (`dist/index.css`), so starting
Next before those files exist can produce intermittent "Module not found" preview failures.

**Dependency strategy** (see `docs/setup/DEPENDENCY_MANAGEMENT.md`): shared deps (React,
Next, Radix, Tailwind) live in the **root** `package.json` and are hoisted; workspace
packages declare shared libs as **`peerDependencies`** and reference internal packages with
**`workspace:*`**. `.npmrc` sets `shamefully-hoist=false`, `auto-install-peers=true`,
`strict-peer-dependencies=false`, and `public-hoist-pattern[]` for radix/react/tailwind/
next/typescript/eslint. pnpm `overrides` pin react/react-dom `^19.1.0`, `@tanstack/react-query`
`^5.76.1`, `react-is` `^18.0.0`, `unrs-resolver` `1.7.13`. Validate with `pnpm deps:validate`
(syncpack + depcheck).

**Environment variables** (see README "Environment Variable Management" + `ai-context.md`):
a root `.env` is injected via **`env-cmd`** into app/package scripts; per-app `.env`
overrides; `packages/web-sdk` layers `.env.<stage>` (+ genai `.env.<stage>`). Only
**`NEXT_PUBLIC_*`** (Next apps) and **`VITE_*`** (Vite/SDK) names reach the browser;
Storybook/Vite expose public envs through a `define` block in `.storybook/main.ts`. The Web
SDK reads `VITE_GEN_SDK_PLACEMENT_ID`, `VITE_GEN_SDK_STYLE_ID`, `VITE_API_KEY`, etc. Use
project/env values when supplied; otherwise use the current default in
`web-sdk-video-embed-skill`. No AWS Secrets Manager is used (see `.octo/env.toml`).

---

## 4. Coding conventions

**Language & runtime**
- TypeScript everywhere, **strict mode**. No `any` without a justified comment. No
  `@ts-ignore`/`@ts-expect-error` without an explanatory comment.
- **ESM only** — no CommonJS `require()`. Node 20+ (`fetch`, `structuredClone`, ES2022+ ok).
- **No `React.FC`** — plain function declarations with explicit prop types. All `useRef`
  calls initialized (e.g. `useRef<HTMLDivElement>(null)`); React 19 ref-as-prop.

**Style**
- 2-space indent, single quotes, semicolons required, max line length **100**.
- **Named exports preferred**; descriptive names (no single-letter vars except short lambdas).
- **No barrel files** that re-export everything — import directly from the source file.
  (`packages/ui` uses an explicit per-component exports map, consistent with this rule.)

**React / Next.js**
- App Router; **Server Components by default** — add `'use client'` only when interactivity
  is needed. Default to parallel data fetching; avoid RSC waterfalls
  (see `nextjs-server-performance`); reason about caching with `nextjs-cache`.
- **Existing component first.** For any UI/component prompt, search `packages/components`
  first, then its Storybook stories/docs for intended APIs. Use or compose an existing
  high-level component whenever it fits; check `packages/ui` primitives next. Create a new
  component only when no existing component/story matches, and model the new work from the
  closest Storybook example.
- Feature folders inside apps: `feature/`, `components/`, `hooks/`, `utils/`, `types/`.
  Colocate tests next to source (`feature.ts` → `feature.test.ts`). Flat over deep nesting.
- Build UI with `frontend-patterns`; design component APIs with
  `composition-patterns` (variants over boolean-prop soup, compound components,
  provider DI, children over render props).

**Styling — Tailwind v4 (prefixed)**
- `@genuin/ui` and `@genuin/components` use the **`gencl:`** utility prefix; `@genuin/genai-sdk`
  uses **`gai:`**; the Web SDK wraps styles in **`.gen-sdk-class`**.
- `@genuin/ui/styles` and `@genuin/components/styles` resolve to built CSS files in
  `packages/*/dist/index.css`; keep exact `tsconfig` path entries for these subpaths before
  wildcard package aliases.
- **`gencl:` utilities silently no-op** until `packages/components` prebuilt CSS
  (`dist/index.css`) is rebuilt — run `pnpm install` (preinstall `build:styles`) or the
  `dev:styles` watcher.
- Tailwind v4 renames: `shadow-sm`→`shadow-xs`, `rounded`→`rounded-sm`,
  `outline-none`→`outline-hidden`, `ring`→`ring-3` (full list in `ai-context.md`).
- New publisher palettes go through `hierarchical-theme` (`.theme-<slug>` in
  `themes.css` + `ThemeName` union).

**State & data**
- Client state: **Zustand** (persisted where needed) — React Context for provider-tree
  concerns. Zustand is the last resort for cross-cutting state; prefer Context per repo rules.
- Server state: **TanStack Query v5**. HTTP via the per-app axios `instance.ts` (interceptors
  attach Bearer token + `x-brand-id`). Forms: `react-hook-form` + **Zod** validation.

**Error handling**
- Handle errors explicitly — no swallowed `catch`. Use typed errors (an `AppError` base with a
  `code` field); never throw raw strings. At API boundaries return `{ data, error }` result
  objects instead of throwing. Wrap client trees in error boundaries.

**Security**
- Validate all external data at trust boundaries with **Zod**. Sanitize any rendered
  user/markdown HTML with **DOMPurify**; no `dangerouslySetInnerHTML` without it.
- API responses return only the fields the client needs; **always paginate** lists.
- Auth tokens belong in `httpOnly` cookies, **not `localStorage`**. (Note: crypto/AES env
  vars and `crypto-es` exist in some packages — do not extend client-side secret handling;
  raise auth/token changes for review.)

**Comments & docs**
- Comment the *why*, not the *what*. Public functions/exported types get JSDoc. No
  commented-out code; use `// TODO(name): …` for known gaps.

**What to avoid**
- No `console.log` in committed code (structured logger instead). No hardcoded secrets/tokens/
  env-specific URLs. No direct DOM manipulation in React (use refs). No `page.waitForTimeout()`
  in Playwright. No CommonJS `require()`. No cross-imports between apps in `apps/`.

**Specialist agents** (in `.claude/agents/`, dispatched by the Agent tool — optional, use when
the work is big enough to pay for itself; small fixes go inline):

| Agent | Use when |
|---|---|
| `planner` | Read-only: explore the codebase and produce a file-by-file implementation plan before coding; "how does X work". |
| `implementer` | Build a feature/component writing production code (types → implementation → tests) following conventions. |
| `architect` | Package placement, monorepo/system design, ADRs, where new code lives (packages vs apps). |
| `debugger` | Root-cause a stubborn bug and apply the minimal safe fix (pairs with the `debug` skill). |
| `code-reviewer` | Quality/security review of a diff right after writing code; git-history-aware. |
| `typescript-reviewer` | TypeScript-focused review — type safety, async correctness; runs typecheck/lint. |
| `security-auditor` | Read-only security audit (auth, injection, secrets, CORS/CSP, CVEs) — never edits. |
| `e2e-tester` | Write/fix Playwright E2E tests for real user flows (Page Object Model). |
| `prd-writer` | Write/update/review a PRD with Given/When/Then acceptance criteria. |

Orchestration for substantial multi-step work: `grill-me` (if vague) → `planner` → `implementer`
→ `code-reviewer`/`typescript-reviewer` → `e2e-tester` (only if a user flow). A one-line fix
skips all of this — do it inline (token economy).

---

## 5. Ownership boundaries & "do NOT" rules

**Requires explicit team approval before changing:**
- Deleting or renaming public API surfaces.
- Changing shared packages in `packages/` that other packages/apps depend on (affects the
  webapp **and** the SDKs — `@genuin/ui`, `@genuin/components`, `@genuin/genai-sdk`,
  `@genuin/tailwind-config` are consumed widely).
- Modifying CI/CD pipeline configuration (`.github/workflows/*`).
- Adding new external dependencies.
- Changing authentication / session handling logic (NextAuth v5, token managers).
- Changing CORS, CSP, or any security-related HTTP headers.

**Hard "do NOT":**
- **Do NOT render content video with a plain video component** — `VideoPlayer`,
  `VideoPlayerV2`, `VideoPoster`, `VideoPage`, `PlayerSwiper`, a raw `<video>`, or a video
  `<iframe>`. Use the Genuin Web SDK placement/embed instead (see §6 / the mandatory skill).
- Do NOT cross-import between `apps/webapp` and `apps/legacy-webapp`.
- Do NOT add barrel files, CommonJS, `React.FC`, uninitialized refs, or `any` (without a
  justified comment).
- Do NOT hardcode secrets, ids, keys, or environment-specific URLs — read from env.
- Do NOT put auth tokens in `localStorage`.
- Do NOT add `*.stories.*`-style work to legacy surfaces blindly; respect each package's setup.
- Do NOT introduce new top-level files/folders under `.octo/` — only `octo.md`,
  `checklist.md`, `env.toml`, and `skills/` are allowed there.

**Quality gates (Husky + lint-staged):** pre-commit runs ESLint `--fix` + Prettier on staged
`*.{ts,tsx,js,mjs}`; `apps/webapp` has a pre-push `npm run build`. CI also gates **bundle
chunk size** (`scripts/check-chunk-size.js`) — large new client chunks fail the build. See
`.octo/checklist.md` for the full done-definition.

---

## 6. Skills you MUST use

Skill bodies live in `.octo/skills/` and are indexed in `.octo/skills/README.md`. Read the
matching skill before doing the work it covers.

### MANDATORY — always used (check these first)

1. **`web-sdk-video-embed-skill` — [MUST USE].** Whenever generated code must display **video
   anywhere** (clip, reel, feed, carousel, contextual feed), you **MUST** mount a Genuin Web
   SDK **placement** (default) or **embed**: a container `<div>` + a guarded
   `window.genuin.init(...)`. You **MUST NOT** emit `VideoPlayer`/`VideoPlayerV2`/`VideoPoster`/
   `VideoPage`/`PlayerSwiper`/a raw `<video>`/a video `<iframe>` for content video. Read source
   ids from supplied config/env or the skill's current default, guard init once via `useRef` +
   SDK-availability, never call `destroy()` per card. Canonical
   reference: `packages/genai/src/components/Chat/CarousalEmbed.tsx`; contract:
   `packages/web-sdk/src/type.ts` (`ConfigByUser`). Pairs with `hierarchical-tree` `video` slots.

2. **`hierarchical-tree` — [MUST USE].** Whenever you create or change a **page, route,
   homepage, landing surface, hero/section layout, destination page, or major UI surface**, you
   **MUST** follow this skill first as a layout-system check. Decide whether the target is already
   implemented through the Hierarchical Layout System or should be represented as a typed `Page`
   artifact. If yes, produce a typed `Page` module validated by the Zod schema
   (`packages/hierarchical-tree/src/schema.ts`), use the `defaultUiRenderers`/
   `defaultSlotRenderers` registries and breakpoint contract, and wire every `video` slot
   (`placementId`/`styleId`/`apiKey`/`elementId`) through skill #1. If the target is ordinary
   React/Next UI, record that decision briefly and continue with `frontend-patterns`; do NOT invent
   a Page artifact or hand-roll page layouts that bypass an existing artifact schema.

3. **`hierarchical-theme` — [MUST USE].** Whenever a **publisher palette / theming** is
   introduced or changed, you **MUST** follow this skill: add a `.theme-<slug>` block in
   `packages/tailwind-config/themes.css` (dual `--gencl-primary-*` + `--gencl-color-primary-*`
   tokens) and extend the `ThemeName` union in `packages/ui/.../theme-provider.tsx`. Do NOT
   introduce brand colors via ad-hoc inline styles or one-off CSS outside this system.

4. **`frontend-patterns` — [MUST USE].** Whenever you create or modify **React components,
   hooks, Next.js pages, forms, or styling**, you **MUST** follow this skill. Use Server
   Components by default, apply the repo's React 19 / Next.js 15 / Tailwind v4 conventions, and
   complete the existing-component-first workflow before creating new UI: search
   `packages/components` and Storybook stories/docs for a component that fits, reuse or compose it
   whenever possible, and create a new component only when no existing component matches the UI or
   ownership boundary. This is what lets a normal user ask for UI changes in plain English without
   naming internal skills.

### Use when the task matches (see `skills/README.md` for the full trigger of each)

- **Understanding:** `zoom-out` (map an unfamiliar area first), `codebase-memory` (read/record
  `.claude/codebase-map.md`).
- **Building:** `frontend-patterns` (React/Next UI, **mandatory**), `composition-patterns` (component API
  design), `nextjs-server-performance` (RSC waterfalls), `nextjs-cache` (caching/ISR).
- **Quality:** `performance` (render/bundle), `accessibility` (WCAG 2.1 AA), `web-design-review`
  (UX/design), `security-audit` (read-only vuln review), `refactor` (behaviour-preserving).
- **Testing/debug:** `debug` (broken/throwing), `test-runner` (Vitest/Jest unit), `e2e-testing`
  (Playwright), `eval-feature` (test a just-built feature against its acceptance criteria via
  approved static/behavioral/llm checks, report a weighted score, then clean up).
- **Process:** `grill-me` (lock down vague requirements), `prd-writer` (write a PRD).
