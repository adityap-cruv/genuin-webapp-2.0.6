# Foil Season Calendar Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open locally generated Season Calendar event details in the existing `/home` content drawer with the same sticky Foil feed used by article and fleet details.

**Architecture:** Add a focused event data module and event detail renderer under the existing Foil feature. Pass calendar selection through a new `Home` callback into the existing drawer selection union, preserving one drawer implementation and the unchanged `/home` URL.

**Tech Stack:** React 19, Next.js, TypeScript, CSS Modules, existing `GenuinEmbedCarousel` placement integration.

## Global Constraints

- Preserve `/home`, the current header, sidebar, drawer animation, article/fleet behavior, and placement credentials.
- Use local generated content for Sydney, Auckland, Saint-Tropez, Plymouth, and Halifax.
- Reuse the existing sticky Foil feed placement.
- Do not commit changes.
- Do not run automated tests; the user will perform experiential verification.

---

### Task 1: Define local Season Calendar content

**Files:**
- Create: `apps/webapp/src/app/(site)/(new)/foil/_data/foil-events.ts`

**Interfaces:**
- Produces: `FoilEvent`, `foilEvents`, and `getFoilEvent(slug: string): FoilEvent | undefined`.

- [ ] **Step 1: Add a typed event model**

Define fields for `slug`, `venue`, `country`, `dates`, `status`, `tag`, `title`, `summary`, `overview`, `courseNotes`, and `schedule`.

- [ ] **Step 2: Add all five event records**

Create complete local copy for Sydney, Auckland, Saint-Tropez, Plymouth, and Halifax, using the dates and statuses displayed on the calendar cards.

- [ ] **Step 3: Add the event lookup helper**

Export `getFoilEvent` using an exact slug match so the drawer can resolve a selected calendar card without network access.

### Task 2: Build the Foil event detail view

**Files:**
- Create: `apps/webapp/src/app/(site)/(new)/foil/_components/foil-event-page.tsx`
- Create: `apps/webapp/src/app/(site)/(new)/foil/_components/foil-event-page.module.css`

**Interfaces:**
- Consumes: `FoilEvent` and the existing `ArticlePlacement` component.
- Produces: `FoilEventPage({ event }: { event: FoilEvent })`.

- [ ] **Step 1: Render the centered event header**

Show the event tag, venue, dates, country, and status within the same centered header width used by existing drawer detail content.

- [ ] **Step 2: Render generated event information**

Create readable sections for the race overview, course intelligence, and race-week schedule using only the selected local event record.

- [ ] **Step 3: Reuse the sticky feed placement**

Place `ArticlePlacement` in the right column with placement `6a032db60ae65ee82495dd72`, style `6a032db60ae65ee82495dd73`, and an event-specific container ID. Keep it sticky on desktop and stacked below copy on narrow screens.

### Task 3: Connect calendar cards to the existing drawer

**Files:**
- Modify: `packages/components/src/page/home/home.tsx`
- Modify: `packages/components/src/page/home/home.module.css`
- Modify: `apps/webapp/src/app/(site)/(new)/home/client-page.tsx`

**Interfaces:**
- `HomeProps.onOpenCalendar?: (slug: string) => void`
- `DrawerSelection` gains `{ kind: "calendar"; slug: string }`.

- [ ] **Step 1: Add stable slugs to the calendar card data**

Use `sydney`, `auckland`, `saint-tropez`, `plymouth`, and `halifax`.

- [ ] **Step 2: Make every card accessible and selectable**

Render each card as a semantic button-style element that invokes `onOpenCalendar(slug)` for click, Enter, and Space while retaining the existing visual layout.

- [ ] **Step 3: Extend the drawer state**

Resolve the selected event using `getFoilEvent`, include its venue in the accessible drawer title, and render `FoilEventPage` inside the existing animated drawer.

- [ ] **Step 4: Preserve fallback behavior**

Include the event in the existing availability condition so a missing event uses the current content-unavailable message rather than an empty drawer.

- [ ] **Step 5: Perform targeted static review**

Inspect the touched diff and run `git diff --check` only. Do not execute automated tests or a full build.
