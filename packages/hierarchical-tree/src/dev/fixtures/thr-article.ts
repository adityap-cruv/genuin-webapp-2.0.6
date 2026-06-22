import type { Page } from '../../schema';

import type { Fixture } from './types';

/**
 * Publisher-article `Page` artifact designed from a real Hollywood Reporter
 * story — a "trade explainer" layout deliberately distinct from the
 * `people-article` (still-hero + right rail) and `ew-article` (video-hero
 * band + meta-list) fixtures.
 *
 * Source: a saved THR.com article ("Tom Hardy 'Refused to Come Out' of
 * 'MobLand' Trailer…" by Lily Ford). THR is a Penske Media title, so its
 * template differs from the Dotdash Meredith pages — this layout leans into
 * trade-press conventions:
 *
 *   eyebrow category → headline → prominent DEK/standfirst → byline →
 *   full-width hero → divider →
 *   [ desktop split, RAIL ON THE LEFT (inverted): sticky "Watch" video +
 *     a "The Bottom Line" summary box + trending list
 *     | body: intro, pull-quote, inline figure, rest, a "Key Questions"
 *       accordion, a "Top Picks" carousel ] →
 *   wide related grid → "More to Watch" grid.
 *
 * Elements unique to this fixture:
 * - A category **eyebrow** + a large **dek** (`text` body-0 standfirst).
 * - A **"The Bottom Line"** `surface tone='brand-strong'` summary callout.
 * - A **`accordion`** "Key Questions" FAQ — an authored-structure primitive
 *   the other fixtures don't use.
 * - The SplitView rail is on the **left** (video + facts), body on the right.
 *
 * Theme-agnostic per spec §1.4 — no "Hollywood Reporter" / "THR" string in
 * any node. Recommended preview URL:
 * `http://localhost:5173/?fixture=thr-article`.
 */

const EYEBROW = {
  type: 'ui' as const,
  uiVariant: 'cluster',
  props: { gap: 'xs' },
  children: [
    { type: 'ui' as const, uiVariant: 'chip', props: { variant: 'secondary', text: 'TV News' } },
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
    text: 'Tom Hardy “Refused to Come Out” of ‘MobLand’ Trailer, Kept Pierce Brosnan and Helen Mirren Waiting for Hours',
  },
};

const HEADLINE_DESKTOP = {
  ...HEADLINE_MOBILE,
  props: { ...HEADLINE_MOBILE.props, level: 'headline-0' },
};

// Prominent dek / standfirst — a trade-press hallmark.
const DEK = {
  type: 'ui' as const,
  uiVariant: 'text',
  props: {
    size: 'body-0',
    as: 'p',
    text: 'A source tells us that Pierce Brosnan and Helen Mirren were kept waiting “for hours” by Tom Hardy on the “MobLand” set, amid reports of his firing from the Paramount+ crime drama.',
  },
};

const BYLINE = {
  type: 'ui' as const,
  uiVariant: 'cluster',
  props: { gap: 'sm', align: 'center' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'avatar',
      props: {
        isAvatar: true,
        size: 'sm',
        imageUrl: 'https://picsum.photos/seed/thr-author-lily/96/96',
        alt: 'Lily Ford',
      },
    },
    {
      type: 'ui' as const,
      uiVariant: 'text',
      props: { size: 'body-2', as: 'span', text: 'By Lily Ford · TV News · May 27, 2026 2:20 p.m. ET' },
    },
  ],
};

const HERO_FIGURE = {
  type: 'ui' as const,
  uiVariant: 'stack',
  props: { gap: 'xs' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'image',
      props: {
        src: 'https://picsum.photos/seed/thr-hero-mobland/1200/675',
        alt: 'Tom Hardy in MobLand',
        aspectRatio: 'landscape',
        radius: 'md',
      },
    },
    {
      type: 'ui' as const,
      uiVariant: 'text',
      props: { size: 'body-2', as: 'p', text: 'Tom Hardy in “MobLand.” PHOTO: Luke Varley/Paramount+' },
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
        src: 'https://picsum.photos/seed/thr-inline-cast/1200/800',
        alt: 'Pierce Brosnan and Helen Mirren in MobLand',
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
        text: 'Pierce Brosnan and Helen Mirren as the Harrigan crime family. PHOTO: Paramount+',
      },
    },
  ],
};

// "The Bottom Line" — a saturated summary callout (trade-review hallmark).
const BOTTOM_LINE = {
  type: 'ui' as const,
  uiVariant: 'surface',
  props: { tone: 'brand-strong', radius: 'md', padding: 'md' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'stack',
      props: { gap: 'xs' },
      children: [
        {
          type: 'ui' as const,
          uiVariant: 'heading',
          props: { level: 'headline-4', as: 'h2', text: 'The Bottom Line' },
        },
        {
          type: 'ui' as const,
          uiVariant: 'text',
          props: {
            size: 'body-1',
            as: 'p',
            text: 'Sources say Hardy kept his co-stars waiting for hours — but THR is told his MobLand future isn’t sealed yet.',
          },
        },
      ],
    },
  ],
};

// "Key Questions" FAQ — accordion (authored-structure primitive).
const KEY_QUESTIONS = {
  type: 'ui' as const,
  uiVariant: 'accordion',
  props: {
    type: 'single',
    defaultValue: 'q1',
    items: [
      {
        value: 'q1',
        label: 'Was Tom Hardy fired from MobLand?',
        content:
          'Not officially. A source close to production says his fate is yet to be decided, though he has been clashing with producers.',
      },
      {
        value: 'q2',
        label: 'What is MobLand?',
        content:
          'A Paramount+ crime drama co-directed by Guy Ritchie. Hardy plays Harry Da Souza, a fixer for the Harrigan crime family.',
      },
      {
        value: 'q3',
        label: 'Who else stars?',
        content:
          'Pierce Brosnan and Helen Mirren lead as the Harrigan patriarch and matriarch, with Paddy Considine, Joanne Froggatt and Lara Pulver.',
      },
      {
        value: 'q4',
        label: 'Has this been reported before?',
        content:
          'George Miller and Patrick Stewart have both publicly described Hardy’s withdrawn, trailer-bound behavior on previous productions.',
      },
    ],
  },
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
          props: { level: 'headline-4', as: 'h2', text: 'The Definitive Voice of Entertainment News' },
        },
        {
          type: 'ui' as const,
          uiVariant: 'text',
          props: {
            size: 'body-1',
            as: 'p',
            text: 'Sign up for our daily newsletter for breaking news, reviews, and the business of Hollywood.',
          },
        },
        { type: 'ui' as const, uiVariant: 'button', props: { theme: 'primary', size: 'md', text: 'Subscribe' } },
      ],
    },
  ],
};

const TOP_PICKS_HEADING = {
  type: 'ui' as const,
  uiVariant: 'heading',
  props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Top Picks' },
};

const TOP_PICKS_CAROUSEL_MOBILE = {
  type: 'slot' as const,
  name: 'hero-carousel',
  kind: 'video' as const,
  style: 'carousel' as const,
  cols: 2,
  // No `aspect`: `size` bounds the carousel height so the embed fills a
  // capped box instead of towering at width×ratio.
  size: 'default' as const,
};

const WATCH_VIDEO = {
  type: 'slot' as const,
  name: 'featured-video',
  kind: 'video' as const,
  style: 'feed' as const,
  aspect: 'video' as const,
  size: 'default' as const,
  minHeight: 'md' as const,
};

const SAMPLE_PAGE: Page = {
  id: 'thr-article-tom-hardy-mobland',
  version: '2026.05',
  breakpoints: [
    // ---------- Mobile (0) ----------
    {
      id: 'thr-article-mobile',
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
              EYEBROW,
              HEADLINE_MOBILE,
              DEK,
              BYLINE,
              HERO_FIGURE,
              BOTTOM_LINE,
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Watch' },
              },
              WATCH_VIDEO,
              { type: 'slot', name: 'article-body', kind: 'content', style: 'single' },
              INLINE_FIGURE,
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'Key Questions' },
              },
              KEY_QUESTIONS,
              TOP_PICKS_HEADING,
              TOP_PICKS_CAROUSEL_MOBILE,
              NEWSLETTER_CALLOUT,
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'Related Stories' },
              },
              { type: 'slot', name: 'related-grid', kind: 'linkout', style: 'grid', cols: 1, rows: 4 },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'Trending Now' },
              },
              { type: 'slot', name: 'trending-rail', kind: 'linkout', style: 'grid', cols: 1, rows: 4 },
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

    // ---------- Desktop (1024): inverted layout — sticky rail on the LEFT ----------
    {
      id: 'thr-article-desktop',
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
              EYEBROW,
              HEADLINE_DESKTOP,
              DEK,
              BYLINE,
              HERO_FIGURE,
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'split-view',
                props: { tracks: [340, 700], gap: 'xl', align: 'start' },
                children: [
                  // LEFT sticky rail: video anchor + bottom line + trending.
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Watch' },
                      },
                      {
                        type: 'slot',
                        name: 'featured-video',
                        kind: 'video',
                        style: 'feed',
                        aspect: 'video',
                        size: 'default',
                        sticky: true,
                        minHeight: 'md',
                      },
                      BOTTOM_LINE,
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
                  // RIGHT body column.
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      { type: 'slot', name: 'body-intro', kind: 'content', style: 'single' },
                      INLINE_FIGURE,
                      { type: 'slot', name: 'body-rest', kind: 'content', style: 'single' },
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'Key Questions' },
                      },
                      KEY_QUESTIONS,
                      TOP_PICKS_HEADING,
                      {
                        type: 'slot',
                        name: 'hero-carousel',
                        kind: 'video',
                        style: 'carousel',
                        cols: 3,
                        // No `aspect` (see mobile note): `size` bounds the
                        // carousel height instead of letting it tower.
                        size: 'default',
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
              { type: 'slot', name: 'related-grid', kind: 'linkout', style: 'grid', cols: 3, rows: 2 },
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

// Pre-authorised demo SDK config — safe to commit. The "Watch" player and
// the below-body grid use The Artitech demo publisher (`ARTITECH_API_KEY`);
// the "Top Picks" carousel uses a separate demo placement whose style
// renders a true horizontal carousel (wired inline in `SAMPLE_SLOT_DATA`).
//   article_after_hero → single 16:9 player: 69d4feedeeba897cebdb937c / 69d4feedeeba897cebdb937b
//   article_after_body → 16:9 video grid:    69d8dcfa09396e721fee4952 / 69d8dcfa09396e721fee4951
const ARTITECH_API_KEY = '5bb7d302c337f2037072da4390ad373019d68ae1d46627e1';

const BODY_INTRO = [
  'Tom Hardy has been making headlines over the past week after reportedly being fired from the hit Paramount+ series — though a source who spoke to THR says the British star’s fate is yet to be decided.',
  '',
  'Hardy has been clashing with producers, THR confirmed, including executive producer Jez Butterworth and others at David Glasser’s 101 Studios, the production company behind *MobLand*, which is filmed across the U.K.',
  '',
  '> He refused to come out of his trailer for hours at a time. He kept the cast waiting.',
  '>',
  '> — A SOURCE CLOSE TO PRODUCTION',
  '',
  '## A Standoff on Set',
  '',
  'The source says the on-set behavior during season two has spooked producers into rethinking Hardy’s future. In *MobLand*, co-directed by Guy Ritchie, Hardy plays Harry Da Souza, a fixer for the Harrigan crime family led by patriarch Conrad (Brosnan) and matriarch Maeve (Mirren).',
].join('\n');

const BODY_REST = [
  '## An Unrenewed Future',
  '',
  'Much of the irresolution stems from the fact that the streamer has not yet officially renewed the show for a third season; another source tells THR that filming on season three, if greenlit, is tentative. It remains unclear exactly what keeps Hardy confined to his trailer — a Puck News story reported he was also attempting to alter dialogue and provide script notes to creator Ronan Bennett.',
  '',
  '## A Pattern, Co-Stars Say',
  '',
  'The account aligns with testimony from *Mad Max: Fury Road* director George Miller, who told *The Telegraph* in 2024 about Hardy’s head-butting with co-star Charlize Theron. “Tom has a damage to him but also a brilliance that comes with it… he had to be coaxed out of his trailer,” Miller said.',
  '',
  'Patrick Stewart has also discussed working with a withdrawn Hardy, who has starred in *The Dark Knight* trilogy, *Peaky Blinders* and the *Venom* films. “Tom wouldn’t engage with any of us on a social level,” Stewart wrote. “Never said ‘Good morning,’ never said ‘Goodnight.’”',
  '',
  'THR did not hear back from Hardy’s team or a rep for Mirren; Brosnan is traveling and unreachable. Paramount Television Studios and 101 Studios have also been asked for an update.',
].join('\n');

const SAMPLE_SLOT_DATA: Record<string, Record<string, unknown>> = {
  'featured-video': {
    // article_after_hero — single large 16:9 player.
    styleId: '69d4feedeeba897cebdb937c',
    placementId: '69d4feedeeba897cebdb937b',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/thr-featured-video/1280/720',
    aspectRatio: 'video',
  },
  'hero-carousel': {
    // "Top Picks" — placement whose SDK style renders a true horizontal
    // carousel of cells. Pre-authorised demo config, safe to commit. The
    // slot omits `aspect`, so its `size` bounds the carousel height.
    styleId: '69c294770970fa2b49e10ff8',
    placementId: '69c294770970fa2b49e10ff7',
    apiKey: '87ff6635b778331da1a7e2709dc6978c433f26247ac2b931',
    poster: 'https://picsum.photos/seed/thr-hero-carousel/1280/720',
    aspectRatio: 'video',
  },
  'after-body-grid': {
    // article_after_body — 16:9 landscape video grid ("More to Watch").
    styleId: '69d8dcfa09396e721fee4952',
    placementId: '69d8dcfa09396e721fee4951',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/thr-after-body/1280/720',
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
        title: 'Tom Hardy’s Reported MobLand Firing: A Timeline',
        description: 'How a week of clashing reports unfolded across the trade press.',
        href: 'https://example.com/tv/tom-hardy-mobland-timeline',
        imageUrl: 'https://picsum.photos/seed/thr-rel-1/480/320',
        brand: 'TV',
      },
      {
        id: 'related-2',
        title: 'Inside Guy Ritchie’s Move to Prestige TV',
        description: 'The director on trading the big screen for streaming crime sagas.',
        href: 'https://example.com/tv/guy-ritchie-tv',
        imageUrl: 'https://picsum.photos/seed/thr-rel-2/480/320',
        brand: 'TV',
      },
      {
        id: 'related-3',
        title: 'Pierce Brosnan on His Return to the Crime Genre',
        description: 'The former Bond on playing a mob patriarch opposite Helen Mirren.',
        href: 'https://example.com/tv/pierce-brosnan-mobland',
        imageUrl: 'https://picsum.photos/seed/thr-rel-3/480/320',
        brand: 'TV',
      },
      {
        id: 'related-4',
        title: 'Paramount+ Renewal Tracker: What’s Safe, What’s Not',
        description: 'A running guide to the streamer’s 2026 series decisions.',
        href: 'https://example.com/business/paramount-renewals',
        imageUrl: 'https://picsum.photos/seed/thr-rel-4/480/320',
        brand: 'Business',
      },
    ],
  },
  'trending-rail': {
    cards: [
      {
        id: 'trending-1',
        title: 'Peaky Blinders Movie: What We Know',
        description: 'Film · 3 min read',
        href: 'https://example.com/movies/peaky-blinders-movie',
        imageUrl: 'https://picsum.photos/seed/thr-tr-1/240/240',
        brand: 'Movies',
      },
      {
        id: 'trending-2',
        title: 'George Miller’s Next Project',
        description: 'Film · 2 min read',
        href: 'https://example.com/movies/george-miller-next',
        imageUrl: 'https://picsum.photos/seed/thr-tr-2/240/240',
        brand: 'Movies',
      },
      {
        id: 'trending-3',
        title: 'Is Venom 4 in Development?',
        description: 'Film · 2 min read',
        href: 'https://example.com/movies/venom-4',
        imageUrl: 'https://picsum.photos/seed/thr-tr-3/240/240',
        brand: 'Movies',
      },
      {
        id: 'trending-4',
        title: 'Helen Mirren’s Career-Defining Roles',
        description: 'TV · 5 min read',
        href: 'https://example.com/tv/helen-mirren-roles',
        imageUrl: 'https://picsum.photos/seed/thr-tr-4/240/240',
        brand: 'TV',
      },
    ],
  },
};

/**
 * Hollywood Reporter article fixture — `article` archetype, trade-explainer
 * layout (eyebrow + dek + "The Bottom Line" + "Key Questions" accordion +
 * left sticky rail). See module-level JSDoc. Recommended preview URL:
 * `http://localhost:5173/?fixture=thr-article`.
 */
export const thrArticle: Fixture = {
  page: SAMPLE_PAGE,
  slotData: SAMPLE_SLOT_DATA,
};
