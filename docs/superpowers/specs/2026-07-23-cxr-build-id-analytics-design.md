# CXR per-build identifier in analytics — design

Date: 2026-07-23
Package: `@genuin/contextual-reels`

## Problem

The CXR loader (`gen_ext.min.js`) ships from a stable, version-pinned URL
(`cxr/<pkgVersion>/gen_ext.min.js`). We rebuild and redeploy to that same URL
repeatedly **without bumping `pkgVersion`**, on purpose — bumping the version
would force every partner to update their embed. The cost: analytics cannot
tell which build a data point came from. Everything reports `CXR_VERSION` /
`pkgVersion` = the same string across many distinct deployed builds, so once a
client's cache is cleared and they pull a newer artifact, there is no signal in
analytics identifying that newer build.

We need a per-build identifier baked into the artifact and surfaced in
analytics, without changing the version string.

## Solution overview

Stamp every build with a **`bid`** (build id) of the shape:

```
<shortCoreHash>.<gitSha>      e.g.  Dk3f9Xa2.b1e05db
```

- **`shortCoreHash`** — first 8 characters of the content hash the build already
  emits in `gen_ext-[hash].js` (`coreFile`, `vite.config.mjs`). Changes if and
  only if the shipped bytes change. This is the artifact identity, matching the
  Sentry/Datadog "bundle id" convention.
- **`gitSha`** — `git rev-parse --short HEAD` at build time, for source
  provenance (jump from a telemetry point to the commit). Guarded: if git is
  unavailable the segment is `nogit` and the build still succeeds.

The Vite plugin computes `bid` **once** in `writeBundle` (the only place the
core content hash is known) and is the single source of truth. It threads the
value to three analytics surfaces.

### Why a `window` global, not `define` / `import.meta.env`

The core content hash does not exist at transform time — Rollup computes it
while emitting the bundle, after `define` substitution has already happened.
So `define` / `import.meta.env` cannot carry the composite `bid` into the core
bundle. Instead the loader (which runs first and is patched post-build via
placeholder replacement, where the hash _is_ known) sets
`window.__CXR_BUILD_ID__`, and the core reads that global. This mirrors the
existing pattern where the loader owns cross-cutting boot state
(`window.__CXR_SCRIPT_PARAMS__`) that the core later consumes, and guarantees
all three surfaces report the identical string.

## Injection points

### 1. Loader `px-lo` beacon (`src/loader.jsx`)

- Add a build-time placeholder `__CR_BUILD_ID__` near the other loader
  constants.
- The `px-lo` URL becomes `<PIXEL_URL>/1/1/px-lo?bid=<id>`.
- `px-lo` is (and must remain) the **first** statement in the IIFE, so it reads
  the baked-in placeholder constant directly — NOT `window.__CXR_BUILD_ID__`
  (which is not set yet). This keeps the fail-safe "loader ran" guarantee.
- Immediately after the `px-lo` block, set `window.__CXR_BUILD_ID__ = BUILD_ID`
  (best-effort, wrapped) so the core can read it. Merge-safe is not required —
  last loader wins is acceptable, same as today's constants.

### 2. `px-script-error` pixel (`src/loader.jsx` + `src/observability/pixel-reporter.ts`)

Both paths fire this pixel; both add `bid`:

- **Loader path** (`buildSdkLoadPixelUrl`): `params.set("bid", BUILD_ID)` using
  the baked-in constant.
- **Core path** (`pixel-reporter.ts` `buildPixelUrl`): read
  `window.__CXR_BUILD_ID__` best-effort and `params.set("bid", value || "0")`,
  consistent with how every other pixel param defaults to `"0"` when unresolved.
  No new bundler coupling.

### 3. Rudderstack events (`src/analytics/analytics.ts`)

Stamp `build_id` as a property on the common event payload, alongside the
existing version / `visit_id` stamping, reading the same
`window.__CXR_BUILD_ID__` best-effort (omit or `"0"` when absent — follow the
surrounding convention for that payload).

## Vite plugin changes (`vite.config.mjs`)

In the existing `processLoaderPlugin.writeBundle`, after `coreFile` is resolved:

1. `shortCoreHash` = hash segment of `coreFile` (`gen_ext-<hash>.js`), first 8
   chars.
2. `gitSha` = `git rev-parse --short HEAD`, wrapped in try/catch →
   fallback `"nogit"`.
3. `BUILD_ID = \`${shortCoreHash}.${gitSha}\``.
4. Add `.replace(/__CR_BUILD_ID__/g, BUILD_ID)` to the existing replacement
   chain.
5. (Optional, nice-to-have) include `BUILD_ID` in the existing loader header
   comment for at-a-glance inspection of a deployed artifact.

## Field naming

- Pixels: query param **`bid`** (keeps pixel URLs lean).
- Rudderstack: property **`build_id`** (self-documenting in event payloads).

## Fail-safe / non-goals

- `px-lo` never depends on the global; core reads degrade to `"0"`, never throw.
- Byte-identical rebuilds of the same commit intentionally get the **same**
  `bid` — from the browser's perspective that is not a different build. A
  redeploy that changes any shipped byte changes the hash, hence the `bid`.
- No CSP mitigation is in scope — a host CSP blocking the pixel domain still
  blocks it (documented limitation, unchanged).
- No change to `pkgVersion`, the stable loader name, or any partner contract.

## Testing

- **pixel-reporter.test**: `px-script-error` URL includes `bid`; present-case
  and fallback-to-`"0"` case (no global).
- **analytics.test**: event payload includes `build_id`; present + absent cases.
- **vite plugin**: `__CR_BUILD_ID__` replaced; git-missing fallback yields
  `<hash>.nogit`.
- `loader.jsx` / `index.jsx` remain E2E-covered per `vitest.config.ts`
  coverage excludes (unchanged).
