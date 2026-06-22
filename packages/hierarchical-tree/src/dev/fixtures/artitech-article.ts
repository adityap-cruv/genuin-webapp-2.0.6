import type { Page } from '../../schema';

import type { Fixture } from './types';

/**
 * Publisher-article `Page` artifact modelled from The Artitech demo.
 *
 * Source: `genuin-demo/demos/The Artitech/publisher/print.html`, the
 * `#page-article` view (lines ~1218–1388). The source is a celebrity-news
 * article template with a breadcrumb, headline, byline, hero image, body
 * copy, related-articles grid, comments, and three SDK placements
 * (`article_after_hero`, `article_after_hero_feed`, `article_after_body`)
 * lifted from `placements.json`.
 *
 * Archetype: `article` — text-centric long-form. The tree follows the
 * `article` archetype sketch in `.team/skills/hierarchical-tree/SKILL.md`
 * (heading + byline + chips + anchor `content` slot + related grid;
 * desktop adds a SplitView with a sticky `video` feed in the right rail
 * and supplementary grids below).
 *
 * The artifact is theme-agnostic per spec §1.4 — no publisher names live
 * in the tree. Recommended preview URL:
 * `http://localhost:5173/?fixture=artitech-article&theme=artitech`.
 *
 * Vocabulary stretches encountered:
 * - The source's author bar (avatar + name + role + share/bookmark/print
 *   action buttons) has no first-class node; collapsed to a single
 *   `text` body-2 byline-dateline line per the archetype sketch. The
 *   action icons are HOST chrome, not Page content.
 * - The hero image lives outside the `video` Slot in the source (it's a
 *   still `<img>` with a caption). The walker treats the `video` Slot's
 *   poster as the rendered hero when the SDK isn't loaded — so the
 *   `article_after_hero_feed` 300×600 portrait feed serves as the
 *   visual hero anchor on desktop (right-rail sticky) and stacks
 *   inline on mobile. The article_after_hero placement maps to a
 *   horizontal `video` carousel that lives below the body.
 * - The source's "Most Read" and "Up Next" sidebar lists are editorial
 *   recirculation — modelled as a right-rail `linkout` style=`single`
 *   stack (density compact) on desktop. On mobile they collapse into
 *   the main column as a single linkout grid before the related-grid.
 * - The comments section is HOST chrome (interactive form + thread) —
 *   not modelled in the Page artifact.
 */
const SAMPLE_PAGE: Page = {
  id: 'artitech-article-celebrity-paris',
  version: '2026.05',
  breakpoints: [
    // ---------- Mobile (0) ----------
    {
      id: 'artitech-article-mobile',
      minWidth: 0,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'mobile', px: 'md' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'lg' },
            children: [
              // Breadcrumb chips (Home / Royals)
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Exclusive' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Home' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                ],
              },
              // Headline
              {
                type: 'ui',
                uiVariant: 'heading',
                props: {
                  level: 'h3',
                  as: 'h1',
                  weight: 'bold',
                  text: "Princess Kate's Surprise Appearance Delights Fans: All the Details",
                },
              },
              // Byline / dateline
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'text',
                    props: {
                      size: 'body-2',
                      as: 'p',
                      text: 'By Charlotte Davies, Royal Correspondent · April 11, 2025 · 5 min read',
                    },
                  },
                ],
              },
              // Tag chips
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Kate Middleton' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'British Royal Family' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Princess of Wales' } },
                ],
              },
              // Hero video feed (article_after_hero_feed — 300×600 portrait)
              {
                type: 'slot',
                name: 'hero-feed',
                kind: 'video',
                style: 'feed',
                sticky: true,
                size: 'hero',
                aspect: 'reel',
              },
              // Anchor article body (markdown)
              {
                type: 'slot',
                name: 'article-body',
                kind: 'content',
                style: 'single',
              },
              // Mid-article horizontal video carousel (article_after_hero) —
              // magazine-style heading bar above a portrait reel carousel.
              // The SDK lays out as many 9:16 cells side-by-side as the
              // container width allows.
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Top Picks' },
              },
              {
                type: 'slot',
                name: 'hero-carousel',
                kind: 'video',
                style: 'carousel',
                cols: 2,
                size: 'default',
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              // Related articles
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'More Celebrity News' },
              },
              {
                type: 'slot',
                name: 'related-grid',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              // Below-body video grid (article_after_body) — a 16:9
              // landscape grid. Visually distinct from `hero-carousel`
              // above because the SDK's `after-body` placement is only
              // registered with the grid style (`...4952`), not the
              // carousel style. Matches the source demo's print.html.
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'More to Watch' },
              },
              {
                type: 'slot',
                name: 'after-body-grid',
                kind: 'video',
                style: 'grid',
                cols: 2,
                rows: 2,
                size: 'compact',
                aspect: 'video',
              },
            ],
          },
        ],
      },
    },

    // ---------- Tablet (748) ----------
    {
      id: 'artitech-article-tablet',
      minWidth: 748,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'tablet', px: 'lg' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'lg' },
            children: [
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Exclusive' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Home' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: {
                  level: 'headline-1',
                  as: 'h1',
                  weight: 'bold',
                  text: "Princess Kate's Surprise Appearance Delights Fans: All the Details",
                },
              },
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'text',
                    props: {
                      size: 'body-2',
                      as: 'p',
                      text: 'By Charlotte Davies, Royal Correspondent · April 11, 2025 · 5 min read',
                    },
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Kate Middleton' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'British Royal Family' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Princess of Wales' } },
                ],
              },
              { type: 'slot', name: 'hero-feed', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
              { type: 'slot', name: 'article-body', kind: 'content', style: 'single' },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Top Picks' },
              },
              {
                type: 'slot',
                name: 'hero-carousel',
                kind: 'video',
                style: 'carousel',
                cols: 2,
                size: 'default',
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', decoration: 'ribbon', text: 'More Celebrity News' },
              },
              {
                type: 'slot',
                name: 'related-grid',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'More to Watch' },
              },
              {
                type: 'slot',
                name: 'after-body-grid',
                kind: 'video',
                style: 'grid',
                cols: 3,
                rows: 2,
                size: 'compact',
                aspect: 'video',
              },
            ],
          },
        ],
      },
    },

    // ---------- Large tablet (1024) — SplitView first appears ----------
    {
      id: 'artitech-article-large-tablet',
      minWidth: 1024,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'tablet', px: 'lg' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'lg' },
            children: [
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Exclusive' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Home' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: {
                  level: 'headline-0',
                  as: 'h1',
                  weight: 'bold',
                  text: "Princess Kate's Surprise Appearance Delights Fans: All the Details",
                },
              },
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'text',
                    props: {
                      size: 'body-2',
                      as: 'p',
                      text: 'By Charlotte Davies, Royal Correspondent · April 11, 2025 · 5 min read',
                    },
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Kate Middleton' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'British Royal Family' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Princess of Wales' } },
                ],
              },
              // SplitView: article body left, sticky hero feed + recirculation right
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
                      { type: 'slot', name: 'article-body', kind: 'content', style: 'single' },
                      // Mid-article video carousel (article_after_hero) —
                      // 9:16 portrait reel carousel mounted inside the
                      // left track. Height matches the source demo's
                      // `placements.json` (500px) so the SDK's carousel
                      // style fits multiple cells side-by-side at this
                      // track width.
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Top Picks' },
                      },
                      {
                        type: 'slot',
                        name: 'hero-carousel',
                        kind: 'video',
                        style: 'carousel',
                        cols: 2,
                        size: 'default',
                      },
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'More to Watch' },
                      },
                      {
                        type: 'slot',
                        name: 'after-body-grid',
                        kind: 'video',
                        style: 'grid',
                        cols: 3,
                        rows: 2,
                        size: 'sm',
                        aspect: 'video',
                      },
                    ],
                  },
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { text: 'Hot Picks', level: 'headline-4', as: 'h2', decoration: 'ribbon' },
                      },
                      { type: 'slot', name: 'hero-feed', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                      // Sidebar "Most Read" panel — wrapped in a tinted
                      // surface so the recirculation block reads as
                      // sidebar chrome rather than inline content.
                      {
                        type: 'ui',
                        uiVariant: 'surface',
                        props: { tone: 'subtle', radius: 'md', padding: 'md', minHeight: 'lg' },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'stack',
                            props: { gap: 'sm' },
                            children: [
                              {
                                type: 'ui',
                                uiVariant: 'heading',
                                props: { level: 'headline-3', as: 'h3', decoration: 'ribbon', text: 'Most Read' },
                              },
                              {
                                type: 'slot',
                                name: 'sidebar-most-read',
                                kind: 'linkout',
                                style: 'grid',
                                cols: 1,
                                rows: 4,
                                density: 'compact',
                                size: 'compact',
                              },
                            ],
                          },
                        ],
                      },
                      // Bottom-of-rail sponsored-style portrait reel — sits
                      // below Most Read / Up Next in the right-rail stack and
                      // scrolls with the page. Reuses the article_after_hero_feed
                      // (styleId, placementId) pair as the Hot Picks slot above:
                      // the SDK's known duplicate-pair latch bug means content
                      // may overlap, accepted because this publisher only has
                      // three registered placements.
                      {
                        type: 'slot',
                        name: 'sidebar-feature',
                        kind: 'video',
                        style: 'feed',
                        sticky: false,
                        size: 'hero',
                        aspect: 'reel',
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', decoration: 'ribbon', text: 'More Celebrity News' },
              },
              {
                type: 'slot',
                name: 'related-grid',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
            ],
          },
        ],
      },
    },

    // ---------- Desktop (1280) ----------
    {
      id: 'artitech-article-desktop',
      minWidth: 1280,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'desktop', px: 'lg' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'lg' },
            children: [
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Exclusive' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Home' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: {
                  level: 'headline-0',
                  as: 'h1',
                  weight: 'bold',
                  text: "Princess Kate's Surprise Appearance Delights Fans: All the Details",
                },
              },
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'text',
                    props: {
                      size: 'body-2',
                      as: 'p',
                      text: 'By Charlotte Davies, Royal Correspondent · April 11, 2025 · 5 min read',
                    },
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Kate Middleton' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'British Royal Family' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Princess of Wales' } },
                ],
              },
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
                      { type: 'slot', name: 'article-body', kind: 'content', style: 'single' },
                      // Mid-article video carousel (article_after_hero) —
                      // 9:16 portrait reel carousel mounted inside the
                      // left track. Height matches the source demo's
                      // `placements.json` (500px) so the SDK's carousel
                      // style fits multiple cells side-by-side at this
                      // track width.
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Top Picks' },
                      },
                      {
                        type: 'slot',
                        name: 'hero-carousel',
                        kind: 'video',
                        style: 'carousel',
                        cols: 2,
                        size: 'default',
                      },
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'More to Watch' },
                      },
                      {
                        type: 'slot',
                        name: 'after-body-grid',
                        kind: 'video',
                        style: 'grid',
                        cols: 3,
                        rows: 2,
                        size: 'sm',
                        aspect: 'video',
                      },
                    ],
                  },
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { text: 'Hot Picks', level: 'headline-4', as: 'h2', decoration: 'ribbon' },
                      },
                      { type: 'slot', name: 'hero-feed', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                      // Sidebar "Most Read" panel — wrapped in a tinted
                      // surface so the recirculation block reads as
                      // sidebar chrome rather than inline content.
                      {
                        type: 'ui',
                        uiVariant: 'surface',
                        props: { tone: 'subtle', radius: 'md', padding: 'md', minHeight: 'lg' },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'stack',
                            props: { gap: 'sm' },
                            children: [
                              {
                                type: 'ui',
                                uiVariant: 'heading',
                                props: { level: 'headline-3', as: 'h3', decoration: 'ribbon', text: 'Most Read' },
                              },
                              {
                                type: 'slot',
                                name: 'sidebar-most-read',
                                kind: 'linkout',
                                style: 'grid',
                                cols: 1,
                                rows: 4,
                                density: 'compact',
                                size: 'compact',
                              },
                            ],
                          },
                        ],
                      },
                      // Bottom-of-rail sponsored-style portrait reel — sits
                      // below Most Read / Up Next in the right-rail stack and
                      // scrolls with the page. Reuses the article_after_hero_feed
                      // (styleId, placementId) pair as the Hot Picks slot above:
                      // the SDK's known duplicate-pair latch bug means content
                      // may overlap, accepted because this publisher only has
                      // three registered placements.
                      {
                        type: 'slot',
                        name: 'sidebar-feature',
                        kind: 'video',
                        style: 'feed',
                        sticky: false,
                        size: 'hero',
                        aspect: 'reel',
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', decoration: 'ribbon', text: 'More Celebrity News' },
              },
              {
                type: 'slot',
                name: 'related-grid',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
            ],
          },
        ],
      },
    },

    // ---------- Wide desktop (1512) ----------
    {
      id: 'artitech-article-wide',
      minWidth: 1512,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'wide', px: 'xl' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'xl' },
            children: [
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'secondary', text: 'Exclusive' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Home' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: {
                  level: 'headline-0',
                  as: 'h1',
                  weight: 'bold',
                  text: "Princess Kate's Surprise Appearance Delights Fans: All the Details",
                },
              },
              {
                type: 'ui',
                uiVariant: 'accent-border',
                props: { side: 'left', tone: 'secondary', weight: 'thick', state: 'always', inset: 'md' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'text',
                    props: {
                      size: 'body-2',
                      as: 'p',
                      text: 'By Charlotte Davies, Royal Correspondent · April 11, 2025 · 5 min read',
                    },
                  },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Kate Middleton' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Royals' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'British Royal Family' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Princess of Wales' } },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'split-view',
                props: { tracks: [880, 360], gap: 'xl', align: 'start' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'slot', name: 'article-body', kind: 'content', style: 'single' },
                      // Mid-article video carousel (article_after_hero) —
                      // 9:16 portrait reel carousel mounted inside the
                      // left track. Height matches the source demo's
                      // `placements.json` (500px) so the SDK's carousel
                      // style fits multiple cells side-by-side at this
                      // track width.
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Top Picks' },
                      },
                      {
                        type: 'slot',
                        name: 'hero-carousel',
                        kind: 'video',
                        style: 'carousel',
                        cols: 2,
                        size: 'default',
                      },
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'More to Watch' },
                      },
                      {
                        type: 'slot',
                        name: 'after-body-grid',
                        kind: 'video',
                        style: 'grid',
                        cols: 3,
                        rows: 2,
                        size: 'sm',
                        aspect: 'video',
                      },
                    ],
                  },
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { text: 'Hot Picks', level: 'headline-4', as: 'h2', decoration: 'ribbon' },
                      },
                      { type: 'slot', name: 'hero-feed', kind: 'video', style: 'feed', sticky: true, size: 'hero', aspect: 'reel' },
                      // Sidebar "Most Read" panel — wrapped in a tinted
                      // surface so the recirculation block reads as
                      // sidebar chrome rather than inline content.
                      {
                        type: 'ui',
                        uiVariant: 'surface',
                        props: { tone: 'subtle', radius: 'md', padding: 'md', minHeight: 'lg' },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'stack',
                            props: { gap: 'sm' },
                            children: [
                              {
                                type: 'ui',
                                uiVariant: 'heading',
                                props: { level: 'headline-3', as: 'h3', decoration: 'ribbon', text: 'Most Read' },
                              },
                              {
                                type: 'slot',
                                name: 'sidebar-most-read',
                                kind: 'linkout',
                                style: 'grid',
                                cols: 1,
                                rows: 4,
                                density: 'compact',
                                size: 'compact',
                              },
                            ],
                          },
                        ],
                      },
                      // Bottom-of-rail sponsored-style portrait reel — sits
                      // below Most Read / Up Next in the right-rail stack and
                      // scrolls with the page. Reuses the article_after_hero_feed
                      // (styleId, placementId) pair as the Hot Picks slot above:
                      // the SDK's known duplicate-pair latch bug means content
                      // may overlap, accepted because this publisher only has
                      // three registered placements.
                      {
                        type: 'slot',
                        name: 'sidebar-feature',
                        kind: 'video',
                        style: 'feed',
                        sticky: false,
                        size: 'hero',
                        aspect: 'reel',
                      },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', decoration: 'ribbon', text: 'More Celebrity News' },
              },
              {
                type: 'slot',
                name: 'related-grid',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
            ],
          },
        ],
      },
    },
  ],
};

// The Artitech publisher demo SDK config — pre-authorised demo key,
// safe to commit. Source: `genuin-demo/demos/The Artitech/publisher/placements.json`.
//   article_after_hero      → carousel style: 69d4feedeeba897cebdb937c / 69d4feedeeba897cebdb937b
//   article_after_hero_feed → feed style:     69d8d7c209396e721fee46b4 / 69d8d7c209396e721fee46b3 (300×600)
//   article_after_body      → grid style:     69d8dcfa09396e721fee4952 / 69d8dcfa09396e721fee4951
//   api key:                                  5bb7d302c337f2037072da4390ad373019d68ae1d46627e1
const ARTITECH_API_KEY = '5bb7d302c337f2037072da4390ad373019d68ae1d46627e1';

const SAMPLE_SLOT_DATA: Record<string, Record<string, unknown>> = {
  'hero-feed': {
    // article_after_hero_feed — 300×600 portrait video feed
    styleId: '69d8d7c209396e721fee46b4',
    placementId: '69d8d7c209396e721fee46b3',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/artitech-hero-feed/600/1200',
    aspectRatio: 'reel',
  },
  'sidebar-feature': {
    // article_after_hero_feed — same registered pair as the Hot Picks
    // right-rail reel above. Distinct mount = SDK fetches a separate
    // content cohort.
    styleId: '69d8d7c209396e721fee46b4',
    placementId: '69d8d7c209396e721fee46b3',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/artitech-sidebar-feature/600/1200',
    aspectRatio: 'reel',
  },
  'hero-carousel': {
    // article_after_hero — the publisher's registered pair. Returns
    // a different content cohort from `after-body-grid` (which uses
    // a different placementId). The SDK latches duplicate (styleId,
    // placementId) pairs onto the first container and re-renders
    // into the second — see the bug comment in the source demo's
    // print.html. Keeping the registered pair guarantees distinct
    // content; visual layout differs from `after-body-grid` because
    // styleId `...937c` is configured as a single-cell player at
    // this publisher.
    styleId: '69d4feedeeba897cebdb937c',
    placementId: '69d4feedeeba897cebdb937b',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/artitech-hero-carousel/1024/576',
    aspectRatio: 'video',
  },
  'after-body-grid': {
    // article_after_body — landscape video grid. The (styleId, placementId)
    // pair must match the publisher registry: this placementId is only
    // valid with the grid style `...4952`. Pairing it with the carousel
    // styleId `...937c` (the hero placement) returns no content because
    // the backend rejects unregistered hybrid pairs.
    styleId: '69d8dcfa09396e721fee4952',
    placementId: '69d8dcfa09396e721fee4951',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/artitech-after-body/1024/576',
    aspectRatio: 'video',
  },
  'article-body': {
    body: [
      "In a moment that caught royal watchers completely by surprise, the Princess of Wales stepped out for an unannounced public engagement this week — and her appearance sent a wave of warmth and relief through a nation that has rallied around her during her health journey. Radiant in a cobalt blue coat dress that immediately started trending online, Kate brought her characteristic warmth and poise to every interaction.",
      '',
      '> She looked completely at ease. It was incredible to witness.',
      '>',
      '> — EYEWITNESS, LONDON',
      '',
      "The engagement — a visit to a children's hospital in central London — was not on the official Court Circular, making it all the more meaningful. \"The children's faces when she walked in were absolutely beautiful,\" a hospital spokesperson told us. \"She spent well over an hour visiting every ward. There was no rushing. She was present for every single interaction.\"",
      '',
      '## A Family United',
      '',
      'Prince William, sources close to the family confirm, has been described as "immensely proud" of his wife\'s resilience and her return to public life. The couple\'s three children — Prince George, Princess Charlotte, and Prince Louis — have reportedly been her "greatest source of strength" throughout her recovery period, according to palace insiders who spoke on condition of anonymity.',
      '',
      'Behind the scenes, royal aides describe a carefully managed return — one paced by Kate herself rather than by the demands of the calendar. The princess has spoken privately about wanting any return to public duties to feel meaningful, not performative.',
      '',
      '## What Comes Next',
      '',
      'Royal observers expect a measured ramp-up of engagements through the summer, anchored around causes she has long championed: early-childhood development, mental-health advocacy, and the arts. Friends say the princess is determined to use her platform with even greater intention than before.',
      '',
      'For the children at the hospital this week, none of that political subtext mattered. What they got was an hour of undivided attention from a princess who, by every account from those in the room, simply wanted to be there.',
    ].join('\n'),
  },
  'sidebar-most-read': {
    cards: [
      {
        id: 'most-read-1',
        title: 'Taylor Swift & Travis Kelce: Inside Their Paris Getaway',
        description: 'EXCLUSIVE · 4 min read',
        href: 'https://example.com/artitech/celebrity/swift-kelce-paris',
        imageUrl: 'https://picsum.photos/seed/artitech-mr-1/240/240',
        brand: 'Celebrity',
      },
      {
        id: 'most-read-2',
        title: 'Zendaya Stuns in Custom Gown at the Met Gala',
        description: 'Red Carpet · 3 min read',
        href: 'https://example.com/artitech/fashion/zendaya-met-gala',
        imageUrl: 'https://picsum.photos/seed/artitech-mr-2/240/240',
        brand: 'Fashion',
      },
      {
        id: 'most-read-3',
        title: "Beyoncé's Cowboy Carter World Tour: Everything We Know",
        description: 'Music · 3 min read',
        href: 'https://example.com/artitech/music/beyonce-cowboy-carter-tour',
        imageUrl: 'https://picsum.photos/seed/artitech-mr-3/240/240',
        brand: 'Music',
      },
      {
        id: 'most-read-4',
        title: 'Selena Gomez Opens Up About Her Most Personal Album Yet',
        description: 'Music · 4 min read',
        href: 'https://example.com/artitech/music/selena-gomez-new-album',
        imageUrl: 'https://picsum.photos/seed/artitech-mr-4/240/240',
        brand: 'Music',
      },
    ],
  },
  'related-grid': {
    cards: [
      {
        id: 'related-1',
        title: 'Princess Kate Returns to Royal Duties After Months of Recovery',
        description: 'A timeline of her gradual return to public life — and what insiders say comes next.',
        href: 'https://example.com/artitech/royals/kate-returns',
        imageUrl: 'https://picsum.photos/seed/artitech-rel-1/480/320',
        brand: 'Royals',
        website: 'artitech.example.com',
      },
      {
        id: 'related-2',
        title: "Prince William's Tribute to His Wife: 'She Inspires Me'",
        description: 'The Prince of Wales spoke candidly during a school visit in Wales this week.',
        href: 'https://example.com/artitech/royals/william-tribute',
        imageUrl: 'https://picsum.photos/seed/artitech-rel-2/480/320',
        brand: 'Royals',
        website: 'artitech.example.com',
      },
      {
        id: 'related-3',
        title: 'Inside the Wales Family: Life at Adelaide Cottage',
        description: 'A rare glimpse into how the royal couple is raising George, Charlotte, and Louis.',
        href: 'https://example.com/artitech/royals/wales-family-life',
        imageUrl: 'https://picsum.photos/seed/artitech-rel-3/480/320',
        brand: 'Royals',
        website: 'artitech.example.com',
      },
    ],
  },
};

/**
 * The Artitech publisher article fixture — `article` archetype.
 * See module-level JSDoc for source mapping + vocabulary notes.
 * Recommended preview URL:
 * `http://localhost:5173/?fixture=artitech-article&theme=artitech`.
 */
export const artitechArticle: Fixture = {
  page: SAMPLE_PAGE,
  slotData: SAMPLE_SLOT_DATA,
};
