import type { Page } from '../../schema';

import type { Fixture } from './types';

/**
 * Planet Fitness landing-page `Page` artifact modelled on The Artitech
 * demo's fitness page.
 *
 * Source: `genuin-demo/demos/The Artitech/fitness/index.html` (page body
 * lines ~1048–1262 — hero with daily-motivation aside, memberships,
 * community spotlight, why-PF, sponsored nutrition takeover,
 * club-tour + member-support, feature band, perks promo, paired SDK
 * video grids, get-started CTA). SDK placement IDs lifted verbatim
 * from the sibling `placements.json`.
 *
 * Archetype: `landing` (skill `.team/skills/hierarchical-tree/SKILL.md`
 * §"Page archetypes" → "landing"). Conversion-oriented marketing page
 * with anchor product-demo video (`daily-motivation`), value-prop
 * sections, and feature / promo grids modelled as `linkout` slots —
 * cards resolve from `slotData[slot.name].cards` per the skill's "Slot
 * data — resolved shape" contract.
 *
 * Skipped on purpose (HOST chrome, never Page content):
 * - The `<header class="topbar">` (brand + nav + Join Now CTA).
 * - The `<footer>` block.
 * - The floating "Tour" launch button + tour-layer modal.
 *
 * The artifact is theme-agnostic per spec §1.4 — no publisher names
 * live in the tree. Recommended preview URL:
 * `http://localhost:5173/?fixture=artitech-fitness&theme=artitech`
 * (artitech red theme; Planet Fitness purple palette can be
 * bootstrapped via the paired hierarchical-theme skill later).
 *
 * Composition notes (per skill `landing` archetype):
 * - All breakpoints render as a single-column stack at container
 *   level — the page has no right rail in the source, so no
 *   SplitView is needed at any BP.
 * - Memberships (2 cards: PF Black Card, Classic), feature band
 *   (3 cards: best-value, equipment, locations), and perks promo
 *   (4 cards: app, guides, exclusive perks, gear) are emitted as
 *   `linkout` slots — the source's authored static tiles are exactly
 *   the "features / use cases" the landing archetype's linkouts
 *   represent. SDK linkout placements do not exist on this page; the
 *   dev fixture supplies cards via `slotData`.
 * - The `nutrition-takeover` (sponsored Hello Fresh segment) lives in
 *   an `accent-border side='left' tone='secondary'` + `surface
 *   tone='subtle'` wrapper to render the sponsored chrome.
 * - Phase 1 satisfied in every tree: `daily-motivation` (video, feed,
 *   sticky) is the first slot; every linkout follows it.
 *
 * Vocabulary stretches encountered:
 * - The hero `<span>planet</span>` highlight word collapses into the
 *   heading `text` prop (gradient styling is a theme concern).
 * - The price field "$24.99/mo*" + "Starting at" tagline collapses
 *   into the linkout card's `description`.
 * - The eyebrow rows (icon + label) become `cluster` of `icon` +
 *   `text` size body-2.
 * - The promo-card "Download the App" pill CTAs are absorbed into the
 *   linkout card chrome (each card's `href` is the destination).
 */
const SAMPLE_PAGE: Page = {
  id: 'artitech-fitness-planet-fitness',
  version: '2026.05',
  breakpoints: [
    // ---------- Mobile (0) — flat single-column stack ----------
    {
      id: 'artitech-fitness-mobile',
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
              // publisher's primary brand (Planet Fitness purple,
              // Artitech red, …) saturates the above-fold band.
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
                        uiVariant: 'cluster',
                        props: { gap: 'xs', align: 'center' },
                        children: [
                          { type: 'ui', uiVariant: 'icon', props: { name: 'star', size: 'sm', 'aria-label': '' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', text: 'Judgement Free Zone' } },
                        ],
                      },
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'h3', as: 'h1', weight: 'bold', text: 'We are all strong on this planet.' },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'text',
                        props: { size: 'body-1', as: 'p', text: 'A fitness club built for every body, every pace, and every first day. Find clean spaces, friendly support, and membership options that keep getting started simple.' },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'cluster',
                        props: { gap: 'sm' },
                        children: [
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Find a Club' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Explore Memberships' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Daily Motivation — anchor feed video (Phase 1)
              // Wrapped in a brand-strong surface so the deep purple
              // "DAILY MOTIVATION" panel from the PF reference reads.
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Daily Motivation' } },
                      { type: 'slot', name: 'daily-motivation', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              // Anchor content slot — markdown body about Planet Fitness
              { type: 'slot', name: 'pf-overview', kind: 'content', style: 'single' },
              // Memberships
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Memberships' } },
              {
                type: 'ui',
                uiVariant: 'text',
                props: { size: 'body-2', as: 'p', text: 'Two simple ways to access The Judgement Free Zone, with tons of cardio, strength equipment, and room to move at your own pace.' },
              },
              { type: 'slot', name: 'memberships-grid', kind: 'linkout', style: 'grid', cols: 1, rows: 2 },
              // Community Spotlight
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Community Spotlight' } },
                      { type: 'slot', name: 'community-spotlight', kind: 'video', style: 'feed', aspect: 'video' },
                    ],
                  },
                ],
              },
              // Why PF — image stays outside, copy panel wrapped in
              // subtle surface.
              {
                type: 'ui',
                uiVariant: 'stack',
                props: { gap: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'image',
                    props: { src: 'https://picsum.photos/seed/pf-why/800/600', alt: 'Gym floor with strength equipment', aspectRatio: 'landscape', radius: 'md' },
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
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'xs', align: 'center' },
                            children: [
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Welcome to Planet Fitness' } },
                            ],
                          },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'A place where everyone feels welcome' } },
                          {
                            type: 'ui',
                            uiVariant: 'text',
                            props: { size: 'body-1', as: 'p', text: 'Go at your own pace and do your own thing in a comfortable, energetic environment designed for beginners, returning members, and everyday routines.' },
                          },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Learn More' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Sponsored Nutrition Takeover — accent-border + surface chrome
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
                          { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Sponsored' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm', align: 'center' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'heart', size: 'lg', 'aria-label': '' } },
                              {
                                type: 'ui',
                                uiVariant: 'stack',
                                props: { gap: 'none' },
                                children: [
                                  { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Your Nutritional Needs' } },
                                  { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Brought to you by Hello Fresh' } },
                                ],
                              },
                            ],
                          },
                          { type: 'slot', name: 'nutrition-takeover', kind: 'video', style: 'feed', aspect: 'video' },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Club Tour — wrapped in brand-strong surface for the
              // purple gradient panel from the PF reference.
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
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Club Tour' } },
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Take a virtual club tour' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Explore cardio, strength, locker rooms, stretching zones, and where to get help before your first workout.' } },
                      { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Watch the Club Tour' } },
                    ],
                  },
                ],
              },
              // Member Support — wrapped in subtle surface (copy panel).
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
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Member Support' } },
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Award-winning support' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'From first-day questions to long-term routines, the team is here to help make fitness feel approachable.' } },
                      { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Join the Club' } },
                    ],
                  },
                ],
              },
              // Feature band — Why members love PF
              // Wrapped in a brand-strong surface so the full-bleed
              // purple band from the PF reference reads.
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Why members love PF' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Affordable access, flexible routines, and welcoming clubs are the heart of the experience.' } },
                      { type: 'slot', name: 'feature-grid', kind: 'linkout', style: 'grid', cols: 1, rows: 3 },
                    ],
                  },
                ],
              },
              // Get more from your membership — promo grid
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Get more from your membership' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'App workouts, perks, referrals, and gear help keep the experience moving beyond the club floor.' } },
              { type: 'slot', name: 'promo-grid', kind: 'linkout', style: 'grid', cols: 1, rows: 4 },
              // More for Your Membership — paired SDK video grids.
              // `tone: 'accent-strong'` saturates the band in the
              // publisher's brand accent (Planet Fitness yellow,
              // Artitech red, …) so the section reads as a deliberate
              // pop rather than another subtle backdrop.
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'accent-strong', radius: 'md', padding: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'More for Your Membership' } },
                      // Two SDK 2x2 grid mounts side-by-side. Single
                      // 4x2 merge previously here didn't render — the
                      // SDK style only emits 4 cells regardless of the
                      // cols/rows hint, so two mounts yield 8 cells.
                      {
                        type: 'ui',
                        uiVariant: 'grid',
                        props: { cols: 2, gap: 'md' },
                        children: [
                          { type: 'slot', name: 'perks-grid-a', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                          { type: 'slot', name: 'perks-grid-b', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Get started today
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Get started today' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Pick a club, compare plans, or preview the experience before your first visit.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'sm' },
                children: [
                  { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Find a Club Near You' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'md', text: 'Explore Perks' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'md', text: 'Take a Virtual Tour' } },
                ],
              },
            ],
          },
        ],
      },
    },

    // ---------- Tablet (748) — flat stack, card grids go 2-col ----------
    {
      id: 'artitech-fitness-tablet',
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
                        uiVariant: 'cluster',
                        props: { gap: 'xs', align: 'center' },
                        children: [
                          { type: 'ui', uiVariant: 'icon', props: { name: 'star', size: 'sm', 'aria-label': '' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', text: 'Judgement Free Zone' } },
                        ],
                      },
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h1', weight: 'bold', text: 'We are all strong on this planet.' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'A fitness club built for every body, every pace, and every first day. Find clean spaces, friendly support, and membership options that keep getting started simple.' } },
                      {
                        type: 'ui',
                        uiVariant: 'cluster',
                        props: { gap: 'sm' },
                        children: [
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Find a Club' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Explore Memberships' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Daily Motivation — brand-strong surface (PF reference).
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Daily Motivation' } },
                      { type: 'slot', name: 'daily-motivation', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              { type: 'slot', name: 'pf-overview', kind: 'content', style: 'single' },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Memberships' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Two simple ways to access The Judgement Free Zone, with tons of cardio, strength equipment, and room to move at your own pace.' } },
              { type: 'slot', name: 'memberships-grid', kind: 'linkout', style: 'grid', cols: 2, rows: 1, size: 'lg' },
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Community Spotlight' } },
                      { type: 'slot', name: 'community-spotlight', kind: 'video', style: 'feed', aspect: 'video' },
                    ],
                  },
                ],
              },
              // Why PF — image stays bare, copy panel in subtle surface.
              {
                type: 'ui',
                uiVariant: 'grid',
                props: { cols: 2, gap: 'md' },
                children: [
                  { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/pf-why/800/600', alt: 'Gym floor with strength equipment', aspectRatio: 'landscape', radius: 'md' } },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Welcome to Planet Fitness' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'A place where everyone feels welcome' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Go at your own pace and do your own thing in a comfortable, energetic environment designed for beginners, returning members, and everyday routines.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Learn More' } },
                        ],
                      },
                    ],
                  },
                ],
              },
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
                          { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Sponsored' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm', align: 'center' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'heart', size: 'lg', 'aria-label': '' } },
                              {
                                type: 'ui',
                                uiVariant: 'stack',
                                props: { gap: 'none' },
                                children: [
                                  { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Your Nutritional Needs' } },
                                  { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Brought to you by Hello Fresh' } },
                                ],
                              },
                            ],
                          },
                          { type: 'slot', name: 'nutrition-takeover', kind: 'video', style: 'feed', aspect: 'video' },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Club Tour (brand-strong) + Member Support (subtle).
              {
                type: 'ui',
                uiVariant: 'grid',
                props: { cols: 2, gap: 'md' },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Club Tour' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Take a virtual club tour' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Explore cardio, strength, locker rooms, stretching zones, and where to get help before your first workout.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Watch the Club Tour' } },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Member Support' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Award-winning support' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'From first-day questions to long-term routines, the team is here to help make fitness feel approachable.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Join the Club' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              // Feature band — Why members love PF (brand-strong band).
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Why members love PF' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Affordable access, flexible routines, and welcoming clubs are the heart of the experience.' } },
                      { type: 'slot', name: 'feature-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'sm' },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Get more from your membership' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'App workouts, perks, referrals, and gear help keep the experience moving beyond the club floor.' } },
              { type: 'slot', name: 'promo-grid', kind: 'linkout', style: 'grid', cols: 2, rows: 2 },
              {
                type: 'ui',
                uiVariant: 'surface',
                // Saturated accent band — see mobile BP comment.
                props: { tone: 'accent-strong', radius: 'md', padding: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'More for Your Membership' } },
                      // Two SDK 2x2 grid mounts side-by-side — see
                      // mobile BP comment for the why.
                      {
                        type: 'ui',
                        uiVariant: 'grid',
                        props: { cols: 2, gap: 'md' },
                        children: [
                          { type: 'slot', name: 'perks-grid-a', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                          { type: 'slot', name: 'perks-grid-b', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Get started today' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Pick a club, compare plans, or preview the experience before your first visit.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'sm' },
                children: [
                  { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Find a Club Near You' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'md', text: 'Explore Perks' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'md', text: 'Take a Virtual Tour' } },
                ],
              },
            ],
          },
        ],
      },
    },

    // ---------- Large tablet (1024) — flat stack ----------
    {
      id: 'artitech-fitness-large-tablet',
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
              // Hero band — brand-strong surface wrapping a SplitView
              // so the deep-purple background spans both tracks (copy
              // on the left, daily-motivation reel on the right). The
              // SplitView only appears at desktop bands (1024+); mobile
              // and tablet keep a flat column stack.
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
                      // Left track — hero copy + CTAs.
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'xs', align: 'center' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'star', size: 'sm', 'aria-label': '' } },
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', text: 'Judgement Free Zone' } },
                            ],
                          },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h1', weight: 'bold', text: 'We are all strong on this planet.' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-0', as: 'p', text: 'A fitness club built for every body, every pace, and every first day. Find clean spaces, friendly support, and membership options that keep getting started simple.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Find a Club' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'md', text: 'Explore Memberships' } },
                            ],
                          },
                        ],
                      },
                      // Right track — daily-motivation reel.
                      { type: 'slot', name: 'daily-motivation', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              { type: 'slot', name: 'pf-overview', kind: 'content', style: 'single' },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Memberships' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Two simple ways to access The Judgement Free Zone, with tons of cardio, strength equipment, and room to move at your own pace.' } },
              { type: 'slot', name: 'memberships-grid', kind: 'linkout', style: 'grid', cols: 2, rows: 1, size: 'lg' },
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Community Spotlight' } },
                      { type: 'slot', name: 'community-spotlight', kind: 'video', style: 'feed', aspect: 'video' },
                    ],
                  },
                ],
              },
              // Why PF — image stays bare, copy panel in subtle surface.
              {
                type: 'ui',
                uiVariant: 'grid',
                props: { cols: 2, gap: 'lg' },
                children: [
                  { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/pf-why/800/600', alt: 'Gym floor with strength equipment', aspectRatio: 'landscape', radius: 'md' } },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Welcome to Planet Fitness' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'A place where everyone feels welcome' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Go at your own pace and do your own thing in a comfortable, energetic environment designed for beginners, returning members, and everyday routines.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Learn More' } },
                        ],
                      },
                    ],
                  },
                ],
              },
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
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Sponsored' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm', align: 'center' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'heart', size: 'xl', 'aria-label': '' } },
                              {
                                type: 'ui',
                                uiVariant: 'stack',
                                props: { gap: 'none' },
                                children: [
                                  { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Your Nutritional Needs' } },
                                  { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Brought to you by Hello Fresh' } },
                                ],
                              },
                            ],
                          },
                          { type: 'slot', name: 'nutrition-takeover', kind: 'video', style: 'feed', aspect: 'video' },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Club Tour (brand-strong) + Member Support (subtle).
              {
                type: 'ui',
                uiVariant: 'grid',
                props: { cols: 2, gap: 'lg' },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Club Tour' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Take a virtual club tour' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Explore cardio, strength, locker rooms, stretching zones, and where to get help before your first workout.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Watch the Club Tour' } },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Member Support' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Award-winning support' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'From first-day questions to long-term routines, the team is here to help make fitness feel approachable.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Join the Club' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              // Feature band — Why members love PF (brand-strong band).
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Why members love PF' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Affordable access, flexible routines, and welcoming clubs are the heart of the experience.' } },
                      { type: 'slot', name: 'feature-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'sm' },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Get more from your membership' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'App workouts, perks, referrals, and gear help keep the experience moving beyond the club floor.' } },
              { type: 'slot', name: 'promo-grid', kind: 'linkout', style: 'grid', cols: 4, rows: 1 },
              {
                type: 'ui',
                uiVariant: 'surface',
                // Saturated accent band — see mobile BP comment.
                props: { tone: 'accent-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'More for Your Membership' } },
                      // Two SDK 2x2 grid mounts side-by-side — see
                      // mobile BP comment for the why.
                      {
                        type: 'ui',
                        uiVariant: 'grid',
                        props: { cols: 2, gap: 'md' },
                        children: [
                          { type: 'slot', name: 'perks-grid-a', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                          { type: 'slot', name: 'perks-grid-b', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Get started today' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Pick a club, compare plans, or preview the experience before your first visit.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'sm' },
                children: [
                  { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Find a Club Near You' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'md', text: 'Explore Perks' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'md', text: 'Take a Virtual Tour' } },
                ],
              },
            ],
          },
        ],
      },
    },

    // ---------- Desktop (1280) — flat stack ----------
    {
      id: 'artitech-fitness-desktop',
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
              // Hero band — brand-strong surface wrapping a SplitView
              // so the deep-purple background spans both tracks (copy
              // on the left, daily-motivation reel on the right). The
              // SplitView only appears at desktop bands (1024+); mobile
              // and tablet keep a flat column stack.
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
                      // Left track — hero copy + CTAs.
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'xs', align: 'center' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'star', size: 'sm', 'aria-label': '' } },
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', text: 'Judgement Free Zone' } },
                            ],
                          },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-0', as: 'h1', weight: 'bold', text: 'We are all strong on this planet.' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-0', as: 'p', text: 'A fitness club built for every body, every pace, and every first day. Find clean spaces, friendly support, and membership options that keep getting started simple.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Find a Club' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'lg', text: 'Explore Memberships' } },
                            ],
                          },
                        ],
                      },
                      // Right track — daily-motivation reel.
                      { type: 'slot', name: 'daily-motivation', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              { type: 'slot', name: 'pf-overview', kind: 'content', style: 'single' },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Memberships' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Two simple ways to access The Judgement Free Zone, with tons of cardio, strength equipment, and room to move at your own pace.' } },
              { type: 'slot', name: 'memberships-grid', kind: 'linkout', style: 'grid', cols: 2, rows: 1, size: 'lg' },
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Community Spotlight' } },
                      { type: 'slot', name: 'community-spotlight', kind: 'video', style: 'feed', aspect: 'video' },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'grid',
                props: { cols: 2, gap: 'lg' },
                children: [
                  { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/pf-why/1200/800', alt: 'Gym floor with strength equipment', aspectRatio: 'landscape', radius: 'md' } },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Welcome to Planet Fitness' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'A place where everyone feels welcome' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Go at your own pace and do your own thing in a comfortable, energetic environment designed for beginners, returning members, and everyday routines.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Learn More' } },
                        ],
                      },
                    ],
                  },
                ],
              },
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
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Sponsored' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm', align: 'center' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'heart', size: 'xl', 'aria-label': '' } },
                              {
                                type: 'ui',
                                uiVariant: 'stack',
                                props: { gap: 'none' },
                                children: [
                                  { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Your Nutritional Needs' } },
                                  { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Brought to you by Hello Fresh' } },
                                ],
                              },
                            ],
                          },
                          { type: 'slot', name: 'nutrition-takeover', kind: 'video', style: 'feed', size: 'default', aspect: 'video' },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Club Tour (brand-strong) + Member Support (subtle).
              {
                type: 'ui',
                uiVariant: 'grid',
                props: { cols: 2, gap: 'lg' },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Club Tour' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Take a virtual club tour' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Explore cardio, strength, locker rooms, stretching zones, and where to get help before your first workout.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Watch the Club Tour' } },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Member Support' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Award-winning support' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'From first-day questions to long-term routines, the team is here to help make fitness feel approachable.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Join the Club' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              // Feature band — Why members love PF (brand-strong band).
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Why members love PF' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'Affordable access, flexible routines, and welcoming clubs are the heart of the experience.' } },
                      { type: 'slot', name: 'feature-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'sm' },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'Get more from your membership' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'App workouts, perks, referrals, and gear help keep the experience moving beyond the club floor.' } },
              { type: 'slot', name: 'promo-grid', kind: 'linkout', style: 'grid', cols: 4, rows: 1 },
              {
                type: 'ui',
                uiVariant: 'surface',
                // Saturated accent band — see mobile BP comment.
                props: { tone: 'accent-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'More for Your Membership' } },
                      // Two SDK 2x2 grid mounts side-by-side — see
                      // mobile BP comment for the why.
                      {
                        type: 'ui',
                        uiVariant: 'grid',
                        props: { cols: 2, gap: 'md' },
                        children: [
                          { type: 'slot', name: 'perks-grid-a', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                          { type: 'slot', name: 'perks-grid-b', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Get started today' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Pick a club, compare plans, or preview the experience before your first visit.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'md' },
                children: [
                  { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Find a Club Near You' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'lg', text: 'Explore Perks' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'lg', text: 'Take a Virtual Tour' } },
                ],
              },
            ],
          },
        ],
      },
    },

    // ---------- Wide (1512) — flat stack ----------
    {
      id: 'artitech-fitness-wide',
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
              // Hero band — brand-strong surface wrapping a SplitView
              // so the deep-purple background spans both tracks (copy
              // on the left, daily-motivation reel on the right). The
              // SplitView only appears at desktop bands (1024+); mobile
              // and tablet keep a flat column stack.
              {
                type: 'ui',
                uiVariant: 'surface',
                props: { tone: 'brand-strong', radius: 'md', padding: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'split-view',
                    props: { tracks: [860, 360], gap: 'lg', align: 'start' },
                    children: [
                      // Left track — hero copy + CTAs.
                      {
                        type: 'ui',
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'xs', align: 'center' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'star', size: 'sm', 'aria-label': '' } },
                              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', text: 'Judgement Free Zone' } },
                            ],
                          },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-0', as: 'h1', weight: 'bold', text: 'We are all strong on this planet.' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-0', as: 'p', text: 'A fitness club built for every body, every pace, and every first day. Find clean spaces, friendly support, and membership options that keep getting started simple.' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm' },
                            children: [
                              { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Find a Club' } },
                              { type: 'ui', uiVariant: 'button', props: { theme: 'secondary', size: 'lg', text: 'Explore Memberships' } },
                            ],
                          },
                        ],
                      },
                      // Right track — daily-motivation reel.
                      { type: 'slot', name: 'daily-motivation', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                    ],
                  },
                ],
              },
              { type: 'slot', name: 'pf-overview', kind: 'content', style: 'single' },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Memberships' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Two simple ways to access The Judgement Free Zone, with tons of cardio, strength equipment, and room to move at your own pace.' } },
              { type: 'slot', name: 'memberships-grid', kind: 'linkout', style: 'grid', cols: 2, rows: 1, size: 'lg' },
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Community Spotlight' } },
                      { type: 'slot', name: 'community-spotlight', kind: 'video', style: 'feed', aspect: 'video' },
                    ],
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'grid',
                props: { cols: 2, gap: 'xl' },
                children: [
                  { type: 'ui', uiVariant: 'image', props: { src: 'https://picsum.photos/seed/pf-why/1600/1000', alt: 'Gym floor with strength equipment', aspectRatio: 'landscape', radius: 'md' } },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'span', weight: 'semibold', text: 'Welcome to Planet Fitness' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-0', as: 'h2', text: 'A place where everyone feels welcome' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-0', as: 'p', text: 'Go at your own pace and do your own thing in a comfortable, energetic environment designed for beginners, returning members, and everyday routines.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Learn More' } },
                        ],
                      },
                    ],
                  },
                ],
              },
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
                        uiVariant: 'stack',
                        props: { gap: 'md' },
                        children: [
                          { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Sponsored' } },
                          {
                            type: 'ui',
                            uiVariant: 'cluster',
                            props: { gap: 'sm', align: 'center' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'heart', size: 'xl', 'aria-label': '' } },
                              {
                                type: 'ui',
                                uiVariant: 'stack',
                                props: { gap: 'none' },
                                children: [
                                  { type: 'ui', uiVariant: 'heading', props: { level: 'headline-0', as: 'h2', text: 'Your Nutritional Needs' } },
                                  { type: 'ui', uiVariant: 'text', props: { size: 'body-0', as: 'p', text: 'Brought to you by Hello Fresh' } },
                                ],
                              },
                            ],
                          },
                          { type: 'slot', name: 'nutrition-takeover', kind: 'video', style: 'feed', size: 'default', aspect: 'video' },
                        ],
                      },
                    ],
                  },
                ],
              },
              // Club Tour (brand-strong) + Member Support (subtle).
              {
                type: 'ui',
                uiVariant: 'grid',
                props: { cols: 2, gap: 'xl' },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Club Tour' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Take a virtual club tour' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Explore cardio, strength, locker rooms, stretching zones, and where to get help before your first workout.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Watch the Club Tour' } },
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
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'span', weight: 'semibold', text: 'Member Support' } },
                          { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Award-winning support' } },
                          { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'From first-day questions to long-term routines, the team is here to help make fitness feel approachable.' } },
                          { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Join the Club' } },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              // Feature band — Why members love PF (brand-strong band).
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
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Why members love PF' } },
                      { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'Affordable access, flexible routines, and welcoming clubs are the heart of the experience.' } },
                      { type: 'slot', name: 'feature-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 1, size: 'sm' },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'Get more from your membership' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-1', as: 'p', text: 'App workouts, perks, referrals, and gear help keep the experience moving beyond the club floor.' } },
              { type: 'slot', name: 'promo-grid', kind: 'linkout', style: 'grid', cols: 4, rows: 1 },
              {
                type: 'ui',
                uiVariant: 'surface',
                // Saturated accent band — see mobile BP comment.
                props: { tone: 'accent-strong', radius: 'md', padding: 'xl' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', as: 'h2', text: 'More for Your Membership' } },
                      // Two SDK 2x2 grid mounts side-by-side — see
                      // mobile BP comment for the why.
                      {
                        type: 'ui',
                        uiVariant: 'grid',
                        props: { cols: 2, gap: 'md' },
                        children: [
                          { type: 'slot', name: 'perks-grid-a', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                          { type: 'slot', name: 'perks-grid-b', kind: 'video', style: 'grid', cols: 2, rows: 2 },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-0', as: 'h2', text: 'Get started today' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-0', as: 'p', text: 'Pick a club, compare plans, or preview the experience before your first visit.' } },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'md' },
                children: [
                  { type: 'ui', uiVariant: 'button', props: { theme: 'primary', size: 'lg', text: 'Find a Club Near You' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'lg', text: 'Explore Perks' } },
                  { type: 'ui', uiVariant: 'button', props: { theme: 'outline', size: 'lg', text: 'Take a Virtual Tour' } },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
};

// The Artitech fitness demo SDK config — public demo key, safe to
// commit. Source: `genuin-demo/demos/The Artitech/fitness/placements.json`.
const ARTITECH_FITNESS_API_KEY = '5bb7d302c337f2037072da4390ad373019d68ae1d46627e1';

const SAMPLE_SLOT_DATA: Record<string, Record<string, unknown>> = {
  // Anchor product-demo feed (hero aside) — fitness_daily_motivation
  'daily-motivation': {
    styleId: '69f2f18d80d77607d4f7755d',
    placementId: '69f2f18d80d77607d4f7755c',
    apiKey: ARTITECH_FITNESS_API_KEY,
    poster: 'https://picsum.photos/seed/pf-daily-motivation/600/1200',
    aspectRatio: 'portrait',
  },
  // Mid-page community video — fitness_community_spotlight
  'community-spotlight': {
    styleId: '69f2effe82040e80b3ea9866',
    placementId: '69f2effe82040e80b3ea9865',
    apiKey: ARTITECH_FITNESS_API_KEY,
    poster: 'https://picsum.photos/seed/pf-community/1024/576',
    aspectRatio: 'video',
  },
  // Sponsored Hello Fresh nutrition — fitness_nutrition_takeover
  'nutrition-takeover': {
    styleId: '69f2f60980d77607d4f7791c',
    placementId: '69f2f60980d77607d4f7791b',
    apiKey: ARTITECH_FITNESS_API_KEY,
    poster: 'https://picsum.photos/seed/pf-nutrition/1024/576',
    aspectRatio: 'video',
  },
  // Paired 2x2 SDK video grids — fitness_more_membership_grid.
  // Two distinct slot names guarantee separate DOM mounts; each mount
  // emits 4 cells (the SDK style ignores cols/rows hints), so the
  // pair yields 8 cells total. Same (styleId, placementId, apiKey,
  // poster, aspectRatio) — any SDK content overlap is the same latch
  // behavior documented elsewhere.
  'perks-grid-a': {
    styleId: '69f3554180d77607d4f7ae2f',
    placementId: '69f3554180d77607d4f7ae2e',
    apiKey: ARTITECH_FITNESS_API_KEY,
    poster: 'https://picsum.photos/seed/pf-perks-a/600/600',
    aspectRatio: 'reel',
  },
  'perks-grid-b': {
    styleId: '69f3554180d77607d4f7ae2f',
    placementId: '69f3554180d77607d4f7ae2e',
    apiKey: ARTITECH_FITNESS_API_KEY,
    poster: 'https://picsum.photos/seed/pf-perks-a/600/600',
    aspectRatio: 'reel',
  },

  // Anchor content slot — markdown overview body. Two paragraphs + one
  // H2 subhead. No H1 (page-level H1 is the hero heading UI node).
  'pf-overview': {
    body: [
      'At Planet Fitness, the philosophy is simple: a clean, welcoming gym should be within reach of anyone willing to take the first step. The clubs are designed for routines that fit real lives — early-morning lifters, lunch-break treadmill walks, evening strength sessions, weekend cardio. The team calls it The Judgement Free Zone, and members say it shows in the small things: friendly check-ins, equipment that just works, and space to do your own thing.',
      '',
      '## Built for every body',
      '',
      'Memberships start at $15 a month, and every plan covers a full set of cardio, strength, stretching, and circuit equipment. The Black Card adds any-club access and a guest privilege so a workout buddy is always part of the deal. Beyond the floor, members tap into app-based workouts, exclusive partner perks, and a member-shop with everyday fitness essentials — the whole experience is built around staying consistent, not feeling watched.',
    ].join('\n'),
  },

  // Memberships — 2 cards (Black Card, Classic). Source: index.html
  // lines ~1101–1127.
  'memberships-grid': {
    cards: [
      {
        id: 'pf-black-card',
        title: 'PF Black Card',
        description: 'Starting at $24.99/mo · Any-club access, bring a guest, premium digital workouts.',
        href: 'https://example.com/planet-fitness/black-card',
        imageUrl: 'https://picsum.photos/seed/pf-black-card/480/320',
      },
      {
        id: 'pf-classic',
        title: 'Classic',
        description: 'Starting at $15/mo · Unlimited access to your home club with a clean, welcoming space.',
        href: 'https://example.com/planet-fitness/classic',
        imageUrl: 'https://picsum.photos/seed/pf-classic/480/320',
      },
    ],
  },

  // Why members love PF — 3 feature cards. Source: index.html lines
  // ~1190–1204.
  'feature-grid': {
    cards: [
      {
        id: 'feature-best-value',
        title: 'Best value',
        description: 'High-quality equipment and friendly spaces at an approachable monthly price.',
        href: 'https://example.com/planet-fitness/why/value',
        imageUrl: 'https://picsum.photos/seed/pf-feature-value/480/320',
      },
      {
        id: 'feature-equipment',
        title: 'Tons of equipment',
        description: 'Cardio, strength, stretching, and circuit options for every pace and routine.',
        href: 'https://example.com/planet-fitness/why/equipment',
        imageUrl: 'https://picsum.photos/seed/pf-feature-equipment/480/320',
      },
      {
        id: 'feature-locations',
        title: '2,700+ locations',
        description: 'A wide network of clubs to help members stay consistent wherever life takes them.',
        href: 'https://example.com/planet-fitness/why/locations',
        imageUrl: 'https://picsum.photos/seed/pf-feature-locations/480/320',
      },
    ],
  },

  // Get more from your membership — 4 promo cards. Source: index.html
  // lines ~1214–1234.
  'promo-grid': {
    cards: [
      {
        id: 'promo-app',
        title: 'Bring PF anywhere',
        description: 'Crowd-meter insights, activity tracking, and digital workouts in the PF app.',
        href: 'https://example.com/planet-fitness/perks/app',
        imageUrl: 'https://picsum.photos/seed/pf-promo-app/480/320',
      },
      {
        id: 'promo-guides',
        title: 'Workout guides',
        description: 'Follow step-by-step routines with visual tutorials and approachable structure.',
        href: 'https://example.com/planet-fitness/perks/guides',
        imageUrl: 'https://picsum.photos/seed/pf-promo-guides/480/320',
      },
      {
        id: 'promo-perks',
        title: 'Exclusive perks',
        description: 'Save on favorite brands with offers made for members.',
        href: 'https://example.com/planet-fitness/perks/exclusive',
        imageUrl: 'https://picsum.photos/seed/pf-promo-perks/480/320',
      },
      {
        id: 'promo-gear',
        title: 'Get your gear',
        description: 'Bags, outfits, and everyday fitness essentials in the PF store.',
        href: 'https://example.com/planet-fitness/perks/gear',
        imageUrl: 'https://picsum.photos/seed/pf-promo-gear/480/320',
      },
    ],
  },
};

/**
 * The Artitech fitness landing fixture — `landing` archetype.
 * See module-level JSDoc for source mapping + composition notes.
 * Recommended preview URL:
 * `http://localhost:5173/?fixture=artitech-fitness&theme=artitech`.
 */
export const artitechFitness: Fixture = {
  page: SAMPLE_PAGE,
  slotData: SAMPLE_SLOT_DATA,
};
