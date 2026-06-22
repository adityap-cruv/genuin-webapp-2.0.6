/**
 * Rudderstack JS SDK loader.
 *
 * Injects the canonical Rudderstack v3 snippet (verbatim from the legacy
 * `analytics_service.js`) into `document.body`. The snippet bootstraps a stub
 * `window.rudderanalytics` queue then lazily loads `rsa.min.js` from the
 * Rudderstack CDN.
 *
 * Idempotent — a no-op (with a console.info) when `window.rudderanalytics` is
 * already present.
 */
import { rudderstackKey, rudderstackLink } from "@cxr/config";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/rudderstack");

/** Version of the Rudderstack JS SDK snippet inlined below. */
export const RUDDER_SNIPPET_VERSION = "3.0.3";

/**
 * Inject the Rudderstack bootstrap snippet.
 *
 * @returns A cleanup function that removes the injected `<script>` node, or
 *          `undefined` when no script was injected (already initialised).
 */
export function initializeRudderAnalytics(): (() => void) | undefined {
  const rudderanalytics = (window as Window & { rudderanalytics?: unknown }).rudderanalytics;

  if (rudderanalytics) {
    _logger.info("RudderAnalytics is already initialized.");
    return undefined;
  }

  const rudderScript = document.createElement("script");
  rudderScript.innerHTML = `
        (function() {
          "use strict";
          window.RudderSnippetVersion = "${RUDDER_SNIPPET_VERSION}";
          var sdkBaseUrl = "https://cdn.rudderlabs.com/v3";
          var sdkName = "rsa.min.js";
          var asyncScript = true;
          window.rudderAnalyticsBuildType = "legacy", window.rudderanalytics = [];
          var e = ["setDefaultInstanceKey", "load", "ready", "page", "track", "identify", "alias", "group", "reset", "setAnonymousId", "startSession", "endSession", "consent"];
          for (var n = 0; n < e.length; n++) {
            var t = e[n];
            window.rudderanalytics[t] = function(e) {
              return function() {
                window.rudderanalytics.push([e].concat(Array.prototype.slice.call(arguments)))
              }
            }(t)
          }
          try {
            new Function('return import("")'), window.rudderAnalyticsBuildType = "modern";
          } catch(a) {}
          if (window.rudderAnalyticsMount = function() {
            "undefined" == typeof globalThis && (Object.defineProperty(Object.prototype, "__globalThis_magic__", {
              get: function get() {
                return this
              }, configurable: true
            }), __globalThis_magic__.globalThis = __globalThis_magic__, delete Object.prototype.__globalThis_magic__);
            var e = document.createElement("script");
            e.src = "".concat(sdkBaseUrl, "/").concat(window.rudderAnalyticsBuildType, "/").concat(sdkName), e.async = asyncScript;
            document.head ? document.head.appendChild(e) : document.body.appendChild(e);
          }, "undefined" == typeof Promise || "undefined" == typeof globalThis) {
            var d = document.createElement("script");
            d.src = "https://polyfill-fastly.io/v3/polyfill.min.js?version=3.111.0&features=Symbol%2CPromise&callback=rudderAnalyticsMount",
            d.async = asyncScript;
            document.head ? document.head.appendChild(d) : document.body.appendChild(d);
          } else {
            window.rudderAnalyticsMount();
          }
          window.rudderanalytics.load("${rudderstackKey}", "${rudderstackLink}", {});
        })();
      `;
  document.body.appendChild(rudderScript);

  return () => {
    if (rudderScript.parentNode) {
      rudderScript.parentNode.removeChild(rudderScript);
    }
  };
}
