import { describe, it, expect } from "vitest";

import { INFOLINKS_PID, STACKED_LAYOUT_TAGS } from "@cxr/config";
import {
  createInfolinksFrame,
  resolvePageUrl,
  setupStackedRows,
  STACKED_TOP_ATTR,
  STACKED_BOTTOM_ATTR,
} from "@cxr/utils/infolinks";

const CONFIG_320 = STACKED_LAYOUT_TAGS["6a032e34054c8fcb08582510"]!;
const CONFIG_300 = STACKED_LAYOUT_TAGS["69b298e3d6a6ad57e7b9a464"]!;

describe("utils/infolinks", () => {
  it("creates an iframe host at the requested size", () => {
    const frame = createInfolinksFrame({ width: 320, height: 50 });
    expect(frame.tagName).toBe("IFRAME");
    expect(frame.width).toBe("320");
    expect(frame.height).toBe("50");
    expect(frame.getAttribute("data-genuin-cxr")).toBe("infolinks");
  });

  it("creates a 300×300 iframe host when asked", () => {
    const frame = createInfolinksFrame({ width: 300, height: 300 });
    expect(frame.width).toBe("300");
    expect(frame.height).toBe("300");
  });

  it("embeds the Infolinks config and script in srcdoc", () => {
    const frame = createInfolinksFrame({ width: 320, height: 50 });
    expect(frame.srcdoc).toContain(`"pid":${INFOLINKS_PID}`);
    expect(frame.srcdoc).toContain(`"width":320`);
    expect(frame.srcdoc).toContain(`"height":50`);
    expect(frame.srcdoc).toContain(`"plugin_version":"Genuin"`);
    expect(frame.srcdoc).toContain(`"keepFrame":true`);
    expect(frame.srcdoc).toContain("https://resources.infolinks.com/js/infolinks_main.js");
  });

  it("embeds the requested 300×300 slot size in srcdoc", () => {
    const frame = createInfolinksFrame({ width: 300, height: 300 });
    expect(frame.srcdoc).toContain(`"width":300`);
    expect(frame.srcdoc).toContain(`"height":300`);
  });

  it("injects the resolved page URL as purl", () => {
    const purl = resolvePageUrl();
    // In JSDOM windowLink resolves to the test page URL, so purl is defined.
    expect(purl).toBeTruthy();
    const frame = createInfolinksFrame({ width: 320, height: 50 });
    expect(frame.srcdoc).toContain(`"purl":${JSON.stringify(purl)}`);
  });

  it("resolvePageUrl prefers the outermost accessible window href", () => {
    // JSDOM: window is top, so this is window.location.href.
    expect(resolvePageUrl()).toBe(window.location.href);
  });
});

describe("utils/setupStackedRows", () => {
  function makeNode(): HTMLElement {
    const node = document.createElement("div");
    node.className = "gen-ext";
    document.body.appendChild(node);
    return node;
  }

  it("splits the node into a top row (returned) and a bottom row", () => {
    const node = makeNode();
    const top = setupStackedRows(node, CONFIG_320);

    expect(top.getAttribute("data-genuin-cxr")).toBe(STACKED_TOP_ATTR);
    expect(node.children).toHaveLength(2);
    expect(node.firstElementChild).toBe(top);
    expect(node.lastElementChild?.getAttribute("data-genuin-cxr")).toBe(STACKED_BOTTOM_ATTR);
  });

  it("puts the Genuin row on top and Infolinks in the bottom row", () => {
    const node = makeNode();
    setupStackedRows(node, CONFIG_320);

    const top = node.querySelector(`[data-genuin-cxr="${STACKED_TOP_ATTR}"]`);
    const bottom = node.querySelector(`[data-genuin-cxr="${STACKED_BOTTOM_ATTR}"]`);
    // Top hosts our widget — no ad frame injected into it.
    expect(top?.querySelector("iframe")).toBeNull();
    // Bottom holds exactly one Infolinks frame.
    const frames = bottom?.querySelectorAll('iframe[data-genuin-cxr="infolinks"]');
    expect(frames).toHaveLength(1);
  });

  it("sizes both halves from the config (320×50)", () => {
    const node = makeNode();
    setupStackedRows(node, CONFIG_320);
    const rows = node.querySelectorAll<HTMLElement>('[data-genuin-cxr^="stacked-"]');
    rows.forEach((row) => {
      expect(row.style.width).toBe("320px");
      expect(row.style.height).toBe("50px");
    });
    // Infolinks frame matches the config's infolinks size.
    const frame = node.querySelector<HTMLIFrameElement>('iframe[data-genuin-cxr="infolinks"]');
    expect(frame?.width).toBe("320");
    expect(frame?.height).toBe("50");
  });

  it("sizes both halves from the config (300×300)", () => {
    const node = makeNode();
    setupStackedRows(node, CONFIG_300);
    const rows = node.querySelectorAll<HTMLElement>('[data-genuin-cxr^="stacked-"]');
    rows.forEach((row) => {
      expect(row.style.width).toBe("300px");
      expect(row.style.height).toBe("300px");
    });
    const frame = node.querySelector<HTMLIFrameElement>('iframe[data-genuin-cxr="infolinks"]');
    expect(frame?.width).toBe("300");
    expect(frame?.height).toBe("300");
    expect(frame?.srcdoc).toContain(`"width":300`);
    expect(frame?.srcdoc).toContain(`"height":300`);
  });

  it("lays the container out as a vertical flex column", () => {
    const node = makeNode();
    setupStackedRows(node, CONFIG_320);
    expect(node.style.display).toBe("flex");
    expect(node.style.flexDirection).toBe("column");
  });

  it("is idempotent — re-calling returns the same top row without a second Infolinks frame", () => {
    const node = makeNode();
    const first = setupStackedRows(node, CONFIG_320);
    const second = setupStackedRows(node, CONFIG_320);

    expect(second).toBe(first);
    expect(node.children).toHaveLength(2);
    expect(node.querySelectorAll('iframe[data-genuin-cxr="infolinks"]')).toHaveLength(1);
  });
});
