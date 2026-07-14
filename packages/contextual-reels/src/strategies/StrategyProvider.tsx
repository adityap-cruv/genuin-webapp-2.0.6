/**
 * StrategyProvider — distributes resolved {@link Strategies} to the tree.
 *
 * Resolves strategies once per tag and shares the result so providers and
 * components read decisions instead of recomputing allowlist checks.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getInitVolumeOverride } from "@cxr/config";
import {
  applyExperiment,
  DEFAULT_STRATEGIES,
  resolveStrategies,
  type Strategies,
} from "@cxr/strategies/strategies";
import { isAdVerificationCrawler } from "@cxr/utils/ads";

const StrategyContext = createContext<Strategies | undefined>(undefined);

interface StrategyProviderProps {
  children: ReactNode;
  /** Tag the strategy decisions are resolved for. */
  tagId: string;
  /** Active tag's `brand_id` (from `tagDetails`), if resolved yet. */
  brandId?: number;
  /**
   * Raw `data-giv` attribute for this instance — the per-div fallback for the
   * initial-volume override when the page-global `GIV` script param is absent.
   */
  dataGiv?: string | null;
}

/**
 * Provide feature decisions for the active tag.
 *
 * @example
 * ```tsx
 * <StrategyProvider tagId={tagId} brandId={tagDetails?.brand_id}>
 *   <Feed ... />
 * </StrategyProvider>
 * ```
 */
export function StrategyProvider({
  children,
  tagId,
  brandId,
  dataGiv,
}: StrategyProviderProps): ReactNode {
  // Roll the experiment bucket once per mount (per page load): the draw is taken
  // inside useMemo keyed on tagId so the bucket stays stable for the session but
  // varies load-to-load. applyExperiment is a no-op for tags with no experiment.
  // Ad-verification crawlers (il.advtq) skip the experiment entirely and behave
  // like the un-sampled majority.
  const value = useMemo(() => {
    const resolved = applyExperiment(
      resolveStrategies(tagId, brandId),
      tagId,
      Math.random(),
      isAdVerificationCrawler()
    );
    // The initial-volume override wins over the resolved config when present and
    // valid — it drives `initialVolume` everywhere (on-load autoplay level,
    // audible-ad-start, and the manual-unmute restore level). Precedence: the
    // page-global `GIV` script param first, then this instance's `data-giv`.
    const initVolumeOverride = getInitVolumeOverride(dataGiv);
    return initVolumeOverride === undefined
      ? resolved
      : { ...resolved, initialVolume: initVolumeOverride };
  }, [tagId, brandId, dataGiv]);
  return <StrategyContext.Provider value={value}>{children}</StrategyContext.Provider>;
}

/**
 * Read the active strategies.
 *
 * Does not throw outside a provider: strategies are an enhancement layer, so a
 * missing provider degrades to {@link DEFAULT_STRATEGIES} (every feature off).
 */
export function useStrategy(): Strategies {
  return useContext(StrategyContext) ?? DEFAULT_STRATEGIES;
}
