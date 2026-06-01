---
name: frontend-patterns
description: Build React components and frontend UI following this repo's conventions — React 19 (no React.FC, initialized refs), Next.js 15 App Router (Server Components by default), Tailwind v4, TanStack Query v5, atomic design (atoms in packages/ui, molecules/organisms in packages/components). Use when creating or modifying components, hooks, pages, forms, or styling. Do NOT use for performance tuning (use performance), accessibility audits (use accessibility), or writing tests.
origin: ECC (adapted for Genuin webapp)
---

# Frontend Development Patterns

Conventions for React 19, Next.js 15 App Router, TypeScript strict, Tailwind v4, and TanStack Query v5.

## Core rules (always apply)

- No `React.FC`. Use plain function components with explicit prop types.
- All `useRef` initialized: `useRef<T>(null)`.
- Server Components by default — add `'use client'` only when interactivity is needed.
- TanStack Query v5 for server state — do not hand-roll fetch hooks.
- React Compiler handles most memoization automatically — only add manual memo where you measure a real problem.
- Zod for validation at all trust boundaries. Return `{ data, error }` from actions/API boundaries.
- Atomic design: atoms → `packages/ui`, molecules/organisms → `packages/components`, pages → `apps/webapp`.

## Reference files — read the one that matches the task

Load the matching file for detailed patterns and code examples. Don't read them all up front.

| Task | Read |
| ---- | ---- |
| Composition, compound components, custom hooks | [references/components.md](references/components.md) |
| Local/global state (Context + reducer) and server state (TanStack Query v5) | [references/state-and-data.md](references/state-and-data.md) |
| Server Components, Client Components, Server Actions, forms, error boundaries | [references/nextjs-app-router.md](references/nextjs-app-router.md) |
| Tailwind v4 utilities and renames | [references/styling-tailwind-v4.md](references/styling-tailwind-v4.md) |
| Keyboard nav, focus management, code splitting, virtualization | [references/accessibility-and-performance.md](references/accessibility-and-performance.md) |

> This skill is for **building** UI. For a performance *audit* use the `performance` skill; for an
> accessibility *audit* use the `accessibility` skill.
