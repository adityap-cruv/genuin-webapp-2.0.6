/**
 * StrategyProvider — distributes resolved {@link Strategies} to the tree.
 *
 * Resolves strategies once per tag and shares the result so providers and
 * components read decisions instead of recomputing allowlist checks.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { getInitVolumeOverride } from "@cxr/config";
import { useTagDetails } from "@cxr/providers/TagDetailsProvider";
import {
  applyExperiment,
  DEFAULT_STRATEGIES,
  getExperimentRoll,
  resolveStrategies,
  type Strategies,
} from "@cxr/strategies/strategies";
import { isAdVerificationCrawler } from "@cxr/utils/ads";

const StrategyContext = createContext<Strategies | undefined>(undefined);

interface StrategyProviderProps {
  children: ReactNode;
  /**
   * Raw `data-giv` attribute for this instance — the per-div fallback for the
   * initial-volume override when the page-global `GIV` script param is absent.
   */
  dataGiv?: string | null;
}

/**
 * Provide feature decisions for the active tag.
 *
 * Reads `tagId`/`brandId` from {@link useTagDetails} rather than props —
 * `TagDetailsProvider` is already an ancestor by the time this mounts.
 *
 * @example
 * ```tsx
 * <StrategyProvider dataGiv={dataGiv}>
 *   <Feed ... />
 * </StrategyProvider>
 * ```
 */
export function StrategyProvider({ children, dataGiv }: StrategyProviderProps): ReactNode {
  const { tagId, brandId, tagDetails } = useTagDetails();

  // Roll the experiment bucket once per mount (per page load): the draw is taken
  // inside useMemo keyed on tagId so the bucket stays stable for the session but
  // varies load-to-load. applyExperiment is a no-op for tags with no experiment.
  // Ad-verification crawlers (il.advtq) skip the experiment entirely and behave
  // like the un-sampled majority.
  const value = useMemo(() => {
    const resolved = applyExperiment(
      resolveStrategies(tagId, brandId),
      tagId,
      getExperimentRoll(tagId),
      isAdVerificationCrawler()
    );
    // The initial-volume override wins over the resolved config when present and
    // valid — it drives `initialVolume` everywhere (on-load autoplay level,
    // audible-ad-start, and the manual-unmute restore level). Precedence: the
    // page-global `GIV` script param first, then this instance's `data-giv`.
    const initVolumeOverride = getInitVolumeOverride(dataGiv);
    const withVolume =
      initVolumeOverride === undefined ? resolved : { ...resolved, initialVolume: initVolumeOverride };

    // Dashboard `enable_ask_question` wins over the strategyConfig allowlist when present
    // (drives live preview toggling); an absent key defers to the allowlist.
    const enableAskQuestion = tagDetails?.config?.enable_ask_question;
    return typeof enableAskQuestion === "boolean"
      ? { ...withVolume, genAiEnabled: enableAskQuestion }
      : withVolume;
  }, [tagId, brandId, dataGiv, tagDetails?.config?.enable_ask_question]);
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
