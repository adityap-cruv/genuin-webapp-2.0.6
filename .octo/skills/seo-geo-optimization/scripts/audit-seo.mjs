#!/usr/bin/env node
/**
 * Deterministic, framework-agnostic SEO/GEO audit of page/metadata source files.
 *
 * Static text checks only — it does not run the app (use verify-live.mjs for the served HTML).
 * GENERIC checks run on any project. PROJECT-PROFILE checks add repo-tuned patterns when a known
 * project is detected (or forced with --profile). Findings are tagged FIX / READY / DEFERRED.
 *
 * Usage:
 *   node .../audit-seo.mjs <path> [<path> ...]   # audit file(s)/dir(s) — works in any repo
 *   node .../audit-seo.mjs                        # auto-detect a known project's default routes
 *   node .../audit-seo.mjs --profile genuin-webapp [<path>]
 *   node .../audit-seo.mjs --generic <path>       # generic checks only, skip project profile
 *   node .../audit-seo.mjs --list-profiles
 *
 * Pair findings with the reference checklists before fixing — these are heuristics.
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = process.cwd()

// --- Generic checks: repo-agnostic patterns in any metadata/page source --------------
// each: {id, tag, test(src)->bool means "problem present", msg}
const GENERIC_CHECKS = [
  {
    id: 'no-canonical',
    tag: 'FIX',
    test: (s) => /generateMetadata|export const metadata|<head\b|og:url/.test(s) && !/canonical/.test(s),
    msg: 'No canonical — param variants dilute ranking. Add a param-free, self-referencing canonical (seo-checklist.md).',
  },
  {
    id: 'incomplete-robots',
    tag: 'FIX',
    test: (s) => /robots['"]?\s*[:=]\s*['"]index/.test(s) && !/max-snippet/.test(s),
    msg: 'robots meta missing max-snippet:-1 / max-image-preview:large (geo-checklist + seo-checklist.md).',
  },
  {
    id: 'twitter-summary-with-player',
    tag: 'FIX',
    test: (s) => /twitter:player/.test(s) && /['"]twitter:card['"]\s*[:=]\s*['"]summary['"]/.test(s),
    msg: 'twitter:card=summary while twitter:player set — player card never activates. Use card=player (video-seo.md §3).',
  },
  {
    id: 'aspect-ratio-dims',
    tag: 'FIX',
    test: (s) => /['"]og:video:width['"]\s*[:=]\s*['"]?9['"]?[\s,}]/.test(s) || /['"]og:video:height['"]\s*[:=]\s*['"]?16['"]?[\s,}]/.test(s),
    msg: 'og:video:width/height look like an aspect ratio (9/16), not pixels. Use real pixel dims (e.g. 1080x1920).',
  },
  {
    id: 'colon-or-hardcoded-duration',
    tag: 'FIX',
    test: (s) => /duration['"]?\s*[:=]\s*['"]\d+:\d+['"]/.test(s) || /\bvideo_duration\s*:\s*['"]PT60S['"]/.test(s) || /\bduration\s*:\s*['"]PT60S['"]/.test(s),
    msg: "duration is colon-form ('2:14') or a hardcoded placeholder ('PT60S'). Emit the real normalized ISO-8601 duration.",
  },
  {
    id: 'og-video-page-url',
    tag: 'FIX',
    test: (s) => /['"]og:video['"]\s*:\s*(shareLink|pageUrl|canonical|url|ogUrl)\b/.test(s),
    msg: 'og:video points at a page URL variable, not the media file. Use the raw mp4 (video-seo.md §3).',
  },
  {
    id: 'no-json-ld',
    tag: 'READY',
    test: (s) => /generateMetadata|export const metadata/.test(s) && !/application\/ld\+json/.test(s) && !/Seo(Content|Block)/.test(s),
    msg: 'No JSON-LD / server SEO block. Add Article/VideoObject/Collection/Organization (assets/json-ld-templates.md).',
  },
]

// --- Project profiles: repo-tuned checks + default routes -----------------------------
const PROFILES = {
  'genuin-webapp': {
    // auto-detected when this path exists relative to repo root
    detect: () => existsSync(resolve(ROOT, 'apps/webapp/src/app')),
    routesDir: 'apps/webapp/src/app/(site)/(new)',
    defaultRoutes: [
      'apps/webapp/src/app/(site)/(new)/video/[slug]/page.tsx',
      'apps/webapp/src/app/(site)/(new)/community/[slug]/page.tsx',
      'apps/webapp/src/app/(site)/(new)/brand/[nickname]/page.tsx',
      'apps/webapp/src/app/(site)/(new)/group/[slug]/page.tsx',
    ],
    checks: [
      {
        id: 'og-video-sharelink',
        tag: 'FIX',
        test: (s) => /['"]og:video['"]\s*:\s*shareLink/.test(s),
        msg: "og:video set to shareLink (page URL + params), not the mp4. Use raw media_url (codebase-map.md).",
      },
      {
        id: 'reuses-source-for-media',
        tag: 'READY',
        test: (s) => /og:video/.test(s) && /\.source\b/.test(s),
        msg: 'Possibly using collapsed .source (m3u8) for og:video/contentUrl. Preserve raw media_url (mp4).',
      },
      {
        id: 'description-typo-fixed',
        tag: 'FIX',
        test: (s) => /\bdescriptionText\b/.test(s) && !/descritptionText/.test(s),
        msg: 'Uses descriptionText — the real schema field is the misspelled descritptionText. Match the typo (codebase-map.md).',
      },
      {
        id: 'axios-singleton',
        tag: 'FIX',
        test: (s) => /axiosInstance/.test(s),
        msg: 'Uses axiosInstance singleton in a server file — auth/x-brand-id leak across requests. Use request-scoped axios.get.',
      },
    ],
  },
}

// --- arg parsing ---------------------------------------------------------------------
const argv = process.argv.slice(2)
if (argv.includes('--list-profiles')) {
  console.log('Available project profiles:')
  for (const [name, p] of Object.entries(PROFILES)) console.log(`  ${name}${p.detect() ? '  (detected here)' : ''}`)
  process.exit(0)
}
let forcedProfile = null
const genericOnly = argv.includes('--generic')
const pIdx = argv.indexOf('--profile')
if (pIdx !== -1) { forcedProfile = argv[pIdx + 1]; if (!PROFILES[forcedProfile]) { console.error(`Unknown profile "${forcedProfile}". Try --list-profiles.`); process.exit(2) } }
const paths = argv.filter((a, i) => !a.startsWith('--') && i !== pIdx + (pIdx !== -1 ? 1 : -999))

const activeProfileName = genericOnly ? null : (forcedProfile || Object.keys(PROFILES).find((n) => PROFILES[n].detect()) || null)
const activeProfile = activeProfileName ? PROFILES[activeProfileName] : null
const CHECKS = [...GENERIC_CHECKS, ...(activeProfile?.checks || [])]

function collectFiles(target) {
  const abs = resolve(ROOT, target)
  if (!existsSync(abs)) return []
  if (statSync(abs).isDirectory()) {
    const out = []
    for (const entry of readdirSync(abs)) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'dist' || entry === '.git') continue
      out.push(...collectFiles(join(target, entry)))
    }
    return out
  }
  return /\.(tsx|jsx|ts|js|astro|vue|svelte|html)$/.test(abs) ? [target] : []
}

let targets
if (paths.length) targets = paths.flatMap(collectFiles)
else if (activeProfile) targets = activeProfile.defaultRoutes.filter((p) => existsSync(resolve(ROOT, p)))
else { console.error('No path given and no known project detected. Pass a file/dir to audit, or use --list-profiles.'); process.exit(2) }

if (!targets.length) { console.error('No matching source files found. Pass an explicit path.'); process.exit(2) }

console.log(`Profile: ${activeProfileName || 'generic only'}  |  ${CHECKS.length} checks  |  ${targets.length} file(s)\n`)

let total = 0
for (const t of targets) {
  const abs = resolve(ROOT, t)
  let src
  try { src = readFileSync(abs, 'utf8') } catch { continue }
  const hits = CHECKS.filter((c) => { try { return c.test(src) } catch { return false } })
  const rel = relative(ROOT, abs)
  if (!hits.length) { console.log(`✓ ${rel} — no static findings`); continue }
  console.log(`● ${rel} — ${hits.length} finding(s)`)
  for (const h of hits) { total++; console.log(`  [${h.tag}] ${h.id}: ${h.msg}`) }
}

console.log(`\n${total} finding(s) across ${targets.length} file(s).`)
console.log('Static heuristics — confirm each against the source + reference checklists, then verify the served HTML (verify-live.mjs).')
process.exit(total > 0 ? 1 : 0)
