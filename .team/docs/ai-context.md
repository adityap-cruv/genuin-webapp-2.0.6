# AI Context — Project State

<!-- This file is read by Claude Code at the start of every session.
     Keep it current. It is the single source of truth for project state.
     Update it when: decisions are made, blockers are resolved, focus shifts. -->

---

## Project overview

genuin-webapp is a Next.js + React TypeScript monorepo serving a B2B SaaS platform.
It uses Turborepo + pnpm workspaces, with a shared UI package, shared business components,
a Next.js webapp, and an embeddable Web SDK.

---

## Current focus

- [ ] TODO: Add current sprint focus here

---

## Active decisions

| Decision                                  | Reason                                   | Date |
| ----------------------------------------- | ---------------------------------------- | ---- |
| ESM only, no CommonJS                     | Consistent module system across monorepo | —    |
| Vitest for unit tests, Playwright for E2E | Standard across all apps                 | —    |
| `httpOnly` cookies for auth tokens        | Security requirement                     | —    |
| Zod for all external data validation      | Type-safe at trust boundaries            | —    |
| `code-reviewer` replaces `reviewer`       | More React/Next.js-aware checklist       | —    |

---

## Known issues

| Issue                       | Severity | Owner | Notes |
| --------------------------- | -------- | ----- | ----- |
| TODO: Add known issues here | —        | —     | —     |

---

## Files to be aware of

| File                       | Why it matters                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `sync-ai-config.mjs`       | Syncs `.team/` → `.claude/` and `.github/`. Run after any change to `.team/`.          |
| `.team/instructions.md`    | Base rules for all agents. Source of truth — do not edit `.claude/CLAUDE.md` directly. |
| `.team/docs/ai-context.md` | This file. Detailed patterns and context.                                              |

---

## Architecture notes

- **Monorepo layout:** `apps/` for deployable apps, `packages/` for shared code. Never cross-import between apps.
- **AI config:** Edit in `.team/`, run `node sync-ai-config.mjs` to propagate to `.claude/` and `.github/`.
- **Skills:** Detailed instruction sets live in `.team/skills/`. Agents load these automatically per the routing rules.

---

## Environment Variable Management

- **Centralized Env Management**: Shared env variables are defined in the root `.env` file.
  App- and package-specific overrides can be placed in their respective `.env` files
  (e.g., `apps/webapp/.env`). Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

- **Injecting Env Vars in Apps with `env-cmd`**: Apps use `env-cmd` to inject environment
  variables from the root `.env` into their runtime. Example (`apps/webapp/package.json`):

  ```json
  "scripts": {
    "dev": "env-cmd -f ../../.env next dev -p 4005"
  }
  ```

- **Injecting Env Vars in Packages (Vite/Storybook)**: Inject via the `define` property in
  `.storybook/main.ts`:

  ```ts
  viteFinal: (config) => ({
    ...config,
    define: {
      ...config.define,
      "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_KEY": JSON.stringify(
        process.env.NEXT_PUBLIC_RUDDERSTACK_KEY,
      ),
      "import.meta.env.NEXT_PUBLIC_RUDDERSTACK_URL": JSON.stringify(
        process.env.NEXT_PUBLIC_RUDDERSTACK_URL,
      ),
      "import.meta.env.NEXT_PUBLIC_MEDIA_BASE_URL": JSON.stringify(
        process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
      ),
      "import.meta.env.NEXT_PUBLIC_HOST_URL": JSON.stringify(
        process.env.NEXT_PUBLIC_HOST_URL,
      ),
    },
  });
  ```

- **Best Practices**:
  - Add new shared envs to root `.env` and document them in `.env.example`.
  - Use `env-cmd` in all app scripts.
  - For Storybook, update the `define` block in `.storybook/main.ts` for any new public envs.
  - Never commit secrets — use `.env.local` for local overrides.

- **Adding a New Public Env Variable**:
  1. Add to root `.env` and `.env.example`: `NEXT_PUBLIC_NEW_FEATURE_FLAG=true`
  2. Reference as `process.env.NEXT_PUBLIC_NEW_FEATURE_FLAG` (Node) or `import.meta.env.NEXT_PUBLIC_NEW_FEATURE_FLAG` (Vite/Storybook).
  3. If needed in Storybook, add to the `define` block in `.storybook/main.ts`.

---

## Tailwind CSS v4 Patterns

1. **CSS and PostCSS Configuration**
   - Use `@tailwind` directives in globals.css for compatibility
   - Use `@config '../../tailwind.config.ts'` directive in globals.css
   - Configure PostCSS to use `@tailwindcss/postcss` plugin

2. **Theme Configuration**
   - The project uses a hybrid approach compatible with both Tailwind v3 and v4
   - CSS variables are defined in the Tailwind theme and accessed via utility classes
   - Use proper color opacity syntax: `bg-primary/[0.5]` instead of `bg-primary/50`

3. **Utility Class Renaming**
   - `shadow-sm` → `shadow-xs`
   - `shadow` → `shadow-sm`
   - `rounded-sm` → `rounded-xs`
   - `rounded` → `rounded-sm`
   - `outline-none` → `outline-hidden`
   - `ring` → `ring-3`

4. **Custom Utilities**
   - Use `@utility` directive instead of `@layer utilities`
   - Variant stacking order is left to right: `first:*:pt-0` → `*:first:pt-0`

5. **Migration References**
   - `TAILWIND_V4_MIGRATION.md` — migration status
   - `TAILWIND_V4_MIGRATION_GUIDE.md` — detailed steps

---

## React & Next.js Patterns

### React 19

- Functional components without React.FC type
- Proper typing of useRef (e.g., `useRef<HTMLDivElement>(null)`)
- Prefer Server Components where possible; `'use client'` only when needed
- Use `React.use()` for data fetching and promise handling in Server Components
- Use `React.cache()` for memoized server functions
- Use `useOptimistic` for optimistic UI updates
- Use Actions and `useFormStatus` for form interactions
- Use `useFormState` for form state management
- Use `useTransition` for smoother UI updates during state changes

### State Management

- React hooks for component-level state
- React Context API for global state (preferred)
- Zustand only as a last resort when Context becomes too complex
- TanStack Query for server state

### Server vs. Client Components

- Default to Server Components unless interactivity is needed
- Add `'use client'` directive at the top of client component files
- Import client components into server components, not vice versa
- Don't use `useState`/`useEffect` in Server Components
- Keep data fetching in server components whenever possible
- Consider "islands architecture" — interactive client components embedded within static server-rendered content
- For SEO-critical pages, ensure all important content is server-rendered

### Next.js 15 Specifics

- App Router only — no Pages Router. Route Handlers replace API Routes. Metadata API replaces `<Head>`.
- Use Metadata API for SEO (`title`, `description`, Open Graph)
- Implement Partial Prerendering (PPR) for hybrid static/dynamic pages
- Use `optimizePackageImports` for better bundle sizes
- Leverage server actions for form submissions and data mutations
- Implement on-demand ISR where appropriate
- Configure proper `staleTimes` for client-side router cache
- Use async params and searchParams (Next.js 15's improved async API)

### Component Design

- Clear responsibilities per component
- Proper prop interfaces with optional props typed explicitly
- Compound components pattern for complex UI
- Proper error boundaries for client components
- Prefer composition over inheritance

---

## Package Specifics

### Web Application (`apps/webapp`)

- Next.js 15 + App Router + NextAuth.js v5
- SSR-first: Server Components by default, client components only where needed
- TanStack Query v5 for data fetching, React Context for global state
- Implements PPR for optimal static/dynamic content delivery
- Utilizes React Compiler for automatic optimization in production builds
- Configures `optimizePackageImports` for better bundle sizes
- Uses enhanced error boundaries with React 19 error handling
- Leverages `useTransition` for smoother UI updates
- Implements `useFormState` and `useFormStatus` for form handling

### UI Library (`packages/ui`)

- Design library similar to shadcn/ui — reusable primitive components
- Built on Radix UI primitives, styled with Tailwind CSS
- Implements the **Atoms** level of atomic design
- Storybook v9.0.0 integration for component development
- Each component has TypeScript interfaces, React 19 patterns, Tailwind variants, full test coverage
- Shared across webapp and web-sdk — ensures visual consistency between delivery formats
- Both Jest and Vitest run together (`test` script: `jest && vitest run`)

### Components (`packages/components`)

- Implements **Molecules** and **Organisms** levels of atomic design
- Business-logic specific components for the Genuin ecosystem
- Shared between webapp and web-sdk — abstracts business logic to be delivery-method agnostic
- Uses React Context where appropriate for state management
- Exports type definitions for all components

### Web SDK (`packages/web-sdk`)

- Standalone embeddable React application, built with Rollup
- Multiple embed types: standard, carousel, feed
- Environment-specific builds (dev, qa, production)
- Functionally equivalent to the webapp but delivered as an embeddable SDK
- Reuses the same UI and business components from shared packages
- S3/CloudFront publishing supported — see `packages/web-sdk/README.md`

### Configuration Packages

- `eslint-config` — shared ESLint rules
- `tailwind-config` — shared Tailwind theme and plugins
- `typescript-config` — base TypeScript configurations
- `utils` — shared utility functions and helpers

---

## TypeScript & Code Standards

- Use explicit return types for functions with complex logic
- Prefer types and interfaces over `any`
- Use proper generics to create reusable components and utilities
- Define strict prop types for all components
- Organize by feature rather than type when appropriate
- Use pnpm workspace dependencies (`workspace:*`) for internal packages

---

## Common Issues to Watch For

### Environment and Setup

- Node version mismatches — should be `>=20.12.0`. Use `nvm` and check `.nvmrc`.
- pnpm workspace dependency issues — correct syntax is `"workspace:*"`. Run `pnpm install` after adding new workspace packages. Check for circular dependencies.

### Framework and Architecture

- App Router only — Route Handlers replace API Routes. Metadata API replaces `<Head>`.
- React 19: no `React.FC`, initialize all `useRef` calls, use `React.use()` for data fetching.
- Server vs Client confusion: default to Server Components, `'use client'` only when needed.

### Build and Performance

- Turborepo cache issues: run `pnpm turbo clean` to reset.
- CSS Module naming conflicts: prefix class names with the component name.
- Client-side env vars must be prefixed with `NEXT_PUBLIC_`.
- TanStack Query: configure `staleTime` and `cacheTime` appropriately per query.

---

## Last updated

**Date:** 2026-04-08
**What changed:** Moved detailed patterns from CLAUDE.md here to slim down context window usage. Removed `reviewer` agent (superseded by `code-reviewer`). Removed `continuous-learning-v2` skill and session hooks (not functional).
