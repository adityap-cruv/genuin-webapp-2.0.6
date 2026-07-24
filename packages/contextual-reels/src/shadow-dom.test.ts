import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetCachesForTesting,
  getShadowConfig,
  isShadowMode,
  resyncShadowStyles,
  setupCxrShadowDOM,
} from "@cxr/shadow-dom";

/**
 * jsdom implements neither constructable stylesheets (`new CSSStyleSheet().replaceSync`)
 * nor `ShadowRoot.adoptedStyleSheets`. Install a minimal shim so tests can exercise the
 * adopt path that real browsers take. Each installed piece is torn down in afterEach via
 * the returned disposers array. Call once per test that needs the adopt path.
 */
const shimDisposers: Array<() => void> = [];
function withConstructableStyleSheets(): void {
  const proto = CSSStyleSheet.prototype as unknown as { replaceSync?: (text: string) => void };
  if (typeof proto.replaceSync !== "function") {
    proto.replaceSync = function replaceSync(this: { __cssText?: string }, text: string) {
      this.__cssText = text;
    };
    shimDisposers.push(() => {
      delete proto.replaceSync;
    });
  }
  // `adoptedStyleSheets` is a per-ShadowRoot accessor in browsers; shim it as a plain
  // backing array so setter assignment + `.length` reads work under jsdom.
  const srProto = ShadowRoot.prototype as unknown as { adoptedStyleSheets?: unknown };
  if (!("adoptedStyleSheets" in srProto)) {
    const store = new WeakMap<object, CSSStyleSheet[]>();
    Object.defineProperty(srProto, "adoptedStyleSheets", {
      configurable: true,
      get(this: object) {
        return store.get(this) ?? [];
      },
      set(this: object, sheets: CSSStyleSheet[]) {
        store.set(this, sheets);
      },
    });
    shimDisposers.push(() => {
      delete (srProto as { adoptedStyleSheets?: unknown }).adoptedStyleSheets;
    });
  }
}

describe("setupCxrShadowDOM", () => {
  let node: HTMLDivElement;

  beforeEach(() => {
    node = document.createElement("div");
    node.id = "gen-ext-1";
    document.body.appendChild(node);
    // Reset CSS link state
    document.querySelectorAll('link[data-genuin-cxr="css"]').forEach((el) => el.remove());
    document.querySelectorAll('link[href*="gen_ad.min.css"]').forEach((el) => el.remove());
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    __resetCachesForTesting();
  });

  afterEach(() => {
    node.remove();
    vi.unstubAllGlobals();
    while (shimDisposers.length) shimDisposers.pop()!();
  });

  it("attaches a shadow root to the node", async () => {
    await setupCxrShadowDOM(node);
    expect(node.shadowRoot).not.toBeNull();
  });

  it("returns an inner div inside the shadow root", async () => {
    const { mountTarget: target } = await setupCxrShadowDOM(node);
    expect(node.shadowRoot!.contains(target)).toBe(true);
    expect(target.tagName).toBe("DIV");
    expect(target.getAttribute("data-cxr-mount")).toBe("true");
  });

  it("is idempotent — second call returns same inner div, no second shadow root", async () => {
    const { mountTarget: target1 } = await setupCxrShadowDOM(node);
    const { mountTarget: target2 } = await setupCxrShadowDOM(node);
    expect(target1).toBe(target2);
    expect(node.shadowRoot!.querySelectorAll("[data-cxr-mount]")).toHaveLength(1);
  });

  it("adopts the fetched CXR CSS into the shadow root via adoptedStyleSheets (no extra <link> fetch)", async () => {
    withConstructableStyleSheets();
    const cssText = ".gencl\\:flex{display:flex}";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(cssText) }));

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    await setupCxrShadowDOM(node);

    // Style lives in a constructed stylesheet, not a second network-fetching <link>.
    const sheets = node.shadowRoot!.adoptedStyleSheets;
    expect(sheets.length).toBeGreaterThan(0);
    expect(node.shadowRoot!.querySelectorAll('link[href*="cxr-abc123.css"]')).toHaveLength(0);
    link.remove();
  });

  it("fetches the CXR CSS only once (text reused for both the shadow sheet and @property hoist)", async () => {
    const cssText = "@property --a{syntax:'<color>';inherits:false;initial-value:red}.gencl\\:flex{display:flex}";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(cssText) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("CSS", { registerProperty: vi.fn() });

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    await setupCxrShadowDOM(node);

    const cxrFetches = fetchMock.mock.calls.filter((c) => String(c[0]).includes("cxr-abc123.css"));
    expect(cxrFetches).toHaveLength(1);
    link.remove();
  });

  it("reuses the loaded <link>'s CSSOM (no network fetch) when the sheet is readable", async () => {
    withConstructableStyleSheets();
    // The head <link> has already downloaded + parsed cxr.css, so its sheet.cssRules
    // is populated. jsdom never parses linked CSS, so stub the sheet to model a
    // production browser where the bytes are already in the CSSOM.
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("") });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("CSS", { registerProperty: vi.fn() });

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);
    Object.defineProperty(link, "sheet", {
      configurable: true,
      value: {
        cssRules: [
          { cssText: "@property --a{syntax:'<color>';inherits:false;initial-value:red}" },
          { cssText: ".gencl\\:flex{display:flex}" },
        ],
      },
    });

    await setupCxrShadowDOM(node);

    // The whole point of the fix: the stylesheet bytes come from the CSSOM, so
    // cxr.css is never fetched a second time over the network.
    const cxrFetches = fetchMock.mock.calls.filter((c) => String(c[0]).includes("cxr-abc123.css"));
    expect(cxrFetches).toHaveLength(0);
    // Style still applied from the CSSOM text.
    expect(node.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThan(0);
    link.remove();
  });

  it("falls back to fetch when the <link>'s cssRules are unreadable (cross-origin SecurityError)", async () => {
    withConstructableStyleSheets();
    const cssText = ".gencl\\:flex{display:flex}";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(cssText) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("CSS", { registerProperty: vi.fn() });

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);
    // A cross-origin stylesheet throws SecurityError on cssRules access — the fast
    // path must swallow it and fall back to the network fetch.
    Object.defineProperty(link, "sheet", {
      configurable: true,
      value: {
        get cssRules(): never {
          throw new DOMException("cross-origin", "SecurityError");
        },
      },
    });

    await setupCxrShadowDOM(node);

    const cxrFetches = fetchMock.mock.calls.filter((c) => String(c[0]).includes("cxr-abc123.css"));
    expect(cxrFetches).toHaveLength(1);
    link.remove();
  });

  it("does not duplicate the adopted CXR sheet on second call", async () => {
    withConstructableStyleSheets();
    const cssText = ".gencl\\:flex{display:flex}";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(cssText) }));

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    await setupCxrShadowDOM(node);
    const firstCount = node.shadowRoot!.adoptedStyleSheets.length;
    await setupCxrShadowDOM(node);

    expect(node.shadowRoot!.adoptedStyleSheets.length).toBe(firstCount);
    link.remove();
  });

  it("falls back to cloning the CXR CSS <link> into the shadow root when the fetch fails", async () => {
    // Fetch failure (offline / CORS) must not leave the shadow root unstyled — a
    // cloned <link> is the resilient fallback even though it costs a second request.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    await setupCxrShadowDOM(node);

    const shadowLinks = Array.from(node.shadowRoot!.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    expect(shadowLinks.some((l) => l.href.includes("cxr-abc123.css"))).toBe(true);
    link.remove();
  });

  it("falls back to cloning when constructable sheets are supported but the fetch also fails", async () => {
    // Covers the `!text` branch inside applyProductionShadowStyle: the fast CSSOM
    // path is unreadable (cross-origin) AND the network fetch fails, so cachedCssText
    // never gets populated — must still clone the <link> rather than leave the
    // shadow root unstyled.
    withConstructableStyleSheets();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    vi.stubGlobal("CSS", { registerProperty: vi.fn() });

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);
    Object.defineProperty(link, "sheet", {
      configurable: true,
      value: {
        get cssRules(): never {
          throw new DOMException("cross-origin", "SecurityError");
        },
      },
    });

    await setupCxrShadowDOM(node);

    const shadowLinks = Array.from(node.shadowRoot!.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    expect(shadowLinks.some((l) => l.href.includes("cxr-abc123.css"))).toBe(true);
    expect(node.shadowRoot!.adoptedStyleSheets.length).toBe(0);
    link.remove();
  });

  it("falls back to cloning when replaceSync throws (CSS text contains @import)", async () => {
    // Real-browser failure mode: `new CSSStyleSheet().replaceSync(text)` throws
    // "@import rules are not allowed when creating stylesheet synchronously" when
    // the fetched CSS contains an `@import`. This must NOT propagate to init (it
    // was firing a false px-script-error) — the resilient path is the same
    // <link> clone used for the other fallbacks, leaving the widget styled.
    const cssWithImport = '@import url("https://fonts.example.com/x.css");.gencl\\:flex{display:flex}';
    withConstructableStyleSheets();
    // Make the shim mimic the browser: reject any text containing an @import.
    const proto = CSSStyleSheet.prototype as unknown as { replaceSync: (text: string) => void };
    const originalReplaceSync = proto.replaceSync;
    proto.replaceSync = function throwingReplaceSync(text: string) {
      if (text.includes("@import")) {
        throw new DOMException(
          "Failed to execute 'replaceSync' on 'CSSStyleSheet': @import rules are not allowed " +
            "when creating stylesheet synchronously.",
          "NotAllowedError"
        );
      }
      originalReplaceSync.call(this, text);
    };
    shimDisposers.push(() => {
      proto.replaceSync = originalReplaceSync;
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(cssWithImport) }));
    vi.stubGlobal("CSS", { registerProperty: vi.fn() });

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-import.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    // No readable CSSOM on the link → forces the fetch path that populates the text.
    await expect(setupCxrShadowDOM(node)).resolves.not.toThrow();

    const shadowLinks = Array.from(node.shadowRoot!.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    expect(shadowLinks.some((l) => l.href.includes("cxr-import.css"))).toBe(true);
    expect(node.shadowRoot!.adoptedStyleSheets.length).toBe(0);
    link.remove();
  });

  it("clones gen_ad.min.css link into shadow root when present in document", async () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://media.begenuin.com/ad-sdk/in-feed/gen_ad.min.css";
    document.head.appendChild(link);

    await setupCxrShadowDOM(node);

    const shadowLinks = Array.from(node.shadowRoot!.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    expect(shadowLinks.some((l) => l.href.includes("gen_ad.min.css"))).toBe(true);
  });

  it("clones dev-mode <style> tags containing gencl\\: into shadow root", async () => {
    // Simulate Vite dev-mode style injection: style.textContent contains CSS
    // escape notation (.gencl\:absolute) so textContent includes the literal "gencl\:".
    const style = document.createElement("style");
    style.textContent = ".gencl\\:absolute{position:absolute}.gencl\\:flex{display:flex}";
    document.head.appendChild(style);

    await setupCxrShadowDOM(node);

    const shadowStyles = Array.from(node.shadowRoot!.querySelectorAll("style"));
    expect(shadowStyles.length).toBeGreaterThan(0);
    expect(shadowStyles.some((s) => s.textContent?.includes("gencl\\:"))).toBe(true);

    style.remove();
  });

  it("does not clone <style> tags that lack the gencl\\: prefix", async () => {
    // Non-CXR style tags present in the document should not be cloned.
    const style = document.createElement("style");
    style.textContent = ".some-other-class{color:red}";
    document.head.appendChild(style);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await setupCxrShadowDOM(node);
    expect(warn).toHaveBeenCalledOnce(); // still warns — no CXR styles found
    warn.mockRestore();

    const shadowStyles = Array.from(node.shadowRoot!.querySelectorAll("style"));
    expect(shadowStyles.length).toBe(0);

    style.remove();
  });

  it("warns but does not throw when no CXR CSS link is found in document", async () => {
    // Spying on console.warn because createLogger routes warn() to console.warn.
    // If the logger implementation changes, update this test accordingly.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(setupCxrShadowDOM(node)).resolves.not.toThrow();
    expect(warn).toHaveBeenCalledOnce();
    // logger.warn emits: console.warn("[cxr/shadow-dom]", "message")
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[cxr/shadow-dom]"),
      expect.stringContaining("No CXR styles found")
    );
    warn.mockRestore();
  });

  it("returns mount even when node is disconnected after async fetch", async () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        node.remove();
        return Promise.resolve({ ok: true, text: () => Promise.resolve("") });
      })
    );

    const { mountTarget: mount } = await setupCxrShadowDOM(node);
    expect(mount.getAttribute("data-cxr-mount")).toBe("true");
    link.remove();
    document.body.appendChild(node); // re-attach for afterEach cleanup
  });

  it("calls CSS.registerProperty for @property rules found in CXR CSS", async () => {
    const registerProperty = vi.fn();
    vi.stubGlobal("CSS", { registerProperty });

    const cssText = `@property --my-color { syntax: "<color>"; inherits: false; initial-value: red; }`;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(cssText) }));

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    await setupCxrShadowDOM(node);

    expect(registerProperty).toHaveBeenCalledWith(expect.objectContaining({ name: "--my-color", inherits: false }));
    link.remove();
  });

  it("swallows errors thrown by CSS.registerProperty (already-registered / invalid syntax)", async () => {
    const registerProperty = vi.fn(() => {
      throw new Error("InvalidModificationError: property already registered");
    });
    vi.stubGlobal("CSS", { registerProperty });

    const cssText = `@property --dup { syntax: "<color>"; inherits: false; initial-value: red; }`;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(cssText) }));

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    await expect(setupCxrShadowDOM(node)).resolves.not.toThrow();
    expect(registerProperty).toHaveBeenCalledTimes(1);
    link.remove();
  });

  it("does not throw when CSS.registerProperty is unavailable", async () => {
    vi.stubGlobal("CSS", {});

    const cssText = `@property --x { syntax: "*"; inherits: false; }`;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(cssText) }));

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    await expect(setupCxrShadowDOM(node)).resolves.not.toThrow();
    link.remove();
  });
});

describe("resyncShadowStyles", () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement("div");
    document.body.appendChild(host);
    document.querySelectorAll('link[href*="gen_ad.min.css"]').forEach((el) => el.remove());
    __resetCachesForTesting();
  });

  afterEach(() => {
    host.remove();
    vi.unstubAllGlobals();
  });

  it("injects gen_ad.min.css into shadow root when link present in document", () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://media.begenuin.com/ad-sdk/in-feed/gen_ad.min.css";
    document.head.appendChild(link);

    const shadowRoot = host.attachShadow({ mode: "open" });
    resyncShadowStyles(shadowRoot);

    const shadowLinks = Array.from(shadowRoot.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
    expect(shadowLinks.some((l) => l.href.includes("gen_ad.min.css"))).toBe(true);
    link.remove();
  });

  it("is a no-op when gen_ad.min.css is not in document", () => {
    const shadowRoot = host.attachShadow({ mode: "open" });
    resyncShadowStyles(shadowRoot);
    expect(shadowRoot.querySelectorAll("link")).toHaveLength(0);
  });

  it("does not duplicate gen_ad.min.css on repeated calls", () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://media.begenuin.com/ad-sdk/in-feed/gen_ad.min.css";
    document.head.appendChild(link);

    const shadowRoot = host.attachShadow({ mode: "open" });
    resyncShadowStyles(shadowRoot);
    resyncShadowStyles(shadowRoot);

    expect(shadowRoot.querySelectorAll('link[href*="gen_ad.min.css"]')).toHaveLength(1);
    link.remove();
  });
});

describe("setupCxrShadowDOM — data attributes", () => {
  let node: HTMLDivElement;

  beforeEach(() => {
    node = document.createElement("div");
    document.body.appendChild(node);
    document.querySelectorAll('link[data-genuin-cxr="css"]').forEach((el) => el.remove());
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    __resetCachesForTesting();
  });

  afterEach(() => {
    node.remove();
    vi.unstubAllGlobals();
  });

  it("sets data-cxr-shadow-host on the host element", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await setupCxrShadowDOM(node);
    expect(node.getAttribute("data-cxr-shadow-host")).toBe("true");
    warn.mockRestore();
  });

  it("sets data-cxr-shadow-root on the mount container div", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { mountTarget } = await setupCxrShadowDOM(node);
    expect(mountTarget.getAttribute("data-cxr-shadow-root")).toBe("true");
    warn.mockRestore();
  });

  it("returns ShadowDomConfig with enabled=true and correct references", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config = await setupCxrShadowDOM(node);
    expect(config.enabled).toBe(true);
    expect(config.hostElement).toBe(node);
    expect(config.shadowRoot).toBe(node.shadowRoot);
    expect(config.mountTarget).toBe(node.shadowRoot!.querySelector("[data-cxr-mount]"));
    warn.mockRestore();
  });

  it("generates and assigns an id when host has none, returns it as shadowHostId", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(node.id).toBe("");
    const config = await setupCxrShadowDOM(node);
    expect(node.id).toMatch(/^cxr-shadow-host-/);
    expect(config.shadowHostId).toBe(node.id);
    warn.mockRestore();
  });

  it("preserves existing id when host already has one", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    node.id = "gen-ext-1";
    const config = await setupCxrShadowDOM(node);
    expect(node.id).toBe("gen-ext-1");
    expect(config.shadowHostId).toBe("gen-ext-1");
    warn.mockRestore();
  });

  it("idempotent second call returns same ShadowDomConfig shape", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await setupCxrShadowDOM(node);
    const config2 = await setupCxrShadowDOM(node);
    expect(config2.enabled).toBe(true);
    expect(config2.mountTarget.getAttribute("data-cxr-mount")).toBe("true");
    expect(config2.shadowHostId).toBe(node.id);
    warn.mockRestore();
  });
});

describe("getShadowConfig", () => {
  it("returns null for an element not inside a shadow root", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(getShadowConfig(el)).toBeNull();
    el.remove();
  });

  it("returns ShadowDomConfig for an element inside a shadow root with a mount div", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const sr = host.attachShadow({ mode: "open" });
    const mount = document.createElement("div");
    mount.setAttribute("data-cxr-mount", "true");
    sr.appendChild(mount);
    const inner = document.createElement("span");
    mount.appendChild(inner);

    const config = getShadowConfig(inner);
    expect(config).not.toBeNull();
    expect(config!.enabled).toBe(true);
    expect(config!.hostElement).toBe(host);
    expect(config!.shadowRoot).toBe(sr);
    expect(config!.mountTarget).toBe(mount);

    host.remove();
  });

  it("returns null when shadow root has no [data-cxr-mount] div", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const sr = host.attachShadow({ mode: "open" });
    const inner = document.createElement("span");
    sr.appendChild(inner);

    expect(getShadowConfig(inner)).toBeNull();
    host.remove();
  });
});

describe("isShadowMode", () => {
  it("returns false for a normal DOM element", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(isShadowMode(el)).toBe(false);
    el.remove();
  });

  it("returns true for an element inside a shadow root", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const sr = host.attachShadow({ mode: "open" });
    const inner = document.createElement("div");
    sr.appendChild(inner);

    expect(isShadowMode(inner)).toBe(true);
    host.remove();
  });
});
