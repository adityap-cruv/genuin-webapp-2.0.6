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
    check: (el: Element) => (el as HTMLStyleElement).textContent?.includes("sonner-toaster") || false,
  },
  {
    name: "gencl",
    selector: "style",
    check: (el: Element) => (el as HTMLStyleElement).textContent?.includes("gencl:") || false,
  },
  {
    name: "gen-ad",
    selector: 'link[rel="stylesheet"]',
    check: (el: Element) => (el as HTMLLinkElement).href?.includes("gen_ad.min.css") || false,
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
export async function ensureStylesInShadowRoot(shadowRoot: ShadowRoot): Promise<void> {
  // Bail if the host was removed from the DOM before we get to mutate it.
  // Prevents "removeChild: not a child" crashes when React unmounts nodes
  // concurrently with async style injection.
  if (!shadowRoot.host?.isConnected) return;

  const cssURL = window.genuin?.cssUrl;

  if (cssURL) {
    const resolvedCssUrl = new URL(cssURL, window.location.href).href;
    const existingCssLink = Array.from(shadowRoot.querySelectorAll('link[rel="stylesheet"]')).find(
      (styleLink) => (styleLink as HTMLLinkElement).href === resolvedCssUrl
    );

    if (!existingCssLink) {
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = cssURL;
      shadowRoot.appendChild(cssLink);
    }

    // Fetch all @property rules from the CSS URL and inject them into this
    // shadow root with inherits: true. This must complete before React renders
    // so that CSS custom properties have their initial values available.
    await hoistTailwindPropertyAtRulesFromShadowRoot(shadowRoot);
    // Re-check after await — host may have been removed while we were fetching.
    if (!shadowRoot.host?.isConnected) return;
  } else {
    console.warn("⚠️ No cssUrl found in window.genuin. Required styles may not be applied to shadow root.");
  }

  REQUIRED_STYLES.forEach(({ selector, check }) => {
    // Check if this style type already exists in shadow root
    const existsInShadow = Array.from(shadowRoot.querySelectorAll(selector)).some(check);

    if (!existsInShadow) {
      // Find and clone matching styles from document
      const matchingStyles = Array.from(document.querySelectorAll(selector)).filter(check);

      matchingStyles.forEach((style) => {
        shadowRoot.appendChild(style.cloneNode(true));
      });

      // matchingStyles cloned into shadow root
    }
  });
}

/**
 * Inline CSS property values that hide an element. A publisher may hide the embed
 * container (e.g. `visibility:hidden` / `display:none` / `opacity:0`) to reclaim
 * layout space when the embed is only used for expand-on-load. The expand overlay
 * renders in its own body-level fixed shadow host (`getOrCreateOverlayShadowHost`)
 * and must stay visible regardless — so we filter these hiding declarations out at
 * the copy boundary (see `copyClassAndStyle`) instead of mutating the publisher's
 * original container. Nothing to override, nothing to restore.
 */
const HIDING_STYLE_VALUES: Record<string, string[]> = {
  visibility: ["hidden", "collapse"],
  display: ["none"],
  opacity: ["0"],
};

/*
 * CSS declarations that hide an element. When the embed container is hidden by the host page
 * (e.g. `display:none` so it takes no layout space until expanded), we must NOT propagate that
 * hiding onto the expand view's overlay host / shadow root — otherwise the expand overlay would
 * inherit the container's hidden state and never appear.
 *
 * The container's own styles are always respected and left untouched; only the *copy* of those
 * styles onto the overlay drops these declarations (see copyClassAndStyle / createShadowRoot).
 *
 * Each predicate normalizes (trim + lowercase) before matching, and `opacity` is parsed
 * numerically so `0`, `0.0`, `0.00`, and `0%` are all treated as hidden.
 */
const HIDING_DECLARATION_PREDICATES: Record<string, (value: string) => boolean> = {
  display: (value) => value.trim().toLowerCase() === "none",
  visibility: (value) => ["hidden", "collapse"].includes(value.trim().toLowerCase()),
  opacity: (value) => {
    const parsed = Number.parseFloat(value);
    return !Number.isNaN(parsed) && parsed <= 0;
  },
};

/**
 * Returns true when the given CSS property/value pair would hide an element
 * (`display:none`, `visibility:hidden|collapse`, or `opacity:0`). Used to filter such
 * declarations out when copying container styles onto the expand view's overlay.
 */
export function isHidingDeclaration(prop: string, value: string): boolean {
  return HIDING_DECLARATION_PREDICATES[prop]?.(value) ?? false;
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
    // Copy the container's inline styles onto the inner root, but drop hiding declarations
    // (display:none, visibility:hidden, opacity:0). The container itself keeps them — we only
    // avoid propagating the hidden state into the shadow tree the embed renders in.
    container.style.cssText
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .forEach((declaration) => {
        const separatorIndex = declaration.indexOf(":");
        if (separatorIndex === -1) return;
        const prop = declaration.slice(0, separatorIndex).trim();
        const value = declaration.slice(separatorIndex + 1).trim();
        if (isHidingDeclaration(prop, value)) return;
        root.style.setProperty(prop, value, container.style.getPropertyPriority(prop));
      });
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
 * Returns the comparable key for a style/link element: a <style>'s text content or a
 * <link>'s href. Used to detect equivalent styles across shadow roots.
 */
function styleKey(styleElement: Element): string | null {
  return styleElement.tagName === "STYLE"
    ? (styleElement as HTMLStyleElement).textContent
    : (styleElement as HTMLLinkElement).href;
}

/**
 * Copies all styles from one shadow root to another, giving the source ("main") styles
 * higher cascade priority than any matching styles already in the target.
 *
 * For each source style: if an equivalent already exists in the target (same <style>
 * text or same <link> href) it is removed, then the source clone is appended LAST. The
 * later DOM position means the main embed's styles win over the overlay's own base
 * styles for equal specificity.
 */
function copyStylesBetweenShadowRoots(sourceShadowRoot: ShadowRoot, targetShadowRoot: ShadowRoot): void {
  const styles = sourceShadowRoot.querySelectorAll('link[rel="stylesheet"], style');

  styles.forEach((styleElement) => {
    const sourceKey = styleKey(styleElement);

    // Remove any equivalent style already present in the target so the main embed's
    // version is the one that takes effect (replace), then append it last (priority).
    Array.from(targetShadowRoot.querySelectorAll("link, style")).forEach((existingStyle) => {
      if (existingStyle.tagName === styleElement.tagName && styleKey(existingStyle) === sourceKey) {
        existingStyle.remove();
      }
    });

    targetShadowRoot.appendChild(styleElement.cloneNode(true));
  });
}

/**
 * Copies the className and inline `style` attribute from a source element onto a target.
 * The source ("main") values take priority: source classes are merged on top of the
 * target's existing classes, and source inline-style declarations override matching
 * target ones while leaving the target's other inline styles intact.
 *
 * @param mode - "merge" keeps the target's existing classes and adds the source's on top
 *   (used for the overlay host, which has its own positioning classes/styles to retain);
 *   "replace" mirrors the source classes onto the target.
 */
function copyClassAndStyle(source: HTMLElement, target: HTMLElement, mode: "merge" | "replace"): void {
  const sourceClasses = source.classList;
  if (mode === "replace") {
    target.className = source.className;
  } else {
    sourceClasses.forEach((cls) => target.classList.add(cls));
  }

  // Merge inline-style declarations: source wins on conflicts, target keeps the rest.
  // Hiding declarations (display:none, visibility:hidden, opacity:0) are skipped so a
  // host page that hides the container does not also hide the copied-onto expand overlay.
  const sourceStyle = source.style;
  for (let i = 0; i < sourceStyle.length; i++) {
    const prop = sourceStyle.item(i);
    const value = sourceStyle.getPropertyValue(prop);
    if (isHidingDeclaration(prop, value)) continue;
    target.style.setProperty(prop, value, sourceStyle.getPropertyPriority(prop));
  }
}

/**
 * Sets up shadow DOM for the main embed container.
 * Returns the inner element that React should mount into.
 * If the host element has no `id`, one is auto-generated and assigned.
 *
 * The container's own hiding styles (display:none, visibility:hidden, opacity:0) are
 * respected and left untouched. They are filtered out only when copied onto the expand
 * view's overlay (see copyClassAndStyle / createShadowRoot), so the overlay stays visible.
 */
export async function setupMainShadowDOM(container: HTMLElement): Promise<HTMLElement> {
  if (!container.id) {
    container.id = `genuin-host-${Math.random().toString(36).slice(2, 9)}`;
  }

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

  // Propagate gen-sdk-class to the inner root so CSS scoping rules apply inside the shadow DOM.
  root?.classList.add("gen-sdk-class");

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
  const cachedShadow = overlayShadowHostCache.get(portalKey);
  if (cachedShadow) {
    return { host: cachedShadow.host, shadowRoot: cachedShadow.shadowRoot };
  }

  // Create a new shadow host for this portalKey
  const host = document.createElement("div");
  host.id = `genuin-overlay-host-${portalKey}`;
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

  // Ensure the overlay's own base styles are present first, so the main embed's styles
  // (copied below) land after them in the DOM and therefore win the cascade.
  void ensureStylesInShadowRoot(shadowRoot);

  // Create the portal container for this host's content
  const portalContainer = document.createElement("div");
  portalContainer.setAttribute("data-portal-container", "true");
  portalContainer.style.position = "relative";
  portalContainer.style.width = "100%";
  portalContainer.style.height = "100%";
  shadowRoot.appendChild(portalContainer);

  // Mirror the main embed's shadow DOM so the overlay renders with identical styling.
  // The main embed's styles, host attributes, and inner-root attributes take priority.
  const mainShadowHost = doc.querySelector<HTMLElement>("[data-genuin-host]");
  if (mainShadowHost?.shadowRoot) {
    // 1. Styles: main embed's <style>/<link> override and sit after the overlay's base.
    copyStylesBetweenShadowRoots(mainShadowHost.shadowRoot, shadowRoot);

    // 2. Host: merge the main host's className + inline style onto the overlay host,
    //    keeping the overlay's own positioning classes/styles (gen-sdk-root-portal,
    //    position:fixed, full-screen sizing).
    copyClassAndStyle(mainShadowHost, host, "merge");

    // 3. Inner root: replicate the main shadow's inner root (the .gen-sdk-class element)
    //    className + inline style onto the overlay's portal container.
    const mainInnerRoot = mainShadowHost.shadowRoot.querySelector<HTMLElement>(".gen-sdk-class");
    if (mainInnerRoot) {
      copyClassAndStyle(mainInnerRoot, portalContainer, "merge");
    }
  }

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
      value.host.remove();
      overlayShadowHostCache.delete(key);
    });
    return;
  }
  const cachedShadow = overlayShadowHostCache.get(portalKey);
  if (!cachedShadow) return;
  cachedShadow.host.remove();
  overlayShadowHostCache.delete(portalKey);
}
