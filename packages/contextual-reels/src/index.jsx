import React, { lazy } from "react";
import { createRoot } from "react-dom/client";

import "@cxr/styles/tailwind.css";

import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";

import { initializeRudderAnalytics } from "@cxr/analytics/rudderstack";
import { EVENT, sendEventLogFromGlobals } from "@cxr/analytics/analytics";
import { enrichDeviceDetailsWithGeoIp, getDeviceDetailsSnapshot } from "@cxr/platform/device";
import { userId } from "@cxr/userId";
import { windowLink } from "@cxr/platform/topWindow";
import { resolveAdLayout, resolveStackedLayout } from "@cxr/config";
import { setupStackedRows } from "@cxr/utils/infolinks";
import { buildPublicApi, installMessageBridge } from "@cxr/publicApi";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { setupCxrShadowDOM } from "@cxr/shadow-dom";
import { DATA_ATTR_SHADOW_DOM_OPT_IN } from "@cxr/shadow-dom-config";
import { getSharedGeoIp } from "@cxr/services/api";
import { getVisitIdPromise } from "@cxr/services/feed";
import { getHostMacro } from "@cxr/hostMacros";
import { PixelReporter, fireTagInitPixel } from "@cxr/observability/pixel-reporter";

// New TypeScript App with provider stack + native feed engine.
const App = lazy(() => import("./app/App"));

/** Track tagIds that have fired TAG_INIT (persists across re-inits). */
const tagIdsWithTagInit = new Set();

/** Generate a unique instance id per node — stable once written to the DOM. */
function generateInstanceId() {
  return `cxr-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

/**
 * Return a stable instance id for a node.
 * If already stamped from a previous init() call, reuse it.
 */
function getOrSetInstanceId(node) {
  let id = node.getAttribute("data-cxr-instance-id");
  if (!id) {
    id = generateInstanceId();
    node.setAttribute("data-cxr-instance-id", id);
  }
  return id;
}

/**
 * Mount directly into the node — styles inherited from the page.
 *
 * @returns {{ enabled: false, hostElement: HTMLElement, shadowRoot: null, mountTarget: HTMLElement }}
 */
function mountDirect(node) {
  return { enabled: false, hostElement: node, shadowRoot: null, mountTarget: node };
}

/**
 * Mount into a shadow root — styles are isolated from the page.
 * Opt-in via data-shadow-dom="true" on the .gen-ext element.
 *
 * @returns {Promise<import('@cxr/shadow-dom-config').ShadowDomConfig>}
 */
async function mountWithShadow(node) {
  return setupCxrShadowDOM(node);
}

async function init() {
  const allNodes = document.querySelectorAll(".gen-ext");
  if (!allNodes.length) return;

  // Warn about duplicate `id` attributes — partners should use id="gen-ext-1", id="gen-ext-2", etc.
  const idCount = new Map();
  allNodes.forEach((node) => {
    const nodeId = node.id;
    if (nodeId) {
      idCount.set(nodeId, (idCount.get(nodeId) || 0) + 1);
    }
  });
  idCount.forEach((count, nodeId) => {
    if (count > 1) {
      // eslint-disable-next-line no-console
      console.warn(
        `[contextual-reels]: Found ${count} elements with the same id="${nodeId}". ` +
          `Each .gen-ext element must have a unique id. ` +
          `Use id="gen-ext-1", id="gen-ext-2", etc.`
      );
    }
  });

  // Warn about missing id — encourage partners to always set one
  allNodes.forEach((node) => {
    if (!node.id) {
      // eslint-disable-next-line no-console
      console.warn(
        `[contextual-reels]: A .gen-ext element has no id attribute. ` +
          `Add a unique id (e.g. id="gen-ext-1") so widgets can be targeted via the public API.`
      );
    }
  });

  // Warn about duplicate data-tag-id values
  const tagIdCount = new Map();
  allNodes.forEach((node) => {
    const tagId = node.getAttribute("data-tag-id");
    if (tagId) {
      tagIdCount.set(tagId, (tagIdCount.get(tagId) || 0) + 1);
    }
  });
  tagIdCount.forEach((count, tagId) => {
    if (count > 1) {
      // eslint-disable-next-line no-console
      console.warn(
        `[contextual-reels]: Found ${count} elements with the same data-tag-id="${tagId}". ` +
          `Each widget should have a distinct data-tag-id.`
      );
    }
  });

  // Deduplicate by element reference so re-calling init() on the same node is a no-op
  const uniqueNodes = new Set();
  allNodes.forEach((node) => {
    const status = node.getAttribute("data-cxr-status");
    if (status === "done" || status === "loading") return;
    uniqueNodes.add(node);
  });

  // Inject <meta name="ad.size"> for GAM/DFP — use the first container's dimensions.
  // Only inject once per page; idempotent if already present.
  if (uniqueNodes.size > 0 && !document.querySelector('meta[name="ad.size"]')) {
    const firstNode = uniqueNodes.values().next().value;
    // Use offsetWidth/Height (the element's own layout box), not
    // getBoundingClientRect() — the latter reports the post-transform box, and
    // some hosts (e.g. Infolinks) wrap our slot in `transform: scale(...)`
    // ancestors, which would inflate the injected GAM ad size.
    const width = firstNode.offsetWidth;
    const height = firstNode.offsetHeight;
    if (width > 0 && height > 0) {
      const adSizeMeta = document.createElement("meta");
      adSizeMeta.name = "ad.size";
      adSizeMeta.content = `width=${Math.round(width)},height=${Math.round(height)}`;
      document.head.appendChild(adSizeMeta);
    }
  }

  // Whether any mounting node is a real (non-preview) embed. Preview instances
  // (data-preview="true") are analytics-silent, so a page with only preview
  // widgets must NOT bootstrap Rudderstack or fetch geoip at all.
  let hasNonPreviewNode = false;
  uniqueNodes.forEach((node) => {
    if (node.getAttribute("data-preview") !== "true") hasNonPreviewNode = true;
  });

  if (hasNonPreviewNode) {
    initializeRudderAnalytics();
  }

  // One shared geoip fetch for the whole page (also reused by AnalyticsProvider).
  const geoipPromise = hasNonPreviewNode ? getSharedGeoIp() : Promise.resolve(null);

  for (const node of uniqueNodes) {
    node.setAttribute("data-cxr-status", "loading");
    const instanceId = getOrSetInstanceId(node);
    // Hoisted above the try so the catch block (and its pixel report) can
    // still identify the tag even when the failure happens before the rest
    // of the per-node body runs.
    const tagId = getHostMacro("tagId") ?? node.getAttribute("data-tag-id");

    try {
      // Single widget per page (see host-macro design): the loader-src `tagId`
      // wins when present; otherwise fall back to the per-div data-tag-id.
      // Per-div initial-volume fallback. The page-global GIV script param wins
      // (resolved in StrategyProvider); this is the per-instance fallback, read
      // here where the DOM node is available. Raw string — validated downstream.
      const dataGiv = node.getAttribute("data-giv");
      // Dashboard preview mode: keep this instance analytics-silent. When set,
      // TAG_INIT (and the whole Rudderstack/geoip bootstrap downstream) is
      // skipped and the widget waits for a `window.cxr.setPreviewConfig` push.
      const preview = node.getAttribute("data-preview") === "true";

      // Wait for geoip and per-tagId visit_id, then send TAG_INIT (once per tagId
      // per page). If visit_id fails to load, still fire TAG_INIT with geoip only.
      if (!preview && !tagIdsWithTagInit.has(tagId)) {
        tagIdsWithTagInit.add(tagId);
        const visitIdPromiseForTag = getVisitIdPromise(tagId);
        Promise.all([geoipPromise, visitIdPromiseForTag.catch(() => undefined)]).then(([geoip, visitId]) => {
          let eventDetails = visitId ? { visit_id: visitId } : {};
          // During initialization, the `passback` value is set to `0` because the user has not yet interacted with the widget.
          eventDetails = { ...eventDetails, passback: 0 };
          sendEventLogFromGlobals(
            {
              eventName: EVENT.TAG_INIT,
              eventDetails,
              tagDetails: { tag_id: tagId },
            },
            { deviceDetails: enrichDeviceDetailsWithGeoIp(getDeviceDetailsSnapshot(), geoip), userId, windowLink }
          );
          // Pixel-side mirror of TAG_INIT: fire px-ti from the same site so the
          // pixel funnel matches the Rudderstack tag_init. brand_id isn't
          // resolved yet here (the tag fetch runs downstream), so it falls back
          // to "1" in the path, per the pixel spec. Best-effort — never blocks
          // analytics dispatch.
          fireTagInitPixel({ tagId, passback: 0 });
        });
      }

      // Register DOM id as alias so window.cxr.expand("gen-ext-2") works
      if (node.id) {
        getInstanceRegistry().registerAlias(node.id, instanceId);
      }

      // Resolve the slot layout up front so we can decide whether this is the
      // stacked 320×100 variant before mounting.
      //
      // offsetWidth/Height report the element's own layout box and are immune to
      // ancestor CSS transforms. getBoundingClientRect() reports the post-transform
      // box, which some hosts inflate: Infolinks wraps our slot in
      // `transform: scale(...)` containers, so a 320×100 slot measures as ~344×204
      // there. resolveAdLayout requires an exact size match, so the inflated numbers
      // resolve to Unknown and the stacked variant fails to activate even when
      // gen_variant=stacked and the tag id both match.
      const resolvedLayout = resolveAdLayout(node.offsetWidth, node.offsetHeight);

      // Stacked variant: split the slot into two equal halves — our widget mounts
      // into the top row (as the config's `ourLayout`); Infolinks fills the bottom.
      const stackedConfig = resolveStackedLayout(tagId, resolvedLayout);
      const mountHost = stackedConfig ? setupStackedRows(node, stackedConfig) : node;
      const adLayout = stackedConfig ? stackedConfig.ourLayout : resolvedLayout;

      // Enable Shadow DOM by default for style isolation.
      const DEFAULT_SHADOW_DOM_SUPPORT = true;

      // Shadow DOM remains enabled unless explicitly disabled.
      const useShadowDom = DEFAULT_SHADOW_DOM_SUPPORT || node.getAttribute(DATA_ATTR_SHADOW_DOM_OPT_IN) === "true";
      const shadowConfig = useShadowDom ? await mountWithShadow(mountHost) : mountDirect(mountHost);
      const { mountTarget } = shadowConfig;

      const root = createRoot(mountTarget);
      // Guards against a double root.unmount(), which React 18+ throws on:
      // the MutationObserver callback below, the registered `destroy` control
      // (called by AdProvider's passback AND by PixelReporter's best-effort
      // teardown on a pre-mount failure), and a node-removal race could
      // otherwise all fire for the same instance.
      let destroyed = false;
      const observer = new MutationObserver(function () {
        if (!document.contains(node) && !destroyed) {
          destroyed = true;
          root.unmount();
          observer.disconnect();
          node.setAttribute("data-cxr-status", "pending");
        }
      });
      // Observe the parent so we detect when `node` itself is removed.
      // In shadow DOM mode React renders into the shadow root — not into `node`
      // directly — so observing `node`'s own childList would never fire.
      const observeTarget = node.parentNode ?? document.body;
      observer.observe(observeTarget, { childList: true });

      // Loader-owned teardown control, invoked by AdProvider after
      // infolinksImpression fires its events, and by PixelReporter on any
      // reported failure (see observability/pixel-reporter.ts). Disconnect
      // the observer first so its own unmount path can't race this one.
      getInstanceRegistry().register(instanceId, {
        destroy: () => {
          if (destroyed) return;
          destroyed = true;
          observer.disconnect();
          root.unmount();
          if (node.parentNode) node.parentNode.removeChild(node);
          node.setAttribute("data-cxr-status", "pending");
        },
      });

      root.render(
        <SafeSuspense
          fallback={null}
          errorFallback={null}
          onError={(error) => {
            PixelReporter.getInstance().report(instanceId, "render", "render_error", {
              tagId,
              width: node.offsetWidth,
              height: node.offsetHeight,
              error,
            });
          }}>
          <App
            tagId={tagId}
            rootTagId={instanceId}
            adLayout={adLayout}
            instanceId={instanceId}
            preview={preview}
            dataGiv={dataGiv}
            shadowConfig={shadowConfig.enabled ? shadowConfig : null}
          />
        </SafeSuspense>
      );

      node.setAttribute("data-cxr-status", "done");
    } catch (error) {
      console.error(`[contextual-reels] Failed to initialize widget instance "${instanceId}":`, error);
      node.setAttribute("data-cxr-status", "pending");
      PixelReporter.getInstance().report(instanceId, "init", "initialization_error", {
        tagId,
        width: node.offsetWidth,
        height: node.offsetHeight,
        error,
      });
    }
  }
}

// Build and expose the public API before any instances boot
window.cxr = buildPublicApi(getInstanceRegistry());

// Iframe embeds: the parent page can't reach this window's `window.cxr`, so
// accept `{ type: 'cxr:infolinksImpression', instanceId? }` via postMessage.
installMessageBridge(window.cxr);

init();
