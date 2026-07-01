import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetCachesForTesting,
  getShadowConfig,
  isShadowMode,
  resyncShadowStyles,
  setupCxrShadowDOM,
} from "@cxr/shadow-dom";

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

  it("clones the CXR CSS link into the shadow root when present in document", async () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    await setupCxrShadowDOM(node);

    const shadowLinks = Array.from(node.shadowRoot!.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    expect(shadowLinks.some((l) => l.href.includes("cxr-abc123.css"))).toBe(true);
  });

  it("does not duplicate CXR CSS link on second call", async () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.example.com/assets/cxr-abc123.css";
    link.setAttribute("data-genuin-cxr", "css");
    document.head.appendChild(link);

    await setupCxrShadowDOM(node);
    await setupCxrShadowDOM(node);

    const shadowLinks = Array.from(node.shadowRoot!.querySelectorAll('link[href*="cxr-abc123.css"]'));
    expect(shadowLinks).toHaveLength(1);
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
