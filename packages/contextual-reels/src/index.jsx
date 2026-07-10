import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";

import "@cxr/styles/tailwind.css";

import { initializeRudderAnalytics } from "@cxr/analytics/rudderstack";
import { EVENT, sendEventLogFromGlobals } from "@cxr/analytics/analytics";
import { getDeviceDetailsSnapshot } from "@cxr/platform/device";
import { userId } from "@cxr/userId";
import { windowLink } from "@cxr/platform/topWindow";
import { resolveAdLayout, resolveStackedLayout } from "@cxr/config";
import { setupStackedRows } from "@cxr/utils/infolinks";
import { buildPublicApi } from "@cxr/publicApi";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { setupCxrShadowDOM } from "@cxr/shadow-dom";
import { DATA_ATTR_SHADOW_DOM_OPT_IN } from "@cxr/shadow-dom-config";
import { ShadowDomProvider } from "@cxr/shadow-dom-context";
import { getHostMacro } from "@cxr/hostMacros";

// New TypeScript App with provider stack + native feed engine.
const App = lazy(() => import("./app/App"));

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

  if (uniqueNodes.size > 0) {
    initializeRudderAnalytics();
  }

  for (const node of uniqueNodes) {
    node.setAttribute("data-cxr-status", "loading");

    const instanceId = getOrSetInstanceId(node);
    // Single widget per page (see host-macro design): the loader-src `tagId`
    // wins when present; otherwise fall back to the per-div data-tag-id.
    const tagId = getHostMacro("tagId") ?? node.getAttribute("data-tag-id");
    let customizationDetails = {};
    try {
      customizationDetails = JSON.parse(node.getAttribute("data-customization-details") ?? "{}") ?? {};
    } catch {
      // malformed JSON — proceed with empty customization
    }

    sendEventLogFromGlobals(
      { eventName: EVENT.TAG_INIT, eventDetails: {}, tagDetails: { tag_id: tagId } },
      { deviceDetails: getDeviceDetailsSnapshot(), userId, windowLink }
    );

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
    const observer = new MutationObserver(function () {
      if (!document.contains(node)) {
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

    root.render(
      <ShadowDomProvider config={shadowConfig.enabled ? shadowConfig : null}>
        <Suspense fallback={null}>
          <App
            tagId={tagId}
            rootTagId={instanceId}
            customizationDetails={customizationDetails}
            adLayout={adLayout}
            instanceId={instanceId}
          />
        </Suspense>
      </ShadowDomProvider>
    );

    node.setAttribute("data-cxr-status", "done");
  }
}

// Build and expose the public API before any instances boot
window.cxr = buildPublicApi(getInstanceRegistry());

init();
