# CXR Production-Readiness Audit — Triage & Status (2026-07-09)

Source: 10-dimension audit workflow (`wf_da553687-3b2`), 70 deduped findings, 42 adversarially
verified before the run hit a session limit (24 confirmed real, 18 refuted). The full per-finding
text (`PRODUCTION_AUDIT_2026-07.md`) was never committed to this repo — this triage log is the
surviving record.

> **Historical status log, not a live reference.** Predates commit `ad1910f74`
> (2026-07-17, Infolinks Impression + single-hit deferred passback + AdProvider prop
> removal). Line-count claims (e.g. `index.jsx` LOC) and any `AdProvider.tsx` line
> references below are stale — `index.jsx` is now 267 lines (destroy control added).

This file tracks what was **fixed**, what is **deferred for team approval**, and what remains
**unverified** (the ~28 findings whose verify agents didn't run).

---

## ✅ Fixed this pass (committed)

| Severity | Finding | Where |
| -------- | ------- | ----- |
| HIGH (security) | CTA / profile link-out anchors rendered untrusted ad/feed URLs into `<a href>` → `javascript:`/`data:` XSS on click | `utils/safeHref.ts` + applied at LinkoutButton, DefaultBottomBar (CTA + profile), FullscreenBottomBar |
| HIGH (reliability) | HLS player had no fatal-ERROR handler → a network/media error stalled the reel forever | `usePlayerLifecycle.ts` ERROR handler (network→startLoad, media→recover-once, else→destroy) |
| HIGH (reliability) | GenAd SDK load rejection (ad-blocker/network) swallowed → slot silently empty, no no-fill, no analytics | `genAdSdk.ts` `.catch` now terminalizes as `ad:nofill` + `Ad Request Failed` |
| HIGH (correctness) | `canplay` retry listener used `{ once:true }` → leaked on unmount / isPlay flip, could fire stale `tryPlay` | `usePlayerLifecycle.ts` effect cleanup removes it |
| HIGH (dx) | `tdd:pairing` / `tdd:order` scripts point to deleted files → always crash | removed from package.json + PROJECT.md |
| HIGH (deps) | `VITE_CXR_GENAI_SDK_URL` required by validateEnv but unused in src → blocks every QA/prod build | removed from schema, `.env.*.example`, README |
| HIGH/MED (docs) | README deploy pipeline wrong (no CDN purge, path not version-derived); env-setup section wrong (env-cmd pulls `../genai/.env`); `ad:removed` event undocumented | README corrected |
| MED/LOW (docs) | docs.md missing ADR 005; stale test count | fixed |
| — (earlier pass) | config.ts console.log config leak; coverage gate red; no-console not enforced | commits `caf5b0a1c`, `353481188` |

Verification after fixes: `typecheck` ✅ · `lint` ✅ · `test:coverage` ✅ (1382 tests, 0 threshold errors).

---

## 🚩 Deferred — requires team approval / decision

These are **confirmed real** but touch revenue paths, shared packages, CI, or the
analytics/security boundary. Do NOT merge unilaterally (per CLAUDE.md governance).

### CRITICAL — hardcoded production ad-break VAST tags
`src/feed/feedTransforms.ts:124` — `REEL_AD_BREAK_TRITON_URL` / `REEL_AD_BREAK_INFY_URL` hardcode a
**residential IP** (`ip=122.170.151.237`), a fixed desktop UA, a fixed `user_id`, and static
`cb`/`AV_TIMESTAMP` cachebusters into the VAST tag. Every reel ad-break request goes out with one
developer's fingerprint → mis-targeted/filtered ads, no cachebusting, likely a privacy issue.
The `TODO(cxr)` on line 119 already flags the fix: **backend must return ad config per reel**;
interim, populate ip/ua/timestamp from runtime macros the SDK already supports. *Revenue-critical —
needs ad-ops + backend sign-off.*

### HIGH — RudderStack snippet loads `polyfill-fastly.io`
`src/analytics/rudderstack.ts:66` — the inlined RudderStack v3 loader has a fallback that injects
`https://polyfill-fastly.io/v3/polyfill.min.js` into the **top page**. That domain family was the
2024 supply-chain-attack vector. Modern targets already have `Promise`/`Symbol`, so the branch is
dead weight. Fix: strip the polyfill fallback or self-host from `media.begenuin.com`. *Touches the
analytics loader + a snapshot test pins the vendor snippet — needs team + security approval; do not
change CSP/headers without sign-off.*

### CRITICAL — no CI runs CXR typecheck/tests/coverage/budget
`.github/workflows/lint.yml` — only `lint` runs on PRs. The strict per-file coverage gate, tsc, 100+
test files, and the ad-resource-budget harness are **never enforced in CI**. Add a CXR job running
`pnpm --filter=@genuin/contextual-reels typecheck test:coverage` and add the tasks to `turbo.json`.
*Modifies CI workflow — team approval required.*

### HIGH — `generateAdLink` returns a Replit sandbox URL
`src/feed/feedTransforms.ts:166` — returns the hardcoded `https://programmatic-dsp.infytvcode.repl.co/vast`
(a dev sandbox) as a VAST endpoint, ignoring its args. Likely dead (`transformReelData` path) — confirm
no runtime caller, then delete; else point at the real production DSP origin from config. *Verify caller
graph with the team before removing.*

### HIGH — fullscreen not instance-scoped
`src/providers/FullScreenProvider.tsx` — `enterFullScreen` uses shared `document.documentElement` and
the document-level `fullscreenchange` listener sets `isFullScreen` without checking which instance
owns the fullscreen element. With **multiple widgets on one page**, one entering fullscreen flips all
of them. Fix: compare `getFullscreenElement()` against this instance's overlay/root. *Behavioral change
to a provider — worth a focused PR + multi-instance test.*

### HIGH — feed renders eagerly (no virtualization)
`src/feed/ReelList.tsx:74` — every reel mounts a full `LightPlayer`/Vlitejs subtree, not just the
active ±1. On a long feed this is a large memory/CPU footprint and pressures the Heavy-Ad budget.
Fix: windowed rendering (placeholders for far-offscreen slides). *Sizeable perf refactor — own PR,
needs care with Embla scroll height.*

### HIGH — E2E depends on live QA GenAd + Bunny CDN (non-hermetic)
`tests/e2e/support/mountWidget.ts` — deliberately does not stub the ad waterfall or CDN media, so E2E
flakes on ad-server/CDN state. A deterministic stubbed mode exists in `tests/_mocks/genAdMock`.
*Documented tradeoff (ADR 004) — team should decide hermetic vs. real.*

---

## 🔍 Deferred — needs team sign-off (lower severity)

- **Dead `src/utils/eventBus.ts`** — no production import; deletion candidate (also drops it from the
  coverage set). Already noted in `.claude/codebase-map.md`.
- **Dead "old" control-bar branch** — `ControlLayer.tsx`, `AdControlLayer` `variant='old'`,
  `CompactControlBarOld`, V1 button clones. No production caller passes `variant='old'`. Safe delete
  after confirming with the team.
- **`config.ts` mixed-concern grab-bag** — env + ad-layout + stacked-variant + iframe detection in one
  file; PROJECT.md docs a `config/` split that doesn't exist. Refactor or update docs.
- **`MutePassbackGuard` stale-closure** (`App.tsx:339`) — empty-dep effect closes over `onAdFail` /
  strategy values; low impact today (values stable per mount) but fragile. Read through a ref.
- **RudderStack full-snippet snapshot test** — pins 44 lines of minified vendor code; brittle. Replace
  with targeted behavioral assertions.
- **`index.jsx` bootstrap coverage-excluded AND not E2E-covered** — 212 LOC of branching orchestration
  (instance-id, dedup, ad.size, unmount observer) untested. Extract testable helpers into a TS module.
- **PROJECT.md source layout stale** — lists `loader/`, `boot/`, `config/` dirs that don't exist; omits
  `monitoring/`, `strategies/`, `platform/`, `shadow-dom`. Regenerate from real `src/`.

---

## ⏳ Unverified (verify agents didn't run — treat as leads, not confirmed)

~28 of the 70 findings never got a verify pass and were NOT adversarially checked —
confirm each against source before acting. The completeness-critic pass (accessibility, i18n,
browser-compat, mobile/touch, release/rollback, monitoring alert wiring) also did not run; a re-run
of the workflow would cover those gaps.
