// shadow-dom.utils.ts
// Centralized Shadow DOM management for main embed and overlay elements

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
    name: "web-sdk",
    selector: 'link[href*="web-sdk"][rel="stylesheet"]',
    check: (el: Element) => (el as HTMLLinkElement).href.includes("web-sdk"),
  },
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
function ensureStylesInShadowRoot(shadowRoot: ShadowRoot): void {
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
export function setupMainShadowDOM(container: HTMLElement): HTMLElement {
  const rootNode = container.getRootNode();
  const isInShadow = rootNode instanceof ShadowRoot;
  let shadowRoot: ShadowRoot | null = null;
  let root: HTMLElement | null = null;

  if (!isInShadow && container.parentNode) {
    // Create new shadow DOM
    root = createShadowRoot(container);
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
    ensureStylesInShadowRoot(shadowRoot);
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
    ensureStylesInShadowRoot(shadowRoot);

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
 * Gets the appropriate container for portaling Shadcn/Radix components
 * Returns overlay shadow root if shadow DOM is enabled, otherwise document.body
 */
export function getRootContainer(
  isShadowDomEnabled: boolean,
): HTMLElement | ShadowRoot {
  if (!isShadowDomEnabled) {
    return document.body;
  }

  const cached = overlayShadowHostCache.get(document);
  if (cached?.shadowRoot) {
    const portalContainer = cached.shadowRoot.querySelector(
      "[data-portal-container]",
    );
    return (portalContainer as HTMLElement) || cached.shadowRoot;
  }

  return document.body;
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
