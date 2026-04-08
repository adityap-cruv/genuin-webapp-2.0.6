---
name: debug
description: Debugging methodology for runtime errors, failing tests, and unexpected behaviour
---

# Skill: Debug

Use this skill for all debugging tasks: runtime errors, failing tests, unexpected
behaviour, and production incidents. It defines the methodology, output format,
and patterns to check first.

---

## Methodology — follow in order, do not skip steps

### Step 1 — Reproduce before touching anything

You must be able to reproduce the problem before you can fix it.

Answer these before writing a single line:

- What is the exact error message, stack trace, or unexpected output?
- What input, action, or condition triggers it?
- Is it consistent or intermittent?
- What environment does it occur in? (local dev / CI / staging / prod)
- When did it start? What changed recently?

If you cannot reproduce it, say so. Do not guess at a fix.

### Step 2 — Read the full stack trace

- The **bottom** of the stack trace is usually closer to the root cause than the top.
- Find the last frame in your own code — that is where to start reading.
- Note the exact file and line number. Open it before forming any hypothesis.

### Step 3 — Localise to a trust boundary

Find where bad data enters the system:

- API response that is not validated
- User input that is not sanitised
- Environment variable that is missing or wrong
- Database record in an unexpected shape
- External package returning something unexpected

### Step 4 — State your hypothesis explicitly

Before changing anything, write:

> "I think the problem is **X** because **Y**. To verify, I will **Z**."

One hypothesis. One verification. Do not change two things at once.

### Step 5 — Verify with a test or command

- Run the failing test in the affected package:
  - `packages/ui`: `pnpm --filter @genuin/ui test` (runs Jest + Vitest)
  - All other packages: `pnpm --filter <package> test` (Vitest only)
  - Single file: `pnpm vitest run src/path/to/failing.test.ts` from the package dir
- Or reproduce the error with a minimal script
- Read the actual output. If it contradicts your hypothesis, form a new one.

### Step 6 — Apply the minimal fix

- Change only what is necessary to fix the root cause.
- Do not rename, restructure, or improve unrelated code in the same change.
- If the fix is non-obvious, add a comment explaining _why_, not _what_.

### Step 7 — Verify the fix

- Run the full test suite or the affected tests after fixing.
- Confirm the original error no longer occurs.
- Confirm no other tests regressed.

---

## Output format

Always structure your debugging response as:

**Root cause:** One sentence — what was actually wrong.

**Why it happened:** Brief explanation — bad assumption, missing guard, race condition, stale cache, etc.

**Fix applied:** What changed and why — show the diff or the new code.

**Verification:** The command run and its output confirming the fix works.

**Regression risk:** Any other areas that could be affected by this change, if any.

---

## Common patterns — check these first

These cover the majority of bugs. Before diving deep, rule them out:

| Pattern                       | What to check                                                             |
| ----------------------------- | ------------------------------------------------------------------------- |
| **Null / undefined access**   | Missing `?.` optional chaining or a guard clause                          |
| **Async not awaited**         | `Promise` returned but not resolved before use — look for missing `await` |
| **Type mismatch at boundary** | API returns `string`, code expects `number`; use Zod to validate          |
| **Missing env variable**      | `process.env.X` is `undefined`, used as a value silently                  |
| **Wrong import path**         | ESM resolution failure — check for missing `.js` extension in imports     |
| **Stale dependency**          | Code expects a version of a package not installed — check `node_modules`  |
| **Test pollution**            | Shared mutable state between tests causing intermittent failures          |
| **Race condition**            | Two async operations completing in an unexpected order                    |
| **Wrong comparison**          | `==` vs `===`, `null` vs `undefined`, `0` vs `false`                      |
| **Off-by-one**                | Array index, pagination offset, date boundary                             |

---

## Monorepo-specific patterns

Check these first for bugs that only appear in certain packages or after adding a dependency:

| Pattern                       | What to check                                                             |
| ----------------------------- | ------------------------------------------------------------------------- |
| **Turborepo stale cache**     | Run `pnpm turbo clean` then rebuild — stale output causes phantom errors  |
| **Package not built**         | Run `pnpm build` from root before debugging cross-package imports         |
| **Missing `workspace:*`**     | A package referencing an internal dep by version number resolves to a published (outdated) version — fix to `workspace:*` |
| **Cross-app import**          | `apps/webapp` importing from `apps/web-sdk` or vice versa is not allowed — shared code must be in `packages/` |
| **pnpm resolution**           | After adding a new package, run `pnpm install` from root — not from the package dir |

---

## Next.js 15 App Router patterns

| Pattern                            | What to check                                                            |
| ---------------------------------- | ------------------------------------------------------------------------ |
| **Async `params` / `searchParams`**| In Next.js 15 these are Promises — `const { id } = await params` not `params.id` directly |
| **Hook in Server Component**       | `useState`, `useEffect`, `useContext` etc. cannot be used without `'use client'` |
| **Route Handler not caching**      | `GET` handlers are no longer cached by default in Next.js 15 — this is expected behaviour, not a bug |
| **Middleware not running**         | Check `apps/webapp/middleware.ts` matcher — the pattern must match the route exactly |
| **`auth()` returning null**        | Call `auth()` from `apps/webapp/auth.ts` — not from `next-auth` directly |

---

## Tailwind v4 patterns

| Symptom                  | Cause                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| Class applies in v3 but not v4 | Class was renamed — check the table below                          |
| `theme()` function not resolving | `theme()` is deprecated in v4 — use CSS variables instead         |

Renamed utilities to check:

| Old (v3)       | New (v4)         |
| -------------- | ---------------- |
| `shadow-sm`    | `shadow-xs`      |
| `shadow`       | `shadow-sm`      |
| `rounded-sm`   | `rounded-xs`     |
| `rounded`      | `rounded-sm`     |
| `outline-none` | `outline-hidden` |
| `ring`         | `ring-3`         |

---

## Auth (NextAuth v5) patterns

| Pattern                      | What to check                                                            |
| ---------------------------- | ------------------------------------------------------------------------ |
| **Session null in Server Component** | Use `auth()` from `apps/webapp/auth.ts`, not from `next-auth`  |
| **`NEXTAUTH_SECRET` missing**| NextAuth v5 requires this env var — check root `.env`                   |
| **Auth config not found**    | Config lives in `apps/webapp/auth.ts` and `apps/webapp/auth.config.ts`  |

---

## Selector and timing issues (Playwright)

If the bug is in an E2E test:

- **Never** add `page.waitForTimeout()` to fix a timing issue — find the real async event
- Use `await expect(locator).toBeVisible()` to wait for elements
- Use `waitForURL` or `waitForResponse` for navigation/network waits
- Check for race conditions between navigation and assertions
- If a test passes locally but fails in CI, check: slower machine speed, missing seed data, missing env vars

---

## What you must never do

- Apply a fix you cannot explain
- Suppress the error without fixing the cause (no empty `catch`, no `!` non-null assertions)
- Use `page.waitForTimeout()` to paper over a timing issue in Playwright
- Fix multiple unrelated bugs in one change — one fix per root cause
- Modify files in `.github/` or `.claude/` — those are generated by `sync-ai-config.mjs`