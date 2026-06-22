import type { Page } from '../../schema';

import type { Fixture } from './types';

/**
 * Smoke-test `Page` artifact for the hierarchical-tree dev surface.
 *
 * Synthetic data hand-authored against the spec. Two breakpoints
 * (mobile + desktop) so the page exercises the walker's atomic
 * breakpoint swap. Uses every common primitive type that the AI
 * generator emits.
 *
 * Text payloads sit on `props.text` (per the walker's typography
 * adapter convention) so the artifact is purely declarative — no
 * recursive `text` subtrees just to carry a string label.
 */
const SAMPLE_PAGE: Page = {
  id: 'preview-sample',
  version: '2025.05',
  breakpoints: [
    // ---------- Mobile ----------
    {
      id: 'mobile',
      minWidth: 0,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'tablet', px: 'md' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'lg' },
            children: [
              // Title + meta cluster
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-1', as: 'h1', text: 'Hierarchical Tree preview' },
              },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'sm', align: 'center' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Preview' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Mobile-first' } },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              // Video slot
              { type: 'slot', name: 'main-video', kind: 'video', style: 'feed' },
              // Body content
              { type: 'slot', name: 'body', kind: 'content' },
              // Linkouts
              { type: 'slot', name: 'linkouts', kind: 'linkout' },
            ],
          },
        ],
      },
    },
    // ---------- Desktop ----------
    {
      id: 'desktop',
      minWidth: 1024,
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
                uiVariant: 'heading',
                props: { level: 'headline-0', as: 'h1', text: 'Hierarchical Tree preview' },
              },
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'sm', align: 'center' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Preview' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Desktop' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Atomic swap' } },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              // Two-column split: video on the left, linkout stack on the right.
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
                      {
                        type: 'slot',
                        name: 'main-video',
                        kind: 'video',
                        style: 'feed',
                      },
                      { type: 'slot', name: 'body', kind: 'content' },
                    ],
                  },
                  { type: 'slot', name: 'linkouts', kind: 'linkout' },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
};

/**
 * Static slot-data fixture, keyed by slot `name`. The dev app's
 * `resolveSlotProps` callback uses this map to turn an authored Slot
 * into renderer-ready props — the same shape a production data fetch
 * would yield.
 */
const SAMPLE_SLOT_DATA: Record<string, Record<string, unknown>> = {
  body: {
    body: [
      "Welcome to the **Hierarchical Tree** preview page. This is the smoke-test for the runtime walker.",
      '',
      "## What you're looking at",
      '',
      'This page is rendered from a single `Page` artifact — a tree of `UiNode`s and `SlotNode`s. The walker picks one of two `LayoutTree`s based on viewport width and renders it through registries of `@genuin/ui` primitives.',
      '',
      'Try resizing the browser past **1024px** — the entire layout swaps atomically.',
      '',
      '### Spec links',
      '',
      '- See the artifact spec for the format.',
      '- See the walker plan for the runtime.',
    ].join('\n'),
  },
  'main-video': {
    elementId: 'preview-main-video-embed',
    aspectRatio: 'video',
    poster:
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=1024&q=60',
  },
  linkouts: {
    cards: [
      {
        id: 'card-1',
        title: 'Hierarchical Tree Spec',
        description: 'The artifact contract — what the AI generator emits.',
        href: 'https://example.com/spec',
      },
      {
        id: 'card-2',
        title: 'Walker plan',
        description: 'Runtime walker — package layout and dispatcher.',
        href: 'https://example.com/plan',
      },
      {
        id: 'card-3',
        title: 'Layout primitives',
        description: 'The 20-entry default UI registry.',
        href: 'https://example.com/primitives',
      },
    ],
  },
};

/**
 * Article archetype fixture. Two breakpoints (mobile, desktop)
 * exercising the walker's atomic swap. Loaded via the dev app at
 * `/?fixture=article` (the default).
 */
export const article: Fixture = {
  page: SAMPLE_PAGE,
  slotData: SAMPLE_SLOT_DATA,
};
