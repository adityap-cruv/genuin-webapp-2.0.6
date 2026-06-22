import { describe, expect, it } from 'vitest';

import { article } from './dev/fixtures/article';
import type { LayoutNode, Page } from './schema';
import {
  ALLOWED_UI_VARIANTS,
  DENY_LIST_UI_VARIANTS,
  validatePage,
  validatePageRules,
} from './validate-rules';

/**
 * Build a minimal-valid `Page` that we can dent for negative tests.
 * Returns a fresh object on each call so mutation is isolated.
 */
function buildValidPage(): Page {
  return {
    id: 'rules-test-page',
    breakpoints: [
      {
        id: 'mobile',
        minWidth: 0,
        root: {
          type: 'ui',
          uiVariant: 'container',
          children: [
            {
              type: 'ui',
              uiVariant: 'stack',
              children: [
                {
                  type: 'slot',
                  name: 'anchor-video',
                  kind: 'video',
                  style: 'feed',
                },
                {
                  type: 'slot',
                  name: 'body',
                  kind: 'content',
                  props: { body: 'A paragraph.\n\n## Subhead\n\nMore prose.' },
                },
                {
                  type: 'slot',
                  name: 'related',
                  kind: 'linkout',
                  style: 'single',
                },
              ],
            },
          ],
        },
      },
    ],
  };
}

describe('validatePageRules — happy paths', () => {
  it('passes the article fixture clean', () => {
    const result = validatePageRules(article.page);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('passes a minimal-valid page clean', () => {
    const result = validatePageRules(buildValidPage());
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('rule 3 — UI_GRID_PLACEMENT_PROPS', () => {
  it('passes when no forbidden props are set', () => {
    const page = buildValidPage();
    const result = validatePageRules(page);
    expect(result.errors.find(e => e.code === 'UI_GRID_PLACEMENT_PROPS')).toBeUndefined();
  });

  it('flags col / row / colSpan / rowSpan on a UI node', () => {
    const page = buildValidPage();
    const root = page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>;
    root.props = { col: 1, colSpan: 2, row: 3, rowSpan: 4 };
    const result = validatePageRules(page);
    const codes = result.errors.filter(e => e.code === 'UI_GRID_PLACEMENT_PROPS');
    expect(codes).toHaveLength(4);
  });
});

describe('rule 4 — ROOT_NOT_UI', () => {
  it('rejects a tree whose root is a Slot', () => {
    const page = buildValidPage();
    page.breakpoints[0].root = {
      type: 'slot',
      name: 'root-slot',
      kind: 'content',
    } as LayoutNode;
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'ROOT_NOT_UI')).toBe(true);
  });
});

describe('rule 7 — BAD_KIND_STYLE', () => {
  it('rejects content with style other than single', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const body = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'content',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    // assigning a forbidden style — cast through unknown for narrow type.
    body.style = 'feed';
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'BAD_KIND_STYLE')).toBe(true);
  });

  it('rejects video with style single', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const v = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'video',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    v.style = 'single';
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'BAD_KIND_STYLE')).toBe(true);
  });

  it('rejects linkout with style feed', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const link = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'linkout',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    link.style = 'feed';
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'BAD_KIND_STYLE')).toBe(true);
  });
});

describe('rule 8 — MISSING_STYLE_DECORATOR', () => {
  it('rejects style=grid without cols/rows', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const link = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'linkout',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    link.style = 'grid';
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MISSING_STYLE_DECORATOR')).toBe(true);
  });

  it('rejects style=carousel without cols', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const link = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'linkout',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    link.style = 'carousel';
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MISSING_STYLE_DECORATOR')).toBe(true);
  });
});

describe('rule 9 — DUPLICATE_SLOT_NAME', () => {
  it('rejects two slots sharing a name in the same tree', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const link = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'linkout',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    link.name = 'body'; // collides with the content slot
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'DUPLICATE_SLOT_NAME')).toBe(true);
  });
});

describe('rule 11 — BAD_UI_VARIANT / DENY_LIST_UI_VARIANT', () => {
  it('rejects an unknown uiVariant', () => {
    const page = buildValidPage();
    const root = page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>;
    root.uiVariant = 'magic-shelf';
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'BAD_UI_VARIANT')).toBe(true);
  });

  it('rejects a deny-list uiVariant with the explicit code', () => {
    const page = buildValidPage();
    const root = page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>;
    root.uiVariant = 'dialog';
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'DENY_LIST_UI_VARIANT')).toBe(true);
    // shouldn't double-emit BAD_UI_VARIANT for the same node.
    expect(result.errors.some(e => e.code === 'BAD_UI_VARIANT')).toBe(false);
  });

  it('accepts every variant in the allow-list', () => {
    for (const variant of ALLOWED_UI_VARIANTS) {
      const page = buildValidPage();
      const root = page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>;
      root.uiVariant = variant;
      const result = validatePageRules(page);
      expect(result.errors.some(e => e.code === 'BAD_UI_VARIANT')).toBe(false);
      expect(result.errors.some(e => e.code === 'DENY_LIST_UI_VARIANT')).toBe(false);
    }
  });

  it('lists 23 emittable variants', () => {
    expect(ALLOWED_UI_VARIANTS).toHaveLength(23);
  });

  it("accepts 'accent-border' as a valid uiVariant wrapping children", () => {
    const page = buildValidPage();
    const root = page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>;
    const originalChildren = root.children ?? [];
    root.children = [
      ...originalChildren,
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
            props: { level: 'headline-4', as: 'h4', text: 'Sponsored card' },
          },
        ],
      },
    ];
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'BAD_UI_VARIANT')).toBe(false);
    expect(result.errors.some(e => e.code === 'DENY_LIST_UI_VARIANT')).toBe(false);
    expect(result.ok).toBe(true);
  });

  it("accepts 'surface' as a valid uiVariant wrapping children", () => {
    const page = buildValidPage();
    const root = page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>;
    const originalChildren = root.children ?? [];
    root.children = [
      ...originalChildren,
      {
        type: 'ui',
        uiVariant: 'surface',
        props: {
          tone: 'subtle',
          radius: 'md',
          padding: 'md',
        },
        children: [
          {
            type: 'ui',
            uiVariant: 'heading',
            props: { level: 'headline-3', as: 'h3', text: 'Most Read' },
          },
        ],
      },
    ];
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'BAD_UI_VARIANT')).toBe(false);
    expect(result.errors.some(e => e.code === 'DENY_LIST_UI_VARIANT')).toBe(false);
    expect(result.ok).toBe(true);
  });

  it("accepts 'meta-list' as a valid uiVariant", () => {
    const page = buildValidPage();
    const root = page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>;
    // Drop the existing stack subtree — meta-list is a leaf (no walker
    // children) so we replace the stack with a wrapper that nests it
    // alongside the existing slots-bearing stack.
    const originalChildren = root.children ?? [];
    root.children = [
      ...originalChildren,
      {
        type: 'ui',
        uiVariant: 'meta-list',
        props: {
          items: [
            { label: 'Placement Styles', value: 'Carousel, Grid' },
            { label: 'Network', value: 'Activated' },
          ],
          leader: 'dotted',
        },
      },
    ];
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'BAD_UI_VARIANT')).toBe(false);
    expect(result.errors.some(e => e.code === 'DENY_LIST_UI_VARIANT')).toBe(false);
  });

  it('lists at least the documented deny-list strings', () => {
    expect(DENY_LIST_UI_VARIANTS).toContain('dialog');
    expect(DENY_LIST_UI_VARIANTS).toContain('input');
    expect(DENY_LIST_UI_VARIANTS).toContain('video-player');
  });
});

describe('rule 12 — MISSING_CONTENT_SLOT', () => {
  it('rejects a tree with no content slot', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    // Drop the content slot entirely.
    stack.children = stack.children!.filter(c => !(c.type === 'slot' && c.kind === 'content'));
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MISSING_CONTENT_SLOT')).toBe(true);
  });
});

describe('rule 12b — MISSING_ANCHOR_VIDEO', () => {
  it('rejects a tree with no video slot at all', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    // Drop both the video and the linkout (so only the feed-anchor rule
    // fires, not LINKOUT_BEFORE_FEED_VIDEO).
    stack.children = stack.children!.filter(
      c => !(c.type === 'slot' && (c.kind === 'video' || c.kind === 'linkout')),
    );
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MISSING_ANCHOR_VIDEO')).toBe(true);
  });

  it('rejects a tree whose only video is non-feed (carousel)', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    // Remove the linkout to isolate this rule, and demote the feed video
    // to a carousel — no anchor remains.
    stack.children = stack.children!.filter(c => !(c.type === 'slot' && c.kind === 'linkout'));
    const video = stack.children!.find(
      (c): c is Extract<LayoutNode, { type: 'slot' }> => c.type === 'slot' && c.kind === 'video',
    )!;
    video.style = 'carousel';
    video.cols = 3;
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MISSING_ANCHOR_VIDEO')).toBe(true);
  });

  it('passes when a feed video is present', () => {
    const result = validatePageRules(buildValidPage());
    expect(result.errors.some(e => e.code === 'MISSING_ANCHOR_VIDEO')).toBe(false);
  });
});

describe('rule 13 — LINKOUT_BEFORE_FEED_VIDEO', () => {
  it('rejects a tree where a linkout appears before any feed video', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    // Swap order: linkout before video.
    const [video, body, linkout] = stack.children!;
    stack.children = [linkout, video, body];
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'LINKOUT_BEFORE_FEED_VIDEO')).toBe(true);
  });

  it('passes when no linkouts exist at all', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    stack.children = stack.children!.filter(c => !(c.type === 'slot' && c.kind === 'linkout'));
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'LINKOUT_BEFORE_FEED_VIDEO')).toBe(false);
  });

  it('passes when feed video and linkout are in different tracks of the same SplitView (parallel)', () => {
    // SplitView with linkout in track 1 (DOM-first) and feed video in
    // track 2 (DOM-last). Source order says linkout-before-video, but
    // visually they are side-by-side — rule 13 must accept this.
    const page: Page = {
      id: 'splitview-parallel',
      breakpoints: [
        {
          id: 'desktop',
          minWidth: 1280,
          root: {
            type: 'ui',
            uiVariant: 'container',
            children: [
              {
                type: 'ui',
                uiVariant: 'split-view',
                props: { tracks: [746, 320], gap: 'lg' },
                children: [
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    children: [
                      {
                        type: 'slot',
                        name: 'related',
                        kind: 'linkout',
                        style: 'single',
                      },
                      {
                        type: 'slot',
                        name: 'body',
                        kind: 'content',
                        props: { body: 'Body copy.' },
                      },
                    ],
                  },
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    children: [
                      {
                        type: 'slot',
                        name: 'anchor-video',
                        kind: 'video',
                        style: 'feed',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    };
    const result = validatePageRules(page);
    expect(result.errors.find(e => e.code === 'LINKOUT_BEFORE_FEED_VIDEO')).toBeUndefined();
  });

  it('rejects when a linkout sits before the SplitView that contains the feed video', () => {
    // Linkout is OUTSIDE the SplitView, in an earlier visual stripe.
    // Even though the SplitView contains a feed video, the linkout
    // is in a stripe that visually precedes it — still illegal.
    const page: Page = {
      id: 'linkout-before-splitview',
      breakpoints: [
        {
          id: 'desktop',
          minWidth: 1280,
          root: {
            type: 'ui',
            uiVariant: 'container',
            children: [
              {
                type: 'slot',
                name: 'early-linkout',
                kind: 'linkout',
                style: 'single',
              },
              {
                type: 'ui',
                uiVariant: 'split-view',
                props: { tracks: [746, 320] },
                children: [
                  {
                    type: 'slot',
                    name: 'body',
                    kind: 'content',
                    props: { body: 'Body.' },
                  },
                  {
                    type: 'slot',
                    name: 'anchor-video',
                    kind: 'video',
                    style: 'feed',
                  },
                ],
              },
            ],
          },
        },
      ],
    };
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'LINKOUT_BEFORE_FEED_VIDEO')).toBe(true);
  });

  it('passes when a linkout sits AFTER the SplitView that contains the feed video', () => {
    // Linkout is OUTSIDE the SplitView in a later stripe — the feed
    // video's stripe precedes the linkout's stripe, so rule 13 holds.
    const page: Page = {
      id: 'linkout-after-splitview',
      breakpoints: [
        {
          id: 'desktop',
          minWidth: 1280,
          root: {
            type: 'ui',
            uiVariant: 'container',
            children: [
              {
                type: 'ui',
                uiVariant: 'split-view',
                props: { tracks: [746, 320] },
                children: [
                  {
                    type: 'slot',
                    name: 'body',
                    kind: 'content',
                    props: { body: 'Body.' },
                  },
                  {
                    type: 'slot',
                    name: 'anchor-video',
                    kind: 'video',
                    style: 'feed',
                  },
                ],
              },
              {
                type: 'slot',
                name: 'related-grid',
                kind: 'linkout',
                style: 'grid',
                cols: 4,
                rows: 2,
              },
            ],
          },
        },
      ],
    };
    const result = validatePageRules(page);
    expect(result.errors.find(e => e.code === 'LINKOUT_BEFORE_FEED_VIDEO')).toBeUndefined();
  });
});

describe('rule 14 — SLOT_BUDGET_EXCEEDED (warning)', () => {
  it('emits a warning when a tree overshoots its band budget', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    // Push 30 linkouts after the existing content+video to blow past
    // the 13-linkout / 20-total mobile budget.
    for (let i = 0; i < 30; i += 1) {
      stack.children!.push({
        type: 'slot',
        name: `extra-${i}`,
        kind: 'linkout',
        style: 'single',
      });
    }
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    expect(result.warnings.some(w => w.code === 'SLOT_BUDGET_EXCEEDED')).toBe(true);
  });
});

describe('DENSITY_NO_EFFECT (warning)', () => {
  it('passes clean when a linkout slot sets density="compact"', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const link = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'linkout',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    link.density = 'compact';
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.some(w => w.code === 'DENSITY_NO_EFFECT')).toBe(false);
  });

  it('passes clean when a video slot sets density="compact"', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const v = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'video',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    v.density = 'compact';
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.some(w => w.code === 'DENSITY_NO_EFFECT')).toBe(false);
  });

  it('warns when a content slot sets density', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const body = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'content',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    body.density = 'compact';
    const result = validatePageRules(page);
    // Warning only — never blocking.
    expect(result.ok).toBe(true);
    const noEffect = result.warnings.filter(w => w.code === 'DENSITY_NO_EFFECT');
    expect(noEffect).toHaveLength(1);
  });

  it('does not warn when density is omitted everywhere', () => {
    const result = validatePageRules(buildValidPage());
    expect(result.warnings.some(w => w.code === 'DENSITY_NO_EFFECT')).toBe(false);
  });
});

describe('size decorator (semantic max-height hint)', () => {
  it('passes clean when a video slot sets size="hero"', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const v = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'video',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    v.size = 'hero';
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('passes clean when a video slot sets expanded size="lg"', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const v = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'video',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    v.size = 'lg';
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('ASPECT_NO_EFFECT (warning)', () => {
  it('passes clean when a video slot sets aspect="reel"', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const v = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'video',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    v.aspect = 'reel';
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    expect(result.warnings.some(w => w.code === 'ASPECT_NO_EFFECT')).toBe(false);
  });

  it('warns when a content slot sets aspect', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const body = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'content',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    body.aspect = 'banner';
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    const w = result.warnings.filter(x => x.code === 'ASPECT_NO_EFFECT');
    expect(w).toHaveLength(1);
  });
});

describe('DIMENSION_NO_EFFECT (warning)', () => {
  it('passes clean when minHeight is set on a surface UI node', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    // Wrap the stack inside a surface to assert surface honors minHeight.
    stack.children!.unshift({
      type: 'ui',
      uiVariant: 'surface',
      props: { minHeight: 'lg' },
      children: [],
    });
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    expect(result.warnings.some(w => w.code === 'DIMENSION_NO_EFFECT')).toBe(false);
  });

  it('passes clean when height is set on a container UI node', () => {
    const page = buildValidPage();
    const root = page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>;
    root.props = { ...(root.props ?? {}), height: 'hero' };
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    expect(result.warnings.some(w => w.code === 'DIMENSION_NO_EFFECT')).toBe(false);
  });

  it('warns when minHeight is set on a non-dimension-aware UI node (row)', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    stack.children!.unshift({
      type: 'ui',
      uiVariant: 'row',
      props: { minHeight: 'lg' },
      children: [],
    });
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    const w = result.warnings.filter(x => x.code === 'DIMENSION_NO_EFFECT');
    expect(w).toHaveLength(1);
    expect(w[0].message).toContain("'minHeight'");
  });

  it('warns when height is set on a grid UI node', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    stack.children!.unshift({
      type: 'ui',
      uiVariant: 'grid',
      props: { cols: 3, height: 'screen' },
      children: [],
    });
    const result = validatePageRules(page);
    expect(result.ok).toBe(true);
    const w = result.warnings.filter(x => x.code === 'DIMENSION_NO_EFFECT');
    expect(w).toHaveLength(1);
    expect(w[0].message).toContain("'height'");
  });
});

describe('rule 16 — DUPLICATE_BREAKPOINT_ID', () => {
  it('rejects two breakpoints sharing an id', () => {
    const page = buildValidPage();
    page.breakpoints.push({
      ...page.breakpoints[0],
      // same id, different minWidth
      minWidth: 1280,
    });
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'DUPLICATE_BREAKPOINT_ID')).toBe(true);
  });
});

describe('rule 17 — MISSING_MIN_WIDTH_ZERO', () => {
  it('rejects when no breakpoint has minWidth=0', () => {
    const page = buildValidPage();
    page.breakpoints[0].minWidth = 320;
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MISSING_MIN_WIDTH_ZERO')).toBe(true);
  });
});

describe('markdown allow-list — MARKDOWN_DISALLOWED_NODE', () => {
  it('rejects H1 in content body', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const body = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'content',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    body.props = { body: '# Page title\n\nMore prose.' };
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MARKDOWN_DISALLOWED_NODE')).toBe(true);
  });

  it('rejects raw HTML in content body', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const body = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'content',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    body.props = { body: 'Some text. <div>raw html</div> More.' };
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MARKDOWN_DISALLOWED_NODE')).toBe(true);
  });

  it('rejects H4+ in content body', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const body = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'content',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    body.props = { body: '#### Deep heading\n\nNot allowed.' };
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MARKDOWN_DISALLOWED_NODE')).toBe(true);
  });

  it('accepts H2 / H3 / lists / blockquotes / inline code / links', () => {
    const page = buildValidPage();
    const stack = (page.breakpoints[0].root as Extract<LayoutNode, { type: 'ui' }>)
      .children![0] as Extract<LayoutNode, { type: 'ui' }>;
    const body = stack.children!.find(
      c => c.type === 'slot' && c.kind === 'content',
    ) as Extract<LayoutNode, { type: 'slot' }>;
    body.props = {
      body:
        '## Subhead\n\n' +
        'Paragraph with *em*, **strong**, and `code`, plus a [link](https://example.com).\n\n' +
        '### Smaller subhead\n\n' +
        '- list item\n- another\n\n' +
        '> a blockquote',
    };
    const result = validatePageRules(page);
    expect(result.errors.some(e => e.code === 'MARKDOWN_DISALLOWED_NODE')).toBe(false);
  });
});

describe('error accumulation', () => {
  it('returns all violations in one pass (does not fast-fail)', () => {
    // Hand-craft a page that breaks multiple rules at once.
    const page: Page = {
      id: 'multi-broken',
      breakpoints: [
        {
          id: 'b1',
          minWidth: 320, // rule 17
          root: {
            type: 'ui',
            uiVariant: 'magic-shelf', // rule 11 (BAD_UI_VARIANT)
            props: { col: 1 }, // rule 3
            children: [
              {
                type: 'slot',
                name: 'lone-linkout',
                kind: 'linkout',
                style: 'single',
              }, // rule 13 (no feed video before linkout); rule 12 (no content slot)
            ],
          },
        },
        {
          id: 'b1', // rule 16 (duplicate id)
          minWidth: 1280,
          root: {
            type: 'ui',
            uiVariant: 'container',
            children: [
              {
                type: 'slot',
                name: 'body',
                kind: 'content',
                props: { body: '# H1 not allowed' }, // markdown rule
              },
              {
                type: 'slot',
                name: 'v',
                kind: 'video',
                style: 'single', // rule 7
              },
            ],
          },
        },
      ],
    };

    const result = validatePageRules(page);
    expect(result.ok).toBe(false);
    const codes = result.errors.map(e => e.code);
    // Confirm a spread of rules surfaced — not just one short-circuit.
    expect(codes).toContain('MISSING_MIN_WIDTH_ZERO');
    expect(codes).toContain('BAD_UI_VARIANT');
    expect(codes).toContain('UI_GRID_PLACEMENT_PROPS');
    expect(codes).toContain('LINKOUT_BEFORE_FEED_VIDEO');
    expect(codes).toContain('MISSING_CONTENT_SLOT');
    expect(codes).toContain('DUPLICATE_BREAKPOINT_ID');
    expect(codes).toContain('MARKDOWN_DISALLOWED_NODE');
    expect(codes).toContain('BAD_KIND_STYLE');
  });
});

describe('validatePage (schema + rules)', () => {
  it('returns SCHEMA errors when the input is shape-invalid', () => {
    const result = validatePage({ id: 'bad', breakpoints: 'not-an-array' });
    expect(result.ok).toBe(false);
    expect(result.errors.every(e => e.code === 'SCHEMA')).toBe(true);
  });

  it('returns the parsed page on success', () => {
    const result = validatePage(buildValidPage());
    expect(result.ok).toBe(true);
    expect(result.page).toBeDefined();
    expect(result.page?.id).toBe('rules-test-page');
  });
});
