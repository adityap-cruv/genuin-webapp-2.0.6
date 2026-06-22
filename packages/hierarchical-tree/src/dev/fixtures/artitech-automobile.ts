import type { Page } from '../../schema';

import type { Fixture } from './types';

/**
 * Harley-Davidson `Page` artifact modelled on The Artitech demo's
 * automobile page.
 *
 * Source: `genuin-demo/demos/The Artitech/automobile/index.html`
 * (page body lines ~989–1188 — hero with Rider Feed aside, Motorcycles
 * grid, HD Experience carousel, Test Ride Days promo, Find Your Ride
 * tool cards, Parts split-promo, Gear Takeover, Stories from the Road,
 * Rider Community grid, SEO copy).
 *
 * SDK placement IDs lifted verbatim from the source HTML's
 * `mountGenuinDiv(...)` calls (lines 1340–1352). The automobile
 * directory ships no `placements.json`; the four (styleId, placementId)
 * pairs are hard-coded in the page script and are the authoritative
 * registry for this demo.
 *
 * Archetype: `landing` — a brand/marketing destination, not editorial.
 * Conversion-oriented (Find a Dealer, Book a Test Ride, Shop Parts)
 * with an anchor product-demo reel (`rider-feed`), value-prop sections,
 * and SDK video placements for community + sponsored takeovers. Mirrors
 * the `landing` archetype called out in the hierarchical-tree skill
 * (§"Page archetypes" → "landing").
 *
 * Skipped on purpose (HOST chrome, never Page content):
 * - The `<header class="topbar">` (brand + nav + cart).
 * - The `<footer>` block and the floating Tour button + tour overlay.
 * - The newsletter sign-up form (form controls are on the deny list).
 *
 * The artifact is theme-agnostic per spec §1.4 — no publisher names
 * live in the tree. Recommended preview URL:
 * `http://localhost:5173/?fixture=artitech-automobile&theme=artitech`.
 *
 * Composition notes (per skill `landing` archetype):
 * - Mobile + tablet render as flat single-column stacks. The hero
 *   becomes a SplitView only at 1024+ where the rider-feed reel can
 *   live in the right track without crowding copy.
 * - The HD Experience and Rider Community mounts are emitted as `video`
 *   slots (carousel + grid respectively) wrapped in a heading
 *   surface — these are the source's "premium ad space" placements.
 * - The Gear Takeover mount is a `video` slot with `style: 'feed'` and
 *   `aspect: 'banner'`; the source renders it as a full-width takeover
 *   strip. `style: 'feed'` is required here because it is the anchor
 *   `feed` video that satisfies Rule 13 for all the `linkout` slots
 *   that appear later in the tree.
 * - Wait — the rider-feed reel is also a `feed`. Both can coexist; the
 *   first `feed` in visual reading order satisfies Rule 13.
 * - "Motorcycles Built to Lead" (3 bike cards), "Find Your Ride" (3
 *   tool cards), and "Parts and Accessories" (single split-promo card)
 *   are emitted as `linkout` slots — the source's authored static tiles
 *   are exactly the "features / use cases" the landing archetype's
 *   linkouts represent. The dev fixture supplies cards via `slotData`.
 * - The Test Ride Days and Stories from the Road bands use
 *   `tone: 'brand-strong'` surfaces (saturated brand) per the source's
 *   black/orange bands. The Parts band uses an `accent-border` for the
 *   red-rule-on-light treatment.
 * - Phase 1 satisfied in every tree: an anchor `content` slot
 *   (`automobile-overview`) and at least one anchor `feed` video
 *   (`rider-feed` or `gear-takeover`) appear before any `linkout`.
 *
 * Vocabulary stretches encountered (flagged as gaps, not invented):
 * - The eyebrow rows (`<span class="eyebrow">New Models</span>`) before
 *   each section heading collapse into a `text` size body-2 weight
 *   semibold node. No first-class "eyebrow" primitive exists.
 * - The "category-tabs" buttons in the Find Your Ride section (Grand
 *   American Touring, Cruiser, Trike, …) collapse into a `cluster` of
 *   `chip` nodes. `tabs` is allowed by the closed vocabulary but only
 *   for authored-content panels — these are category filters, not
 *   content switches.
 * - The newsletter sign-up form is omitted entirely. Form controls
 *   (`input`, `button[type=submit]`) are on the deny-list.
 * - The hero "Watch the Video" / "Explore Motorcycles" CTA pair uses
 *   plain `button` text labels; the source has no icon affordance.
 * - The HD Experience SDK is rendered into a centered card with an
 *   orange/dark backdrop — collapsed here into a `tone: 'brand-strong'`
 *   surface. Exact gradient is a theme concern.
 */
const SAMPLE_PAGE: Page = {
  id: 'artitech-automobile-harley-davidson',
  version: '2026.05',
  breakpoints: [
    // ---------- Mobile (0) — flat single-column stack ----------
    {
      id: 'artitech-automobile-mobile',
      minWidth: 0,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'mobile', px: 'md' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'xl' },
            children: [
              // Hero — wrapped in a brand-strong surface so the
              // publisher's primary brand saturates the above-fold band.
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'text',
                        props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Discover H-D' },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'h3', as: 'h1', weight: 'bold', text: 'This Is Why We Ride.' },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'text',
                        props: { size: 'body-1', as: 'p', text: 'For over a century, H-D has brought people together through the joy of riding. That spirit is alive and stronger than ever.' },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'cluster',
                        props: { gap: 'sm' },
                        children: [
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Watch the Video' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Explore Motorcycles' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Rider Feed — anchor reel (Phase 1 anchor video).
              // Wrapped in a brand-strong surface to read like the
              // dark hero aside on the source page.
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Rider Feed' } },
                      { type: 'slot', name: 'rider-feed', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              // Anchor content slot — markdown overview body.
              { type: 'slot', name: 'automobile-overview', kind: 'content', style: 'single' },
              // Motorcycles Built to Lead — 3 bike cards as linkouts.
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'New Models' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Motorcycles Built to Lead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Powerful engines, aggressive stance, and road-first details made for riders who like their freedom loud.' } },
              { type: 'slot', name: 'motorcycles-grid', kind: 'linkout', style: 'grid', cols: 1, rows: 3 },
              // The HD Experience — SDK carousel inside a brand-strong card.
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'The HD Experience' } },
                      { type: 'slot', name: 'hd-experience', kind: 'video', style: 'carousel', cols: 1, aspect: 'video' },
                    ],
                  },
                ],
              },
              // Test Ride Days — split promo (image + copy) flattens to stack on mobile.
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'May 8 - 16, 2026' } },
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Harley-Davidson Test Ride Days' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Visit your local dealership, test ride a new motorcycle, and experience the lineup from the seat that matters.' } },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-test-ride/1024/576', alt: 'Motorcyclist riding on an open highway', aspectRatio: 'landscape', radius: 'md' } },
                      {
                        type: 'ui',
                        uiVariant: 'cluster',
                        props: { gap: 'sm' },
                        children: [
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Book a Test Ride' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Find a Dealer' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Find Your Ride — category chips + tool cards.
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Browse the Garage' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Find Your Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Filter by riding style, compare categories, and start with the motorcycle that matches the road you want.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Grand American Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Cruiser' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Trike' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Adventure Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Sport' } },
                ],
              },
              { type: 'slot', name: 'tools-grid', kind: 'linkout', style: 'grid', cols: 1, rows: 3 },
              // Parts and Accessories — split-promo with accent border.
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'surface',
                    props: { tone: 'subtle', radius: 'md', padding: 'md' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-parts/1024/576', alt: 'Motorcycle parts and workshop tools', aspectRatio: 'landscape', radius: 'md' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Parts and Accessories' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Your Ride. Your Rules.' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Customize your motorcycle with parts and accessories that bring your vision to life, from seats and bars to luggage and performance upgrades.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Shop Parts and Accessories' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Gear for the Ride — SDK takeover (full-width banner feed).
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Shop by Category' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Gear for the Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Jackets, tees, riding gear, gifts, and collaborations that carry the same attitude off the bike.' } },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'accent-strong', radius: 'md', padding: 'md' },
                children: [
                  { type: 'slot', name: 'gear-takeover', kind: 'video', style: 'feed', aspect: 'video' },
                ],
              },
              // Stories from the Road — brand-strong band (dark + copy).
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Stories from the Road' } },
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Follow the Riders' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Journeys, wins, rallies, and road-tested stories from the community that keeps Harley-Davidson moving.' } },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-stories/1024/576', alt: 'Group of riders parked at sunset', aspectRatio: 'landscape', radius: 'md' } },
                      { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Explore the Content Below' } },
                    ],
                  },
                ],
              },
              // Rider Community — large SDK grid card.
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Rider Community' } },
                      { type: 'slot', name: 'rider-community', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                    ],
                  },
                ],
              },
              // SEO copy — closing brand paragraphs. Authored inline as
              // heading + text UI nodes (not a second `content` slot)
              // to stay under the 1-content budget at mobile / tablet /
              // desktop bands.
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Motorcycles built for the road ahead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Harley-Davidson motorcycles are made for riders who live wide open. From cross-country touring to everyday city rides, each model balances performance, sound, and unmistakable style.' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Performance, legacy, and community' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'For over 120 years, Harley-Davidson has stood for freedom, endurance, and individuality. Whether you are learning to ride or adding another machine to the garage, the next step begins with the road in front of you.' } },
            ],
          },
        ],
      },
    },

    // ---------- Tablet (748) — flat stack, grids go 2-col ----------
    {
      id: 'artitech-automobile-tablet',
      minWidth: 748,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'tablet', px: 'md' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'xl' },
            children: [
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Discover H-D' } },
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h1', weight: 'bold', text: 'This Is Why We Ride.' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'For over a century, H-D has brought people together through the joy of riding. That spirit is alive and stronger than ever.' } },
                      {
                        type: 'ui',
                        uiVariant: 'cluster',
                        props: { gap: 'sm' },
                        children: [
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Watch the Video' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Explore Motorcycles' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Rider Feed' } },
                      { type: 'slot', name: 'rider-feed', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              { type: 'slot', name: 'automobile-overview', kind: 'content', style: 'single' },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'New Models' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Motorcycles Built to Lead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Powerful engines, aggressive stance, and road-first details made for riders who like their freedom loud.' } },
              { type: 'slot', name: 'motorcycles-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'lg' },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'The HD Experience' } },
                      { type: 'slot', name: 'hd-experience', kind: 'video', style: 'carousel', cols: 1, aspect: 'video' },
                    ],
                  },
                ],
              },
              // Test Ride Days — 2-col grid (copy + image) at tablet.
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'grid',
                    props: { cols: 2, gap: 'md' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'May 8 - 16, 2026' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Harley-Davidson Test Ride Days' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Visit your local dealership, test ride a new motorcycle, and experience the lineup from the seat that matters.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Book a Test Ride' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Find a Dealer' } },
                            ],
                          },
                        ],
                      },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-test-ride/1024/768', alt: 'Motorcyclist riding on an open highway', aspectRatio: 'landscape', radius: 'md' } },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Browse the Garage' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Find Your Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Filter by riding style, compare categories, and start with the motorcycle that matches the road you want.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Grand American Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Cruiser' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Trike' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Adventure Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Sport' } },
                ],
              },
              { type: 'slot', name: 'tools-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'sm' },
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'surface',
                    props: { tone: 'subtle', radius: 'md', padding: 'md' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'grid',
                        props: { cols: 2, gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-parts/1024/768', alt: 'Motorcycle parts and workshop tools', aspectRatio: 'landscape', radius: 'md' } },
                          {
                            type: 'ui',
                            uiVariant: 'stack',
                            props: { gap: 'md' },
                            children: [
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Parts and Accessories' } },
                              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Your Ride. Your Rules.' } },
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Customize your motorcycle with parts and accessories that bring your vision to life, from seats and bars to luggage and performance upgrades.' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Shop Parts and Accessories' } },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Shop by Category' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Gear for the Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Jackets, tees, riding gear, gifts, and collaborations that carry the same attitude off the bike.' } },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'accent-strong', radius: 'md', padding: 'md' },
                children: [
                  { type: 'slot', name: 'gear-takeover', kind: 'video', style: 'feed', aspect: 'video' },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'grid',
                    props: { cols: 2, gap: 'md' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Stories from the Road' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Follow the Riders' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Journeys, wins, rallies, and road-tested stories from the community that keeps Harley-Davidson moving.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Explore the Content Below' } },
                        ],
                      },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-stories/1024/768', alt: 'Group of riders parked at sunset', aspectRatio: 'landscape', radius: 'md' } },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Rider Community' } },
                      { type: 'slot', name: 'rider-community', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                    ],
                  },
                ],
              },
              // SEO copy — closing brand paragraphs (inline UI nodes,
              // not a second `content` slot, to stay within budget).
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Motorcycles built for the road ahead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Harley-Davidson motorcycles are made for riders who live wide open. From cross-country touring to everyday city rides, each model balances performance, sound, and unmistakable style.' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Performance, legacy, and community' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'For over 120 years, Harley-Davidson has stood for freedom, endurance, and individuality. Whether you are learning to ride or adding another machine to the garage, the next step begins with the road in front of you.' } },
            ],
          },
        ],
      },
    },

    // ---------- Large tablet (1024) — hero becomes SplitView ----------
    {
      id: 'artitech-automobile-large-tablet',
      minWidth: 1024,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'desktop', px: 'lg' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'xl' },
            children: [
              // Hero — brand-strong surface wrapping a SplitView so the
              // dark band spans both copy and rider-feed reel.
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'split-view',
                    props: { tracks: [620, 280], gap: 'lg', align: 'start' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Discover H-D' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h1', weight: 'bold', text: 'This Is Why We Ride.' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-0', as: 'p', text: 'For over a century, H-D has brought people together through the joy of riding. That spirit is alive and stronger than ever.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Watch the Video' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Explore Motorcycles' } },
                            ],
                          },
                        ],
                      },
                      { type: 'slot', name: 'rider-feed', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              { type: 'slot', name: 'automobile-overview', kind: 'content', style: 'single' },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'New Models' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Motorcycles Built to Lead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Powerful engines, aggressive stance, and road-first details made for riders who like their freedom loud.' } },
              { type: 'slot', name: 'motorcycles-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'lg' },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'The HD Experience' } },
                      { type: 'slot', name: 'hd-experience', kind: 'video', style: 'carousel', cols: 1, aspect: 'video' },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'grid',
                    props: { cols: 2, gap: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'May 8 - 16, 2026' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Harley-Davidson Test Ride Days' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Visit your local dealership, test ride a new motorcycle, and experience the lineup from the seat that matters.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Book a Test Ride' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Find a Dealer' } },
                            ],
                          },
                        ],
                      },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-test-ride/1280/800', alt: 'Motorcyclist riding on an open highway', aspectRatio: 'landscape', radius: 'md' } },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Browse the Garage' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Find Your Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Filter by riding style, compare categories, and start with the motorcycle that matches the road you want.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Grand American Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Cruiser' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Trike' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Adventure Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Sport' } },
                ],
              },
              { type: 'slot', name: 'tools-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'sm' },
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'surface',
                    props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'grid',
                        props: { cols: 2, gap: 'lg' },
                        children: [
                          { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-parts/1280/800', alt: 'Motorcycle parts and workshop tools', aspectRatio: 'landscape', radius: 'md' } },
                          {
                            type: 'ui',
                            uiVariant: 'stack',
                            props: { gap: 'md' },
                            children: [
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Parts and Accessories' } },
                              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Your Ride. Your Rules.' } },
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Customize your motorcycle with parts and accessories that bring your vision to life, from seats and bars to luggage and performance upgrades.' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Shop Parts and Accessories' } },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Shop by Category' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Gear for the Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Jackets, tees, riding gear, gifts, and collaborations that carry the same attitude off the bike.' } },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'accent-strong', radius: 'md', padding: 'lg' },
                children: [
                  { type: 'slot', name: 'gear-takeover', kind: 'video', style: 'feed', aspect: 'video' },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'grid',
                    props: { cols: 2, gap: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Stories from the Road' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Follow the Riders' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Journeys, wins, rallies, and road-tested stories from the community that keeps Harley-Davidson moving.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Explore the Content Below' } },
                        ],
                      },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-stories/1280/800', alt: 'Group of riders parked at sunset', aspectRatio: 'landscape', radius: 'md' } },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Rider Community' } },
                      { type: 'slot', name: 'rider-community', kind: 'video', style: 'grid', cols: 3, rows: 2 },
                    ],
                  },
                ],
              },
              // SEO copy — closing brand paragraphs (inline UI nodes,
              // not a second `content` slot, to stay within budget).
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Motorcycles built for the road ahead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Harley-Davidson motorcycles are made for riders who live wide open. From cross-country touring to everyday city rides, each model balances performance, sound, and unmistakable style.' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Performance, legacy, and community' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'For over 120 years, Harley-Davidson has stood for freedom, endurance, and individuality. Whether you are learning to ride or adding another machine to the garage, the next step begins with the road in front of you.' } },
            ],
          },
        ],
      },
    },

    // ---------- Desktop (1280) — same shape as large-tablet, wider tracks ----------
    {
      id: 'artitech-automobile-desktop',
      minWidth: 1280,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'desktop', px: 'lg' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'xl' },
            children: [
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'split-view',
                    props: { tracks: [746, 320], gap: 'lg', align: 'start' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Discover H-D' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-0', as: 'h1', weight: 'bold', text: 'This Is Why We Ride.' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-0', as: 'p', text: 'For over a century, H-D has brought people together through the joy of riding. That spirit is alive and stronger than ever.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Watch the Video' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'lg', text: 'Explore Motorcycles' } },
                            ],
                          },
                        ],
                      },
                      { type: 'slot', name: 'rider-feed', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              { type: 'slot', name: 'automobile-overview', kind: 'content', style: 'single' },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'New Models' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Motorcycles Built to Lead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Powerful engines, aggressive stance, and road-first details made for riders who like their freedom loud.' } },
              { type: 'slot', name: 'motorcycles-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'lg' },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'The HD Experience' } },
                      { type: 'slot', name: 'hd-experience', kind: 'video', style: 'carousel', cols: 1, aspect: 'video' },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'grid',
                    props: { cols: 2, gap: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'May 8 - 16, 2026' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Harley-Davidson Test Ride Days' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Visit your local dealership, test ride a new motorcycle, and experience the lineup from the seat that matters.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Book a Test Ride' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Find a Dealer' } },
                            ],
                          },
                        ],
                      },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-test-ride/1600/1000', alt: 'Motorcyclist riding on an open highway', aspectRatio: 'landscape', radius: 'md' } },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Browse the Garage' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Find Your Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Filter by riding style, compare categories, and start with the motorcycle that matches the road you want.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Grand American Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Cruiser' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Trike' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Adventure Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Sport' } },
                ],
              },
              { type: 'slot', name: 'tools-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'sm' },
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'surface',
                    props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'grid',
                        props: { cols: 2, gap: 'lg' },
                        children: [
                          { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-parts/1600/1000', alt: 'Motorcycle parts and workshop tools', aspectRatio: 'landscape', radius: 'md' } },
                          {
                            type: 'ui',
                            uiVariant: 'stack',
                            props: { gap: 'md' },
                            children: [
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Parts and Accessories' } },
                              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Your Ride. Your Rules.' } },
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Customize your motorcycle with parts and accessories that bring your vision to life, from seats and bars to luggage and performance upgrades.' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Shop Parts and Accessories' } },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Shop by Category' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Gear for the Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Jackets, tees, riding gear, gifts, and collaborations that carry the same attitude off the bike.' } },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'accent-strong', radius: 'md', padding: 'lg' },
                children: [
                  { type: 'slot', name: 'gear-takeover', kind: 'video', style: 'feed', aspect: 'video' },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'grid',
                    props: { cols: 2, gap: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Stories from the Road' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Follow the Riders' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Journeys, wins, rallies, and road-tested stories from the community that keeps Harley-Davidson moving.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Explore the Content Below' } },
                        ],
                      },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-stories/1600/1000', alt: 'Group of riders parked at sunset', aspectRatio: 'landscape', radius: 'md' } },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Rider Community' } },
                      { type: 'slot', name: 'rider-community', kind: 'video', style: 'grid', cols: 3, rows: 2 },
                    ],
                  },
                ],
              },
              // SEO copy — closing brand paragraphs (inline UI nodes,
              // not a second `content` slot, to stay within budget).
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Motorcycles built for the road ahead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Harley-Davidson motorcycles are made for riders who live wide open. From cross-country touring to everyday city rides, each model balances performance, sound, and unmistakable style.' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Performance, legacy, and community' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'For over 120 years, Harley-Davidson has stood for freedom, endurance, and individuality. Whether you are learning to ride or adding another machine to the garage, the next step begins with the road in front of you.' } },
            ],
          },
        ],
      },
    },

    // ---------- Wide desktop (1512) — wider container, identical structure ----------
    {
      id: 'artitech-automobile-wide',
      minWidth: 1512,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'wide', px: 'lg' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'xl' },
            children: [
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'split-view',
                    props: { tracks: [900, 360], gap: 'lg', align: 'start' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Discover H-D' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-0', as: 'h1', weight: 'bold', text: 'This Is Why We Ride.' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-0', as: 'p', text: 'For over a century, H-D has brought people together through the joy of riding. That spirit is alive and stronger than ever.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Watch the Video' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'lg', text: 'Explore Motorcycles' } },
                            ],
                          },
                        ],
                      },
                      { type: 'slot', name: 'rider-feed', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              { type: 'slot', name: 'automobile-overview', kind: 'content', style: 'single' },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'New Models' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Motorcycles Built to Lead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Powerful engines, aggressive stance, and road-first details made for riders who like their freedom loud.' } },
              { type: 'slot', name: 'motorcycles-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'lg' },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'The HD Experience' } },
                      { type: 'slot', name: 'hd-experience', kind: 'video', style: 'carousel', cols: 1, aspect: 'video' },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'grid',
                    props: { cols: 2, gap: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'May 8 - 16, 2026' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Harley-Davidson Test Ride Days' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Visit your local dealership, test ride a new motorcycle, and experience the lineup from the seat that matters.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Book a Test Ride' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Find a Dealer' } },
                            ],
                          },
                        ],
                      },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-test-ride/2000/1200', alt: 'Motorcyclist riding on an open highway', aspectRatio: 'landscape', radius: 'md' } },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Browse the Garage' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Find Your Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Filter by riding style, compare categories, and start with the motorcycle that matches the road you want.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Grand American Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Cruiser' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Trike' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Adventure Touring' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Sport' } },
                ],
              },
              { type: 'slot', name: 'tools-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'sm' },
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'surface',
                    props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'grid',
                        props: { cols: 2, gap: 'lg' },
                        children: [
                          { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-parts/2000/1200', alt: 'Motorcycle parts and workshop tools', aspectRatio: 'landscape', radius: 'md' } },
                          {
                            type: 'ui',
                            uiVariant: 'stack',
                            props: { gap: 'md' },
                            children: [
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Parts and Accessories' } },
                              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Your Ride. Your Rules.' } },
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Customize your motorcycle with parts and accessories that bring your vision to life, from seats and bars to luggage and performance upgrades.' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Shop Parts and Accessories' } },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Shop by Category' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Gear for the Ride' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Jackets, tees, riding gear, gifts, and collaborations that carry the same attitude off the bike.' } },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'accent-strong', radius: 'md', padding: 'lg' },
                children: [
                  { type: 'slot', name: 'gear-takeover', kind: 'video', style: 'feed', aspect: 'video' },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'grid',
                    props: { cols: 2, gap: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Stories from the Road' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Follow the Riders' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Journeys, wins, rallies, and road-tested stories from the community that keeps Harley-Davidson moving.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Explore the Content Below' } },
                        ],
                      },
                      { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/hd-stories/2000/1200', alt: 'Group of riders parked at sunset', aspectRatio: 'landscape', radius: 'md' } },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'subtle', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Rider Community' } },
                      { type: 'slot', name: 'rider-community', kind: 'video', style: 'grid', cols: 4, rows: 2 },
                    ],
                  },
                ],
              },
              // SEO copy — closing brand paragraphs (inline UI nodes,
              // not a second `content` slot, to stay within budget).
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Motorcycles built for the road ahead' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Harley-Davidson motorcycles are made for riders who live wide open. From cross-country touring to everyday city rides, each model balances performance, sound, and unmistakable style.' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Performance, legacy, and community' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'For over 120 years, Harley-Davidson has stood for freedom, endurance, and individuality. Whether you are learning to ride or adding another machine to the garage, the next step begins with the road in front of you.' } },
            ],
          },
        ],
      },
    },
  ],
};

// The Artitech automobile demo SDK config — public demo key, safe to
// commit. Source: `genuin-demo/demos/The Artitech/automobile/index.html`
// lines 1294 (`GENUIN_API_KEY`) and 1340–1352 (the four
// `mountGenuinDiv(...)` calls). The automobile directory ships no
// `placements.json`; these four (styleId, placementId) pairs are
// hard-coded in the page script and are the authoritative registry
// for this demo.
const ARTITECH_AUTOMOBILE_API_KEY = '5bb7d302c337f2037072da4390ad373019d68ae1d46627e1';

const SAMPLE_SLOT_DATA: Record<string, Record<string, unknown>> = {
  // Hero aside — automobile_home_feed (reel)
  'rider-feed': {
    styleId: '69f38a9f82040e80b3eada80',
    placementId: '69f38a9f82040e80b3eada7f',
    apiKey: ARTITECH_AUTOMOBILE_API_KEY,
    poster: 'https://picsum.photos/seed/hd-rider-feed/600/1200',
    aspectRatio: 'reel',
  },
  // Mid-page premium card — automobile_hd_experience (carousel)
  'hd-experience': {
    styleId: '69f394ad80d77607d4f7c66e',
    placementId: '69f394ad80d77607d4f7c66d',
    apiKey: ARTITECH_AUTOMOBILE_API_KEY,
    poster: 'https://picsum.photos/seed/hd-experience/1024/576',
    aspectRatio: 'video',
  },
  // Full-width SDK takeover — automobile_gear_takeover (feed/banner).
  // Source renders this as a single full-width sponsored takeover.
  'gear-takeover': {
    styleId: '69f399bf82040e80b3eadf6f',
    placementId: '69f399bf82040e80b3eadf6e',
    apiKey: ARTITECH_AUTOMOBILE_API_KEY,
    poster: 'https://picsum.photos/seed/hd-gear-takeover/1600/600',
    aspectRatio: 'video',
  },
  // Large grid mount before footer — automobile_rider_community
  'rider-community': {
    styleId: '69f3a0def1feb6b63d573107',
    placementId: '69f3a0def1feb6b63d573106',
    apiKey: ARTITECH_AUTOMOBILE_API_KEY,
    poster: 'https://picsum.photos/seed/hd-rider-community/600/600',
    aspectRatio: 'square',
  },

  // Anchor content body — Harley-Davidson brand overview. Two
  // paragraphs + one H2 subhead. No H1 (page-level H1 is the hero
  // heading UI node).
  'automobile-overview': {
    body: [
      'Harley-Davidson is more than a motorcycle company — it is a century-old American story about freedom, individuality, and the people who turn the highway into a way of life. From the first single-cylinder bike out of Milwaukee to today\'s touring rigs and electric experiments, every model carries forward the same intent: build the machine, then build the community around it.',
      '',
      '## A lineup built around the rider',
      '',
      'The 2026 lineup leans into what riders have always asked for — distinctive sound, road-first ergonomics, and finishes that look ready before the engine turns over. Cruisers like the Low Rider S and Nightster sit alongside touring rigs like the Road Glide, with adventure, sport, and trike variants rounding out the garage. Pair the bike with H-D1 Marketplace, build-your-own customization, and a dealer network that has been part of the brand since the start, and the next ride is rarely far away.',
    ].join('\n'),
  },

  // Motorcycles Built to Lead — 3 bike cards. Source: index.html
  // lines ~1018–1055.
  'motorcycles-grid': {
    cards: [
      {
        id: 'bike-low-rider-s',
        title: '2026 Low Rider S',
        description: 'Dark or Bright. Same Bite. A stripped-down cruiser attitude with flash, muscle, and a stance that looks ready before the engine turns over.',
        href: 'https://example.com/harley-davidson/2026/low-rider-s',
        imageUrl: 'https://picsum.photos/seed/hd-low-rider-s/600/400',
      },
      {
        id: 'bike-nightster',
        title: '2026 Nightster',
        description: 'Lightning Bottled in Orange. A sport-inspired street machine with tribute graphics, black wheels, and a quick-hit profile made for city rides.',
        href: 'https://example.com/harley-davidson/2026/nightster',
        imageUrl: 'https://picsum.photos/seed/hd-nightster/600/400',
      },
      {
        id: 'bike-road-glide',
        title: '2026 Road Glide',
        description: 'Some Rides Are Better Solo. Long-haul capability, wind-cutting style, and the kind of cockpit that makes the highway feel personal.',
        href: 'https://example.com/harley-davidson/2026/road-glide',
        imageUrl: 'https://picsum.photos/seed/hd-road-glide/600/400',
      },
    ],
  },

  // Find Your Ride — 3 tool cards (Build, Browse Inventory, Offers).
  // Source: index.html lines ~1100–1125.
  'tools-grid': {
    cards: [
      {
        id: 'tool-build',
        title: 'Build Your Own',
        description: 'Customize finishes, wheels, luggage, and trim before you visit the dealer.',
        href: 'https://example.com/harley-davidson/build',
        imageUrl: 'https://picsum.photos/seed/hd-tool-build/480/320',
      },
      {
        id: 'tool-inventory',
        title: 'Browse Inventory',
        description: 'See available motorcycles near you and compare options quickly.',
        href: 'https://example.com/harley-davidson/inventory',
        imageUrl: 'https://picsum.photos/seed/hd-tool-inventory/480/320',
      },
      {
        id: 'tool-offers',
        title: 'Offers',
        description: 'Review current financing, limited-time programs, and rider incentives.',
        href: 'https://example.com/harley-davidson/offers',
        imageUrl: 'https://picsum.photos/seed/hd-tool-offers/480/320',
      },
    ],
  },
};

/**
 * The Artitech automobile (Harley-Davidson) fixture — `landing`
 * archetype. See module-level JSDoc for source mapping + composition
 * notes. Recommended preview URL:
 * `http://localhost:5173/?fixture=artitech-automobile&theme=artitech`.
 */
export const artitechAutomobile: Fixture = {
  page: SAMPLE_PAGE,
  slotData: SAMPLE_SLOT_DATA,
};
