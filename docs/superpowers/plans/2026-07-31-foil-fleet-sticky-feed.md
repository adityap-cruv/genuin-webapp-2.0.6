# Foil Fleet Sticky Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the existing Foil live feed placement as a bounded sticky rail beside the local Fleet profile content.

**Architecture:** Reuse the shared `ArticlePlacement` integration and the exact article feed credentials. Convert the athlete profile content wrapper into a desktop two-column grid whose right column owns the sticky rail; collapse it into normal document flow below 820px.

**Tech Stack:** Next.js App Router, React, CSS Modules, Genuin SDK placement wrapper, Playwright.

## Global Constraints

- Keep the existing athlete hero, statistics, Fan Reactions, Championship Outlook, Related Video, and footer unchanged.
- Use style ID `6a032db60ae65ee82495dd73` and placement ID `6a032db60ae65ee82495dd72`.
- The sticky rail must stop before the existing Fan Reactions section.
- Below 820px, render the feed in normal document flow rather than sticky positioning.
- Reuse `ArticlePlacement`; do not add another SDK loader.

---

### Task 1: Fleet Profile Sticky Feed

**Files:**
- Modify: `apps/webapp/tests/e2e/foil-article-local.spec.ts`
- Modify: `apps/webapp/src/app/(site)/(new)/foil/_components/foil-athlete-page.tsx`
- Modify: `apps/webapp/src/app/(site)/(new)/foil/_components/foil-athlete-page.module.css`

**Interfaces:**
- Consumes: `ArticlePlacement({ articleSlug, className, placementId, styleId, testId })`
- Produces: `data-testid="foil-athlete-sticky-feed"` on the sticky wrapper and a child `.gen-sdk-class[data-placement-id="6a032db60ae65ee82495dd72"]`.

- [ ] **Step 1: Write the failing desktop behavior test**

Add this test inside `Feature: Local Foil Fleet profiles`:

```ts
test("renders the article feed as a bounded sticky rail on Fleet profiles", async ({ page }) => {
  await page.goto("/foil/athletes/slingsby");

  const stickyRail = page.getByTestId("foil-athlete-sticky-feed");
  await expect(stickyRail).toHaveCSS("position", "sticky");
  await expect(stickyRail.locator(".gen-sdk-class")).toHaveAttribute(
    "data-placement-id",
    "6a032db60ae65ee82495dd72"
  );

  const fanReactions = page.getByTestId("foil-athlete-fan-reactions");
  const stickyBoundaryBottom = await stickyRail.evaluate(
    (element) => element.parentElement?.parentElement?.getBoundingClientRect().bottom
  );
  const fanReactionsTop = await fanReactions.evaluate((element) => element.getBoundingClientRect().top);
  expect(stickyBoundaryBottom).toBeLessThanOrEqual(fanReactionsTop + 1);
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts --grep "bounded sticky rail"
```

Expected: FAIL because `foil-athlete-sticky-feed` does not exist.

- [ ] **Step 3: Add the shared feed placement to the profile content region**

In `foil-athlete-page.tsx`, replace the single-column `profileWrap` content with a content grid. Preserve the existing `profileBody` markup and add:

```tsx
<aside className={styles.stickyColumn} aria-label="Live Foil feed">
  <div className={styles.stickyFeed} data-testid="foil-athlete-sticky-feed">
    <p className={styles.railLabel}>Live Feed</p>
    <ArticlePlacement
      articleSlug={`athlete-${athlete.slug}`}
      className={styles.stickyFeedHost}
      placementId="6a032db60ae65ee82495dd72"
      styleId="6a032db60ae65ee82495dd73"
      testId="foil-athlete-sticky-feed"
    />
  </div>
</aside>
```

Add `data-testid="foil-athlete-fan-reactions"` to the existing Fan Reactions section so the test can verify the sticky boundary.

- [ ] **Step 4: Add desktop and responsive layout styles**

In `foil-athlete-page.module.css`:

```css
.profileWrap {
  display: grid;
  grid-template-columns: minmax(0, 740px) minmax(300px, 360px);
  justify-content: center;
  gap: clamp(32px, 5vw, 76px);
  max-width: none;
}

.stickyColumn {
  min-width: 0;
}

.stickyFeed {
  position: sticky;
  top: 80px;
}

.railLabel {
  margin: 0 0 10px;
  color: var(--muted);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stickyFeedHost {
  width: 100%;
  height: 540px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}
```

At `max-width: 820px`, switch `.profileWrap` to `display: block`, give `.stickyColumn` a top margin, set `.stickyFeed` to `position: static`, and constrain `.stickyFeedHost` to `min(100%, 540px)` centered. Keep `.outlook` single-column by overriding its display.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts --grep "bounded sticky rail"
```

Expected: PASS.

- [ ] **Step 6: Run complete scoped verification**

Run:

```bash
pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts
pnpm --filter @genuin/webapp typecheck
pnpm exec prettier --check \
  'apps/webapp/src/app/(site)/(new)/foil/_components/foil-athlete-page.tsx' \
  'apps/webapp/src/app/(site)/(new)/foil/_components/foil-athlete-page.module.css' \
  'apps/webapp/tests/e2e/foil-article-local.spec.ts'
git diff --check
```

Expected: all Foil tests pass, TypeScript exits 0, formatting passes, and no whitespace errors are reported.

