"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Discriminator for the underlying video-player implementation FeedPlayer mounts. */
export type PlayerImpl = "v1" | "v2";

/**
 * Optional override for `FeedPlayer`'s `playerImpl` prop. When supplied at any
 * ancestor, every descendant `FeedPlayer` reads this value unless overridden
 * by an explicit `playerImpl` prop at the call site.
 *
 * Primary consumer: the components Storybook preview decorator, which wires
 * this to a toolbar global so reviewers can flip V1/V2 across all
 * Web-SDK stories without re-threading props through Embed → EmbedTile →
 * FeedPlayer. Not intended for production wiring — long-term V1 is removed
 * in M4 per VIDEO_ELEMENT_REUSE_PLAN.md, after which this context goes too.
 */
const PlayerImplContext = createContext<PlayerImpl | null>(null);

export interface PlayerImplProviderProps {
  impl: PlayerImpl | null | undefined;
  children: ReactNode;
}

/** Provider for {@link PlayerImpl}. Passing `null` / `undefined` is equivalent
 *  to not wrapping at all — descendants fall through to the prop default. */
export function PlayerImplProvider({ impl, children }: PlayerImplProviderProps) {
  return <PlayerImplContext.Provider value={impl ?? null}>{children}</PlayerImplContext.Provider>;
}

/** Returns the inherited {@link PlayerImpl} or `null` if no provider is above. */
export function usePlayerImplOverride(): PlayerImpl | null {
  return useContext(PlayerImplContext);
}
