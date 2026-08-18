/**
 * Resolves what a `.gen-ext` slot mounts as: which node the React root attaches
 * to, and which {@link AdLayoutId} the widget renders in.
 *
 * Lives outside `index.jsx` so the stacked-variant seam is unit-testable — the
 * bootstrap file is excluded from coverage (it does DOM scanning + createRoot),
 * and this is the one decision in it that changes what the user sees.
 */
import { resolveAdLayout, resolveStackedLayout, type AdLayoutId } from "@cxr/config";
import { setupStackedRows } from "@cxr/utils/infolinks";

/** What a slot resolved to, ready for the shadow-root mount. */
export interface SlotMount {
  /** Node the React root mounts into — the stacked top row, or the slot itself. */
  mountHost: HTMLElement;
  /** Layout the widget renders in (the stacked config's `ourLayout` when split). */
  adLayout: AdLayoutId;
  /** Whether the slot was split into stacked rows. */
  isStacked: boolean;
}

/**
 * Resolve a slot's mount host + layout, splitting it into stacked rows when the
 * tag and slot size opt in.
 *
 * offsetWidth/Height report the element's own layout box and are immune to
 * ancestor CSS transforms. getBoundingClientRect() reports the post-transform
 * box, which some hosts inflate: Infolinks wraps our slot in `transform:
 * scale(...)` containers, so a 320×100 slot measures as ~344×204 there.
 * resolveAdLayout requires an exact size match, so the inflated numbers resolve
 * to Unknown and the stacked variant fails to activate even when
 * gen_variant=stacked and the tag id both match.
 *
 * @param node  The `.gen-ext` slot element.
 * @param tagId Resolved tag id — decides stacked eligibility with the size.
 * @returns The mount host, the layout to render, and whether it stacked.
 */
export function resolveSlotMount(node: HTMLElement, tagId: string): SlotMount {
  const resolvedLayout = resolveAdLayout(node.offsetWidth, node.offsetHeight);

  // Stacked variant: split the slot into two equal halves — our widget mounts
  // into the top row (as the config's `ourLayout`); Infolinks fills the bottom.
  const stackedConfig = resolveStackedLayout(tagId, resolvedLayout);
  if (!stackedConfig) {
    return { mountHost: node, adLayout: resolvedLayout, isStacked: false };
  }

  return {
    mountHost: setupStackedRows(node, stackedConfig),
    adLayout: stackedConfig.ourLayout,
    isStacked: true,
  };
}
