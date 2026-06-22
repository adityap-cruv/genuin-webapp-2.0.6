import type { Page } from '../../schema';

import type { Fixture } from './types';

/**
 * Figma-derived `Page` artifact for the Genuin Website-V5 "Online Retailer"
 * industry page.
 *
 * Source: Figma file `P9FjWHXqrnBYoXum6NRzxm`, node `5240:159768`
 * ({@link https://www.figma.com/design/P9FjWHXqrnBYoXum6NRzxm/Genuin-Website-V5?node-id=5240-159768}).
 *
 * Identified as the `landing` archetype (added to the SKILL alongside
 * this fixture). The source frame is a B2B product marketing page —
 * exactly the use case `landing` is built for. The tree composition
 * follows the landing archetype sketch in
 * `.team/skills/hierarchical-tree/SKILL.md` (hero + CTAs +
 * product-demo video Slot + content body + feature linkout grids).
 * Rough edges (see report for the full list): the animated demo card
 * stands in for the anchor `video` Slot; nav tiles become `linkout`
 * Slots; stat cards have no vocabulary equivalent and are folded into
 * markdown.
 *
 * Convention reminders (the SKILL.md is misleading on these — fix
 * pending):
 * - Typography primitives (`heading`, `text`, `chip`, `button`) take a
 *   string `text` prop, NOT `children`. The walker's `pickTextPayload`
 *   helper reads `props.text` first.
 * - Slot data lives entirely in `slotData[slot.name]` — the dev shell's
 *   `resolveSlotProps` returns the slotData entry directly and does
 *   NOT merge `slot.props`. Authoring data on `slot.props` is dead.
 */
const SAMPLE_PAGE: Page = {
  id: 'figma-websitev5-online-retailer',
  version: '2026.05',
  breakpoints: [
    // ---------- Mobile (0) ----------
    {
      id: 'websitev5-mobile',
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
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Reach & Frequency' } },
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Clearance' } },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'h3', as: 'h1', weight: 'bold', text: 'Gross Merchandise Volume' },
              },
              {
                type: 'ui',
                uiVariant: 'text',
                props: {
                  size: 'body-1',
                  as: 'p',
                  text: 'A strong price-driven CTA accelerates sell-through and protects margin before forced markdowns.',
                },
              },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'sm' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'button',
                    props: { theme: 'primary', size: 'md' },
                    children: [
                      { type: 'ui', uiVariant: 'icon', props: { name: 'arrow-right', size: 'sm', 'aria-label': '' } },
                      { type: 'ui', uiVariant: 'text', props: { as: 'span', text: 'Get Genuin RSS feed' } },
                    ],
                  },
                  {
                    type: 'ui',
                    uiVariant: 'button',
                    props: { theme: 'outline', size: 'md', text: 'See live examples' },
                  },
                ],
              },
              {
                type: 'slot',
                name: 'product-demo',
                kind: 'video',
                style: 'feed',
                sticky: true,
                size: 'lg',
                aspect: 'video',
              },
              {
                type: 'slot',
                name: 'section-intro',
                kind: 'content',
                style: 'single',
              },
              {
                type: 'slot',
                name: 'stats',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-3', as: 'h2', text: 'Based on your environment' },
              },
              {
                type: 'slot',
                name: 'environments',
                kind: 'linkout',
                style: 'grid',
                cols: 1,
                rows: 3,
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-3', as: 'h2', text: 'More styles to discover' },
              },
              {
                type: 'slot',
                name: 'styles-grid',
                kind: 'linkout',
                style: 'grid',
                cols: 1,
                rows: 3,
              },
            ],
          },
        ],
      },
    },

    // ---------- Tablet (748) ----------
    {
      id: 'websitev5-tablet',
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
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Reach & Frequency' } },
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Clearance' } },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-1', as: 'h1', weight: 'bold', text: 'Gross Merchandise Volume' },
              },
              {
                type: 'ui',
                uiVariant: 'text',
                props: {
                  size: 'body-0',
                  as: 'p',
                  text: 'A strong price-driven CTA accelerates sell-through and protects margin before forced markdowns.',
                },
              },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'sm' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'button',
                    props: { theme: 'primary', size: 'lg' },
                    children: [
                      { type: 'ui', uiVariant: 'icon', props: { name: 'arrow-right', size: 'sm', 'aria-label': '' } },
                      { type: 'ui', uiVariant: 'text', props: { as: 'span', text: 'Get Genuin RSS feed' } },
                    ],
                  },
                  {
                    type: 'ui',
                    uiVariant: 'button',
                    props: { theme: 'outline', size: 'lg', text: 'See live examples' },
                  },
                ],
              },
              { type: 'slot', name: 'product-demo', kind: 'video', style: 'feed', sticky: true, size: 'lg', aspect: 'video' },
              { type: 'slot', name: 'section-intro', kind: 'content', style: 'single' },
              {
                type: 'slot',
                name: 'stats',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', text: 'Based on your environment' },
              },
              {
                type: 'slot',
                name: 'environments',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', text: 'More styles to discover' },
              },
              {
                type: 'slot',
                name: 'styles-grid',
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

    // ---------- Large tablet (1024) — SplitView first appears ----------
    {
      id: 'websitev5-large-tablet',
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
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Reach & Frequency' } },
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Clearance' } },
                ],
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-0', as: 'h1', weight: 'bold', text: 'Gross Merchandise Volume' },
              },
              {
                type: 'ui',
                uiVariant: 'split-view',
                props: { tracks: [620, 280], gap: 'lg', align: 'start' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md', minHeight: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'text',
                        props: {
                          size: 'body-0',
                          as: 'p',
                          text: 'A strong price-driven CTA accelerates sell-through and protects margin before forced markdowns.',
                        },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'cluster',
                        props: { gap: 'sm' },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'button',
                            props: { theme: 'primary', size: 'lg' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'arrow-right', size: 'sm', 'aria-label': '' } },
                              { type: 'ui', uiVariant: 'text', props: { as: 'span', text: 'Get Genuin RSS feed' } },
                            ],
                          },
                          {
                            type: 'ui',
                            uiVariant: 'button',
                            props: { theme: 'outline', size: 'lg', text: 'See live examples' },
                          },
                        ],
                      },
                      { type: 'slot', name: 'product-demo', kind: 'video', style: 'feed', sticky: true, size: 'lg', aspect: 'video' },
                      { type: 'slot', name: 'section-intro', kind: 'content', style: 'single' },
                    ],
                  },
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'sm', minHeight: 'hero' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: {
                          level: 'headline-3',
                          as: 'h3',
                          decoration: 'ribbon',
                          text: 'Package for: Online Retailer',
                        },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'meta-list',
                        props: {
                          leader: 'dotted',
                          items: [
                            { label: 'Placement Styles', value: 'Carousel, Grid, Feed' },
                            { label: 'Network', value: 'Activated' },
                            { label: 'Octo', value: 'Enabled' },
                            { label: 'In-Stream', value: 'Pre/Mid/End Roll' },
                            { label: 'In-Feed', value: 'Sponsored Post' },
                            { label: 'Revenue Potential', value: '$58k–$142k/mo' },
                          ],
                        },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'accent-border',
                        props: {
                          side: 'left',
                          tone: 'primary',
                          weight: 'medium',
                          state: 'always',
                          inset: 'sm',
                        },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'heading',
                            props: {
                              level: 'headline-4',
                              as: 'h4',
                              text: 'Content Programming Template',
                            },
                          },
                          {
                            type: 'slot',
                            name: 'programming-template',
                            kind: 'linkout',
                            style: 'grid',
                            cols: 1,
                            rows: 5,
                            density: 'compact',
                            size: 'lg',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'slot',
                name: 'stats',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', text: 'Based on your environment' },
              },
              {
                type: 'slot',
                name: 'environments',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', text: 'More styles to discover' },
              },
              {
                type: 'slot',
                name: 'styles-grid',
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

    // ---------- Desktop (1280) — full SplitView with sticky meta panel ----------
    {
      id: 'websitev5-desktop',
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
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Reach & Frequency' } },
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Clearance' } },
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
                    props: { gap: 'md', minHeight: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-0', as: 'h1', weight: 'bold', text: 'Gross Merchandise Volume' },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'text',
                        props: {
                          size: 'body-0',
                          as: 'p',
                          text: 'A strong price-driven CTA accelerates sell-through and protects margin before forced markdowns.',
                        },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'cluster',
                        props: { gap: 'sm' },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'button',
                            props: { theme: 'primary', size: 'lg' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'arrow-right', size: 'sm', 'aria-label': '' } },
                              { type: 'ui', uiVariant: 'text', props: { as: 'span', text: 'Get Genuin RSS feed' } },
                            ],
                          },
                          {
                            type: 'ui',
                            uiVariant: 'button',
                            props: { theme: 'outline', size: 'lg', text: 'See live examples' },
                          },
                        ],
                      },
                      { type: 'slot', name: 'product-demo', kind: 'video', style: 'feed', sticky: true, size: 'lg', aspect: 'video' },
                      { type: 'slot', name: 'section-intro', kind: 'content', style: 'single' },
                    ],
                  },
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md', minHeight: 'hero' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: {
                          level: 'headline-3',
                          as: 'h3',
                          decoration: 'ribbon',
                          text: 'Package for: Online Retailer',
                        },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'meta-list',
                        props: {
                          leader: 'dotted',
                          items: [
                            { label: 'Placement Styles', value: 'Carousel, Grid, Feed' },
                            { label: 'Network', value: 'Activated' },
                            { label: 'Octo', value: 'Enabled' },
                            { label: 'In-Stream', value: 'Pre/Mid/End Roll' },
                            { label: 'In-Feed', value: 'Sponsored Post' },
                            { label: 'Revenue Potential', value: '$58k–$142k/mo' },
                          ],
                        },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'accent-border',
                        props: {
                          side: 'left',
                          tone: 'primary',
                          weight: 'medium',
                          state: 'always',
                          inset: 'sm',
                        },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'heading',
                            props: {
                              level: 'headline-4',
                              as: 'h4',
                              text: 'Content Programming Template',
                            },
                          },
                          {
                            type: 'slot',
                            name: 'programming-template',
                            kind: 'linkout',
                            style: 'grid',
                            cols: 1,
                            rows: 5,
                            density: 'compact',
                            size: 'lg',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'slot',
                name: 'stats',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', text: 'Based on your environment' },
              },
              {
                type: 'slot',
                name: 'environments',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', text: 'More styles to discover' },
              },
              {
                type: 'slot',
                name: 'styles-grid',
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
      id: 'websitev5-wide',
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
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Reach & Frequency' } },
                  { type: 'ui', uiVariant: 'chip', props: { variant: 'success', text: 'Clearance' } },
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
                    props: { gap: 'md', minHeight: 'lg' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-0', as: 'h1', weight: 'bold', text: 'Gross Merchandise Volume' },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'text',
                        props: {
                          size: 'body-0',
                          as: 'p',
                          text: 'A strong price-driven CTA accelerates sell-through and protects margin before forced markdowns.',
                        },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'cluster',
                        props: { gap: 'sm' },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'button',
                            props: { theme: 'primary', size: 'lg' },
                            children: [
                              { type: 'ui', uiVariant: 'icon', props: { name: 'arrow-right', size: 'sm', 'aria-label': '' } },
                              { type: 'ui', uiVariant: 'text', props: { as: 'span', text: 'Get Genuin RSS feed' } },
                            ],
                          },
                          {
                            type: 'ui',
                            uiVariant: 'button',
                            props: { theme: 'outline', size: 'lg', text: 'See live examples' },
                          },
                        ],
                      },
                      { type: 'slot', name: 'product-demo', kind: 'video', style: 'feed', sticky: true, size: 'lg', aspect: 'video' },
                      { type: 'slot', name: 'section-intro', kind: 'content', style: 'single' },
                    ],
                  },
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md', minHeight: 'hero' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: {
                          level: 'headline-3',
                          as: 'h3',
                          decoration: 'ribbon',
                          text: 'Package for: Online Retailer',
                        },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'meta-list',
                        props: {
                          leader: 'dotted',
                          items: [
                            { label: 'Placement Styles', value: 'Carousel, Grid, Feed' },
                            { label: 'Network', value: 'Activated' },
                            { label: 'Octo', value: 'Enabled' },
                            { label: 'In-Stream', value: 'Pre/Mid/End Roll' },
                            { label: 'In-Feed', value: 'Sponsored Post' },
                            { label: 'Revenue Potential', value: '$58k–$142k/mo' },
                          ],
                        },
                      },
                      {
                        type: 'ui',
                        uiVariant: 'accent-border',
                        props: {
                          side: 'left',
                          tone: 'primary',
                          weight: 'medium',
                          state: 'always',
                          inset: 'sm',
                        },
                        children: [
                          {
                            type: 'ui',
                            uiVariant: 'heading',
                            props: {
                              level: 'headline-4',
                              as: 'h4',
                              text: 'Content Programming Template',
                            },
                          },
                          {
                            type: 'slot',
                            name: 'programming-template',
                            kind: 'linkout',
                            style: 'grid',
                            cols: 1,
                            rows: 5,
                            density: 'compact',
                            size: 'lg',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'slot',
                name: 'stats',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-1', as: 'h2', text: 'Based on your environment' },
              },
              {
                type: 'slot',
                name: 'environments',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 1,
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-1', as: 'h2', text: 'More styles to discover' },
              },
              {
                type: 'slot',
                name: 'styles-grid',
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

// Demo SDK pairs (user-supplied, safe to commit):
//   carousel: styleId '69c294770970fa2b49e10ff8', placementId '69c294770970fa2b49e10ff7'
//   grid:     styleId '6a0f01d7c018730283e080dd', placementId '6a0f01d7c018730283e080dc'
//   feed:     styleId '6a0f01a22b5e67f84cf9340d', placementId '6a0f01a22b5e67f84cf9340c'
//   api key:  '87ff6635b778331da1a7e2709dc6978c433f26247ac2b931'
const SAMPLE_SLOT_DATA: Record<string, Record<string, unknown>> = {
  'product-demo': {
    // Demo Genuin SDK config — user-supplied, safe to commit.
    styleId: '6a0f01a22b5e67f84cf9340d',
    placementId: '6a0f01a22b5e67f84cf9340c',
    apiKey: '87ff6635b778331da1a7e2709dc6978c433f26247ac2b931',
    // Fallback poster for when the SDK fails / isn't loaded.
    poster:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1024&q=60',
    aspectRatio: 'video',
  },
  'section-intro': {
    body: [
      "Genuin's RSS-driven video layer slots into your retail experience without a redesign.",
      '',
      '## Across the consumer journey',
      '',
      'The same content programming template powers homepage merchandising, category pages, and post-purchase upsell.',
      '',
      '## Based on your environment',
      '',
      'Pick the surface — desktop or mobile — and Genuin adapts the layout. The runtime walker swaps trees at known breakpoints, so the experience reads native on every device.',
    ].join('\n'),
  },
  stats: {
    aspectRatio: 'square',
    cards: [
      {
        id: 'stat-vendors',
        title: '99+',
        description: 'Vendors live today',
        href: 'https://example.com/genuin/customers',
        imageUrl: 'https://picsum.photos/seed/genuin-stat-vendors/240/240',
        brand: 'Genuin',
      },
      {
        id: 'stat-impressions',
        title: 'Billions',
        description: 'Impressions served',
        href: 'https://example.com/genuin/scale',
        imageUrl: 'https://picsum.photos/seed/genuin-stat-impressions/240/240',
        brand: 'Genuin',
      },
      {
        id: 'stat-arpv',
        title: '$20',
        description: 'Genuin-served ARPV',
        href: 'https://example.com/genuin/arpv',
        imageUrl: 'https://picsum.photos/seed/genuin-stat-arpv/240/240',
        brand: 'Genuin',
      },
    ],
  },
  'programming-template': {
    cards: [
      {
        id: 'sponsored-1st',
        title: '1st Place: Sponsored Advertiser Content',
        description: 'Premium slot — top-of-rail, full creative control, weekly rotation.',
        href: 'https://example.com/genuin/templates/sponsored-1st',
        imageUrl: 'https://picsum.photos/seed/genuin-sponsored-1st/240/240',
        brand: 'Genuin',
        website: 'begenuin.com',
        rating: '4.9',
        likes: '12.4K',
      },
      {
        id: 'ads-2nd',
        title: '2nd Place: Ads with Explicit Offers',
        description: 'Performance creatives — direct discount codes and CTA pills.',
        href: 'https://example.com/genuin/templates/ads-explicit',
        imageUrl: 'https://picsum.photos/seed/genuin-ads-2nd/240/240',
        brand: 'Genuin',
        website: 'begenuin.com',
        originalPrice: '$49.00',
        currentPrice: '$29.00',
        rating: '4.7',
      },
      {
        id: 'sponsored-3rd',
        title: '3rd Place: Sponsored Advertiser Content',
        description: 'Brand storytelling units served between organic posts.',
        href: 'https://example.com/genuin/templates/sponsored-3rd',
        imageUrl: 'https://picsum.photos/seed/genuin-sponsored-3rd/240/240',
        brand: 'Genuin',
        website: 'begenuin.com',
        rating: '4.6',
        likes: '8.1K',
      },
      {
        id: 'podcast-4th',
        title: '4th Place: Sponsored Podcast Led Content',
        description: 'Audio-first creators; transcripts surface as shoppable chips.',
        href: 'https://example.com/genuin/templates/podcast',
        imageUrl: 'https://picsum.photos/seed/genuin-podcast-4th/240/240',
        brand: 'Genuin Audio',
        website: 'begenuin.com/podcasts',
        rating: '4.5',
        likes: '5.6K',
        downloads: '2.1K',
      },
      {
        id: 'sponsored-5th',
        title: '5th Place: Sponsored Advertiser Content',
        description: 'Tail slot — long-tail relevance buys, programmatic eligible.',
        href: 'https://example.com/genuin/templates/sponsored-5th',
        imageUrl: 'https://picsum.photos/seed/genuin-sponsored-5th/240/240',
        brand: 'Genuin',
        website: 'begenuin.com',
        rating: '4.4',
        likes: '3.2K',
      },
    ],
  },
  environments: {
    aspectRatio: 'reel',
    cards: [
      {
        id: 'desktop-web',
        title: 'Desktop Web',
        description: 'Sticky shoppable strip for category landings and PDPs.',
        href: 'https://example.com/genuin/environments/desktop-web',
        imageUrl: 'https://picsum.photos/seed/genuin-desktop-web/240/240',
        brand: 'Genuin SDK',
        website: 'begenuin.com/sdk',
        rating: '4.8',
        likes: '18.2K',
      },
      {
        id: 'mobile-web',
        title: 'Mobile Web',
        description: 'Swipe-native feed for thumb-driven browse sessions.',
        href: 'https://example.com/genuin/environments/mobile-web',
        imageUrl: 'https://picsum.photos/seed/genuin-mobile-web/240/240',
        brand: 'Genuin SDK',
        website: 'begenuin.com/sdk',
        rating: '4.9',
        likes: '22.7K',
        downloads: '14.3K',
      },
      {
        id: 'in-app',
        title: 'In-App',
        description: 'Native SDK embed for iOS / Android shopping apps.',
        href: 'https://example.com/genuin/environments/in-app',
        imageUrl: 'https://picsum.photos/seed/genuin-in-app/240/240',
        brand: 'Genuin SDK',
        website: 'begenuin.com/sdk',
        rating: '4.7',
        likes: '11.4K',
        downloads: '9.8K',
      },
    ],
  },
  'styles-grid': {
    aspectRatio: 'square',
    cards: [
      {
        id: 'carousel',
        title: 'Carousel',
        description: 'Horizontal swipe; great above the fold for product spotlights.',
        href: 'https://example.com/genuin/styles/carousel',
        imageUrl: 'https://picsum.photos/seed/genuin-style-carousel/240/240',
        brand: 'Genuin',
        website: 'begenuin.com/styles',
        rating: '4.6',
        likes: '6.4K',
      },
      {
        id: 'grid',
        title: 'Grid',
        description: 'Browse mode for category landings and topic hubs.',
        href: 'https://example.com/genuin/styles/grid',
        imageUrl: 'https://picsum.photos/seed/genuin-style-grid/240/240',
        brand: 'Genuin',
        website: 'begenuin.com/styles',
        rating: '4.7',
        likes: '7.9K',
      },
      {
        id: 'feed',
        title: 'Feed',
        description: 'Infinite vertical scroll; high session length on mobile.',
        href: 'https://example.com/genuin/styles/feed',
        imageUrl: 'https://picsum.photos/seed/genuin-style-feed/240/240',
        brand: 'Genuin',
        website: 'begenuin.com/styles',
        rating: '4.8',
        likes: '9.1K',
      },
    ],
  },
};

/**
 * Figma-derived `Page` artifact — Genuin Website-V5 "Online Retailer" page.
 * See module-level JSDoc for source frame + rough-edge notes.
 */
export const figmaWebsitev5: Fixture = {
  page: SAMPLE_PAGE,
  slotData: SAMPLE_SLOT_DATA,
};
