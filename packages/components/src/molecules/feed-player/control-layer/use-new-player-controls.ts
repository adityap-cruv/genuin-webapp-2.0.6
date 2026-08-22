import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

/**
 * Returns `true` when the new (Design System V2) player controls are enabled.
 *
 * Two independent opt-ins:
 * - `configuration.player_controls === "v2"` — the controls on their own.
 * - `isDesignSystemV2` — the whole v2 rollout (dynamic linkouts, sponsored
 *   treatment, width-derived control sizing), which includes the controls.
 *
 * The first exists because those are separable: an embed can want the v2
 * control cluster without the rest of the design system, which is still being
 * rolled out per-placement. Defaults to `false` (old UI).
 */
export function useNewPlayerControls(): boolean {
  const { isDesignSystemV2 } = useEmbedConfigs();
  const embedData = useSafeEmbedContext()?.embedData;
  return embedData?.configuration?.player_controls === "v2" || isDesignSystemV2;
}
