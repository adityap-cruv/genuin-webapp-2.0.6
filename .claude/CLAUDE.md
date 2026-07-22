# Project Instructions

These rules apply to all AI tools working in this repository.
They are the single source of truth for how code should be written here.

> **Documentation map**: All docs in this repo are indexed in `docs.md` at the root. Read it to find the right file before guessing a path.
>
> **Detailed context** (React/Next.js patterns, Tailwind v4, package specifics, env vars, common issues) lives in `.claude/docs/ai-context.md`. Read it when working in those domains.

---

## How to work in this repo (token economy)

Match effort to the task. Most requests are answered best by working directly — reading the few
relevant files and responding — not by spinning up extra machinery. Spending a fresh-context
subagent to fix a one-line bug is wasted tokens.

- **Inline-first.** Handle the task in the main conversation by default. A small bug, a one-file
  change, or a focused question needs no subagent.
- **Spawn a subagent only when it pays for itself:** broad parallel search across many files,
  genuinely independent parallel work, or work that needs an isolated context.
- **Skills over agents for guidance.** A skill injects targeted instructions cheaply; a subagent
  spins up a whole new context window. Reach for the skill first.
- **Load on demand.** Read a skill, reference file, or agent definition when the task calls for it —
  not preemptively.
- **Reuse codebase knowledge.** Before a broad codebase search, check
  [`.claude/codebase-map.md`](codebase-map.md); after learning something non-obvious, record it there
  (see the `codebase-memory` skill). Don't re-discover what's already mapped.
- **Right-size the response.** Small task, small answer.

### Specialist agents & skills (optional — use when they help)

Specialist agents live in `.claude/agents/` and are dispatched by Claude Code's native Agent tool
based on their `description`. Domain skills live in `.claude/skills/` and are auto-discovered via the
Skill tool. They are tools, **not mandatory steps** — reach for them when a task genuinely benefits.

| When it helps | Agent / Skill |
| ------------- | ------------- |
| A focused implementation plan before a big change | `planner` agent |
| Building a non-trivial feature across files | `implementer` agent |
| Finding the root cause of a stubborn bug | `debugger` agent + `debug` skill |
| Reviewing a meaningful diff | `code-reviewer` / `typescript-reviewer` agent |
| Package placement / monorepo / system design | `architect` agent |
| Security review of auth/input/secrets | `security-auditor` agent + `security-audit` skill |
| Playwright / E2E tests | `e2e-tester` agent + `e2e-testing` skill |
| Writing a PRD / spec | `prd-writer` agent + `prd-writer` skill |
| Building React components / frontend UI | `frontend-patterns` skill |
| Performance / accessibility / refactor / unit tests | `performance` / `accessibility` / `refactor` / `test-runner` skill |

Full catalog of skills + agents with trigger phrases: [.claude/README.md](README.md).

### Orchestration — chain agents for multi-step work

For a substantial, multi-step task (a feature, a cross-file refactor — anything you'd plan before
coding), run the agents **in sequence**, each handing off to the next:

1. **`grill-me` skill** — *if the request is vague* → lock down requirements first.
2. **`planner` agent** — produce a file-by-file plan. Present it; get a nod for anything risky.
3. **`implementer` agent** — build it (types → implementation → tests), following the plan.
4. **`code-reviewer` / `typescript-reviewer` agent** — review the diff before declaring done.
5. **`e2e-tester` agent** — only if the feature has a user flow worth covering.

Jump straight to the step that fits — and **a one-line fix needs none of this; do it inline.** The
chain is for work big enough that the hand-offs save rework, not for every prompt (token economy).

Use `superpowers:brainstorming` before the plan when the *solution* is open-ended; use `grill-me`
when the solution is clear but the *requirements* aren't.

---

## Repository Structure and Purpose

This is a Next.js and React monorepo organized with Turborepo and pnpm workspaces. The project
contains a main web application and a Web SDK package that share the same underlying component
architecture despite having different delivery methods.

```
genuin-webapp-standalone/
├── apps/
│   └── webapp/                  # Next.js web application
├── packages/
│   ├── components/              # Shared React components (Molecules/Organisms)
│   ├── eslint-config/
│   ├── tailwind-config/
│   ├── typescript-config/
│   ├── ui/                      # UI component library (Atoms)
│   ├── utils/                   # Shared utility functions
│   └── web-sdk/                 # Genuin Web SDK package
├── scripts/                     # Root-level utility scripts
```

---

## Big Picture Architecture

- **Monorepo**: pnpm workspaces + Turborepo.
- **Apps**: `apps/webapp` (Next.js 15, App Router, SSR-first) and `packages/web-sdk` (embeddable React SDK, Rollup build).
- **Shared Code**: UI primitives (`packages/ui`), business components (`packages/components`), utilities reused across both.
- **Atomic Design**: Atoms → `packages/ui`, Molecules/Organisms → `packages/components`, Templates/Pages → `apps/webapp`.
- **Strict Typing**: TypeScript strict mode everywhere. No `React.FC` types.

---

## Technology Stack

- **Next.js**: v15.0.0+ with App Router
- **React**: v19.0.0+
- **TypeScript**: v5.2.2+ (strict mode)
- **Node.js**: v20.12.0+
- **Package Manager**: pnpm v8.15.3+
- **Authentication**: NextAuth.js v5.0.0+
- **State Management**: React Context API (preferred), Zustand (last resort)
- **API Client**: TanStack Query v5
- **CSS**: Tailwind CSS v4, CSS Modules
- **Testing**: Vitest + React Testing Library, Jest (`packages/ui`), Playwright (E2E)
- **UI Development**: Storybook v9.0.0
- **Security**: DOMPurify for HTML sanitization at trust boundaries

---

## Language & Runtime

- TypeScript everywhere (strict mode). No `any` unless explicitly justified with a comment.
- Node.js 20+. Use native `fetch`, `structuredClone`, and ES2022+ features freely.
- ESM modules only. No CommonJS `require()`.
- No `React.FC` type annotations — use plain function declarations with explicit prop types.
- All `useRef` calls must be initialized (e.g., `useRef<HTMLDivElement>(null)`).

---

## Code Style

- 2-space indentation. Single quotes. Semicolons required.
- Max line length: 100 characters.
- Named exports preferred over default exports.
- Descriptive names: avoid single-letter variables except in short lambdas.
- No barrel files (`index.ts` re-exporting everything). Import directly from the source file.
- Use `workspace:*` for internal pnpm workspace dependencies.

---

## Architecture Patterns

- **Apps** live in `apps/`. **Shared packages** live in `packages/`. Never cross-import between apps.
- Feature folders inside apps: `feature/`, `components/`, `hooks/`, `utils/`, `types/`.
- Colocate tests next to the source file: `feature.ts` → `feature.test.ts`.
- Avoid deep nesting. Flat is better.
- Default to Server Components (Next.js). Add `'use client'` only when interactivity is needed.

---

## Error Handling

- Always handle errors explicitly. No swallowed `catch` blocks.
- Use typed errors: define an `AppError` base class with a `code` field. Never throw raw strings.
- At API boundaries, return `{ data, error }` result objects instead of throwing.
- Implement proper error boundaries for all client components.

---

## Security

- Validate all external data at trust boundaries using Zod or equivalent schema validation.
- Never interpolate user input into query strings. Use parameterised queries.
- API responses must only return the fields the client actually needs.
- Auth tokens go in `httpOnly` cookies — never `localStorage`.
- No `dangerouslySetInnerHTML` without explicit sanitisation via DOMPurify.
- Any change to auth, CORS, CSP, or security headers requires explicit team approval.

---

## Comments & Docs

- Write comments for _why_, not _what_.
- Public functions and exported types must have JSDoc.
- Avoid commented-out code in PRs. Use `// TODO(yourname): ...` format for known gaps.

---

## Development Workflow

- **Install**: `pnpm install` (always run from repo root)
- **Dev**: `pnpm dev`
- **Build**: `pnpm build`
- **Lint/Format**: `pnpm lint`, `pnpm format`
- **Typecheck**: `pnpm typecheck`
- **Clear cache**: `pnpm turbo clean`
- **Web SDK builds**: `npm run build` / `npm run build:qa` / `npm run build:prod` in `packages/web-sdk`

---

## What to Avoid

- No `console.log` in committed code — use a structured logger instead.
- No hardcoded secrets, tokens, or environment-specific URLs. Use environment variables.
- No `@ts-ignore` or `@ts-expect-error` without a comment explaining why.
- No direct DOM manipulation in React components — use refs properly.
- No `dangerouslySetInnerHTML` without explicit sanitisation.
- No `page.waitForTimeout()` in Playwright tests.
- No barrel files (`index.ts` re-exporting everything).
- No CommonJS `require()` — this repo uses ESM only.
- No `any` without a justified comment.
- No cross-imports between apps in `apps/`.
- No `localStorage` for auth tokens — use `httpOnly` cookies.
- No unbounded API responses — always paginate lists and select only needed fields.

---

## Guardrails

The rules above are the working conventions. A few additional governance and quality rules:

**Testing & accessibility**

- Write tests that are independent — never depend on execution order or shared mutable state.
- In E2E tests, select by `data-testid` or ARIA role, never by CSS class or tag alone.
- Add `data-testid` to interactive elements that need to be testable.
- Associate form inputs with labels via `htmlFor`/`id` or `aria-labelledby`.
- Never suppress focus outlines without providing a visible replacement.
- Render interactive content with semantic elements (`<button>`, `<a>`), not bare `<div>`s.

**Requires explicit team approval**

- Deleting or renaming public API surfaces.
- Changing shared packages in `packages/` that other apps depend on (affects webapp **and** web-sdk).
- Modifying CI/CD pipeline configuration (`.github/workflows/*`).
- Adding new external dependencies.
- Changing authentication or session handling logic.
- Changing CORS, CSP, or any security-related HTTP headers.

---

## Additional Resources

- `docs.md` — **documentation map**: index of every doc file in this repo; read this first when looking for a doc or deciding where to put a new one
- `.claude/docs/ai-context.md` — React/Next.js patterns, Tailwind v4, env vars, package specifics, common issues
- `apps/webapp/UPGRADE_GUIDE.md` — Next.js 15 and React 19 upgrade details
- `docs/migrations/TAILWIND_V4_MIGRATION_GUIDE.md` — detailed Tailwind v4 migration steps
- `docs/setup/NODE_VERSION.md` — Node.js version requirements and setup
- Package-specific `README` files — detailed per-package instructions

---

If any section is unclear or incomplete, please ask for clarification or suggest improvements.
