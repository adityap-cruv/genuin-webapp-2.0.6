# Foil Fleet Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the first three externally framed Fleet profiles with editable local pages and give the remaining three Fleet cards the prototype's exact unavailable-profile behavior.

**Architecture:** Store the extracted Slingsby, Outteridge, and Delapierre profile content as typed local data, then render all three through one reusable `FoilLocalAthletePage` component that follows the existing local Foil article pattern. Keep Fleet-card navigation in the existing Home component; real profiles use local Next.js routes, while unavailable profiles use the mounted design-system toaster.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, Genuin UI toaster, Genuin placement component, Playwright.

## Global Constraints

- Preserve the current header, sidebar, Foil home layout, and all unrelated dirty-worktree changes.
- The first three Fleet cards must never iframe or redirect to the prototype.
- The final three Fleet cards must remain on `/home` and show the exact prototype copy `Profile coming soon: {full name}…`.
- Reuse the existing Genuin placement integration and mounted application toaster.
- Do not introduce a hierarchical-tree artifact; this is an ordinary React/Next route.

---

### Task 1: Fleet behavior regression tests

**Files:**
- Modify: `apps/webapp/tests/e2e/foil-article-local.spec.ts`

**Interfaces:**
- Consumes: `/home` Fleet cards and `/foil/athletes/[slug]` routes.
- Produces: browser-level assertions for local profile rendering and unavailable-profile messages.

- [ ] **Step 1: Write the failing local-profile test**

Add a parameterized Playwright test for `slingsby`, `outteridge`, and `delapierre` that visits each local route, asserts `data-testid="foil-local-athlete"`, asserts its athlete heading, and asserts that no `iframe` exists.

- [ ] **Step 2: Run the local-profile test and verify RED**

Run: `pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts --grep "local Fleet profiles"`

Expected: FAIL because the existing athlete route still renders `FoilSourcePage` with an iframe.

- [ ] **Step 3: Write the failing unavailable-profile test**

Visit `/home`, click the Dylan Mills, Martine Grael, and Diego Barceló profile controls one at a time, and assert the exact visible messages:

```text
Profile coming soon: Dylan Mills…
Profile coming soon: Martine Grael…
Profile coming soon: Diego Barceló…
```

- [ ] **Step 4: Run the unavailable-profile test and verify RED**

Run: `pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts --grep "coming soon"`

Expected: FAIL because those three cards are currently non-interactive articles.

### Task 2: Extracted local athlete data and assets

**Files:**
- Create: `apps/webapp/src/app/(site)/(new)/foil/_data/foil-athletes.ts`
- Create: `apps/webapp/src/app/(site)/(new)/foil/_data/athletes.json`
- Create: `apps/webapp/public/foil/athletes/slingsby-hero.*`
- Create: `apps/webapp/public/foil/athletes/outteridge-hero.*`
- Create: `apps/webapp/public/foil/athletes/delapierre-hero.*`

**Interfaces:**
- Produces: `FoilAthlete`, `foilAthletes`, and `getFoilAthlete(slug: string)`.

- [ ] **Step 1: Capture the three prototype profiles**

Extract each profile's title, team, category, hero image, rank, stats, profile body, results table, championship outlook, placement labels, and placement credentials into `athletes.json`; store the exact hero images locally.

- [ ] **Step 2: Add the typed data adapter**

Define a `FoilAthlete` type matching the JSON fields and export a slug lookup equivalent to the existing article-data lookup.

### Task 3: Shared local Fleet profile renderer

**Files:**
- Create: `apps/webapp/src/app/(site)/(new)/foil/_components/foil-athlete-page.tsx`
- Create: `apps/webapp/src/app/(site)/(new)/foil/_components/foil-athlete-page.module.css`
- Modify: `apps/webapp/src/app/(site)/(new)/foil/athletes/[slug]/page.tsx`

**Interfaces:**
- Consumes: `FoilAthlete` and the existing `GenuinEmbedCarousel` integration.
- Produces: `FoilLocalAthletePage({ athlete }: { athlete: FoilAthlete })` and local athlete routes.

- [ ] **Step 1: Render the local profile shell**

Implement the prototype's sticky Foil navigation, hero, athlete identity, rank, statistics, profile copy, results table, championship outlook, and footer with semantic HTML.

- [ ] **Step 2: Reuse the prototype placement configuration**

Render Fan Reactions with style `69f4814de964b815fc224fed` / placement `69f4814de964b815fc224fec`, and Related Video with style `69f481d1e964b815fc22502c` / placement `69f481cbe964b815fc225021`, using API key `8a5582af807e98dbad239b749a1cd7fb026831eec1a95d00` and SDK `https://media.begenuin.com/sdk/2.0.6/gen_sdk.min.js`.

- [ ] **Step 3: Switch athlete routes to local data**

Replace `FoilSourcePage` with `getFoilAthlete` and `FoilLocalAthletePage`, preserve `notFound()`, and generate metadata from local data.

- [ ] **Step 4: Run the local-profile test and verify GREEN**

Run the Task 1 local-profile command and confirm all three cases pass.

### Task 4: Prototype-matching unavailable Fleet cards

**Files:**
- Modify: `packages/components/src/page/home/home.tsx`
- Modify only if needed for button reset: `packages/components/src/page/home/home.module.css`

**Interfaces:**
- Consumes: the already-mounted `Toaster` and `Toast.Success` from `@genuin/ui`.
- Produces: accessible buttons for the three unavailable athlete cards.

- [ ] **Step 1: Add full card metadata**

Give each Fleet entry an explicit optional slug and make every card an interactive control without changing its visual treatment.

- [ ] **Step 2: Show the exact unavailable message**

Use `Toast.Success({ message: `Profile coming soon: ${name}…` })` for Mills, Grael, and Barceló, and keep the first three as local links.

- [ ] **Step 3: Run the coming-soon test and verify GREEN**

Run the Task 1 unavailable-profile command and confirm all three messages pass.

### Task 5: Verification

**Files:**
- No additional production files.

**Interfaces:**
- Validates the complete Fleet change without committing unrelated workspace edits.

- [ ] **Step 1: Run focused browser tests**

Run: `pnpm --filter @genuin/webapp exec playwright test tests/e2e/foil-article-local.spec.ts`

- [ ] **Step 2: Run TypeScript validation**

Run: `pnpm --filter @genuin/webapp typecheck`

- [ ] **Step 3: Inspect the scoped diff**

Review only the Fleet data, Fleet profile component, athlete route, Home Fleet cards, test, and this plan. Do not stage or modify unrelated dirty files.
