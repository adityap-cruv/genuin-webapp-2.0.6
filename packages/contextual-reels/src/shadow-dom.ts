/**
 * CXR-specific Shadow DOM setup.
 *
 * Called per .gen-ext node when data-shadow-dom="true".
 * Attaches a shadow root, injects CXR styles, and returns
 * a ShadowDomConfig describing the full shadow topology.
 */

import {
  DATA_ATTR_SHADOW_HOST,
  DATA_ATTR_SHADOW_MOUNT,
  DATA_ATTR_SHADOW_ROOT_CONTAINER,
  type ShadowDomConfig,
} from "@cxr/shadow-dom-config";
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/shadow-dom");

/** Module-level cache: CSS URL → Set of @property rule strings fetched. */
const cachedPropertyRules = new Map<string, Set<string>>();
/** Module-level cache: CSS URL → raw stylesheet text, reused to build the adopted sheet. */
const cachedCssText = new Map<string, string>();
/** Module-level cache: CSS URL → constructed stylesheet, shared across widget instances. */
const cachedStyleSheets = new Map<string, CSSStyleSheet>();
const pendingFetches = new Map<string, Promise<void>>();
const jsRegisteredNames = new Set<string>();

/** True when the browser supports constructable stylesheets + adoptedStyleSheets. */
function supportsConstructableStyleSheets(shadowRoot: ShadowRoot): boolean {
  return (
    typeof CSSStyleSheet === "function" &&
    typeof CSSStyleSheet.prototype.replaceSync === "function" &&
    "adoptedStyleSheets" in shadowRoot
  );
}

// ---------------------------------------------------------------------------
// @property hoisting
// ---------------------------------------------------------------------------

function collectPropertyRulesFromText(cssText: string): string[] {
  const rules: string[] = [];
  const re = /@property\s+[^{}]+\{[^{}]*\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cssText)) !== null) {
    if (m[0]) rules.push(m[0].trim());
  }
  return rules;
}

function getPropertyName(rule: string): string | null {
  const m = /@property\s+([^\s{]+)/.exec(rule);
  return m?.[1] ?? null;
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function registerPropertyGlobally(rule: string): void {
  const cssApi = CSS as typeof CSS & {
    registerProperty?: (def: { name: string; syntax: string; inherits: boolean; initialValue?: string }) => void;
  };
  if (typeof cssApi.registerProperty !== "function") return;

  const name = getPropertyName(rule);
  if (!name || jsRegisteredNames.has(name)) return;
  jsRegisteredNames.add(name);

  const bodyMatch = /@property\s+[^\s{]+\s*\{([\s\S]*?)\}/.exec(rule);
  if (!bodyMatch?.[1]) return;

  const descriptors = new Map<string, string>();
  for (const m of bodyMatch[1].matchAll(/([a-z-]+)\s*:\s*([^;]+);?/g)) {
    if (m[1] && m[2]) descriptors.set(m[1].trim(), m[2].trim());
  }

  const rawSyntax = descriptors.get("syntax");
  if (!rawSyntax) return;

  const syntax = stripQuotes(rawSyntax);
  const rawInitial = descriptors.get("initial-value");
  const initialValue = rawInitial ? stripQuotes(rawInitial) : undefined;
  const rawInherits = descriptors.get("inherits");
  const inherits = rawInherits?.trim() === "true";

  try {
    cssApi.registerProperty({
      name,
      syntax,
      inherits,
      ...(initialValue !== undefined ? { initialValue } : {}),
    });
  } catch {
    // Already registered or invalid syntax — ignore.
  }
}

/**
 * Reconstruct the stylesheet text from an already-loaded same-origin `<link>`'s
 * parsed CSSOM (`link.sheet.cssRules`). The head `<link data-genuin-cxr="css">`
 * has already downloaded these bytes, so reading them back from the CSSOM avoids
 * a second network transfer of the full stylesheet. Returns null when the sheet
 * isn't ready yet or its rules aren't readable (cross-origin / not parsed), so
 * the caller can fall back to fetch.
 */
function readCssTextFromLink(sourceLink: HTMLLinkElement | null): string | null {
  const sheet = sourceLink?.sheet;
  if (!sheet) return null;
  try {
    // Accessing cssRules throws SecurityError for cross-origin sheets; cxr.css is
    // same-origin with the loader, so this succeeds in production.
    const rules = sheet.cssRules;
    if (!rules || rules.length === 0) return null;
    let text = "";
    for (const rule of Array.from(rules)) text += rule.cssText + "\n";
    return text || null;
  } catch {
    return null;
  }
}

/**
 * Populate the CSS text + @property caches for a stylesheet URL.
 *
 * Fast path (production): read the text back from `sourceLink.sheet.cssRules` —
 * the head `<link>` already downloaded the bytes, so no second transfer. Falls
 * back to a network `fetch` only when the sheet's rules aren't readable yet.
 */
async function fetchAndCachePropertyRules(
  cssUrl: string,
  sourceLink?: HTMLLinkElement | null
): Promise<void> {
  const resolved = new URL(cssUrl, window.location.href).href;

  if (cachedPropertyRules.has(resolved)) return;

  // Fast path: reuse the already-loaded <link>'s CSSOM instead of re-fetching
  // the full stylesheet (a second transfer under a different HTTP-cache key).
  const linkText = readCssTextFromLink(sourceLink ?? null);
  if (linkText) {
    cachedCssText.set(resolved, linkText);
    const rules = new Set<string>();
    collectPropertyRulesFromText(linkText).forEach((r) => rules.add(r));
    cachedPropertyRules.set(resolved, rules);
    return;
  }

  const pending = pendingFetches.get(resolved);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const res = await fetch(resolved, { credentials: "omit" });
      if (!res.ok) return;
      const text = await res.text();
      // Cache the raw text so the shadow-root style can be built from the same fetch
      // instead of a second network request (a cloned <link>).
      cachedCssText.set(resolved, text);
      const rules = new Set<string>();
      collectPropertyRulesFromText(text).forEach((r) => rules.add(r));
      cachedPropertyRules.set(resolved, rules);
    } catch {
      // CORS / network — ignore.
    } finally {
      pendingFetches.delete(resolved);
    }
  })();

  pendingFetches.set(resolved, promise);
  return promise;
}

async function hoistPropertyRulesFromCssUrl(
  cssUrl: string,
  sourceLink?: HTMLLinkElement | null
): Promise<void> {
  await fetchAndCachePropertyRules(cssUrl, sourceLink);
  const resolved = new URL(cssUrl, window.location.href).href;
  cachedPropertyRules.get(resolved)?.forEach(registerPropertyGlobally);
}

// ---------------------------------------------------------------------------
// Style injection helpers
// ---------------------------------------------------------------------------

/**
 * Clone the production CXR CSS `<link>` into the shadow root. Fallback path used only
 * when constructable stylesheets are unavailable or the CSS text fetch failed — it costs
 * a second network request for the same file, which the adopt path avoids.
 */
function cloneCxrLinkIntoShadow(shadowRoot: ShadowRoot, sourceLink: HTMLLinkElement): void {
  const href = sourceLink.href;
  const alreadyInjected = Array.from(shadowRoot.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(
    (l) => l.href === href
  );
  if (!alreadyInjected) {
    shadowRoot.appendChild(sourceLink.cloneNode(true));
  }
}

/**
 * Apply the production CXR stylesheet to the shadow root by adopting the text the @property
 * hoist already fetches (via a shared constructable `CSSStyleSheet`) — avoids a second
 * network request. Falls back to cloning the `<link>` when constructable sheets are
 * unavailable or the fetch produced no text.
 */
async function applyProductionShadowStyle(shadowRoot: ShadowRoot, sourceLink: HTMLLinkElement): Promise<void> {
  const href = sourceLink.href;

  if (!supportsConstructableStyleSheets(shadowRoot)) {
    cloneCxrLinkIntoShadow(shadowRoot, sourceLink);
    return;
  }

  // Ensure the CSS text is available + cached (shared with the @property hoist).
  // Reads the already-loaded <link>'s CSSOM first; only fetches as a fallback.
  await fetchAndCachePropertyRules(href, sourceLink);
  const resolved = new URL(href, window.location.href).href;
  const text = cachedCssText.get(resolved);

  if (!text) {
    // Fetch failed (offline / CORS) — never leave the shadow root unstyled.
    cloneCxrLinkIntoShadow(shadowRoot, sourceLink);
    return;
  }

  let sheet = cachedStyleSheets.get(resolved);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(text);
    cachedStyleSheets.set(resolved, sheet);
  }

  // Idempotent: adopt only if this sheet isn't already applied to this root.
  if (!shadowRoot.adoptedStyleSheets.includes(sheet)) {
    shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, sheet];
  }
}

/**
 * Inject CXR styles into the shadow root.
 *
 * Dev mode: Vite injects styles as `<style>` tags into document.head — clone
 * any `<style>` whose textContent contains the "gencl\:" Tailwind prefix
 * (CSS escape notation: backslash + colon, as returned by style.textContent).
 *
 * Production mode: CSS is emitted as a separate file linked via
 * `<link data-genuin-cxr="css">`. Returns its href so the caller can apply the
 * stylesheet (via {@link applyProductionShadowStyle}) and hoist @property rules —
 * it does *not* clone the link here, to keep the single-fetch path.
 *
 * Returns the CSS href for the production apply + @property hoist, or null in dev mode.
 */
function injectCxrStyles(shadowRoot: ShadowRoot): string | null {
  // Production: return the href without cloning — the caller adopts the fetched text.
  const sourceLink = document.querySelector<HTMLLinkElement>('link[data-genuin-cxr="css"]');
  if (sourceLink) {
    return sourceLink.href;
  }

  // Dev mode: clone any <style> tags containing the "gencl\:" Tailwind prefix.
  // Vite injects CSS as inline style tags when running the dev server.
  // Tailwind v4 emits utility selectors as .gencl\:absolute (CSS escape notation),
  // which means style.textContent contains the literal backslash: "gencl\:".
  // The naive check for "gencl:" (without backslash) always fails because the DOM
  // preserves the raw CSS text including the backslash escape character.
  const devStyleTags = Array.from(document.querySelectorAll<HTMLStyleElement>("style")).filter((s) => {
    const text = s.textContent ?? "";
    return text.includes("gencl\\:") || text.includes("genai-sdk-container") || text.includes("gen-sdk-class");
  });

  if (devStyleTags.length === 0) {
    logger.warn("No CXR styles found in document. Styles may be missing in shadow root.");
    return null;
  }

  devStyleTags.forEach((style) => {
    // Idempotent: skip if an identical style block is already in the shadow root.
    const alreadyInjected = Array.from(shadowRoot.querySelectorAll<HTMLStyleElement>("style")).some(
      (s) => s.textContent === style.textContent
    );
    if (!alreadyInjected) {
      shadowRoot.appendChild(style.cloneNode(true));
    }

    // Dev parity with the production hoist path: register any @property rules
    // found in the cloned style text. Without this, registered custom props
    // (e.g. --cxr-animated-border-angle/--cxr-animated-border-opacity) stay untyped in dev shadow DOM and
    // their keyframe interpolation silently fails. registerPropertyGlobally is
    // idempotent (guards on jsRegisteredNames), so re-scanning is safe.
    const text = style.textContent;
    if (text) collectPropertyRulesFromText(text).forEach(registerPropertyGlobally);
  });

  return null;
}

/**
 * Clone gen_ad.min.css link from document.head into shadow root (idempotent).
 * GenAd renders into document.body portals but its CSS also needs to be
 * available inside the shadow root for any in-shadow ad UI elements.
 */
function injectGenAdCssLink(shadowRoot: ShadowRoot): void {
  const sourceLink = document.querySelector<HTMLLinkElement>('link[href*="gen_ad.min.css"]');
  if (!sourceLink) return;

  const href = sourceLink.href;
  const alreadyInjected = Array.from(shadowRoot.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(
    (l) => l.href === href
  );

  if (!alreadyInjected) {
    const clone = sourceLink.cloneNode(true) as HTMLLinkElement;
    shadowRoot.appendChild(clone);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Set up Shadow DOM for a .gen-ext host element.
 *
 * - Attaches a shadow root (open mode) if not already attached.
 * - Marks the host with data-cxr-shadow-host and the container with data-cxr-shadow-root.
 * - Injects CXR CSS and gen_ad.min.css links.
 * - Hoists Tailwind @property rules globally via CSS.registerProperty.
 * - Returns a ShadowDomConfig describing the full shadow topology.
 *
 * Idempotent: safe to call multiple times on the same node.
 */
/** Generate a stable id for a shadow host that has none. */
function ensureShadowHostId(node: HTMLElement): string {
  if (!node.id) {
    node.id = `cxr-shadow-host-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  }
  return node.id;
}

export async function setupCxrShadowDOM(node: HTMLElement): Promise<ShadowDomConfig> {
  // Reuse existing shadow root if already attached (idempotent).
  if (node.shadowRoot) {
    const existing = node.shadowRoot.querySelector<HTMLElement>(`[${DATA_ATTR_SHADOW_MOUNT}]`);
    if (existing) {
      return {
        enabled: true,
        hostElement: node,
        shadowRoot: node.shadowRoot,
        mountTarget: existing,
        shadowHostId: ensureShadowHostId(node),
      };
    }
  }

  // Guarantee host has an id before attaching shadow so GenAd can target it.
  const shadowHostId = ensureShadowHostId(node);

  // Attach shadow root.
  const shadowRoot = node.shadowRoot ?? node.attachShadow({ mode: "open" });

  // Mark the host element so external tooling can identify it.
  node.setAttribute(DATA_ATTR_SHADOW_HOST, "true");

  // Inner container that sits as the direct child of the shadow root.
  const mount = document.createElement("div");
  mount.setAttribute(DATA_ATTR_SHADOW_ROOT_CONTAINER, "true");
  mount.setAttribute(DATA_ATTR_SHADOW_MOUNT, "true");
  mount.style.width = "100%";
  mount.style.height = "100%";
  shadowRoot.appendChild(mount);

  // Inject styles — CXR CSS first (hoist @property from it), then gen_ad.
  // In production `injectCxrStyles` returns the CSS href without cloning the <link>;
  // we apply the fetched stylesheet below so the shadow root costs no extra request.
  const cxrCssHref = injectCxrStyles(shadowRoot);
  const productionLink = document.querySelector<HTMLLinkElement>('link[data-genuin-cxr="css"]');
  injectGenAdCssLink(shadowRoot);

  // Apply the production stylesheet, then hoist @property rules before React renders.
  // Both reuse one cached CSS fetch (cutting the old 3× cxr.css load to head <link> + this).
  if (cxrCssHref && productionLink) {
    await applyProductionShadowStyle(shadowRoot, productionLink);
  }
  if (cxrCssHref) {
    await hoistPropertyRulesFromCssUrl(cxrCssHref, productionLink);
    // Re-check connectivity after async work.
    if (!node.isConnected) {
      return { enabled: true, hostElement: node, shadowRoot, mountTarget: mount, shadowHostId };
    }
  }

  return { enabled: true, hostElement: node, shadowRoot, mountTarget: mount, shadowHostId };
}

/**
 * Walk from an element to its containing shadow root and return a ShadowDomConfig,
 * or null when the element is not inside a shadow root.
 *
 * Uses the same getRootNode() pattern as genAdSdk.ts.
 */
export function getShadowConfig(element: HTMLElement): ShadowDomConfig | null {
  const rootNode = element.getRootNode();
  if (!(rootNode instanceof ShadowRoot)) return null;

  const host = rootNode.host;
  if (!(host instanceof HTMLElement)) return null;

  const mountTarget = rootNode.querySelector<HTMLElement>(`[${DATA_ATTR_SHADOW_MOUNT}]`);
  if (!mountTarget) return null;

  return {
    enabled: true,
    hostElement: host,
    shadowRoot: rootNode,
    mountTarget,
    shadowHostId: ensureShadowHostId(host),
  };
}

/**
 * Returns true when the given element is inside a shadow root.
 * Convenience wrapper around getShadowConfig.
 */
export function isShadowMode(element: HTMLElement): boolean {
  return element.getRootNode() instanceof ShadowRoot;
}

/**
 * Re-sync styles into a shadow root that was set up earlier.
 *
 * Call this after `loadGenAdSdk()` resolves so gen_ad.min.css is
 * available in document.head to clone into the shadow root.
 */
export function resyncShadowStyles(shadowRoot: ShadowRoot): void {
  injectGenAdCssLink(shadowRoot);
}

/**
 * Reset module-level caches. For test isolation only — do not use in production.
 * @internal
 */
export function __resetCachesForTesting(): void {
  cachedPropertyRules.clear();
  cachedCssText.clear();
  cachedStyleSheets.clear();
  pendingFetches.clear();
  jsRegisteredNames.clear();
}
