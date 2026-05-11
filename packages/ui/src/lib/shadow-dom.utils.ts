/**
 * Resolves the correct container for portaling Shadcn/Radix components.
 *
 * Priority:
 * 1. If Shadow DOM is disabled → fallback to document.body.
 * 2. If overlay mode is active (carousel/feed/PiP) → use overlay shadow root.
 *    - Prefer a dedicated [data-portal-container] if available.
 * 3. Otherwise (standard wall mode) → use main host shadow root.
 * 4. Final fallback → document.body.
 */
export function getRootContainer(): HTMLElement | ShadowRoot | null {
  // Return early if not running in a browser (e.g., SSR)
  if (typeof window === "undefined" || !window.document) {
    return null;
  }

  // Main SDK host element
  const hostElement = document.querySelector<HTMLElement>("[data-genuin-host]");

  // Shadow DOM disabled
  if (!hostElement) {
    return document.body;
  }

  // Overlay host (carousel / feed / PiP modes)
  const overlayHost = document.querySelector<HTMLElement>("[data-genuin-overlay-host]");

  const overlayShadowRoot = overlayHost?.shadowRoot;

  if (overlayShadowRoot) {
    const portalContainer = overlayShadowRoot.querySelector<HTMLElement>("[data-portal-container]");

    return portalContainer ?? overlayShadowRoot;
  }

  // Standard wall mode
  if (hostElement.shadowRoot) {
    return hostElement.shadowRoot;
  }

  // Safe fallback
  return document.body;
}
