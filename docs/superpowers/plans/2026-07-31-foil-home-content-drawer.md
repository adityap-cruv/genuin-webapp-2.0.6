# Foil Home Content Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open existing local Foil articles and Fleet profiles in a right-side drawer on `/home` without changing the URL or hiding the shared header/sidebar.

**Architecture:** Add optional selection callbacks to the shared `Home` component and keep all app-owned drawer state, data resolution, focus management, and presentation in the home client layer. Reuse `FoilLocalArticlePage` and `FoilLocalAthletePage` with an embedded presentation mode so their content remains identical while page-only navigation chrome is omitted.

**Tech Stack:** Next.js 15, React, TypeScript, CSS Modules, Playwright.

## Global Constraints

- The URL must remain `/home` while content is open.
- The shared header and sidebar must remain visible.
- Existing local article and athlete content must remain unchanged.
- Standalone article and athlete routes must continue to work.
- Do not commit implementation changes in this session.

---

### Task 1: Add failing home drawer behavior tests

**Files:**
- Modify: `apps/webapp/tests/e2e/foil-article-local.spec.ts`

**Interfaces:**
- Consumes: current `/home`, `/foil/articles/[slug]`, and `/foil/athletes/[slug]` behavior.
- Produces: regression coverage for `foil-content-drawer`, `foil-content-drawer-close`, and unchanged `/home` URL behavior.

- [ ] **Step 1: Write the failing article drawer test**

Add a Playwright test that opens `/home`, clicks the lead Desk story, verifies `foil-content-drawer` and `foil-local-article` are visible, verifies the URL pathname is `/home`, verifies the shared Home and Popular navigation links remain visible, closes the drawer, and verifies focus returns to the Desk story trigger.

- [ ] **Step 2: Write the failing Fleet drawer test**

Add a Playwright test that opens `/home`, clicks Tom Slingsby's Fleet card, verifies `foil-content-drawer` and `foil-local-athlete` are visible, verifies the URL pathname remains `/home`, presses Escape, and verifies the drawer closes.

- [ ] **Step 3: Run the focused tests to verify RED**

Run: `pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts --grep "home content drawer"`

Expected: FAIL because the card clicks still navigate and `foil-content-drawer` does not exist.

### Task 2: Expose optional Home card-selection callbacks

**Files:**
- Modify: `packages/components/src/page/home/home.tsx`

**Interfaces:**
- Produces: `HomeProps` with optional `onOpenArticle?: (slug: string) => void` and `onOpenAthlete?: (slug: string) => void` callbacks.
- Preserves: existing Next.js links whenever the corresponding callback is not supplied.

- [ ] **Step 1: Add the callback contract**

Change `Home()` to `Home({ onOpenArticle, onOpenAthlete }: HomeProps)` and define the two optional callbacks.

- [ ] **Step 2: Make Desk story cards callback-aware**

Render the same card body through a button with the existing visual class and accessible label when `onOpenArticle` exists. Invoke it with the story slug. Otherwise retain the current `<Link href="/foil/articles/...">` fallback.

- [ ] **Step 3: Make linked Fleet cards callback-aware**

For Fleet entries with a slug, invoke `onOpenAthlete(slug)` through the existing card button styling when supplied. Otherwise retain the current `<Link href="/foil/athletes/...">`. Keep the three current coming-soon buttons unchanged.

### Task 3: Add embedded presentation support to local content pages

**Files:**
- Modify: `apps/webapp/src/app/(site)/(new)/foil/_components/foil-source-page.tsx`
- Modify: `apps/webapp/src/app/(site)/(new)/foil/_components/foil-athlete-page.tsx`

**Interfaces:**
- Produces: optional `presentation?: "page" | "drawer"` on `FoilLocalArticlePageProps` and `FoilLocalAthletePageProps`.
- Default: `"page"`, preserving standalone routes.

- [ ] **Step 1: Add the article presentation prop**

Default the prop to `"page"` and omit only `articleNav` when the value is `"drawer"`. Keep every content section and placement unchanged.

- [ ] **Step 2: Add the athlete presentation prop**

Default the prop to `"page"` and omit only `athleteNav` when the value is `"drawer"`. Keep every profile section and placement unchanged.

### Task 4: Implement the app-owned drawer shell

**Files:**
- Modify: `apps/webapp/src/app/(site)/(new)/home/client-page.tsx`
- Create: `apps/webapp/src/app/(site)/(new)/home/client-page.module.css`

**Interfaces:**
- Consumes: `Home` callbacks, `getFoilArticle(slug)`, `getFoilAthlete(slug)`, `FoilLocalArticlePage`, and `FoilLocalAthletePage`.
- Produces: local `DrawerSelection = { kind: "article" | "athlete"; slug: string } | null` state and the labelled `foil-content-drawer` overlay.

- [ ] **Step 1: Add state and data resolution**

Store the selected kind/slug in React state. Resolve the corresponding local record and render the existing content component with `presentation="drawer"`.

- [ ] **Step 2: Add the drawer shell**

Wrap Home in a full-size, positioned container. Render an absolute drawer covering that container with a right-to-left transform transition, `role="dialog"`, `aria-modal="true"`, an accessible title, and a close button with `data-testid="foil-content-drawer-close"`.

- [ ] **Step 3: Add independent scrolling and background locking**

Make the drawer body vertically scrollable and horizontally clipped. While open, make the underlying Home layer inert and non-scrollable without affecting the global header/sidebar. Record and restore the Home scroll offset when opening and closing.

- [ ] **Step 4: Add keyboard and focus behavior**

Capture the triggering element, focus the close button on open, close on Escape, and restore focus to the trigger on close.

- [ ] **Step 5: Add invalid-selection fallback**

If a selected slug is missing, render an unavailable-content message and retain the close control.

### Task 5: Verify the complete behavior

**Files:**
- Test: `apps/webapp/tests/e2e/foil-article-local.spec.ts`

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: verified drawer and preserved standalone route behavior.

- [ ] **Step 1: Run the new drawer tests**

Run: `pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts --grep "home content drawer"`

Expected: PASS.

- [ ] **Step 2: Run the full focused Foil suite**

Run: `pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts`

Expected: all Foil article, Fleet, sticky-placement, coming-soon, and drawer tests pass.

- [ ] **Step 3: Run TypeScript and formatting checks**

Run: `pnpm --filter @genuin/webapp typecheck`

Run: `pnpm exec prettier --check apps/webapp/src/app/\(site\)/\(new\)/home/client-page.tsx apps/webapp/src/app/\(site\)/\(new\)/home/client-page.module.css apps/webapp/src/app/\(site\)/\(new\)/foil/_components/foil-source-page.tsx apps/webapp/src/app/\(site\)/\(new\)/foil/_components/foil-athlete-page.tsx packages/components/src/page/home/home.tsx apps/webapp/tests/e2e/foil-article-local.spec.ts`

Expected: both commands pass.

- [ ] **Step 4: Check the patch for whitespace errors**

Run: `git diff --check`

Expected: no output.
