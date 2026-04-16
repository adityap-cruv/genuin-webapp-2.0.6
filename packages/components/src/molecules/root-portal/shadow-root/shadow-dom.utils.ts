// shadow-dom.utils.ts
// Centralized Shadow DOM management for main embed and overlay elements

import { hoistTailwindPropertyAtRulesFromShadowRoot } from "./hoist-tailwind-property-rules";

interface StyleRequirement {
  name: string;
  selector: string;
  check: (el: Element) => boolean;
}

/**
 * Style requirements that need to be present in shadow DOM
 * Add new style types here to automatically include them
 */
const REQUIRED_STYLES: StyleRequirement[] = [
  {
    name: "sonner",
    selector: "style",
    check: (el: Element) =>
      (el as HTMLStyleElement).textContent?.includes("sonner-toaster") || false,
  },
  {
    name: "gencl",
    selector: "style",
    check: (el: Element) =>
      (el as HTMLStyleElement).textContent?.includes("gencl:") || false,
  },
  {
    name: "gen-ad",
    selector: 'link[rel="stylesheet"]',
    check: (el: Element) =>
      (el as HTMLLinkElement).href?.includes("gen_ad.min.css") || false,
  },
] as const;

/**
 * Cache for overlay shadow hosts, keyed by portalKey.
 * Each distinct portalKey gets its own host element and shadow root so that
 * style props (e.g. PipView height:0px vs ExpandView height:812px) are fully
 * isolated and can never overwrite each other.
 */
const overlayShadowHostCache = new Map<
  string,
  {
    host: HTMLElement;
    shadowRoot: ShadowRoot;
  }
>();

/**
 * Ensures shadow root has all required styles (idempotent)
 * Can be called multiple times safely - checks before cloning
 */
export async function ensureStylesInShadowRoot(
  shadowRoot: ShadowRoot,
): Promise<void> {
  const cssURL = window.genuin?.cssUrl;

  if (cssURL) {
    const resolvedCssUrl = new URL(cssURL, window.location.href).href;
    const existingCssLink = Array.from(
      shadowRoot.querySelectorAll('link[rel="stylesheet"]'),
    ).find(
      (styleLink) => (styleLink as HTMLLinkElement).href === resolvedCssUrl,
    );

    if (!existingCssLink) {
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = cssURL;
      shadowRoot.appendChild(cssLink);
      console.log("✅ Added web-sdk stylesheet from cssUrl to shadow root");
    }

    // Fetch all @property rules from the CSS URL and inject them into this
    // shadow root with inherits: true. This must complete before React renders
    // so that CSS custom properties have their initial values available.
    await hoistTailwindPropertyAtRulesFromShadowRoot(shadowRoot);
  } else {
    console.warn(
      "⚠️ No cssUrl found in window.genuin. Required styles may not be applied to shadow root.",
    );
  }

  REQUIRED_STYLES.forEach(({ name, selector, check }) => {
    // Check if this style type already exists in shadow root
    const existsInShadow = Array.from(
      shadowRoot.querySelectorAll(selector),
    ).some(check);

    if (!existsInShadow) {
      // Find and clone matching styles from document
      const matchingStyles = Array.from(
        document.querySelectorAll(selector),
      ).filter(check);

      matchingStyles.forEach((style) => {
        shadowRoot.appendChild(style.cloneNode(true));
      });

      if (matchingStyles.length > 0) {
        console.log(
          `✅ Cloned ${matchingStyles.length} ${name} styles to shadow root`,
        );
      }
    }
  });
}

/**
 * Creates a shadow root element with proper attributes and styles
 */
function createShadowRoot(container: HTMLElement): HTMLElement {
  const root = document.createElement("div");
  // Distinguishes each shadow root in multi-embed cases.
  root.id = container.id;
  root.className = container.className;

  // Copy all non-id/class attributes from container to shadow root
  container.getAttributeNames().forEach((attrName) => {
    if (attrName !== "id" && attrName !== "class") {
      const attrValue = container.getAttribute(attrName);
      if (attrValue !== null) {
        root.setAttribute(attrName, attrValue);
      }
    }
  });

  const originalStyle = container.getAttribute("style");
  if (originalStyle) {
    root.setAttribute("style", originalStyle);
  }
  return root;
}

/**
 * Resets container styles to fill shadow host
 */
function resetContainerStyles(container: HTMLElement): void {
  Object.assign(container.style, {
    width: "100%",
    height: "100%",
    margin: "0",
    position: "relative",
    border: "none",
  });
}

/**
 * Copies all styles from one shadow root to another
 */
function copyStylesBetweenShadowRoots(
  sourceShadowRoot: ShadowRoot,
  targetShadowRoot: ShadowRoot,
): void {
  const styles = sourceShadowRoot.querySelectorAll(
    'link[rel="stylesheet"], style',
  );

  styles.forEach((styleElement) => {
    // Only clone if not already present
    const styleContent =
      styleElement.tagName === "STYLE"
        ? (styleElement as HTMLStyleElement).textContent
        : (styleElement as HTMLLinkElement).href;

    const alreadyExists = Array.from(
      targetShadowRoot.querySelectorAll("link, style"),
    ).some((existingStyle) => {
      if (
        existingStyle.tagName === "STYLE" &&
        styleElement.tagName === "STYLE"
      ) {
        return (existingStyle as HTMLStyleElement).textContent === styleContent;
      }
      if (existingStyle.tagName === "LINK" && styleElement.tagName === "LINK") {
        return (existingStyle as HTMLLinkElement).href === styleContent;
      }
      return false;
    });

    if (!alreadyExists) {
      targetShadowRoot.appendChild(styleElement.cloneNode(true));
    }
  });
}

/**
 * Sets up shadow DOM for the main embed container
 * Returns the shadow root that was created or already exists
 */
export async function setupMainShadowDOM(
  container: HTMLElement,
): Promise<HTMLElement> {
  const rootNode = container.getRootNode();
  const isInShadow = rootNode instanceof ShadowRoot;
  let shadowRoot: ShadowRoot | null = null;
  let root: HTMLElement | null = null;

  if (!isInShadow && container.shadowRoot) {
    // Shadow root already attached to this container (e.g. re-init or double call).
    // Reuse the existing inner root element rather than calling attachShadow() again,
    // which would throw a DOMException in all browsers.
    shadowRoot = container.shadowRoot;
    root =
      shadowRoot.querySelector<HTMLElement>(`#${CSS.escape(container.id)}`) ??
      (shadowRoot.firstElementChild as HTMLElement | null);
  } else if (!isInShadow && container.parentNode) {
    // Create new shadow DOM
    root = createShadowRoot(container);
    // Some external dependencies apply styles directly to the host (e.g. `:host { margin-left/right: auto; }`),
    // which can break the embed layout.
    // To avoid this, reset the container margins to `0px`,
    // but only if the client hasn’t explicitly set them.
    if (!container.style.marginLeft) {
      container.style.marginLeft = "0px";
    }
    if (!container.style.marginRight) {
      container.style.marginRight = "0px";
    }
    container.setAttribute("data-genuin-host", "true");
    shadowRoot = container.attachShadow({ mode: "open" });
    shadowRoot.appendChild(root);
    resetContainerStyles(root);
  } else if (isInShadow) {
    // Use existing shadow root
    shadowRoot = rootNode as ShadowRoot;
  }

  // Ensure all required styles exist
  if (shadowRoot) {
    await ensureStylesInShadowRoot(shadowRoot);
  }

  return root || container;
}

/**
 * Creates or retrieves a keyed overlay shadow host.
 *
 * Each distinct `portalKey` gets its own `<div data-genuin-overlay-host>`
 * element and shadow root, so that style props applied by different
 * RootPortal instances (e.g. PipView height:0px vs ExpandView height:812px)
 * are fully isolated and can never overwrite each other.
 *
 * @param portalKey - Unique identifier for this portal's host (default: "default")
 */
export function getOrCreateOverlayShadowHost(portalKey: string = "default"): {
  host: HTMLElement;
  shadowRoot: ShadowRoot;
} {
  const doc = document;

  // Return the existing host+shadow root if already created for this portalKey
  let cachedShadow = overlayShadowHostCache.get(portalKey);
  if (cachedShadow) {
    return { host: cachedShadow.host, shadowRoot: cachedShadow.shadowRoot };
  }

  // Create a new shadow host for this portalKey
  const host = document.createElement("div");
  host.setAttribute("data-genuin-overlay-host", "true");
  host.setAttribute("data-portal-key", portalKey);
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  host.style.width = "100%";
  host.style.height = "100%";
  host.style.border = "none";

  host.classList.add("gen-sdk-root-portal");

  doc.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });

  // Copy styles from the main embed's shadow DOM (if exists)
  const mainShadowHost = doc.querySelector("[data-genuin-host]");
  if (mainShadowHost?.shadowRoot) {
    copyStylesBetweenShadowRoots(mainShadowHost.shadowRoot, shadowRoot);
    console.log(
      "✅ Copied styles from main shadow root to overlay shadow root",
    );
  }

  void ensureStylesInShadowRoot(shadowRoot);

  // Create the portal container for this host's content
  const portalContainer = document.createElement("div");
  portalContainer.setAttribute("data-portal-container", "true");
  portalContainer.style.position = "relative";
  portalContainer.style.width = "100%";
  portalContainer.style.height = "100%";
  shadowRoot.appendChild(portalContainer);

  overlayShadowHostCache.set(portalKey, { host, shadowRoot });
  return { host, shadowRoot };
}

/**
 * Cleans up overlay shadow host(s).
 * Call this when the corresponding RootPortal unmounts.
 *
 * @param portalKey - Key matching the one passed to getOrCreateOverlayShadowHost.
 *   If omitted, all tracked overlay shadow hosts are removed (global teardown).
 */
export function cleanupOverlayShadowHost(portalKey?: string): void {
  if (!portalKey) {
    // No portalKey provided — called from a global teardown (e.g. React utils cleanup).
    // Remove every overlay shadow host that is currently tracked.
    overlayShadowHostCache.forEach((value, key) => {
      console.log(key, value.host, value.shadowRoot);
      value.host.remove();
      overlayShadowHostCache.delete(key);
    });
    return;
  }
  const cachedShadow = overlayShadowHostCache.get(portalKey);
  if (!cachedShadow) return;
  cachedShadow.host.remove();
  overlayShadowHostCache.delete(portalKey);
  console.log(`✅ Cleaned up overlay shadow host (key: ${portalKey})`);
}
