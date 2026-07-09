/**
 * Genuin Contextual Reels Loader
 * Stable bootstrap script. Partners include:
 *   <script src="https://media.begenuin.com/cxr/in-feed/gen_ext.min.js"></script>
 * Build-time placeholders are replaced with the hashed core/CSS filenames.
 */

(function () {
  "use strict";

  var CXR_VERSION = '1.0.0';
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

  function bootCore() {
    var coreUrl = baseUrl + CORE_FILENAME;
    return import(/* @vite-ignore */ coreUrl).catch(function (err) {
      console.error("[contextual-reels] failed to load core:", err);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCore);
  } else {
    bootCore();
  }
})();
