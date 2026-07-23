/**
 * Genuin Contextual Reels Loader
 * Stable bootstrap script. Partners include:
 *   <script src="https://media.begenuin.com/cxr/in-feed/gen_ext.min.js"></script>
 * Build-time placeholders are replaced with the hashed core/CSS filenames.
 */

(function () {
  "use strict";

  var PIXEL_URL = "__CR_PIXEL_URL__";

  // High-level "loader reached" beacon — the FIRST statement executed in the
  // IIFE. Fires before any script-src/macro/CSS/boot logic so it is a pure,
  // unconditional "loader ran" signal that can never fire in a partially-booted
  // or doubtful state. tagId + host macros are unresolved here, so the path uses
  // "0" and no query params are sent.
  //
  // Fired via `new Image()` GET, NOT `navigator.sendBeacon`: the pixel endpoint
  // is GET-only (POST → 405), and sendBeacon always POSTs — worse, it reports
  // success on merely queuing the POST, which would mask the 405 and suppress a
  // fallback. A GET image request matches the endpoint and mirrors the existing
  // px-script-error pixel. Fail-safe by construction: the whole block is wrapped
  // so a beacon failure can NEVER interrupt script execution, `Image` is feature-
  // detected so a WebView without it just no-ops, and a build-placeholder guard
  // stops a misbuild from firing a bogus request. Note: no client technique can
  // defeat a host-app CSP that blocks the pixel domain — that must be fixed by
  // allowlisting the domain on the host side.
  try {
    if (PIXEL_URL && PIXEL_URL.indexOf("__CR_") === -1 && typeof Image === "function") {
      var pxLoUrl = PIXEL_URL + "/1/1/px-lo";
      new Image().src = pxLoUrl;
      try {
        console.log("[contextual-reels][PixelReporter] fired pixel (px-lo):", pxLoUrl);
      } catch {
        // console can be absent/throwing in locked-down WebViews — ignore.
      }
    }
  } catch {
    // Absolutely never let the loader beacon break bootstrap.
  }

  var CXR_VERSION = "1.0.0";
  var CORE_FILENAME = "__CR_CORE_FILENAME__";
  var CSS_FILENAME = "__CR_CSS_FILENAME__";
  var CDN_BASE = "__CR_CDN_BASE__";

  // Resolve the URL of our own <script> tag. This is the only URL we can read
  // that the partner fully controls, and it lives in the same document as the
  // .gen-ext slot — so a query param on it (e.g. ?gen_variant=stacked) is a
  // reliable signal even inside a cross-origin srcdoc iframe where neither the
  // frame URL nor window.top is readable.
  function resolveScriptSrc() {
    try {
      var current = document.currentScript;
      if (current && current.src) return current.src;
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || "";
        if (src.indexOf("gen_ext") !== -1) return src;
      }
    } catch {
      // ignore — no readable script src
    }
    return "";
  }

  var scriptSrc = resolveScriptSrc();

  // Expose the script tag's query string so the core can read config the partner
  // passed via the loader URL (e.g. gen_variant=stacked). Merge rather than
  // overwrite so multiple loader includes don't clobber each other.
  try {
    if (scriptSrc) {
      var scriptQuery = scriptSrc.indexOf("?") !== -1 ? scriptSrc.slice(scriptSrc.indexOf("?") + 1) : "";
      if (scriptQuery) {
        window.__CXR_SCRIPT_PARAMS__ = (window.__CXR_SCRIPT_PARAMS__ || "") + "&" + scriptQuery;
      }
    }
  } catch {
    // non-fatal — config falls back to other detection paths
  }

  var baseUrl = scriptSrc ? scriptSrc.replace(/\?.*$/, "").replace(/\/[^/]*$/, "/") : CDN_BASE;

  if (CSS_FILENAME) {
    var cssHref = baseUrl + "assets/" + CSS_FILENAME;
    var existing = document.querySelector('link[data-genuin-cxr="css"]');
    if (!existing) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      link.setAttribute("data-genuin-cxr", "css");
      (document.head || document.documentElement).appendChild(link);
    }
  }

  // Same macro set PixelReporter (inside the core bundle) resolves for the
  // px-script-error pixel — duplicated here because loader.jsx is a plain
  // script and cannot import the core's TypeScript modules. Falls back to "0"
  // per param when the host never supplied (or never resolved) the macro.
  var PIXEL_HOST_MACRO_PARAMS = [
    ["appn", "appn"],
    ["appv", "appv"],
    ["appb", "appb"],
    ["appsu", "appsu"],
    ["ifa", "ifa"],
    ["appidfa", "ifa"],
    ["appaid", "ifa"],
    ["deviceid", "ifa"],
    ["appsi", "appsi"],
    ["appc", "appc"],
    ["country", "country"],
    ["loc", "loc"],
    ["loclong", "loclong"],
    ["loclat", "loclat"],
    ["dnt", "dnt"],
    ["gdpr", "gdpr"],
    ["gdpr_consent", "gdpr_consent"],
    ["us_privacy", "us_privacy"],
    ["d", "appb"],
  ];

  function readHostMacroBestEffort(name) {
    try {
      var raw = window.__CXR_SCRIPT_PARAMS__;
      if (!raw) return undefined;
      var value = new URLSearchParams(raw).get(name);
      if (!value) return undefined;
      var trimmed = value.trim();
      if (!trimmed || /^\{.*\}$/.test(trimmed) || /^~.*~$/.test(trimmed)) return undefined;
      return trimmed;
    } catch {
      return undefined;
    }
  }

  // Cap on the `reason` query param so one long error message can't blow up
  // the pixel URL — mirrors MAX_REASON_LENGTH in observability/pixel-reporter.ts.
  var MAX_REASON_LENGTH = 200;

  // No `.gen-ext` node has been read at this point (that's index.jsx's job) —
  // sdk_load failures happen before any widget instance is known. brand_id is
  // never resolvable here (only known after a successful tag fetch); tag_id
  // falls back to the `tagId` host macro when the host provided one, else "0".
  function buildSdkLoadPixelUrl(err) {
    var tagId = readHostMacroBestEffort("tagId") || "0";
    var path = PIXEL_URL + "/1/" + encodeURIComponent(tagId) + "/px-script-error";

    var params = new URLSearchParams();
    for (var i = 0; i < PIXEL_HOST_MACRO_PARAMS.length; i++) {
      var param = PIXEL_HOST_MACRO_PARAMS[i][0];
      var macroName = PIXEL_HOST_MACRO_PARAMS[i][1];
      params.set(param, readHostMacroBestEffort(macroName) || "0");
    }
    params.set("w", "0");
    params.set("h", "0");
    params.set("ho", "1");
    params.set("error_type", "network_error");
    params.set("error_stage", "sdk_load");

    var reason = err && err.message ? String(err.message) : typeof err === "string" ? err : "";
    if (reason.trim()) {
      params.set("error_reason", reason.trim().slice(0, MAX_REASON_LENGTH));
    }

    return path + "?" + params.toString();
  }

  function bootCoreFailureHandler(err) {
    console.error("[contextual-reels] failed to load core:", err);
    // Fire a tracking pixel: the core bundle itself never loaded, so
    // PixelReporter (which lives inside that bundle) isn't available here.
    // Mirrors PixelReporter's URL shape so both paths land the same way on
    // the receiving end.
    try {
      var pixelSrc = buildSdkLoadPixelUrl(err);
      new Image().src = pixelSrc;
      console.log("[contextual-reels][PixelReporter] fired pixel (stage=sdk_load):", pixelSrc);
    } catch (pixelError) {
      console.error("[contextual-reels] failed to fire core-load error pixel:", pixelError);
    }
  }

  function bootCore() {
    var coreUrl = baseUrl + CORE_FILENAME;
    return import(/* @vite-ignore */ coreUrl).catch(bootCoreFailureHandler);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCore);
  } else {
    bootCore();
  }
})();
