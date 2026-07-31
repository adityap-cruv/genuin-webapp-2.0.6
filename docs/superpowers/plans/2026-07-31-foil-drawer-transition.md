# Foil Drawer Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a smooth 450ms opening and closing transition to the Foil `/home` content drawer.

**Architecture:** Extend the existing home client state with an `open`/`closing` phase. CSS owns the directional animations; React keeps the selected content mounted until closing completes and then restores focus.

**Tech Stack:** React, TypeScript, CSS Modules, Playwright

## Global Constraints

- Keep the browser URL at `/home`.
- Keep the shared header and sidebar visible.
- Reuse the existing local article and Fleet profile content.
- Do not create a commit.

---

### Task 1: Animate both drawer directions

**Files:**

- Modify: `apps/webapp/tests/e2e/foil-article-local.spec.ts`
- Modify: `apps/webapp/src/app/(site)/(new)/home/client-page.tsx`
- Modify: `apps/webapp/src/app/(site)/(new)/home/client-page.module.css`

**Interfaces:**

- Consumes: the existing `DrawerSelection` and `closeContent` behavior.
- Produces: `data-state="opening" | "open" | "closing"` on `foil-content-drawer`.

- [ ] **Step 1: Write the failing test**

Assert that opening passes through `data-state="opening"` before `open`, then clicking the close button changes the drawer to `closing`, keeps it visible during exit, and removes it after the transition.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts --grep "opens and closes a local article"`

Expected: FAIL because the drawer currently has no `data-state="closing"` phase.

- [ ] **Step 3: Implement the minimal state and CSS changes**

Add an `open`/`closing` phase, delay unmounting for 450ms, restore trigger focus after unmount, and define matching slide-in/slide-out keyframes. Respect `prefers-reduced-motion` by closing immediately.

- [ ] **Step 4: Run focused and full verification**

Run the focused test, the complete Foil E2E file, TypeScript type checking, Prettier checking, and `git diff --check`.

- [ ] **Step 5: Leave changes uncommitted**

Report the verification results and do not create a commit.
