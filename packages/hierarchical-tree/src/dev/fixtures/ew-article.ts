import type { Page } from '../../schema';

import type { Fixture } from './types';

/**
 * Publisher-article `Page` artifact designed from a real Entertainment
 * Weekly story — with a **video-led** layout distinct from the
 * still-image-hero `people-article` fixture.
 *
 * Source: a saved EW.com article ("Joe Jonas totally bombed his auditions
 * for 'Wicked' and 'The Morning Show'" by Emlyn Travis). The story is
 * built around a podcast video clip ("watch the Jonas Brothers share bad
 * audition stories in the video above"), so the layout treats the embedded
 * video — not a photo — as the page's signature anchor:
 *
 *   breadcrumb → headline → author/date byline → tags →
 *   FULL-WIDTH HERO VIDEO + caption → divider →
 *   [ desktop split: main column (a "The Details" meta-list fact box,
 *     body, a structural pull-quote, inline figure, reel carousel)
 *     | sticky rail (trending list) ] →
 *   newsletter callout → wide related grid → "More to Watch" video grid.
 *
 * Layout choices that differentiate it from `people-article`:
 * - The `feed` anchor video is a full-width hero band at the top, not a
 *   sidebar/inline placement. The still photo is demoted to an inline figure.
 * - A `meta-list` "The Details" fact box (Show / Role / Network / Podcast)
 *   — a primitive `people-article` doesn't use.
 * - The headline pull-quote is a structural `accent-border` block in the
 *   tree, not a markdown blockquote buried in the body.
 *
 * Theme-agnostic per spec §1.4 — no "Entertainment Weekly" / "EW" string
 * lives in any node. Recommended preview URL:
 * `http://localhost:5173/?fixture=ew-article`.
 */

const BREADCRUMB = {
  type: 'ui' as const,
  uiVariant: 'cluster',
  props: { gap: 'xs' },
  children: [
    { type: 'ui' as const, uiVariant: 'chip', props: { variant: 'secondary', text: 'Celebrities' } },
    { type: 'ui' as const, uiVariant: 'chip', props: { text: 'Home' } },
    { type: 'ui' as const, uiVariant: 'chip', props: { text: 'TV' } },
  ],
};

const HEADLINE_MOBILE = {
  type: 'ui' as const,
  uiVariant: 'heading',
  props: {
    level: 'h3',
    as: 'h1',
    weight: 'bold',
    text: "Joe Jonas Totally Bombed His Auditions for 'Wicked' and 'The Morning Show': 'I Crash and Burn'",
  },
};

const HEADLINE_DESKTOP = {
  ...HEADLINE_MOBILE,
  props: { ...HEADLINE_MOBILE.props, level: 'headline-0' },
};

const AUTHOR_BAR = {
  type: 'ui' as const,
  uiVariant: 'cluster',
  props: { gap: 'sm', align: 'center' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'avatar',
      props: {
        isAvatar: true,
        size: 'md',
        imageUrl: 'https://picsum.photos/seed/ew-author-emlyn/96/96',
        alt: 'Emlyn Travis',
      },
    },
    {
      type: 'ui' as const,
      uiVariant: 'stack',
      props: { gap: 'none' },
      children: [
        {
          type: 'ui' as const,
          uiVariant: 'text',
          props: { size: 'body-1', as: 'span', weight: 'semibold', text: 'By Emlyn Travis' },
        },
        {
          type: 'ui' as const,
          uiVariant: 'text',
          props: { size: 'body-2', as: 'span', text: 'Published May 27, 2026 2:30 p.m. ET · 3 min read' },
        },
      ],
    },
  ],
};

const TAG_CLUSTER = {
  type: 'ui' as const,
  uiVariant: 'cluster',
  props: { gap: 'xs' },
  children: [
    { type: 'ui' as const, uiVariant: 'chip', props: { text: 'Joe Jonas' } },
    { type: 'ui' as const, uiVariant: 'chip', props: { text: 'Jonas Brothers' } },
    { type: 'ui' as const, uiVariant: 'chip', props: { text: 'Movies' } },
    { type: 'ui' as const, uiVariant: 'chip', props: { text: 'Music' } },
  ],
};

// Full-width hero video — the clip the article is about.
const HERO_VIDEO = {
  type: 'slot' as const,
  name: 'featured-video',
  kind: 'video' as const,
  style: 'feed' as const,
  aspect: 'video' as const,
  size: 'hero' as const,
  minHeight: 'lg' as const,
};

const HERO_VIDEO_CAPTION = {
  type: 'ui' as const,
  uiVariant: 'text',
  props: {
    size: 'body-2',
    as: 'p',
    text: 'Watch: the Jonas Brothers recall their most cringeworthy auditions on the latest episode of "Hey Jonas."',
  },
};

// "The Details" fact box — meta-list (a primitive people-article omits).
const DETAILS_BOX = {
  type: 'ui' as const,
  uiVariant: 'stack',
  props: { gap: 'xs' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'heading',
      props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'The Details' },
    },
    {
      type: 'ui' as const,
      uiVariant: 'meta-list',
      props: {
        leader: 'dotted',
        items: [
          { label: 'Show', value: 'The Morning Show' },
          { label: 'Role', value: 'Young news anchor' },
          { label: 'Network', value: 'Apple TV+' },
          { label: 'Podcast', value: 'Hey Jonas' },
          { label: 'Also up for', value: 'Wicked' },
        ],
      },
    },
  ],
};

// Structural pull-quote — accent-border block (not a markdown blockquote).
const PULL_QUOTE = {
  type: 'ui' as const,
  uiVariant: 'accent-border',
  props: { side: 'left', tone: 'primary', weight: 'thick', state: 'always', inset: 'md' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'stack',
      props: { gap: 'xs' },
      children: [
        {
          type: 'ui' as const,
          uiVariant: 'text',
          props: { size: 'body-0', as: 'p', weight: 'semibold', text: '"I go in and I just… I crash and burn."' },
        },
        {
          type: 'ui' as const,
          uiVariant: 'text',
          props: { size: 'body-2', as: 'span', text: '— Joe Jonas, on his Morning Show callback' },
        },
      ],
    },
  ],
};

const INLINE_FIGURE = {
  type: 'ui' as const,
  uiVariant: 'stack',
  props: { gap: 'xs' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'image',
      props: {
        src: 'https://picsum.photos/seed/ew-inline-jonas/1200/800',
        alt: 'The Jonas Brothers in 2025',
        aspectRatio: 'landscape',
        radius: 'md',
      },
    },
    {
      type: 'ui' as const,
      uiVariant: 'text',
      props: {
        size: 'body-2',
        as: 'p',
        text: 'The Jonas Brothers in 2025. PHOTO: Axelle/Bauer-Griffin/FilmMagic',
      },
    },
  ],
};

const NEWSLETTER_CALLOUT = {
  type: 'ui' as const,
  uiVariant: 'surface',
  props: { tone: 'brand-tint', radius: 'lg', padding: 'lg' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'stack',
      props: { gap: 'sm' },
      children: [
        {
          type: 'ui' as const,
          uiVariant: 'heading',
          props: { level: 'headline-4', as: 'h2', text: 'Get the Dispatch' },
        },
        {
          type: 'ui' as const,
          uiVariant: 'text',
          props: {
            size: 'body-1',
            as: 'p',
            text: 'Your daily dose of entertainment news, celebrity updates, and what to watch — delivered to your inbox.',
          },
        },
        {
          type: 'ui' as const,
          uiVariant: 'button',
          props: { theme: 'primary', size: 'md', text: 'Sign Up' },
        },
      ],
    },
  ],
};

const TOP_PICKS_HEADING = {
  type: 'ui' as const,
  uiVariant: 'heading',
  props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Top Picks' },
};

const SAMPLE_PAGE: Page = {
  id: 'ew-article-joe-jonas-auditions',
  version: '2026.05',
  breakpoints: [
    // ---------- Mobile (0): video-led single column ----------
    {
      id: 'ew-article-mobile',
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
              BREADCRUMB,
              HEADLINE_MOBILE,
              AUTHOR_BAR,
              TAG_CLUSTER,
              // Hero video leads (the clip the story is about).
              HERO_VIDEO,
              HERO_VIDEO_CAPTION,
              DETAILS_BOX,
              // Mobile budget caps content at 1 → single merged body slot.
              { type: 'slot', name: 'article-body', kind: 'content', style: 'single' },
              PULL_QUOTE,
              INLINE_FIGURE,
              TOP_PICKS_HEADING,
              {
                type: 'slot',
                name: 'hero-carousel',
                kind: 'video',
                style: 'carousel',
                cols: 2,
                // No `aspect` here on purpose: the SDK feed only fans out
                // into a horizontal reel strip when its container is tall
                // (reel-shaped). With `aspect` set the renderer applies no
                // height cap, so a reel strip towers ~width×16/9. Omitting
                // `aspect` lets `size` apply an explicit height + overflow
                // clip, so the strip renders but stays bounded.
                size: 'default',
              },
              NEWSLETTER_CALLOUT,
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'Related Stories' },
              },
              {
                type: 'slot',
                name: 'related-grid',
                kind: 'linkout',
                style: 'grid',
                cols: 1,
                rows: 4,
              },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'Trending Now' },
              },
              {
                type: 'slot',
                name: 'trending-rail',
                kind: 'linkout',
                style: 'grid',
                cols: 1,
                rows: 4,
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

    // ---------- Desktop (1024): hero band → split body/rail → wide grids ----------
    {
      id: 'ew-article-desktop',
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
              BREADCRUMB,
              HEADLINE_DESKTOP,
              AUTHOR_BAR,
              TAG_CLUSTER,
              // Full-width hero video band — the signature anchor.
              HERO_VIDEO,
              HERO_VIDEO_CAPTION,
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'split-view',
                props: { tracks: [720, 340], gap: 'xl', align: 'start' },
                children: [
                  // Main column: fact box, body split around pull-quote +
                  // inline figure, then a reel carousel.
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      DETAILS_BOX,
                      { type: 'slot', name: 'body-intro', kind: 'content', style: 'single' },
                      PULL_QUOTE,
                      INLINE_FIGURE,
                      { type: 'slot', name: 'body-rest', kind: 'content', style: 'single' },
                      TOP_PICKS_HEADING,
                      {
                        type: 'slot',
                        name: 'hero-carousel',
                        kind: 'video',
                        style: 'carousel',
                        cols: 3,
                        // No `aspect` (see mobile note): omitting it lets
                        // `size` cap the reel strip's height instead of
                        // letting it tower at width×16/9.
                        size: 'default',
                      },
                    ],
                  },
                  // Sticky right rail: compact "Trending Now" list (short
                  // titles keep the narrow cards wider-than-tall = stable).
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
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
                                props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'Trending Now' },
                              },
                              {
                                type: 'slot',
                                name: 'trending-rail',
                                kind: 'linkout',
                                style: 'grid',
                                cols: 1,
                                rows: 4,
                                density: 'compact',
                                size: 'compact',
                                sticky: true,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              NEWSLETTER_CALLOUT,
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-2', as: 'h2', decoration: 'ribbon', text: 'Related Stories' },
              },
              // Wide full-width grid below the split-view (cells stay
              // landscape → stable card orientation).
              {
                type: 'slot',
                name: 'related-grid',
                kind: 'linkout',
                style: 'grid',
                cols: 3,
                rows: 2,
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
  ],
};

// Pre-authorised demo SDK config — safe to commit. The hero player and the
// below-body grid use The Artitech demo publisher (`ARTITECH_API_KEY`); the
// "Top Picks" carousel uses a separate demo placement whose style renders a
// true horizontal carousel (wired inline in `SAMPLE_SLOT_DATA`). Distinct
// (styleId, placementId) pairs avoid the SDK's duplicate-pair latch bug.
//   article_after_hero → single 16:9 player: 69d4feedeeba897cebdb937c / 69d4feedeeba897cebdb937b
//   article_after_body → 16:9 video grid:    69d8dcfa09396e721fee4952 / 69d8dcfa09396e721fee4951
const ARTITECH_API_KEY = '5bb7d302c337f2037072da4390ad373019d68ae1d46627e1';

// Article body, in two halves. Desktop renders them as separate `content`
// slots with the inline figure between; mobile (content-slot budget of 1)
// renders the joined string in a single slot. The headline quote lives in
// the tree (PULL_QUOTE), not here.
const BODY_INTRO = [
  "Even someone as cool as Joe Jonas isn't immune to a bad audition.",
  '',
  "The middle Jonas Brother recently recalled totally bombing while trying out for the *Wicked* movie and Apple TV's Emmy-winning drama *The Morning Show*.",
  '',
  '## The Morning Show Callback',
  '',
  '"It was *The Morning Show*. It was my callback, and it was to play a young anchor that they have in the show," Joe revealed on the latest episode of *Hey Jonas*, his podcast with brothers Nick and Kevin.',
  '',
  'Nick then chimed in to note that the character would have been a "love interest" for Jennifer Aniston\'s Alex Levy. Kevin described the part as a "right-wing-y podcast host guy" — seemingly Brodie "Bro" Hartman, the conservative podcaster played by Boyd Holbrook who has a dalliance with Alex in season 4.',
].join('\n');

const BODY_REST = [
  '## "The Saddest Room You Can Imagine"',
  '',
  '"Long story short, I show up early and they\'re like, \'Oh!\'" Joe recalled. "They were like, \'Oh, we have a private room for you.\' I was like, \'Okay…\'" He then called the space "the saddest room you can imagine."',
  '',
  '"It was just these little blinds. All the lights were off and they didn\'t work," he said. "And I could hear, clear as day, all the guys auditioning… And these guys were crushing it." When it finally came time for his own audition, he was too confident and paid the price.',
  '',
  '"It was literally like, I don\'t even know what I\'m auditioning for, just like me forgetting the name of *The Morning Show*," he recalled. "It was such a bad audition." Joe — who acted in the Disney movies *Camp Rock* and *Camp Rock 2* and the war film *Devotion* — added that he had a similar experience trying out for an unnamed role in *Wicked*.',
  '',
  "## He Wasn't Alone",
  '',
  'Nick shared his own anecdote about embarrassing himself in front of a director for a "big movie," and Kevin revealed that a casting director once put him on blast.',
  '',
  '"I had an audition once when we were younger and the guy that was auditioning me said — to me, in the room — \'Maybe we try it a different way because I can clearly tell that you don\'t have any acting experience,\'" the eldest Jonas recalled. Joe let out a groan of sympathy as Nick acknowledged the comment must have been "tough" to hear. "I was like, \'Well, okay! I guess I\'m not getting this role!\'" Kevin said.',
].join('\n');

const SAMPLE_SLOT_DATA: Record<string, Record<string, unknown>> = {
  'featured-video': {
    // article_after_hero — single large 16:9 player.
    styleId: '69d4feedeeba897cebdb937c',
    placementId: '69d4feedeeba897cebdb937b',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/ew-featured-video/1280/720',
    aspectRatio: 'video',
  },
  'hero-carousel': {
    // "Top Picks" — a placement whose SDK style renders a true horizontal
    // carousel of cells (the article_after_hero_feed placement only does a
    // single vertical-swipe player here). Pre-authorised demo config, safe
    // to commit. The slot omits `aspect`, so its `size` bounds the carousel
    // height (the embed fills the sized box rather than towering).
    styleId: '69c294770970fa2b49e10ff8',
    placementId: '69c294770970fa2b49e10ff7',
    apiKey: '87ff6635b778331da1a7e2709dc6978c433f26247ac2b931',
    poster: 'https://picsum.photos/seed/ew-hero-carousel/1280/720',
    aspectRatio: 'video',
  },
  'after-body-grid': {
    // article_after_body — 16:9 landscape video grid ("More to Watch").
    styleId: '69d8dcfa09396e721fee4952',
    placementId: '69d8dcfa09396e721fee4951',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/ew-after-body/1280/720',
    aspectRatio: 'video',
  },
  // Mobile: single merged body slot.
  'article-body': { body: `${BODY_INTRO}\n\n${BODY_REST}` },
  // Desktop: split around the inline figure.
  'body-intro': { body: BODY_INTRO },
  'body-rest': { body: BODY_REST },
  'related-grid': {
    cards: [
      {
        id: 'related-1',
        title: 'Mariska Hargitay Gives Update on Relationship with Biological Dad',
        description: 'The Law & Order: SVU star opens up about reconnecting with her birth father.',
        href: 'https://example.com/celebrity/mariska-hargitay-dad',
        imageUrl: 'https://picsum.photos/seed/ew-rel-1/480/320',
        brand: 'Celebrity',
      },
      {
        id: 'related-2',
        title: 'Rosie O’Donnell Reveals She Got a Facelift',
        description: 'The comedian gets candid about the procedure in a new essay.',
        href: 'https://example.com/celebrity/rosie-odonnell-facelift',
        imageUrl: 'https://picsum.photos/seed/ew-rel-2/480/320',
        brand: 'Celebrity',
      },
      {
        id: 'related-3',
        title: 'Kevin Hart Defends Himself After Roast Backlash',
        description: 'The comedian responds to criticism over a controversial set.',
        href: 'https://example.com/celebrity/kevin-hart-roast',
        imageUrl: 'https://picsum.photos/seed/ew-rel-3/480/320',
        brand: 'Comedy',
      },
      {
        id: 'related-4',
        title: 'Chelsea Handler Blasts Bobby Flay for Being a ‘Cheap’ Date',
        description: 'Handler dishes on a dinner that didn’t go quite as planned.',
        href: 'https://example.com/celebrity/chelsea-handler-bobby-flay',
        imageUrl: 'https://picsum.photos/seed/ew-rel-4/480/320',
        brand: 'Celebrity',
      },
    ],
  },
  'trending-rail': {
    cards: [
      {
        id: 'trending-1',
        title: 'Jack Osbourne Defends Ozzy AI Avatar',
        description: 'TV · 3 min read',
        href: 'https://example.com/tv/jack-osbourne-ai-avatar',
        imageUrl: 'https://picsum.photos/seed/ew-tr-1/240/240',
        brand: 'TV',
      },
      {
        id: 'trending-2',
        title: 'McCartney’s Wild Harrison Story',
        description: 'Music · 2 min read',
        href: 'https://example.com/music/paul-mccartney-harrison',
        imageUrl: 'https://picsum.photos/seed/ew-tr-2/240/240',
        brand: 'Music',
      },
      {
        id: 'trending-3',
        title: 'Antonoff Dodges a Swift Question',
        description: 'Music · 2 min read',
        href: 'https://example.com/music/jack-antonoff-swift',
        imageUrl: 'https://picsum.photos/seed/ew-tr-3/240/240',
        brand: 'Music',
      },
      {
        id: 'trending-4',
        title: 'The Jonas Brothers’ 2026 Tour',
        description: 'Music · 4 min read',
        href: 'https://example.com/music/jonas-brothers-tour',
        imageUrl: 'https://picsum.photos/seed/ew-tr-4/240/240',
        brand: 'Music',
      },
    ],
  },
};

/**
 * Entertainment Weekly article fixture — `article` archetype with a
 * video-led layout. See module-level JSDoc for the section mapping and how
 * it differs from `people-article`. Recommended preview URL:
 * `http://localhost:5173/?fixture=ew-article`.
 */
export const ewArticle: Fixture = {
  page: SAMPLE_PAGE,
  slotData: SAMPLE_SLOT_DATA,
};
