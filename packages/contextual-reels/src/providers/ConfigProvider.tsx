/**
 * ConfigProvider — distributes tag configuration to the feed component tree.
 *
 * Responsibilities:
 *  - Receives tagDetails, rootTagId, tagId as props.
 *  - Derives isGenAiEnabled (via isGenAiAllowed allowlist).
 *  - Exposes useConfig() hook.
 *
 * Ad layout config (`adLayout`, `isAudioOnlyAds`) lives exclusively in
 * `AdProvider` / `useAdWaterfall()` — do not add ad-layout concerns here.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { isGenAiAllowed } from "@cxr/config";
import type { TagResponse } from "@cxr/types";

/** Context value exposed via useConfig. */
export interface ConfigContextValue {
  /** The full tag creative configuration. */
  tagDetails: TagResponse;
  /** Root tag identifier (used for global state lookups). */
  rootTagId: string;
  /** Tag identifier. */
  tagId: string;
  /** True when GenAI experience is enabled for this tag. */
  isGenAiEnabled: boolean;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
  tagDetails: TagResponse;
  rootTagId: string;
  tagId: string;
}

/**
 * Distribute tag configuration through the feed component tree.
 *
 * @example
 * ```tsx
 * <ConfigProvider tagDetails={td} rootTagId={rootTagId} tagId={tagId}>
 *   <Feed ... />
 * </ConfigProvider>
 * ```
 */
export function ConfigProvider({ children, tagDetails, rootTagId, tagId }: ConfigProviderProps): ReactNode {
  const value = useMemo<ConfigContextValue>(
    () => ({
      tagDetails,
      rootTagId,
      tagId,
      isGenAiEnabled: isGenAiAllowed(tagId),
    }),
    [tagDetails, rootTagId, tagId]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

/**
 * Hook accessor for the config context.
 *
 * @throws Error when called outside a {@link ConfigProvider}.
 */
export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig must be used inside <ConfigProvider>");
  }
  return ctx;
}

/**
 * Non-throwing config accessor. Returns `undefined` when rendered outside a
 * {@link ConfigProvider} (e.g. isolated unit tests). Use for optional reads
 * such as feature gates that must degrade gracefully rather than crash.
 */
export function useOptionalConfig(): ConfigContextValue | undefined {
  return useContext(ConfigContext);
}
