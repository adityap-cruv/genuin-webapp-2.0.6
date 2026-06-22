"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

import { createVideoRegistry, type CreateRegistryOptions, type VideoRegistry } from "./registry";

/**
 * Context-level access to a single {@link VideoRegistry} instance shared by
 * every `<VideoPlayerV2>` rendered inside the provider's subtree.
 */

const VideoRegistryContext = createContext<VideoRegistry | null>(null);

export type VideoElementProviderProps = CreateRegistryOptions & {
  children: ReactNode;
};

/**
 * Mounts a single `VideoRegistry` for its subtree and tears it down (with
 * `evictAll`) when the subtree unmounts. Per Resolved decisions §1, place
 * this in the route group layout that contains the video consumers — leaving
 * the group should evict everything.
 *
 * The registry itself is created lazily inside `useMemo`. The actual DOM
 * effects (the parking `<div>` it appends to `document.body`) only happen the
 * first time `claim` is called, keeping the provider safe to render on the
 * server.
 */
export function VideoElementProvider({ children, maxEntries }: VideoElementProviderProps) {
  // useMemo — not useState — because we never replace the registry; we just
  // need a stable reference for the lifetime of the provider.
  const registry = useMemo(
    () => createVideoRegistry({ maxEntries }),
    // maxEntries is a config knob; if the consumer changes it at runtime they
    // get a brand-new registry, which is the correct semantic.
    [maxEntries]
  );

  useEffect(() => {
    return () => {
      registry.evictAll();
    };
  }, [registry]);

  return <VideoRegistryContext.Provider value={registry}>{children}</VideoRegistryContext.Provider>;
}

/**
 * Returns the registry for the current subtree. Throws if called outside a
 * {@link VideoElementProvider} so misuses surface immediately rather than
 * silently no-op-ing.
 */
export function useVideoRegistry(): VideoRegistry {
  const registry = useContext(VideoRegistryContext);
  if (!registry) {
    throw new Error("useVideoRegistry must be used within a <VideoElementProvider>");
  }
  return registry;
}
