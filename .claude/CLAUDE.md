# Project Instructions

These rules apply to all AI tools working in this repository.
They are the single source of truth for how code should be written here.

> **Documentation map**: All docs in this repo are indexed in `docs.md` at the root. Read it to find the right file before guessing a path.
>
> **Detailed context** (React/Next.js patterns, Tailwind v4, package specifics, env vars, common issues) lives in `.team/docs/ai-context.md`. Read it when working in those domains.

---

## Agent Routing

**You must follow these routing rules on every prompt. This is not optional.**

Match the user's intent to the right specialist agent. Do not respond as a general assistant when a specialist exists.

| Intent | Agent |
|---|---|
| Plan / design / structure / approach | `planner` |
| Implement / build / add / create / write code | `implementer` |
| Review / feedback on code | `code-reviewer` |
| Fix / debug / broken / error / not working | `debugger` |
| Security / vulnerability / audit | `security-auditor` |
| E2E / Playwright / integration test | `e2e-tester` |
| PRD / spec / requirements | `prd-writer` |
| Investigate / how does X work / trace | `planner` (read-only) |
| Anything else | `planner` (read-only) |

> **Copilot:** See `.team/copilot/instructions.md` for keyword-based routing rules.

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

## Additional Resources

- `docs.md` — **documentation map**: index of every doc file in this repo; read this first when looking for a doc or deciding where to put a new one
- `.team/docs/ai-context.md` — React/Next.js patterns, Tailwind v4, env vars, package specifics, common issues
- `apps/webapp/UPGRADE_GUIDE.md` — Next.js 15 and React 19 upgrade details
- `docs/migrations/TAILWIND_V4_MIGRATION_GUIDE.md` — detailed Tailwind v4 migration steps
- `docs/setup/NODE_VERSION.md` — Node.js version requirements and setup
- Package-specific `README` files — detailed per-package instructions

---

If any section is unclear or incomplete, please ask for clarification or suggest improvements.

---

## MANDATORY: Agent routing — check before every response

**This is not optional. Do not respond as a general assistant when a specialist agent exists.**

Read the user's intent and activate the first matching agent via the Agent tool.
The sub-agent responds directly — do not summarise or filter its output.

| User intent | Agent to activate |
|---|---|
| Investigate / "how does X work" / "why is" / "what's happening" | `planner` (read-only) |
| Fix / broken / error / not working / failing | `debugger` |
| Plan / design / structure / approach / where to put | `planner` |
| Implement / build / add / create / write code | `implementer` |
| Code review / check this / feedback on code | `code-reviewer` |
| TypeScript review / type safety / PR review | `typescript-reviewer` |
| Architecture / monorepo / package placement / ADR | `architect` |
| Security / vulnerability / audit / is this safe | `security-auditor` |
| E2E / Playwright / integration test | `e2e-tester` |
| PRD / spec / requirements | `prd-writer` |
| **Anything else (default)** | `planner` in read-only mode |

**Skill loading** — also load the matching skill before responding:

| User's goal | Skill to load |
|---|---|
| Investigating or fixing a bug | `.claude/skills/debug/SKILL.md` |
| Writing or fixing Playwright / E2E tests | `.claude/skills/e2e-testing/SKILL.md` |
| Auditing or improving accessibility (WCAG) | `.claude/skills/accessibility/SKILL.md` |
| Auditing or improving performance | `.claude/skills/performance/SKILL.md` |
| Security audit | `.claude/skills/security-audit/SKILL.md` |
| Restructuring or cleaning up existing code | `.claude/skills/refactor/SKILL.md` |
| Writing a PRD or feature spec | `.claude/skills/prd-writer/SKILL.md` |
| Writing unit or integration tests with Vitest | `.claude/skills/test-runner/SKILL.md` |
| Building React components or frontend UI | `.claude/skills/frontend-patterns/SKILL.md` |

---

# Claude-Specific Instructions

- Never edit files in `.claude/` or `.github/` directly — they are generated by `scripts/sync-ai-config.mjs`. Edit `.team/` instead.
- Never respond to a routed request without activating the correct agent via the Agent tool.
- Never skip loading a skill file for a domain-specific request.

---

## Agent routing (Claude Code)

Claude Code activates specialist agents based on the **user's intent**, not exact keywords.
Read the prompt, understand what the user is trying to accomplish, and activate the right agent.
Do not respond as a general assistant when a specialist agent exists for the task.

When activating an agent, launch it as a sub-agent with the full user prompt.
The sub-agent responds directly — do not summarise or filter its output.

Agents available in `.claude/agents/`.

---

## Skill loading

Skills are detailed instruction sets for specific domains. Load the relevant skill
before responding — it contains project-specific conventions that override general
best practices. Skills are in `.claude/skills/`.

| User's goal                                   | Skill to load                               |
| --------------------------------------------- | ------------------------------------------- |
| Investigating or fixing a bug                 | `.claude/skills/debug/SKILL.md`             |
| Writing or fixing Playwright / E2E tests      | `.claude/skills/e2e-testing/SKILL.md`       |
| Auditing or improving accessibility (WCAG)    | `.claude/skills/accessibility/SKILL.md`     |
| Auditing or improving performance             | `.claude/skills/performance/SKILL.md`       |
| Security audit                                | `.claude/skills/security-audit/SKILL.md`    |
| Restructuring or cleaning up existing code    | `.claude/skills/refactor/SKILL.md`          |
| Writing a PRD or feature spec                 | `.claude/skills/prd-writer/SKILL.md`        |
| Writing unit or integration tests with Vitest | `.claude/skills/test-runner/SKILL.md`       |
| Building React components or frontend UI      | `.claude/skills/frontend-patterns/SKILL.md` |

---

## Multi-agent tasks

For complex tasks that span multiple concerns, activate agents in sequence:

1. **Plan then implement:** activate `planner` first, present the plan, then ask
   the user to confirm before activating `implementer`.
2. **Implement then review:** after `implementer` finishes, automatically activate
   `code-reviewer` on the output before presenting it to the user.
3. **Implement then test:** after `implementer` finishes a feature with no E2E tests,
   prompt the user: "Should I also write E2E tests for this flow?"

---

## What Claude Code must never do

- Respond to a routed request without activating the correct agent
- Skip loading a skill file for a domain-specific request
- Edit files in `.claude/` or `.github/` directly — these are generated by sync
- Make changes to auth, CORS, CSP, or security headers without flagging approval required