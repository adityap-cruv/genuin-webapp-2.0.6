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
] as const;

/**
 * Cache for overlay shadow host (one per document)
 */
const overlayShadowHostCache = new WeakMap<
  Document,
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
  // This class ensures that the feed view navigation button stays within the screen bounds.
  root.classList.add("gencl:overflow-clip");

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

  if (!isInShadow && container.parentNode) {
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
 * Creates or retrieves the shared overlay shadow host
 * This is a separate shadow DOM for overlay elements (dialogs, tooltips, modals)
 * It derives styles from the main shadow root
 */
export function getOrCreateOverlayShadowHost(): {
  host: HTMLElement;
  shadowRoot: ShadowRoot;
} {
  const doc = document;

  // Check cache first
  let cached = overlayShadowHostCache.get(doc);

  if (!cached || !doc.body.contains(cached.host)) {
    // Create new shadow host for overlays
    const host = document.createElement("div");
    host.setAttribute("data-genuin-overlay-host", "true");
    // Critical styles for the host (max z-index to stay on top)
    host.style.position = "fixed";
    host.style.top = "0";
    host.style.left = "0";
    host.style.width = "100%";
    host.style.height = "100%";
    host.style.border = "none";

    host.classList.add("gen-sdk-root-portal");

    // Append to body
    doc.body.appendChild(host);

    // Attach shadow root
    const shadowRoot = host.attachShadow({ mode: "open" });

    // First, copy styles from main embed's shadow DOM (if exists)
    const mainShadowHost = doc.querySelector("[data-genuin-host]");
    if (mainShadowHost?.shadowRoot) {
      copyStylesBetweenShadowRoots(mainShadowHost.shadowRoot, shadowRoot);
      console.log(
        "✅ Copied styles from main shadow root to overlay shadow root",
      );
    }

    // Then, ensure all required styles from document are present
    void ensureStylesInShadowRoot(shadowRoot);

    // Create portal container for overlay content
    const portalContainer = document.createElement("div");
    portalContainer.setAttribute("data-portal-container", "true");
    portalContainer.style.position = "relative";
    portalContainer.style.width = "100%";
    portalContainer.style.height = "100%";
    shadowRoot.appendChild(portalContainer);

    // Cache for reuse
    cached = { host, shadowRoot };
    overlayShadowHostCache.set(doc, cached);
  }

  return cached;
}

/**
 * Gets the main shadow root for the embed (if exists)
 */
export function getMainShadowRoot(): ShadowRoot | null {
  const mainShadowHost = document.querySelector("[data-genuin-host]");
  return mainShadowHost?.shadowRoot || null;
}

/**
 * Gets the overlay shadow root (if exists)
 */
export function getOverlayShadowRoot(): ShadowRoot | null {
  const cached = overlayShadowHostCache.get(document);
  return cached?.shadowRoot || null;
}

/**
 * Cleans up the overlay shadow host
 * Call this when all embeds are destroyed
 */
export function cleanupOverlayShadowHost(): void {
  const cached = overlayShadowHostCache.get(document);
  if (cached) {
    cached.host.remove();
    overlayShadowHostCache.delete(document);
    console.log("✅ Cleaned up overlay shadow host");
  }
}
