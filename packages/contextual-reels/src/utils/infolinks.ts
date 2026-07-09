/**
 * Infolinks in-place unit injector for the stacked layout.
 *
 * The stacked layout splits a slot into two equal halves: our widget on top and
 * an Infolinks in-place unit below. Infolinks' own snippet spawns and manages
 * its ad iframe, so we give it a dedicated, exactly-sized host document (via
 * `srcdoc`) rather than letting it inject into our page — this keeps its scripts
 * and styles fully isolated from the widget's DOM. Both halves and the Infolinks
 * slot size are supplied per tag via {@link StackedLayoutConfig}.
 */

import { INFOLINKS_PID, INFOLINKS_PURL_PARAM, getScriptParam, type StackedLayoutConfig } from "@cxr/config";
import { windowLink } from "@cxr/platform/topWindow";

const INFOLINKS_SCRIPT_SRC = "https://resources.infolinks.com/js/infolinks_main.js";

/** Size of the Infolinks `inplace_slot`. */
interface InfolinksSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Resolve the publisher page URL to pass to Infolinks as `purl`.
 *
 * Infolinks uses `purl` to attribute the slot to the hosting page. From inside
 * our own (often cross-origin) ad iframe it would otherwise default to
 * `about:srcdoc`, which Infolinks cannot attribute — so we resolve the real page
 * URL on our end and inject it:
 *   0. Loader override — `purl` on our <script src>. When supplied it wins,
 *      since the partner/Infolinks knows the true page URL and a cross-origin
 *      frame often cannot resolve it on its own.
 *   1. {@link windowLink} — the outermost accessible window's href (the true
 *      publisher URL when same-origin).
 *   2. `document.referrer` — the page that embedded us (reliable when the top
 *      frame is cross-origin and `windowLink` only sees our own frame).
 *   3. `location.href` — last resort.
 * Returns `undefined` when none are available (SSR / no browser).
 */
export function resolvePageUrl(): string | undefined {
  const override = getScriptParam(INFOLINKS_PURL_PARAM);
  if (override) return override;
  if (windowLink) return windowLink;
  if (typeof document !== "undefined" && document.referrer) return document.referrer;
  if (typeof window !== "undefined") return window.location.href;
  return undefined;
}

/**
 * Build the `srcdoc` HTML for the Infolinks host iframe. The document is sized
 * to the given dimensions with no margins so the in-place unit fills the row
 * exactly.
 */
function buildInfolinksSrcDoc({ width, height }: InfolinksSize): string {
  const purl = resolvePageUrl();
  const config = {
    pid: INFOLINKS_PID,
    // Attribution URL resolved on our end — see resolvePageUrl(). Omitted when
    // unresolvable so we never send an empty/`about:srcdoc` purl.
    ...(purl ? { purl } : {}),
    iframe: true,
    inplace_slot: {
      width,
      height,
      ad: "genuin",
      plugin_version: "Genuin",
      keepFrame: true,
    },
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>html,body{margin:0;padding:0;width:${width}px;height:${height}px;overflow:hidden;}</style>
<script type="text/javascript">window.infolinks_config = ${JSON.stringify(config)};</script>
<script type="text/javascript" src="${INFOLINKS_SCRIPT_SRC}"></script>
</head>
<body></body>
</html>`;
}

/**
 * Create an Infolinks host iframe at the given size. The caller is responsible
 * for appending it to the bottom row of the stacked container.
 */
export function createInfolinksFrame(size: InfolinksSize, doc: Document = document): HTMLIFrameElement {
  const frame = doc.createElement("iframe");
  frame.width = String(size.width);
  frame.height = String(size.height);
  frame.scrolling = "no";
  frame.setAttribute("frameborder", "0");
  frame.setAttribute("aria-hidden", "true");
  frame.setAttribute("data-genuin-cxr", "infolinks");
  frame.style.cssText = `display:block;width:${size.width}px;height:${size.height}px;border:0;`;
  frame.srcdoc = buildInfolinksSrcDoc(size);
  return frame;
}

/** Marker for the top (Genuin) row of a split stacked slot. */
export const STACKED_TOP_ATTR = "stacked-top";
/** Marker for the bottom (Infolinks) row of a split stacked slot. */
export const STACKED_BOTTOM_ATTR = "stacked-bottom";

/**
 * Split a stacked slot into two equal halves per the supplied config.
 *
 * The top row hosts our widget; the returned element is used as the React mount
 * host in place of `node`. The bottom row receives the Infolinks in-place unit
 * (sized via `config.infolinks`). Idempotent — re-calling on an already-split
 * node returns the existing top row without appending a second Infolinks frame.
 *
 * @param node   The `.gen-ext` container to split.
 * @param config The stacked layout config for this tag.
 * @returns The top-row element to mount the widget into.
 */
export function setupStackedRows(node: HTMLElement, config: StackedLayoutConfig): HTMLElement {
  const doc = node.ownerDocument ?? document;
  const existing = node.querySelector<HTMLElement>(`:scope > [data-genuin-cxr="${STACKED_TOP_ATTR}"]`);
  if (existing) return existing;

  const { width, halfHeight } = config;
  const rowStyle = `width:${width}px;height:${halfHeight}px;flex:0 0 ${halfHeight}px;overflow:hidden;`;

  node.style.display = "flex";
  node.style.flexDirection = "column";

  const topRow = doc.createElement("div");
  topRow.setAttribute("data-genuin-cxr", STACKED_TOP_ATTR);
  topRow.style.cssText = rowStyle;

  const bottomRow = doc.createElement("div");
  bottomRow.setAttribute("data-genuin-cxr", STACKED_BOTTOM_ATTR);
  bottomRow.style.cssText = rowStyle;
  bottomRow.appendChild(createInfolinksFrame(config.infolinks, doc));

  node.appendChild(topRow);
  node.appendChild(bottomRow);

  return topRow;
}
