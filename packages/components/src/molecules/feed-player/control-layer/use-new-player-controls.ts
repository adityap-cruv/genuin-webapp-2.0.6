import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

/**
 * Returns `true` when the new (Design System V2) player controls are enabled.
 * Native webapp defaults to v2; SDK embeds default to v1 and opt in via the
 * `design_system=v2` URL param.
 *
 * A second, narrower opt-in exists: `configuration.player_controls === "v2"`
 * turns on the control cluster alone, without the rest of the v2 rollout
 * (dynamic linkouts, sponsored treatment, width-derived control sizing). Those
 * are separable — a placement can want the controls while the design system is
 * still rolling out.
 */
export function useNewPlayerControls(): boolean {
  const { isDesignSystemV2 } = useEmbedConfigs();
  const embedData = useSafeEmbedContext()?.embedData;
  return embedData?.configuration?.player_controls === "v2" || isDesignSystemV2;
}
