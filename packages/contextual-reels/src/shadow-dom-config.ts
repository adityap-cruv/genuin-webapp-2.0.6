/**
 * Centralized Shadow DOM configuration constants and types for CXR.
 *
 * Import from "@cxr/shadow-dom-config" wherever a data attribute name
 * or the ShadowDomConfig type is needed.
 */

/** Opt-in attribute placed on the .gen-ext host element by the partner embed. */
export const DATA_ATTR_SHADOW_DOM_OPT_IN = 'data-shadow-dom' as const;

/**
 * Set on the .gen-ext element by setupCxrShadowDOM once a shadow root has
 * been attached. Allows CSS / JS outside the tree to identify the shadow host.
 */
export const DATA_ATTR_SHADOW_HOST = 'data-cxr-shadow-host' as const;

/**
 * Set on the container <div> that is the direct child of the shadow root.
 * Use this to locate the shadow boundary container from inside the tree.
 */
export const DATA_ATTR_SHADOW_ROOT_CONTAINER = 'data-cxr-shadow-root' as const;

/**
 * Set on the inner <div> that React mounts into.
 * Pre-existing attribute — kept for backward compat with any external tooling
 * that queries [data-cxr-mount].
 */
export const DATA_ATTR_SHADOW_MOUNT = 'data-cxr-mount' as const;

/** Describes the active Shadow DOM topology for one widget instance. */
export interface ShadowDomConfig {
  /** Whether shadow DOM isolation is active for this instance. */
  enabled: boolean;
  /** The .gen-ext element that owns the shadow root. */
  hostElement: HTMLElement;
  /** The ShadowRoot attached to hostElement. */
  shadowRoot: ShadowRoot;
  /** The inner <div data-cxr-mount> that React renders into. */
  mountTarget: HTMLElement;
  /**
   * The `id` of the shadow host element — guaranteed non-empty.
   * If the host had no `id` when setupCxrShadowDOM ran, one was generated and
   * assigned. Pass this to GenAd.init() as `shadowHostId`.
   */
  shadowHostId: string;
}

/** Discriminated union describing how a widget instance is mounted. */
export type ShadowDomMode = 'shadow' | 'direct';
