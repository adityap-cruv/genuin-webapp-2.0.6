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
const pendingFetches = new Map<string, Promise<void>>();
const jsRegisteredNames = new Set<string>();

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

async function fetchAndCachePropertyRules(cssUrl: string): Promise<void> {
  const resolved = new URL(cssUrl, window.location.href).href;

  if (cachedPropertyRules.has(resolved)) return;

  const pending = pendingFetches.get(resolved);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const res = await fetch(resolved, { credentials: "omit" });
      if (!res.ok) return;
      const text = await res.text();
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

async function hoistPropertyRulesFromCssUrl(cssUrl: string): Promise<void> {
  await fetchAndCachePropertyRules(cssUrl);
  const resolved = new URL(cssUrl, window.location.href).href;
  cachedPropertyRules.get(resolved)?.forEach(registerPropertyGlobally);
}

// ---------------------------------------------------------------------------
// Style injection helpers
// ---------------------------------------------------------------------------

/**
 * Inject CXR styles into the shadow root.
 *
 * Dev mode: Vite injects styles as `<style>` tags into document.head — clone
 * any `<style>` whose textContent contains the "gencl\:" Tailwind prefix
 * (CSS escape notation: backslash + colon, as returned by style.textContent).
 *
 * Production mode: CSS is emitted as a separate file linked via
 * `<link data-genuin-cxr="css">` — clone that link and return its href so
 * we can hoist @property rules from it.
 *
 * Returns the CSS href for @property hoisting, or null in dev mode.
 */
function injectCxrStyles(shadowRoot: ShadowRoot): string | null {
  // Production: look for the emitted CSS link first.
  const sourceLink = document.querySelector<HTMLLinkElement>('link[data-genuin-cxr="css"]');
  if (sourceLink) {
    const href = sourceLink.href;
    const alreadyInjected = Array.from(shadowRoot.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(
      (l) => l.href === href
    );
    if (!alreadyInjected) {
      shadowRoot.appendChild(sourceLink.cloneNode(true));
    }
    return href;
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
  const cxrCssHref = injectCxrStyles(shadowRoot);
  injectGenAdCssLink(shadowRoot);

  // Hoist Tailwind @property rules globally before React renders.
  if (cxrCssHref) {
    await hoistPropertyRulesFromCssUrl(cxrCssHref);
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
  pendingFetches.clear();
  jsRegisteredNames.clear();
}
