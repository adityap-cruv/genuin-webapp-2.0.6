#!/usr/bin/env node
/**
 * Generate a `.theme-<slug>` CSS block for the Hierarchical Theme
 * Provider from a primary hex colour and (optionally) a secondary hex
 * colour. Pure stdout — does not mutate any file. Paste the output into
 * `packages/tailwind-config/themes.css`.
 *
 * Usage:
 *   node scripts/generate-theme-ramp.mjs <publisher-slug> <#RRGGBB> [#RRGGBB]
 *
 * Examples:
 *   node scripts/generate-theme-ramp.mjs us-mag '#7B1FA2'
 *   node scripts/generate-theme-ramp.mjs artitech '#E91E26' '#666666'
 *
 * Algorithm: deterministic linear mix against white (tints for the low
 * stops) and black (shades for the high stops). 500 ≈ the input hex
 * exactly. The 11 secondary ratios produce a smooth scale (50 nearly
 * white, 900 nearly black). The 7 primary ratios match the existing
 * iHeart / McClatchy ramp shapes — consistency across themes matters
 * more than exact reproduction.
 *
 * Verification:
 *   node scripts/generate-theme-ramp.mjs --verify
 *
 * Exit codes:
 *   0 — success, CSS block printed to stdout
 *   1 — invalid input (slug, primary hex, or secondary hex)
 */

/** Closed mix table for primary — keep these ratios in lockstep across publishers. */
const PRIMARY_RAMP_STEPS = [
  { name: '100', mode: 'tint', amount: 0.85 },
  { name: '200', mode: 'tint', amount: 0.65 },
  { name: '300', mode: 'tint', amount: 0.4 },
  { name: '400', mode: 'tint', amount: 0.2 },
  { name: '600', mode: 'shade', amount: 0.25 },
  { name: '700', mode: 'shade', amount: 0.55 },
];

/**
 * Closed mix table for secondary — 11 stops. 500 is the input colour
 * exactly (amount = 0). Low stops mix toward white, high stops toward
 * black. Order matches the `:root` declaration in `shared-styles.css`
 * (ascending: 50 → 900).
 */
const SECONDARY_RAMP_STEPS = [
  { name: '50', mode: 'tint', amount: 0.92 },
  { name: '100', mode: 'tint', amount: 0.8 },
  { name: '150', mode: 'tint', amount: 0.7 },
  { name: '200', mode: 'tint', amount: 0.6 },
  { name: '300', mode: 'tint', amount: 0.4 },
  { name: '400', mode: 'tint', amount: 0.2 },
  { name: '500', mode: 'tint', amount: 0 },
  { name: '600', mode: 'shade', amount: 0.15 },
  { name: '700', mode: 'shade', amount: 0.3 },
  { name: '800', mode: 'shade', amount: 0.5 },
  { name: '900', mode: 'shade', amount: 0.7 },
];

/**
 * Parse `#RRGGBB` (with or without the leading `#`) into an `[r,g,b]`
 * tuple of integers 0–255. Returns `null` for any malformed input.
 *
 * @param {string} input
 * @returns {[number, number, number] | null}
 */
function parseHex(input) {
  if (typeof input !== 'string') return null;
  const cleaned = input.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  const n = parseInt(cleaned, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/**
 * Mix a colour with white (tint) or black (shade) by the given ratio.
 * `amount = 0` → original colour. `amount = 1` → pure target.
 *
 * @param {[number, number, number]} rgb
 * @param {'tint' | 'shade'} mode
 * @param {number} amount
 * @returns {[number, number, number]}
 */
function mix(rgb, mode, amount) {
  const target = mode === 'tint' ? 255 : 0;
  return rgb.map(channel => Math.round(channel + (target - channel) * amount));
}

/**
 * Convert `[r,g,b]` back to a lowercase `#rrggbb` string.
 *
 * @param {[number, number, number]} rgb
 * @returns {string}
 */
function toHex(rgb) {
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
}

/** kebab-case slug: must start with a letter, then lowercase alnum + `-`. */
const SLUG_RE = /^[a-z][a-z0-9-]*$/;

/**
 * Render the CSS block for a given slug, primary hex, and (optional)
 * secondary hex. Returned string is paste-ready into `themes.css` (no
 * trailing newline beyond the closing brace line — caller decides
 * spacing).
 *
 * The emitted block contains TWO sets of variables carrying identical
 * hex values:
 *
 *   1. Brand tokens (`--gencl-primary*`, `--gencl-secondary*`) —
 *      consumed by components that read `var(--gencl-primary)` etc.
 *      directly.
 *   2. Tailwind v4 indirection tokens (`--gencl-color-primary*`,
 *      `--gencl-color-secondary*`) — consumed by utility classes
 *      (`bg-primary`, `bg-secondary-900`, …). These MUST be
 *      re-declared in each theme scope because the `@theme` block in
 *      `shared-styles.css` declares them as `var(--gencl-primary)`
 *      ONLY at `:root`, so the `var()` resolves once and the
 *      resolved literal cascades down to descendants — child
 *      `.theme-X` overrides of `--gencl-primary` never reach the
 *      utility chain. Duplicating the values here re-resolves them
 *      against the current theme's brand tokens.
 *
 * When `secondaryHex` is omitted, only the 14 primary lines are
 * emitted (7 brand + 7 Tailwind). When supplied, 22 additional
 * secondary lines (11 brand + 11 Tailwind) are appended after the
 * primary block.
 *
 * @param {string} slug
 * @param {string} primaryHex normalised lowercase `#rrggbb`
 * @param {string} [secondaryHex] normalised lowercase `#rrggbb`
 * @returns {string}
 */
export function renderThemeBlock(slug, primaryHex, secondaryHex) {
  const primaryRgb = parseHex(primaryHex);
  if (!primaryRgb) {
    throw new Error(`Invalid primary hex: ${primaryHex}`);
  }
  /** @type {Array<{ name: string, hex: string }>} 7-element list including the base. */
  const primaryRamp = [
    { name: '', hex: primaryHex },
    ...PRIMARY_RAMP_STEPS.map(step => ({
      name: step.name,
      hex: toHex(mix(primaryRgb, step.mode, step.amount)),
    })),
  ];

  /** @type {Array<{ name: string, hex: string }> | null} 11-element list (no base — 500 is in the table). */
  let secondaryRamp = null;
  if (secondaryHex !== undefined) {
    const secondaryRgb = parseHex(secondaryHex);
    if (!secondaryRgb) {
      throw new Error(`Invalid secondary hex: ${secondaryHex}`);
    }
    secondaryRamp = SECONDARY_RAMP_STEPS.map(step => ({
      name: step.name,
      hex: toHex(mix(secondaryRgb, step.mode, step.amount)),
    }));
  }

  const lines = [
    `/* TODO(designer-handoff): real ${slug} palette per brand guidelines. */`,
    `.theme-${slug} {`,
    `  /* Brand tokens — for components that read var(--gencl-primary-*) directly. */`,
  ];
  for (const stop of primaryRamp) {
    const suffix = stop.name ? `-${stop.name}` : '';
    lines.push(`  --gencl-primary${suffix}: ${stop.hex};`);
  }
  if (secondaryRamp) {
    for (const stop of secondaryRamp) {
      lines.push(`  --gencl-secondary-${stop.name}: ${stop.hex};`);
    }
  }
  lines.push(
    `  /* Tailwind v4 utility tokens — re-declared here because the @theme block`,
    `   * in shared-styles.css declares them as var(--gencl-primary) ONLY at :root,`,
    `   * so the var() resolves once and the literal cascades down. Re-declaring`,
    `   * in each theme scope re-resolves against this theme's brand tokens. */`,
  );
  for (const stop of primaryRamp) {
    const suffix = stop.name ? `-${stop.name}` : '';
    lines.push(`  --gencl-color-primary${suffix}: ${stop.hex};`);
  }
  if (secondaryRamp) {
    for (const stop of secondaryRamp) {
      lines.push(`  --gencl-color-secondary-${stop.name}: ${stop.hex};`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Self-check: render the artitech sample and print a labelled scale so
 * the operator can eyeball monotonicity. Invoked via `--verify`.
 */
function runVerify() {
  const slug = 'artitech';
  const primary = '#e91e26';
  const secondary = '#666666';
  process.stdout.write(`# verify: ${slug} primary=${primary} secondary=${secondary}\n`);
  process.stdout.write(renderThemeBlock(slug, primary, secondary) + '\n\n');

  const secondaryRgb = parseHex(secondary);
  process.stdout.write('# secondary scale (lightness check — must be monotonic):\n');
  for (const step of SECONDARY_RAMP_STEPS) {
    const rgb = mix(secondaryRgb, step.mode, step.amount);
    const luminance = Math.round((rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) / 2.55);
    process.stdout.write(`  ${step.name.padStart(3)}: ${toHex(rgb)}  (L=${luminance}%)\n`);
  }
}

function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--verify') {
    runVerify();
    return;
  }
  const [rawSlug, rawPrimary, rawSecondary] = argv;
  if (!rawSlug || !rawPrimary) {
    process.stderr.write(
      'usage: generate-theme-ramp.mjs <publisher-slug> <#RRGGBB> [#RRGGBB]\n' +
        '  example: generate-theme-ramp.mjs us-mag "#7B1FA2"\n' +
        '  example: generate-theme-ramp.mjs artitech "#E91E26" "#666666"\n',
    );
    process.exit(1);
  }
  if (!SLUG_RE.test(rawSlug)) {
    process.stderr.write(
      `error: slug must be kebab-case (lowercase letters/digits/dashes, leading letter). Got: ${rawSlug}\n`,
    );
    process.exit(1);
  }
  const primaryRgb = parseHex(rawPrimary);
  if (!primaryRgb) {
    process.stderr.write(
      `error: primary must be a 6-digit hex (#RRGGBB). Got: ${rawPrimary}\n`,
    );
    process.exit(1);
  }
  const normalisedPrimary = toHex(primaryRgb);

  let normalisedSecondary;
  if (rawSecondary !== undefined) {
    const secondaryRgb = parseHex(rawSecondary);
    if (!secondaryRgb) {
      process.stderr.write(
        `error: secondary must be a 6-digit hex (#RRGGBB). Got: ${rawSecondary}\n`,
      );
      process.exit(1);
    }
    normalisedSecondary = toHex(secondaryRgb);
  }

  const block = renderThemeBlock(rawSlug, normalisedPrimary, normalisedSecondary);
  process.stdout.write(block + '\n');
}

// Only run when invoked directly — keeps the file importable for tests.
const isDirectInvocation = import.meta.url === `file://${process.argv[1]}`;
if (isDirectInvocation) {
  main();
}
