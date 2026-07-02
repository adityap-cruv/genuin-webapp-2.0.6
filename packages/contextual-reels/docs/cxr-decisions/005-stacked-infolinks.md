# ADR 005 — Stacked layout with an Infolinks in-place unit

**Status**: Accepted

## Context

Certain tags need to render as a **stacked** pair — our widget in the top half
and a third-party Infolinks in-place unit (pid `3446242`) in the bottom half —
when the partner page carries `?variant=stacked`. Two tags opt in today:

| Tag id                       | Slot     | Layout | Top half (ours)      | Bottom half (Infolinks) |
| ---------------------------- | -------- | ------ | -------------------- | ----------------------- |
| `6a032e34054c8fcb08582510`   | 320×100  | L4     | 320×50 — L3 compact  | 320×50                  |
| `69b298e3d6a6ad57e7b9a464`   | 300×600  | L1     | 300×300 — L2 player  | 300×300                 |

Three decisions had to be made:

1. **Where to split.** The widget resolves a single `adLayout` from the
   container's pixel size in `index.jsx` and threads it through the whole React
   tree (`App` → providers → feed).
2. **How to isolate Infolinks.** Its snippet spawns and manages its own ad
   iframe and expects to inject into the host document.
3. **How to test the layout locally** without owning the production tag id.

## Decision

**Drive everything from a per-tag registry.** `STACKED_LAYOUT_TAGS` in
`config.ts` maps each opted-in tag id to a `StackedLayoutConfig`: the
`requiredLayout` the slot must resolve to, the `ourLayout` our widget renders in
the top half, the shared `width`/`halfHeight` of each half, and the Infolinks
`inplace_slot` size. Adding a tag is a single map entry — no new branches.
`resolveStackedLayout(tagId, adLayout)` returns the matching config (or `null`).

**Split at the mount boundary, not inside React.** When
`resolveStackedLayout(...)` returns a config, `index.jsx` calls
`setupStackedRows(node, config)` to flex-split the `.gen-ext` container into two
equal halves *before* mounting. Our widget mounts into the **top** half and is
told it is `config.ourLayout` (an existing layout — L3 or L2). No new layout
component, no changes to the provider stack or the feed; the rest of the
codebase treats it exactly like a normal embed of that layout. The bottom half
receives Infolinks.

**Isolate Infolinks in a `srcdoc` iframe.** `createInfolinksFrame(size)` builds
an iframe at the config's Infolinks size whose `srcdoc` contains the
`infolinks_config` and the `infolinks_main.js` script. Infolinks runs inside its
own document, so its scripts and styles never touch our DOM or shadow root, and
it manages its own frame there as it expects. The slot size in the config
(`320×50` or `300×300`) is written into the `inplace_slot` so Infolinks requests
the right creative size per tag.

**Relax the tag-id gate on localhost.** In production the gate requires a
registered tag id *and* its `requiredLayout` *and* the `variant=stacked` param.
On a local host (`isLocalhost()` — `localhost`, `127.0.0.1`, `[::1]`, `*.local`)
the tag-id check is skipped: any slot whose resolved layout matches a registered
`requiredLayout` stacks, picking up that entry's config. The layout and param
requirements still hold everywhere, so local behaviour stays faithful to
production and the bypass can never fire on a real domain.

The `variant=stacked` param is read from this frame and — when absent here — the
top frame, swallowing the cross-origin `SecurityError` (same probe pattern as
`isAdVerificationCrawler` / `hasStackedVariant`).

## Consequences

- **No new layout surface.** Reusing L3 / L2 for the top half means zero changes
  to `App`, the providers, or `ReelItem`; the feature lives in `config.ts`,
  `utils/infolinks.ts`, and the boot branch in `index.jsx`.
- **`setupStackedRows` is idempotent** — re-running `init()` on an already-split
  node returns the existing top row and does not append a second Infolinks
  frame. Covered by unit tests.
- **GAM `ad.size` still reports the full slot** (320×100 / 300×600). The meta
  injection reads the original container rect, so the slot is still advertised at
  its true size.
- **Infolinks fill is not covered by tests** — it depends on their network and
  does not run in JSDOM. Unit tests assert the frame is built and placed
  correctly (config, pid, script, per-tag dimensions, row placement); live fill
  must be verified in a browser on a domain registered for the pid.
- **Adding another stacked tag** is one entry in `STACKED_LAYOUT_TAGS`. A
  different third-party unit (not Infolinks) would need its own frame builder
  alongside `createInfolinksFrame`.
