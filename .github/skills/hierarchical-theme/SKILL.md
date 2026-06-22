---
name: hierarchical-theme
description: Bootstrap a new publisher palette for the Hierarchical Theme Provider — given a publisher slug + primary hex (or brand reference), emit a `.theme-<slug>` CSS block in `packages/tailwind-config/themes.css` and extend the `ThemeName` union.
---

# Hierarchical Theme — Publisher Palette Bootstrap

You are adding a **per-publisher brand palette** to the Hierarchical Theme Provider. The palette is a CSS block keyed off a `.theme-<slug>` class containing:

- **14 primary variables** (always): the 7 brand tokens (`--gencl-primary` + 6 ramp stops) AND the 7 Tailwind-indirection tokens (`--gencl-color-primary` + 6 ramp stops), carrying identical hex values.
- **22 secondary variables** (optional, when a `secondaryHex` is supplied): the 11 brand tokens (`--gencl-secondary-{50,100,150,200,300,400,500,600,700,800,900}`) AND the 11 Tailwind-indirection tokens (`--gencl-color-secondary-*`), carrying identical hex values.

**14 primary + 22 secondary = 36 max** (each token duplicated as `--gencl-*-N` and `--gencl-color-*-N` — see the *Why the duplication?* note in [Output](#output)).

The host applies the palette by wrapping the page in `<ThemeProvider theme="<slug>">`; the artifact itself stays themeless.

This skill is paired with `hierarchical-tree`. If the operator asks `hierarchical-tree` to generate a Page for a publisher whose palette does not yet exist in `themes.css`, invoke **this skill first** to bootstrap the palette — then return to page generation.

---

## When to activate

Triggers:

- "Create a theme for `<publisher>`."
- "Add a `<publisher>` palette."
- "Bootstrap a new publisher."
- A `pageTypeHint` or `hierarchical-tree` invocation referencing a publisher whose `.theme-<slug>` block is not present in `packages/tailwind-config/themes.css`.

**Do not** activate this skill for:

- Modifying an existing publisher palette (out of v0 scope — emit `THEME_SLUG_COLLISION`).
- Dark-mode handling (host concern; the host adds `class="dark"` separately).
- Per-page colour overrides (forbidden by the `hierarchical-tree` contract — page artifacts are themeless).
- Adding any CSS variable outside the contract below (14 primary + optional 22 secondary = 36 max).

---

## Inputs contract

```ts
interface SkillInput {
  /** kebab-case publisher slug. Must match /^[a-z][a-z0-9-]*$/. */
  publisher: string;

  /** Primary brand colour as `#RRGGBB`. Optional only when `reference` is provided. */
  primaryHex?: string;

  /**
   * Optional secondary (neutral) brand colour as `#RRGGBB`. When
   * supplied, the generator emits an 11-stop `--gencl-secondary-*`
   * scale (50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900)
   * inside the same `.theme-<slug>` block. 500 maps to this exact
   * value; lower stops mix toward white, higher stops toward black.
   * When omitted, the design-system grey ramp from
   * `shared-styles.css :root` applies unchanged.
   */
  secondaryHex?: string;

  /**
   * Optional per-stop overrides for the **primary** ramp only. Each
   * value must be `#RRGGBB`. Missing keys fall through to the
   * generated ramp. Secondary stops are not overridable in v0 — adjust
   * `secondaryHex` instead, or edit the emitted block by hand.
   */
  ramp?: Partial<{
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '600': string;
    '700': string;
  }>;

  /**
   * Optional brand reference (Figma URL / node, brand-guidelines URL,
   * or hosted image). Used only when `primaryHex` is absent — the
   * agent extracts the primary colour from this reference via the
   * Figma MCP or WebFetch before invoking the ramp generator.
   */
  reference?: string;
}
```

The agent must determine a single `#RRGGBB` primary before running the generator. If neither `primaryHex` nor enough info in `reference` is supplied, emit `THEME_INPUT_INSUFFICIENT`.

---

## Output

Two edits. **No new files. No imports.**

1. **Append a `.theme-<slug>` block to `packages/tailwind-config/themes.css`**, inserted *after the last existing `.theme-*` block* (file is currently in arrival order: `genuin`, `iheart`, `mcclatchy`, `us-weekly`). Convention for this skill: **append at the end** — do not re-sort existing blocks.

2. **Extend the `ThemeName` union in `packages/ui/src/components/theme-provider/theme-provider.tsx`** to include the new slug as a string literal. The union currently reads:

   ```ts
   export type ThemeName = "genuin" | "iheart" | "mcclatchy" | "us-weekly" | (string & {});
   ```

   Insert the new slug alphabetically among the named literals (the `(string & {})` fallback always stays last).

**Why the duplication?** Tailwind v4's `@theme` block in `shared-styles.css` declares `--gencl-color-primary: var(--gencl-primary)` (and the analogous `--gencl-color-secondary-*` indirections) at `:root` only. The `var()` resolves once at `:root`, so the resolved literal cascades down to all descendants — child `.theme-X` overrides of `--gencl-primary` don't reach the Tailwind-utility chain (`bg-primary`, `bg-secondary-900`, …). The fix is to override both the brand token (used by direct `var(--gencl-primary)` readers) AND the Tailwind-resolved token (used by `bg-primary` / `bg-secondary-900` utilities) inside each `.theme-<slug>` scope. The generator emits both with the same hex; theme authors never need to think about which is which.

**Forbidden output:**

- No changes to `:root` in `packages/tailwind-config/shared-styles.css`.
- No new CSS files. No new TS files. No barrel exports.
- No JS/TS logic in `themes.css` — themes are pure CSS variable overrides.
- No colour utilities (`bg-*`, `text-*`) added to the theme block.
- No CSS variables outside the contract. The contract is **14 primary** — 7 brand tokens (`--gencl-primary`, `--gencl-primary-{100,200,300,400,600,700}`) plus 7 Tailwind-indirection tokens (`--gencl-color-primary`, `--gencl-color-primary-{100,200,300,400,600,700}`) — plus, only when `secondaryHex` is supplied, **22 secondary** — 11 brand tokens (`--gencl-secondary-{50,100,150,200,300,400,500,600,700,800,900}`) plus 11 Tailwind-indirection tokens (`--gencl-color-secondary-{50,100,150,200,300,400,500,600,700,800,900}`). 36 variables maximum, never more.
- No modification of existing `.theme-*` blocks (their `TODO(designer-handoff)` comments and values stay intact).

---

## Process

Numbered steps. Do them in order.

1. **Validate the slug.** Must match `/^[a-z][a-z0-9-]*$/`. If it collides with an existing `.theme-<slug>` block in `themes.css`, emit `THEME_SLUG_COLLISION` and stop.

2. **Determine the primary hex.**
   - If `primaryHex` is supplied, validate it matches `/^#?[0-9a-fA-F]{6}$/`. Normalise to lowercase `#rrggbb`.
   - Otherwise, extract the primary colour from `reference` (Figma MCP `get_design_context` for Figma URLs; WebFetch for brand-guideline pages; visual inspection of an image asset).
   - If neither path yields a primary, emit `THEME_INPUT_INSUFFICIENT` and stop.

3. **Generate the ramp.** Run from the repo root:

   ```bash
   node scripts/generate-theme-ramp.mjs <slug> <primaryHex> [secondaryHex]
   ```

   The third arg is optional. When supplied, the emitted block contains 36 variable lines (14 primary + 22 secondary, plus a header comment for each set); when omitted, 14 primary lines only. Capture stdout — it is a complete `.theme-<slug>` CSS block.

   Validate `secondaryHex` ahead of invocation: `/^#?[0-9a-fA-F]{6}$/`. The generator also rejects invalid hex with a non-zero exit.

4. **Apply ramp overrides if provided.** For each key in `input.ramp`, replace the matching `--gencl-primary-<n>: <hex>;` line in the generated block with the operator-supplied value. Validate each override is `#RRGGBB`.

5. **Append to `themes.css`.** Insert one blank line, then the (possibly overridden) block, at the end of the file. Preserve the trailing newline.

6. **Update `ThemeName`.** Insert the new slug as a string literal in alphabetical order among the named entries; keep `(string & {})` last. Example: adding `us-mag` to the current list yields `"genuin" | "iheart" | "mcclatchy" | "us-mag" | "us-weekly" | (string & {})`.

7. **Verify.**
   - `pnpm --filter @genuin/ui typecheck` exits 0.
   - `pnpm --filter @genuin/hierarchical-tree dev` boots and `http://localhost:5173/?theme=<slug>` shows the new palette (the dev shell defaults to `theme=genuin`; pass `?theme=<slug>` to preview).

If verification fails, do not roll back automatically — surface the failure to the operator and stop.

---

## Hard rules

The agent must never:

1. Mutate `:root` defaults in `packages/tailwind-config/shared-styles.css`.
2. Add any CSS variable outside the contract: 14 primary tokens (7 brand `--gencl-primary*` + 7 Tailwind-indirection `--gencl-color-primary*`) plus, only when `secondaryHex` was supplied, the 22 secondary tokens (11 brand `--gencl-secondary-*` + 11 Tailwind-indirection `--gencl-color-secondary-*`). Nothing else — no `--gencl-red-*`, `--gencl-error-status`, font tokens, etc. The brand and Tailwind-indirection token for each stop MUST carry the same hex; never split them.
3. Add Tailwind colour utilities (`bg-*`, `text-*`) inside `themes.css` — themes only override CSS variables.
4. Add JS/TS logic to `themes.css`. Themes are pure CSS.
5. Modify an existing `.theme-*` block (rename, reorder, change values, drop comments). Updates are out of v0 scope — emit `THEME_SLUG_COLLISION` if asked.
6. Emit a publisher name into a Page artifact. Theming stays at host level; artifacts remain theme-agnostic.
7. Skip the slug-collision check before writing.

---

## Worked example — bootstrap `us-mag` from `#7B1FA2`

**Input:**

```ts
{
  publisher: 'us-mag',
  primaryHex: '#7B1FA2',
}
```

**Step 1.** Slug `us-mag` matches the regex; no `.theme-us-mag` block exists. Proceed.

**Step 2.** Primary `#7B1FA2` → normalised `#7b1fa2`.

**Step 3.** Run the generator:

```bash
node scripts/generate-theme-ramp.mjs us-mag '#7b1fa2'
```

Captured stdout:

```css
/* TODO(designer-handoff): real us-mag palette per brand guidelines. */
.theme-us-mag {
  /* Brand tokens — for components that read var(--gencl-primary-*) directly. */
  --gencl-primary: #7b1fa2;
  --gencl-primary-100: #ebddf1;
  --gencl-primary-200: #d1b1de;
  --gencl-primary-300: #b079c7;
  --gencl-primary-400: #954cb5;
  --gencl-primary-600: #5c177a;
  --gencl-primary-700: #370e49;
  /* Tailwind v4 utility tokens — re-declared here because the @theme block
   * in shared-styles.css declares them as var(--gencl-primary) ONLY at :root,
   * so the var() resolves once and the literal cascades down. Re-declaring
   * in each theme scope re-resolves against this theme's brand tokens. */
  --gencl-color-primary: #7b1fa2;
  --gencl-color-primary-100: #ebddf1;
  --gencl-color-primary-200: #d1b1de;
  --gencl-color-primary-300: #b079c7;
  --gencl-color-primary-400: #954cb5;
  --gencl-color-primary-600: #5c177a;
  --gencl-color-primary-700: #370e49;
}
```

**Step 4.** No `ramp` overrides supplied — the captured block is used verbatim. (The `--gencl-color-*` lines duplicate the `--gencl-*` hex values on purpose — see *Why the duplication?* above.)

**Step 5.** Append to `packages/tailwind-config/themes.css` after the `.theme-us-weekly` block, preceded by one blank line.

**Step 6.** Update `ThemeName` in `packages/ui/src/components/theme-provider/theme-provider.tsx`:

```diff
- export type ThemeName = "genuin" | "iheart" | "mcclatchy" | "us-weekly" | (string & {});
+ export type ThemeName = "genuin" | "iheart" | "mcclatchy" | "us-mag" | "us-weekly" | (string & {});
```

**Step 7.** Preview at `http://localhost:5173/?fixture=article&theme=us-mag`. The status footer should read `fixture: article · theme: us-mag`; primary surfaces (chips, links, headings using `--gencl-primary`) render in violet.

---

## Worked example 2 — bootstrap `artitech` with primary + secondary

**Input:**

```ts
{
  publisher: 'artitech',
  primaryHex: '#E91E26',
  secondaryHex: '#c40000',
}
```

**Step 1.** Slug `artitech` matches the regex; no `.theme-artitech` block exists. Proceed.

**Step 2.** Primary `#E91E26` → `#e91e26`. Secondary `#c40000` → `#c40000` (both already lowercase 6-digit).

**Step 3.** Run the generator with the third arg:

```bash
node scripts/generate-theme-ramp.mjs artitech '#e91e26' '#c40000'
```

Captured stdout:

```css
/* TODO(designer-handoff): real artitech palette per brand guidelines. */
.theme-artitech {
  /* Brand tokens — for components that read var(--gencl-primary-*) directly. */
  --gencl-primary: #e91e26;
  --gencl-primary-100: #fcddde;
  --gencl-primary-200: #f7b0b3;
  --gencl-primary-300: #f2787d;
  --gencl-primary-400: #ed4b51;
  --gencl-primary-600: #af171d;
  --gencl-primary-700: #690e11;
  --gencl-secondary-50: #faebeb;
  --gencl-secondary-100: #f3cccc;
  --gencl-secondary-150: #edb3b3;
  --gencl-secondary-200: #e79999;
  --gencl-secondary-300: #dc6666;
  --gencl-secondary-400: #d03333;
  --gencl-secondary-500: #c40000;
  --gencl-secondary-600: #a70000;
  --gencl-secondary-700: #890000;
  --gencl-secondary-800: #620000;
  --gencl-secondary-900: #3b0000;
  /* Tailwind v4 utility tokens — re-declared here because the @theme block
   * in shared-styles.css declares them as var(--gencl-primary) ONLY at :root,
   * so the var() resolves once and the literal cascades down. Re-declaring
   * in each theme scope re-resolves against this theme's brand tokens. */
  --gencl-color-primary: #e91e26;
  --gencl-color-primary-100: #fcddde;
  --gencl-color-primary-200: #f7b0b3;
  --gencl-color-primary-300: #f2787d;
  --gencl-color-primary-400: #ed4b51;
  --gencl-color-primary-600: #af171d;
  --gencl-color-primary-700: #690e11;
  --gencl-color-secondary-50: #faebeb;
  --gencl-color-secondary-100: #f3cccc;
  --gencl-color-secondary-150: #edb3b3;
  --gencl-color-secondary-200: #e79999;
  --gencl-color-secondary-300: #dc6666;
  --gencl-color-secondary-400: #d03333;
  --gencl-color-secondary-500: #c40000;
  --gencl-color-secondary-600: #a70000;
  --gencl-color-secondary-700: #890000;
  --gencl-color-secondary-800: #620000;
  --gencl-color-secondary-900: #3b0000;
}
```

Note that `--gencl-secondary-500` matches the input exactly. The lower stops mix toward white (50 ≈ near-white red tint), the higher stops toward black (900 ≈ near-black deep red). The scale is monotonic in lightness — eyeball it before committing; if it jumps awkwardly, regenerate with a closer-to-mid secondary value. Picking a saturated red here (`#c40000`) instead of a neutral grey makes the linkout "Learn more" CTA, which renders against `--gencl-secondary-900`, read as **brand-red** rather than indistinguishable-from-default near-black.

**Step 4.** No `ramp` overrides supplied — captured block used verbatim. (`ramp` only overrides primary stops; to override secondary stops, regenerate with a different `secondaryHex` or hand-edit. The `--gencl-color-secondary-*` lines duplicate the `--gencl-secondary-*` hex values on purpose — see *Why the duplication?* above.)

**Step 5.** Append to `packages/tailwind-config/themes.css`, preceded by one blank line.

**Step 6.** Update `ThemeName` in `packages/ui/src/components/theme-provider/theme-provider.tsx`: insert `"artitech"` alphabetically before `"genuin"`.

**Step 7.** Preview at `http://localhost:5173/?fixture=figma-websitev5&theme=artitech`. Primary surfaces (chips, primary buttons) render in artitech red; the linkout "Learn more" CTA and outline-button borders pick up the new `--gencl-secondary-900` value (`#3b0000`, a deep brand-red replacing the design-system near-black).

---

## Failure path

If any precondition cannot be satisfied, emit a structured error object and stop. **Do not** write a partial palette or guess.

```ts
export const error = {
  type: 'cannot_satisfy',
  code: 'THEME_INPUT_INSUFFICIENT' | 'THEME_SLUG_COLLISION' | 'THEME_BAD_HEX',
  message: string,
} as const;
```

Error codes:

- `THEME_INPUT_INSUFFICIENT` — no `primaryHex`, and `reference` did not yield a primary colour. Message should name what the operator needs to supply (a hex, a Figma frame, or a brand-guidelines URL).
- `THEME_SLUG_COLLISION` — a `.theme-<slug>` block already exists in `themes.css`, or the slug already appears in `ThemeName`. Message should point the operator to the existing block.
- `THEME_BAD_HEX` — `primaryHex`, `secondaryHex`, or any `ramp` value is not a valid `#RRGGBB`. Message should echo the offending value and name which input it came from.

A clean error is recoverable; a half-applied palette is not.

---

## Surface tone token mapping

The `surface` UI primitive (closed `tone` enum) consumes the palette through these CSS variables. When you pick a publisher's stops, pre-visualise the result by mapping each tone to the hex the cascade will resolve:

| `tone` value     | CSS variable consumed                | Foreground flip | Typical use                                                                                                                                                                                                       |
| ---------------- | ------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`           | _(transparent)_                      | none            | Render decoration off, keep padding/radius semantics.                                                                                                                                                             |
| `subtle`         | `--gencl-secondary-50`               | none            | Sidebar backdrops, sponsor chrome, near-white tint. Pick `--gencl-secondary-50` to be a true near-white in the publisher's brand family (e.g. Planet Fitness `#fffcee`, Artitech `#faebeb`).                      |
| `brand-tint`     | `--gencl-primary-100`                | none            | Stat tiles, soft brand-tinted blocks. The lightest primary stop (already part of the 7-stop primary ramp the generator emits).                                                                                    |
| `brand-strong`   | `--gencl-primary`                    | `text-white`    | Hero bands, BREAKING badges, conversion CTAs against a saturated brand fill.                                                                                                                                      |
| `accent-strong`  | `--gencl-secondary-500`              | `text-black`    | **NEW.** Saturated accent strips — the Planet Fitness yellow "more for your membership" band is the canonical example. Pick `--gencl-secondary-500` to be a vibrant brand accent (Planet Fitness `#ffdf29`).      |
| `inverse`        | **theme-independent** `--gencl-black` | `text-white`    | Dark-mode strips. **No longer reads `--gencl-secondary-900`** — that change avoids the previous failure mode where a publisher's coloured `secondary-900` (e.g. Planet Fitness olive `#4d430c`) muddied the band. |

When bootstrapping a new theme, eyeball the resolved `secondary-50` and `secondary-500` against these expectations before committing the block.

---

## Palette completeness checklist

Before declaring the bootstrap done:

- [ ] `--gencl-primary` **and** `--gencl-color-primary` declared with the same hex (and the same for stops 100/200/300/400/600/700). The duplication is mandatory — see *Why the duplication?* above.
- [ ] When `secondaryHex` was supplied, `--gencl-secondary-{50…900}` **and** `--gencl-color-secondary-{50…900}` declared in lockstep.
- [ ] `--gencl-secondary-500` is a **vibrant brand accent** — that's the colour `surface tone='accent-strong'` consumes for saturated bands. A muddy 500 will render the accent strip flat.
- [ ] `--gencl-secondary-50` is a **near-white brand tint** — that's the colour `surface tone='subtle'` consumes for backdrop chrome. Too saturated and every sidebar / sponsor card screams.
- [ ] You **do not** need to special-case `--gencl-secondary-900` for darkness anymore. `surface tone='inverse'` deliberately bypasses the brand-secondary scale and resolves to a theme-independent near-black; pick `secondary-900` purely for what the linkout "Learn more" CTA and outline-button borders should look like under this publisher's palette.

---

## Cross-reference

This SKILL is paired with `hierarchical-tree` (one directory over: `../hierarchical-tree/SKILL.md`). `hierarchical-tree` emits theme-agnostic Page artifacts; this SKILL configures the host palette those artifacts render against. The artifact never names a publisher, and this skill never edits a Page — the two surfaces stay disjoint.