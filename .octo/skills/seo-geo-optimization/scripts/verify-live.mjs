#!/usr/bin/env node
/**
 * Live verification of an SEO/GEO fix against the SERVED, JS-free HTML.
 *
 * The audit script reads source; this reads output. It fetches a URL as a crawler (no JS
 * execution — just the server's first response) and asserts the same things Google, Meta/
 * Instagram, and X/LinkedIn enforce: a crawlable body, valid JSON-LD, canonical/og:url hygiene,
 * og:video pointing at real media with pixel dims, complete robots meta, and the player card.
 *
 * Usage:
 *   node .octo/skills/seo-geo-optimization/scripts/verify-live.mjs <url>
 *   node .octo/skills/seo-geo-optimization/scripts/verify-live.mjs http://localhost:4000/video/abc
 *
 * Exit: 0 if no failures, 1 if any FAIL, 2 on fetch/usage error. WARN does not fail the run.
 * It cannot reach external validators (Rich Results, Sharing Debugger, Card Validator) — those
 * need a public URL and a human; it prints which ones to run. See references/verification.md.
 */

const url = process.argv[2]
if (!url) {
  console.error('Usage: verify-live.mjs <url>  (e.g. http://localhost:4000/video/<slug>)')
  process.exit(2)
}

const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const PARAM_BLOCKLIST = ['utm_', 'community', 'group', 'share_image_id', 'fbclid', 'gclid']

const results = [] // {level: 'PASS'|'FAIL'|'WARN'|'INFO', id, msg}
const add = (level, id, msg) => results.push({ level, id, msg })

let html, status, finalUrl
try {
  const res = await fetch(url, { headers: { 'User-Agent': BOT_UA }, redirect: 'follow' })
  status = res.status
  finalUrl = res.url
  html = await res.text()
} catch (err) {
  console.error(`FETCH FAILED: ${err.message}`)
  console.error('Is the server running? Start it (npm run build && npm run start → :4000), or ask the user for a reachable URL.')
  process.exit(2)
}

// --- §F bot access -----------------------------------------------------------
if (status === 200) add('PASS', 'bot-access', `200 OK as Googlebot UA (${html.length} bytes)`)
else add('FAIL', 'bot-access', `Server returned ${status} to a crawler UA — body invisible to bots. Check WAF/auth/redirect (bot-policy.md).`)

const looksLikeChallenge = /just a moment|cf-browser-verification|enable javascript to|captcha/i.test(html.slice(0, 4000))
if (looksLikeChallenge) add('FAIL', 'bot-challenge', 'Response looks like a JS/anti-bot challenge, not the page. Crawlers see nothing.')

// --- helpers -----------------------------------------------------------------
const metaContent = (re) => {
  // matches <meta ... name/property="X" ... content="Y"> in either attribute order
  const tags = html.match(/<meta\b[^>]*>/gi) || []
  for (const tag of tags) {
    if (re.test(tag)) {
      const m = tag.match(/content\s*=\s*("([^"]*)"|'([^']*)')/i)
      if (m) return (m[2] ?? m[3] ?? '').trim()
    }
  }
  return null
}
const og = (prop) => metaContent(new RegExp(`(name|property)\\s*=\\s*["']og:${prop}["']`, 'i'))
const tw = (name) => metaContent(new RegExp(`(name|property)\\s*=\\s*["']twitter:${name}["']`, 'i'))
const hasParams = (u) => {
  try { const q = new URL(u, finalUrl).search; return PARAM_BLOCKLIST.some((p) => q.includes(p)) || q.length > 0 }
  catch { return /[?&]/.test(u) }
}

// --- §E title / description / canonical / robots -----------------------------
const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim()
if (title) add('PASS', 'title', `<title> present: "${title.slice(0, 70)}"`)
else add('FAIL', 'title', 'No non-empty <title>.')

const desc = metaContent(/name\s*=\s*["']description["']/i)
if (desc) add('PASS', 'meta-description', `meta description present (${desc.length} chars)`)
else add('FAIL', 'meta-description', 'No meta description.')

const canonical = (html.match(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i) || [])[0]
if (!canonical) add('FAIL', 'canonical', 'No <link rel="canonical">.')
else {
  const href = (canonical.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i) || [])
  const cu = href[2] ?? href[3]
  if (!cu) add('FAIL', 'canonical', 'canonical tag has no href.')
  else if (hasParams(cu)) add('FAIL', 'canonical-params', `canonical has query params: ${cu} — must be param-free.`)
  else add('PASS', 'canonical', `canonical param-free: ${cu}`)
}

const robots = metaContent(/name\s*=\s*["']robots["']/i)
if (!robots) add('WARN', 'robots', 'No robots meta tag (defaults to index,follow — fine unless a global default applies).')
else if (/noindex/i.test(robots)) add('INFO', 'robots-noindex', `robots = "${robots}" (noindex — confirm intentional, e.g. profile/embed).`)
else {
  const need = ['max-image-preview:large', 'max-video-preview:-1', 'max-snippet:-1']
  const missing = need.filter((d) => !robots.includes(d))
  if (missing.length) add('FAIL', 'robots-incomplete', `robots missing ${missing.join(', ')} (max-snippet:-1 enables full AI citation). Got: "${robots}"`)
  else add('PASS', 'robots', `robots complete: "${robots}"`)
}

// --- §C Open Graph -----------------------------------------------------------
if (og('title')) add('PASS', 'og-title', 'og:title present')
else add('WARN', 'og-title', 'No og:title (Meta/Instagram unfurl weaker).')
if (og('image')) add('PASS', 'og-image', 'og:image present')
else add('WARN', 'og-image', 'No og:image — unfurls show no preview image.')

const ogUrl = og('url')
if (ogUrl && hasParams(ogUrl)) add('FAIL', 'og-url-params', `og:url has params: ${ogUrl} — strip tracking params.`)
else if (ogUrl) add('PASS', 'og-url', `og:url param-free: ${ogUrl}`)

const ogVideo = og('video') || og('video:url') || og('video:secure_url')
if (ogVideo) {
  if (/\.(mp4|mov|webm)(\?|$)/i.test(ogVideo)) add('PASS', 'og-video-media', `og:video → media file: ${ogVideo}`)
  else add('FAIL', 'og-video-media', `og:video does not point at a media file (.mp4): ${ogVideo}. Page URL/HLS won't play in unfurls.`)
  const w = og('video:width'), h = og('video:height')
  if (w && h) {
    if (Number(w) <= 16 && Number(h) <= 16) add('FAIL', 'og-video-dims', `og:video:width/height look like an aspect ratio (${w}x${h}), not pixels. Use real dims (e.g. 1080x1920).`)
    else add('PASS', 'og-video-dims', `og:video pixel dims: ${w}x${h}`)
  } else add('WARN', 'og-video-dims', 'og:video present but width/height missing.')
}

// --- §D Twitter / X card -----------------------------------------------------
const twCard = tw('card')
const twPlayer = tw('player')
if (twPlayer && twCard !== 'player') add('FAIL', 'twitter-card', `twitter:player set but twitter:card="${twCard}". Player card never activates — use card=player.`)
else if (twCard) add('PASS', 'twitter-card', `twitter:card = ${twCard}`)

// --- §A crawlable body -------------------------------------------------------
const bodyMatch = html.match(/<body[\s\S]*<\/body>/i)
const body = bodyMatch ? bodyMatch[0] : ''
const visibleText = body.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
if (visibleText.length >= 200) add('PASS', 'crawlable-body', `~${visibleText.length} chars of body text in raw HTML (crawlable/citable).`)
else add('FAIL', 'crawlable-body', `Only ~${visibleText.length} chars of body text in raw HTML — likely client-rendered. Crawlers & LLMs see nothing citable. Add the server SEO block.`)

const h1s = (body.match(/<h1\b/gi) || []).length
if (h1s === 1) add('PASS', 'single-h1', 'Exactly one <h1>.')
else add('WARN', 'single-h1', `${h1s} <h1> tags (expected 1).`)

// --- §B JSON-LD --------------------------------------------------------------
const ldBlocks = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
if (!ldBlocks.length) add('FAIL', 'json-ld-present', 'No application/ld+json block — no structured data for Google Rich Results or GEO.')
else {
  let parsedTypes = []
  ldBlocks.forEach((raw, i) => {
    let data
    try { data = JSON.parse(raw) } catch (e) {
      add('FAIL', 'json-ld-invalid', `JSON-LD block #${i + 1} is invalid JSON: ${e.message}`)
      return
    }
    const nodes = Array.isArray(data) ? data : (data['@graph'] && Array.isArray(data['@graph']) ? data['@graph'] : [data])
    for (const node of nodes) {
      const type = node['@type']
      if (type) parsedTypes.push(type)
      // duration must be ISO-8601 wherever it appears
      const dur = node.duration
      if (dur != null) {
        if (/^PT(?=\d|.*\d)/.test(String(dur)) === false || /:/.test(String(dur))) {
          add('FAIL', 'json-ld-duration', `${type || 'node'}.duration = "${dur}" is not ISO-8601 (need e.g. PT2M14S). #1 rich-results error.`)
        } else add('PASS', 'json-ld-duration', `${type}.duration ISO-8601: ${dur}`)
      }
      // empty-string fields are a validation error — omit instead
      const empties = Object.entries(node).filter(([, v]) => v === '').map(([k]) => k)
      if (empties.length) add('FAIL', 'json-ld-empty', `${type || 'node'} has empty-string field(s): ${empties.join(', ')} — omit the field instead.`)
      if (type === 'VideoObject') {
        for (const req of ['name', 'thumbnailUrl', 'uploadDate']) if (!node[req]) add('WARN', 'json-ld-videoobject', `VideoObject missing ${req}.`)
        if (node.contentUrl && !/\.(mp4|mov|webm)(\?|$)/i.test(String(node.contentUrl))) add('WARN', 'json-ld-contenturl', `VideoObject.contentUrl is not an mp4: ${node.contentUrl}`)
      }
    }
  })
  if (parsedTypes.length) add('PASS', 'json-ld-present', `Valid JSON-LD: ${[...new Set(parsedTypes)].join(', ')}`)
}

// --- report ------------------------------------------------------------------
const order = { FAIL: 0, WARN: 1, INFO: 2, PASS: 3 }
const icon = { PASS: '✓', FAIL: '✗', WARN: '!', INFO: 'i' }
results.sort((a, b) => order[a.level] - order[b.level])
console.log(`\nVerifying (as Googlebot): ${finalUrl}\n`)
for (const r of results) console.log(`  [${icon[r.level]} ${r.level}] ${r.id}: ${r.msg}`)

const fails = results.filter((r) => r.level === 'FAIL').length
const warns = results.filter((r) => r.level === 'WARN').length
console.log(`\n${fails} FAIL, ${warns} WARN, ${results.filter((r) => r.level === 'PASS').length} PASS`)
console.log('\nThis checks the served HTML only. For a public URL, also run the human validators:')
console.log('  • Google Rich Results Test — search.google.com/test/rich-results')
console.log('  • Schema Markup Validator  — validator.schema.org')
console.log('  • Meta Sharing Debugger    — developers.facebook.com/tools/debug   (Instagram/WhatsApp unfurls)')
console.log('  • X Card Validator         — cards-dev.twitter.com/validator')
console.log('See references/verification.md. This skill stops here — it does not open a PR.')
process.exit(fails > 0 ? 1 : 0)
