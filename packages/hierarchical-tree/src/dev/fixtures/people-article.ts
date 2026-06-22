import type { Page } from '../../schema';

import type { Fixture } from './types';

/**
 * Publisher-article `Page` artifact designed from a real People.com story.
 *
 * Source: a saved People.com article ("Rosie O'Donnell, 64, Reveals She
 * Got an Expensive Secret Facelift"). Unlike the Artitech fixture — which
 * clones a generic celebrity-article tree and treats the hero as a video
 * poster — this layout is modelled on how People.com actually structures
 * the page, section for section:
 *
 *   breadcrumb → headline → author/trust bar (avatar + publish date) →
 *   still hero image with credit caption → embedded "Watch" video module →
 *   body (split around an inline editorial figure) → newsletter sign-up
 *   callout → related-stories grid.
 *
 * Key structural choices that differ from `artitech-article`:
 * - The hero is a first-class still `image` UI node with a credit caption
 *   (People leads with a photo, not a video). The single `video` Slot is
 *   the inline "Watch" autoplay player People drops near the top.
 * - The author bar is an `avatar` + name + dateline cluster, matching the
 *   People attribution component (it shows the writer's headshot).
 * - The body is two `content` slots so a real inline figure (the second
 *   People photo) can sit between them — content slots render one markdown
 *   blob each, so interleaving media requires a split.
 * - The mid-article newsletter unit ("Never miss a story — sign up…") is a
 *   `surface` callout (heading + blurb + button), not editorial copy.
 *
 * The artifact stays theme-agnostic per spec §1.4 — no "People.com" string
 * lives in any node. Recommended preview URL:
 * `http://localhost:5173/?fixture=people-article`.
 *
 * The SDK placement IDs / API key in `SAMPLE_SLOT_DATA` are the committed,
 * pre-authorised Artitech demo pair reused here so the `video` slot renders
 * live content on the dev surface.
 */

// Breadcrumb chips, shared across breakpoints.
const BREADCRUMB = {
  type: 'ui' as const,
  uiVariant: 'cluster',
  props: { gap: 'xs' },
  children: [
    { type: 'ui' as const, uiVariant: 'chip', props: { variant: 'secondary', text: 'Lifestyle' } },
    { type: 'ui' as const, uiVariant: 'chip', props: { text: 'Home' } },
    { type: 'ui' as const, uiVariant: 'chip', props: { text: 'Celebrity' } },
  ],
};

// Author / trust bar: headshot + name + publish dateline.
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
        imageUrl: 'https://picsum.photos/seed/people-author-angel/96/96',
        alt: 'Angel Saunders',
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
          props: { size: 'body-1', as: 'span', weight: 'semibold', text: 'By Angel Saunders' },
        },
        {
          type: 'ui' as const,
          uiVariant: 'text',
          props: { size: 'body-2', as: 'span', text: 'Published on May 26, 2025 · Updated 4 min read' },
        },
      ],
    },
  ],
};

// Still hero photo + credit caption (People leads with a photo).
const HERO_FIGURE = {
  type: 'ui' as const,
  uiVariant: 'stack',
  props: { gap: 'xs' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'image',
      props: {
        src: 'https://picsum.photos/seed/people-hero-rosie/1200/675',
        alt: 'Rosie O’Donnell at the Sydney Opera House',
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
        text: 'Rosie O’Donnell at the Sydney Opera House on October 6, 2025. PHOTO: Brendon Thorne/Getty',
      },
    },
  ],
};

// Inline editorial figure that sits between the two body halves.
const INLINE_FIGURE = {
  type: 'ui' as const,
  uiVariant: 'stack',
  props: { gap: 'xs' },
  children: [
    {
      type: 'ui' as const,
      uiVariant: 'image',
      props: {
        src: 'https://picsum.photos/seed/people-inline-evita/1200/800',
        alt: 'Rosie O’Donnell attends the press night performance of Evita in London',
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
        text: 'Rosie O’Donnell attends the press night performance of "Evita" on July 1, 2025, in London. PHOTO: Dave Benett/Getty',
      },
    },
  ],
};

// Mid-article newsletter sign-up unit (People's "Never miss a story" block).
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
          props: { level: 'headline-4', as: 'h2', text: 'Never Miss a Story' },
        },
        {
          type: 'ui' as const,
          uiVariant: 'text',
          props: {
            size: 'body-1',
            as: 'p',
            text: 'Sign up for our free daily newsletter to stay up to date on the best of celebrity news and compelling human-interest stories.',
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

const SAMPLE_PAGE: Page = {
  id: 'people-article-rosie-facelift',
  version: '2026.05',
  breakpoints: [
    // ---------- Mobile (0): single column, top-to-bottom reading order ----------
    {
      id: 'people-article-mobile',
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
              {
                type: 'ui',
                uiVariant: 'heading',
                props: {
                  level: 'h3',
                  as: 'h1',
                  weight: 'bold',
                  text: "Rosie O'Donnell, 64, Reveals She Got an Expensive Secret Facelift",
                },
              },
              AUTHOR_BAR,
              // Tag chips
              {
                type: 'ui',
                uiVariant: 'cluster',
                props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Rosie O\'Donnell' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Beauty & Style' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Cosmetic Procedures' } },
                ],
              },
              HERO_FIGURE,
              // Embedded "Watch" video module — People's autoplay player.
              // The mobile budget band caps content slots at 1, so the body
              // is a single merged slot here (desktop splits it around an
              // inline figure).
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
                minHeight: 'md',
              },
              { type: 'slot', name: 'article-body', kind: 'content', style: 'single' },
              INLINE_FIGURE,
              // Mid-article reel carousel — the SDK lays out a horizontal
              // strip of 9:16 clips.
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
                // No `aspect`: lets `size` bound the carousel height so the
                // embed fills a capped box instead of towering at width×ratio.
                size: 'default',
              },
              NEWSLETTER_CALLOUT,
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'heading',
                props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'Related Stories' },
              },
              // Full-width single column → cells stay landscape (wide), so the
              // responsive card orientation is stable (unlike a narrow rail).
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
              // Below-body 16:9 video grid ("More to Watch").
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

    // ---------- Desktop (1024): article column + sticky "Trending" rail ----------
    {
      id: 'people-article-desktop',
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
              {
                type: 'ui',
                uiVariant: 'heading',
                props: {
                  level: 'headline-0',
                  as: 'h1',
                  weight: 'bold',
                  text: "Rosie O'Donnell, 64, Reveals She Got an Expensive Secret Facelift",
                },
              },
              AUTHOR_BAR,
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              {
                type: 'ui',
                uiVariant: 'split-view',
                props: { tracks: [700, 340], gap: 'xl', align: 'start' },
                children: [
                  // Main article column
                  {
                    type: 'ui',
                    uiVariant: 'stack',
                    props: { gap: 'md' },
                    children: [
                      HERO_FIGURE,
                      { type: 'slot', name: 'body-intro', kind: 'content', style: 'single' },
                      INLINE_FIGURE,
                      { type: 'slot', name: 'body-rest', kind: 'content', style: 'single' },
                      // "Watch" video inline in the wide main column. Uses the
                      // single-cell-player placement (one large 16:9 player)
                      // rather than the reel-carousel placement, so it reads as
                      // a feature video, not a strip of tiny reels.
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-3', as: 'h2', decoration: 'ribbon', text: 'Watch' },
                      },
                      {
                        type: 'slot',
                        name: 'featured-video',
                        kind: 'video',
                        style: 'feed',
                        aspect: 'video',
                        size: 'lg',
                        minHeight: 'md',
                      },
                      // Mid-article reel carousel ("Top Picks").
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
                        cols: 3,
                        // No `aspect` (see mobile note): `size` bounds the
                        // carousel height instead of letting it tower.
                        size: 'default',
                      },
                      NEWSLETTER_CALLOUT,
                      { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
                      {
                        type: 'ui',
                        uiVariant: 'heading',
                        props: { level: 'headline-2', as: 'h2', decoration: 'ribbon', text: 'Related Stories' },
                      },
                      {
                        type: 'slot',
                        name: 'related-grid',
                        kind: 'linkout',
                        style: 'grid',
                        cols: 2,
                        rows: 2,
                      },
                      // Below-body 16:9 video grid ("More to Watch").
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
                  // Sticky right rail: "Trending Now" recirculation list.
                  // Compact cols-1 sidebar, mirroring the shipped
                  // `artitech-article` pattern. Titles are kept short so each
                  // card stays wider than tall — that keeps the responsive
                  // card's orientation stable (long titles in a narrow column
                  // make the card taller than wide, which oscillates the
                  // portrait/landscape picker).
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

// Article body, in two halves. Desktop renders them as separate `content`
// slots with an inline figure between; mobile (content-slot budget of 1)
// renders the joined string in a single slot.
const BODY_INTRO = [
  'Rosie O’Donnell paid a pretty penny for a facelift earlier this year after previously promising herself she would not alter her features.',
  '',
  'The 64-year-old former talk show host revealed in a Monday, May 25, Substack post that she got a lower deep plane facelift in January that “cost more money than I have ever paid for a car.”',
  '',
  '> There’s a point where acceptance starts to feel like lying.',
  '>',
  '> — ROSIE O’DONNELL',
  '',
  '## A Promise She Made Herself',
  '',
  'O’Donnell prefaced her post by explaining that she’d always felt “very strongly about facelifts” and prided herself on being someone “who would never — ever” have one done.',
  '',
  '“I thought it was a betrayal. Of feminism. Of aging. Of our team of women worldwide. And then I lost 50 pounds…,” she wrote. While she usually accepts herself as she is, the former View co-host said that it sometimes felt inauthentic to be completely against cosmetic procedures.',
].join('\n');

const BODY_REST = [
  '## Her Daughter’s Objection',
  '',
  'She started doing the required research, but her feelings shifted again when her daughter Clay, 13, found out and advised against it. “Young women look up to you,” Clay told her, O’Donnell wrote. Clay also told O’Donnell she “wouldn’t be able to respect you if you did it,” a line that “landed” with O’Donnell.',
  '',
  'Clay “sounded exactly like me. Like my younger, more certain, more morally rigid self had somehow moved into my house,” O’Donnell wrote. The comedian saw the exchange as a learning opportunity for her children. “I want them to grow up in a world where they don’t feel like they have to change but also knows they can, if they want to, without losing moral standing in their own life,” she wrote.',
  '',
  '## Going Through With It',
  '',
  'O’Donnell went ahead with her plans, selecting a doctor whose work she’d seen thanks to friends who had also had work done. However, she made it clear that she didn’t want to develop a fixation where she was constantly trying to make more and more tweaks. “I didn’t want to become that voice—the one that keeps moving the goalpost, never satisfied, the one that turns their own face into a problem. I wanted a limit,” she wrote.',
  '',
  'Surprisingly, O’Donnell claimed no one realized she’d undergone a facelift. “Not one person. Not a friend, not a stranger, not even people who owe me compliments. My teen daughter has not said a word. Nothing. I went through a full existential feminist crisis, had my face and neck surgically altered, and the result is… zippo,” she said.',
  '',
  'Although O’Donnell was pleased with her subtle enhancements, she admitted there’s a “sense of deceit I’m struggling with.” Still, she ended on a note of gratitude: “Here at 64 years old with a new lower face and neck, just happy to be alive. For the girl I was. The woman I am. This is me.”',
].join('\n');

const SAMPLE_SLOT_DATA: Record<string, Record<string, unknown>> = {
  'featured-video': {
    // article_after_hero — single large 16:9 player.
    styleId: '69d4feedeeba897cebdb937c',
    placementId: '69d4feedeeba897cebdb937b',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/people-featured-video/1280/720',
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
    poster: 'https://picsum.photos/seed/people-hero-carousel/1280/720',
    aspectRatio: 'video',
  },
  'after-body-grid': {
    // article_after_body — 16:9 landscape video grid ("More to Watch").
    styleId: '69d8dcfa09396e721fee4952',
    placementId: '69d8dcfa09396e721fee4951',
    apiKey: ARTITECH_API_KEY,
    poster: 'https://picsum.photos/seed/people-after-body/1280/720',
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
        title: 'Rosie O’Donnell, 64, Shares Unfiltered Before-and-After Photos of Her Facelift',
        description: 'The comedian followed up her candid essay with side-by-side images.',
        href: 'https://example.com/lifestyle/rosie-odonnell-before-after',
        imageUrl: 'https://picsum.photos/seed/people-rel-1/480/320',
        brand: 'Celebrity',
        website: 'lifestyle.example.com',
      },
      {
        id: 'related-2',
        title: 'Joy Behar, 83, Reveals Every Cosmetic Procedure She’s Had',
        description: 'The View co-host names the tweaks she swears by — and the ones she finds “ridiculous.”',
        href: 'https://example.com/lifestyle/joy-behar-procedures',
        imageUrl: 'https://picsum.photos/seed/people-rel-2/480/320',
        brand: 'Celebrity',
        website: 'lifestyle.example.com',
      },
      {
        id: 'related-3',
        title: 'Keltie Knight Says Her Facelift at 41 Took Nearly 9 Hours',
        description: 'The host opens up about a procedure complicated by unexpected scar tissue.',
        href: 'https://example.com/lifestyle/keltie-knight-facelift',
        imageUrl: 'https://picsum.photos/seed/people-rel-3/480/320',
        brand: 'Beauty',
        website: 'lifestyle.example.com',
      },
      {
        id: 'related-4',
        title: 'Cindy Crawford on Confidence and the Product She Swears By at 60',
        description: 'The supermodel on closeups, aging, and feeling her best.',
        href: 'https://example.com/lifestyle/cindy-crawford-confidence',
        imageUrl: 'https://picsum.photos/seed/people-rel-4/480/320',
        brand: 'Beauty',
        website: 'lifestyle.example.com',
      },
    ],
  },
  'trending-rail': {
    cards: [
      {
        id: 'trending-1',
        title: 'Charlie Puth’s Boston Shout-Out',
        description: 'Music · 2 min read',
        href: 'https://example.com/music/charlie-puth-boston',
        imageUrl: 'https://picsum.photos/seed/people-tr-1/240/240',
        brand: 'Music',
      },
      {
        id: 'trending-2',
        title: 'Summer House Reunion Bombshells',
        description: 'TV · 5 min read',
        href: 'https://example.com/tv/summer-house-reunion',
        imageUrl: 'https://picsum.photos/seed/people-tr-2/240/240',
        brand: 'TV',
      },
      {
        id: 'trending-3',
        title: 'Snooki’s Implant Surprise',
        description: 'Celebrity · 3 min read',
        href: 'https://example.com/celebrity/snooki-implants',
        imageUrl: 'https://picsum.photos/seed/people-tr-3/240/240',
        brand: 'Celebrity',
      },
      {
        id: 'trending-4',
        title: 'A 15-Year Wait for a Nose Job',
        description: 'Beauty · 4 min read',
        href: 'https://example.com/beauty/nose-job-results',
        imageUrl: 'https://picsum.photos/seed/people-tr-4/240/240',
        brand: 'Beauty',
      },
    ],
  },
};

/**
 * People.com article fixture — `article` archetype, layout designed from
 * the real page structure (not cloned from Artitech). See module-level
 * JSDoc for the section mapping. Recommended preview URL:
 * `http://localhost:5173/?fixture=people-article`.
 */
export const peopleArticle: Fixture = {
  page: SAMPLE_PAGE,
  slotData: SAMPLE_SLOT_DATA,
};
