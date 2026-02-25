/**
 * Ensures Tailwind CSS Houdini `@property` declarations are registered globally
 * with `inherits: true` for Shadow DOM usage.
 *
 * Strategy: `CSS.registerProperty()` – global JS registration. Registers each
 * custom property with `inherits: true` before any stylesheet can assign
 * `inherits: false`, ensuring correct value inheritance into shadow roots.
 */

/** Globally JS-registered property names. */
const jsRegisteredNames = new Set<string>();

/** Module-level cache of @property rules fetched from the CSS URL. */
const cachedPropertyRulesFromUrl = new Map<string, Set<string>>();
const pendingUrlFetches = new Map<string, Promise<void>>();

type CssWithRegisterProperty = typeof CSS & {
  registerProperty?: (definition: {
    name: string;
    syntax: string;
    inherits: boolean;
    initialValue?: string;
  }) => void;
};

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function collectPropertyAtRulesFromCssText(cssText: string): string[] {
  const propertyRules: string[] = [];
  const propertyAtRuleRegex = /@property\s+[^{}]+\{[^{}]*\}/g;
  let match: RegExpExecArray | null;

  while ((match = propertyAtRuleRegex.exec(cssText)) !== null) {
    if (match[0]) {
      propertyRules.push(match[0].trim());
    }
  }

  return propertyRules;
}

function collectPropertyAtRulesFromCssRuleList(
  cssRules: CSSRuleList,
  collector: Set<string>,
): void {
  Array.from(cssRules).forEach((cssRule) => {
    const cssText = (cssRule.cssText || "").trim();
    if (cssText.startsWith("@property ")) {
      collector.add(cssText);
    }

    const nestedCssRules = (cssRule as CSSRule & { cssRules?: CSSRuleList })
      .cssRules;
    if (nestedCssRules) {
      collectPropertyAtRulesFromCssRuleList(nestedCssRules, collector);
    }
  });
}

function getPropertyName(propertyRule: string): string | null {
  const match = /@property\s+([^\s{]+)/.exec(propertyRule);
  return match?.[1] ?? null;
}

/** Strip outer CSS string quotes: `"*"` → `*`, `'<color>'` → `<color>`. */
function stripCssStringQuotes(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function ensureInheritsTrue(propertyRule: string): string {
  if (/inherits\s*:\s*true/.test(propertyRule)) {
    return propertyRule;
  }
  if (/inherits\s*:\s*false/.test(propertyRule)) {
    return propertyRule.replace(/inherits\s*:\s*false/, "inherits: true");
  }
  return propertyRule.replace(/\}$/, "  inherits: true;\n}");
}

// ---------------------------------------------------------------------------
// CSS.registerProperty() global registration
// ---------------------------------------------------------------------------

function registerPropertyGlobally(propertyRule: string): void {
  const cssApi = CSS as CssWithRegisterProperty;
  if (typeof cssApi.registerProperty !== "function") {
    return;
  }

  const name = getPropertyName(propertyRule);
  if (!name || jsRegisteredNames.has(name)) {
    return;
  }

  jsRegisteredNames.add(name);

  const bodyMatch = /@property\s+[^\s{]+\s*\{([\s\S]*?)\}/.exec(propertyRule);
  if (!bodyMatch?.[1]) {
    return;
  }

  const descriptors = new Map<string, string>();
  for (const m of bodyMatch[1].matchAll(/([a-z-]+)\s*:\s*([^;]+);?/g)) {
    if (m[1] && m[2]) {
      descriptors.set(m[1].trim(), m[2].trim());
    }
  }

  const rawSyntax = descriptors.get("syntax");
  if (!rawSyntax) {
    return;
  }

  // CSS serialises syntax as a string literal: `syntax: "*"`.
  // registerProperty() expects a bare string: `"*"` → `*`.
  const syntax = stripCssStringQuotes(rawSyntax);

  const rawInitialValue = descriptors.get("initial-value");
  const initialValue = rawInitialValue
    ? stripCssStringQuotes(rawInitialValue)
    : undefined;

  try {
    cssApi.registerProperty({
      name,
      syntax,
      inherits: true,
      ...(initialValue !== undefined ? { initialValue } : {}),
    });
  } catch {
    // Ignore: already registered or invalid syntax.
  }
}

// ---------------------------------------------------------------------------
// CSS URL fetch
// ---------------------------------------------------------------------------

async function fetchPropertyRulesFromCssUrl(cssUrl: string): Promise<void> {
  const resolvedUrl = new URL(cssUrl, window.location.href).href;

  if (cachedPropertyRulesFromUrl.has(resolvedUrl)) {
    return;
  }

  const pending = pendingUrlFetches.get(resolvedUrl);
  if (pending) {
    return pending;
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(resolvedUrl, { credentials: "omit" });
      if (!response.ok) {
        return;
      }

      const cssText = await response.text();
      const rules = new Set<string>();
      collectPropertyAtRulesFromCssText(cssText).forEach((rule) =>
        rules.add(rule),
      );
      cachedPropertyRulesFromUrl.set(resolvedUrl, rules);
    } catch {
      // Ignore fetch failures (CORS / network).
    } finally {
      pendingUrlFetches.delete(resolvedUrl);
    }
  })();

  pendingUrlFetches.set(resolvedUrl, fetchPromise);
  return fetchPromise;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Registers all `@property` rules discovered in the given shadow root and from
 * the SDK CSS URL globally via `CSS.registerProperty()` with `inherits: true`.
 *
 * Must be awaited before React renders into the shadow root so that custom
 * properties have their initial values and inheritance available on first render.
 */
export async function hoistTailwindPropertyAtRulesFromShadowRoot(
  shadowRoot: ShadowRoot,
): Promise<void> {
  const discoveredPropertyRules = new Set<string>();

  // Collect from inline <style> elements.
  Array.from(shadowRoot.querySelectorAll("style")).forEach((styleElement) => {
    collectPropertyAtRulesFromCssText(styleElement.textContent || "").forEach(
      (rule) => discoveredPropertyRules.add(rule),
    );
  });

  // Collect from same-origin linked stylesheets (cross-origin throws).
  Array.from(shadowRoot.styleSheets).forEach((styleSheet) => {
    try {
      collectPropertyAtRulesFromCssRuleList(
        (styleSheet as CSSStyleSheet).cssRules,
        discoveredPropertyRules,
      );
    } catch {
      // Cross-origin – handled by URL fetch below.
    }
  });

  // Register synchronously-collected rules globally.
  discoveredPropertyRules.forEach((rule) => registerPropertyGlobally(rule));

  // Fetch the CSS URL to handle cross-origin stylesheets.
  const cssUrl = window.genuin?.cssUrl;
  if (cssUrl) {
    await fetchPropertyRulesFromCssUrl(cssUrl);

    const resolvedUrl = new URL(cssUrl, window.location.href).href;
    const cachedRules = cachedPropertyRulesFromUrl.get(resolvedUrl);
    if (cachedRules) {
      cachedRules.forEach((rule) => registerPropertyGlobally(rule));
    }
  }
}
