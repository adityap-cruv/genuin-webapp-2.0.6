/**
 * Canonical map of prefetchable chunks for the embed → expand-view flow.
 *
 * Each value is a thunk that returns the SAME dynamic import (by resolved module
 * file) as the matching `React.lazy()` declaration. The web-sdk builds with Vite,
 * which dedupes dynamic imports by resolved module id — so calling one of these
 * thunks early "warms" the chunk, and the later `lazy()` import resolves instantly
 * from cache. This is the whole prefetch mechanism; there are no webpack magic
 * comments (the bundler is Vite, not webpack).
 *
 * SPECIFIER RULE — each thunk must resolve to the same file as its `lazy()` site:
 *  - lazy() sites that use the `@genuin/components/...` alias → copied verbatim.
 *  - lazy() sites that use a RELATIVE specifier (relative to THAT file, so it can't
 *    be copied literally here) → the equivalent `@genuin/components/...` alias that
 *    resolves to the same file. Rollup dedupes alias-vs-relative-to-the-same-file by
 *    resolved id, so the chunk still merges.
 *
 * Keep the `lazy:` comments accurate — they are the discoverable link between a
 * chunk name and its render site, and the guard against drift.
 */
export const CHUNK_LOADERS = {
  // lazy: organisms/embed/expand-view/expand-view-loader.tsx — import("./expand-view")
  expandView: () => import("@genuin/components/organisms/embed/expand-view/expand-view"),
  // lazy: organisms/embed/expand-view/expand-view-loader.tsx — import("./embed-expand-sectioned-view")
  expandSectioned: () => import("@genuin/components/organisms/embed/expand-view/embed-expand-sectioned-view"),
  // lazy: organisms/embed/expand-view/expand-view.tsx — import("@genuin/components/templates/feed") [verbatim]
  feedView: () => import("@genuin/components/templates/feed"),
  // lazy: templates/feed/core.tsx — import("@genuin/components/organisms/player-swiper") [verbatim]
  playerList: () => import("@genuin/components/organisms/player-swiper"),
  // lazy: organisms/player-swiper/player-swiper.tsx — import("./non-sectioned-content")
  nonSectionedContent: () => import("@genuin/components/organisms/player-swiper/non-sectioned-content"),
  // lazy: organisms/player-swiper/player-swiper.tsx — import("./sectioned-content")
  sectionedContent: () => import("@genuin/components/organisms/player-swiper/sectioned-content"),
  // lazy: organisms/player-swiper/non-sectioned-content.tsx — import("./player")
  player: () => import("@genuin/components/organisms/player-swiper/player"),
  // lazy: organisms/player-swiper/player.tsx & embed-tile.tsx — import("@genuin/components/molecules/feed-player") [verbatim]
  feedPlayer: () => import("@genuin/components/molecules/feed-player"),
  // lazy: organisms/player-swiper/player-swiper.tsx — import("@genuin/components/molecules/comments/comments") [verbatim]
  comments: () => import("@genuin/components/molecules/comments/comments"),
  // lazy: organisms/embed/expand-view/expand-view.tsx — import("@genuin/components/page/standard-wall/standard-wall") [verbatim]
  standardWall: () => import("@genuin/components/page/standard-wall/standard-wall"),
  // lazy: molecules/feed-player/control-layer/embed.tsx — import("./embed/iheart")
  controlLayerIheart: () => import("@genuin/components/molecules/feed-player/control-layer/embed/iheart"),
  // lazy: molecules/feed-player/control-layer/embed.tsx — import("./embed/ted-embed")
  controlLayerTed: () => import("@genuin/components/molecules/feed-player/control-layer/embed/ted-embed"),
} as const;

/** Name of a prefetchable chunk. */
export type ChunkName = keyof typeof CHUNK_LOADERS;
