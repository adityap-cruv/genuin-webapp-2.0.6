# Skills

Complete index of every skill in `.octo/skills/`. Each skill is a self-contained
procedure — read the matching file before doing the work it covers. Skills are
matched by intent (the "Use when…" trigger below); you do not type a slash command.

> **MANDATORY skills are marked `[MUST USE]`.** When the trigger matches, using the
> skill is non-negotiable, not optional.

## Must-use (always-on — check these FIRST)

These three are mandatory: apply each whenever its trigger appears, before reaching for any
other skill.

- `web-sdk-video-embed-skill`: **[MUST USE]** Use **whenever generated code must display
  video ANYWHERE** (a clip, reel, feed, carousel, or contextual feed). You MUST mount a
  Genuin Web SDK placement/embed — a container `<div>` + guarded `window.genuin.init(...)` —
  and MUST NOT emit `VideoPlayer`/`VideoPlayerV2`/`VideoPoster`/`VideoPage`/`PlayerSwiper`/
  a raw `<video>`/a video `<iframe>` for content video. Do NOT use for non-video UI, images,
  or audio-only surfaces.
- `hierarchical-tree`: **[MUST USE]** Use **whenever you build or emit a Page layout
  artifact** for the Hierarchical Layout System (article/recap/topic-hub/gallery/section/
  landing, or brand/advertiser/sponsorship/generative destinations). Produce a typed `Page`
  module validated by the Zod schema, via the default UI/slot renderers and breakpoint
  contract, and wire every `video` slot through `web-sdk-video-embed-skill`. Do NOT hand-roll
  page layouts that bypass the artifact schema.
- `hierarchical-theme`: **[MUST USE]** Use **whenever a publisher palette / theming is
  introduced or changed** — add a `.theme-<slug>` block in
  `packages/tailwind-config/themes.css` and extend the `ThemeName` union. Do NOT introduce
  brand colors via ad-hoc inline styles or one-off CSS outside this system.

## Understanding the codebase

- `zoom-out`: Use when onboarding to or mapping an unfamiliar area (modules, callers, data
  flow, the big picture) before line-by-line reading. Not for deep-reading one known file or
  planning a change.
- `codebase-memory`: Use at the START of any codebase investigation / "where is X" / bug
  hunt (read `.claude/codebase-map.md` first) and at the END to record non-obvious findings
  back into it.

## Building & frontend

- `frontend-patterns`: Use when creating or modifying React components, hooks, Next.js
  pages, forms, or styling per this repo's React 19 / Next.js 15 App Router / Tailwind v4 /
  TanStack Query v5 conventions and atomic design. Not for perf, a11y, or tests.
- `seo-geo-optimization`: Use when auditing, fixing, or generating SEO / GEO / AIO surfaces:
  page routes/components, metadata, JSON-LD/schema, Open Graph/Twitter tags, canonicals,
  sitemaps, robots, blog/video/community/brand/profile/entity pages, or requests to show up
  in Google, ChatGPT, Perplexity, Gemini, and similar answer engines. Also use when editing
  user-facing pages that affect crawlable search surface.
- `composition-patterns`: Use when a component has too many boolean props or when designing
  the public API of a reusable molecule/organism in `packages/components` — compound
  components, provider-injected state, explicit variants, children over render props,
  React 19 ref-as-prop.
- `nextjs-server-performance`: Use when writing or reviewing Next.js 15 Server Components,
  Server Actions, Route Handlers, or data fetching that feels slow or serial (RSC waterfalls,
  the server→client boundary). Not for client render perf (use `performance`).
- `nextjs-cache`: Use when Next.js 15 content is stale, a route rebuilds too often/rarely, a
  GET Route Handler stopped caching, or you're unsure why a route is dynamic vs static
  (caching, revalidation, ISR, `revalidateTag`/`revalidatePath`, `staleTimes`).

> `hierarchical-tree` and `hierarchical-theme` are also building skills, but they are
> **mandatory** — see the "Must-use" section above.

## Reviewing & quality

- `performance`: Use when something is slow/janky, the bundle is too large, or a render is
  expensive — React re-renders, memoization (React Compiler-aware), code splitting, bundle
  size, image/LCP, TanStack Query caching. Not for general component building or a11y.
- `accessibility`: Use when auditing or fixing WCAG 2.1 AA accessibility — semantic HTML,
  keyboard nav, focus, form labels, colour contrast, ARIA, reduced-motion. Not for general UI
  building or non-a11y visual review.
- `web-design-review`: Use when reviewing/auditing/polishing UI design, UX, motion,
  typography, CLS, images, navigation/URL state, dark mode, i18n, or hydration safety. Not for
  a11y/WCAG (use `accessibility`) or data architecture (use `frontend-patterns`).
- `security-audit`: Use when asked whether code is safe, to review an auth/input/secrets
  change, or to hunt for vulnerabilities (read-only — never modifies files; auth/CORS/CSP
  changes need explicit team approval).
- `refactor`: Use when restructuring, renaming, deduplicating, or cleaning up existing code
  without changing observable behaviour. Not for bug fixes or new features.

## Testing & debugging

- `debug`: Use when something is broken, throwing, crashing, or behaving unexpectedly —
  runtime errors, failing tests, repo-specific gotchas (Turborepo cache, pnpm resolution,
  Next.js 15 async params, Tailwind v4 renames, NextAuth v5). Reproduce → localise →
  hypothesise → verify → minimal fix.
- `test-runner`: Use when adding, fixing, or interpreting unit/integration tests — Vitest,
  plus Jest in `packages/ui`. Not Playwright E2E (use `e2e-testing`).
- `e2e-testing`: Use when writing, fixing, or reviewing Playwright E2E/integration tests,
  page objects, or selectors in `apps/webapp` E2E or the web-sdk, using the Page Object Model.
  Not for unit/component tests or non-test bugs.
- `eval-feature`: Use when asked to test/eval a feature the agent just built ("test this
  feature", "eval what you built", "verify this scenario works") — turn its acceptance
  criteria into automated static/behavioral/llm checks, get the user to approve the
  test-plan YAML, run the checks, report a weighted score, then delete every test file
  created. Self-contained (no eval framework needed) and not tied to PRs. Not for the
  project's permanent test suite (use `test-runner`/`e2e-testing`).

## Planning & process

- `grill-me`: Use when the user wants to stress-/pressure-test a plan or design, says "grill
  me" / "interrogate me", or kicks off an underspecified feature — interview one question at a
  time until requirements are clear. Not for clear requirements, formal specs, or
  solution-space exploration.
- `prd-writer`: Use when asked to write, update, or review a PRD — a spec, feature
  requirements, user stories, or Given/When/Then acceptance criteria. Not for implementation
  planning.
