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

  function resolveBaseUrl() {
    try {
      var current = document.currentScript;
      if (current && current.src) {
        return current.src.replace(/\/[^/]*$/, "/");
      }
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || "";
        if (src.indexOf("gen_ext") !== -1) {
          return src.replace(/\/[^/]*$/, "/");
        }
      }
    } catch {
      // Fall through to CDN_BASE
    }
    return CDN_BASE;
  }

  var baseUrl = resolveBaseUrl();

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
