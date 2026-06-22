"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

const SDK_SRC = "https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js";

/**
 * Minimal shape of `window.genuin` exposed by the Genuin Web SDK loader
 * (`gen_sdk.min.js`). The full surface is broader, but the page only
 * needs `init` here.
 */
interface GenuinWindow {
  genuin?: {
    init: (config: {
      style_id?: string;
      placement_id?: string;
      embed_id?: string;
      api_key: string;
      contextualParams?: Record<string, unknown>;
    }) => void;
  };
}

export interface GenuinEmbedCarouselProps {
  /** Genuin placement style id. */
  styleId: string;
  /** Genuin placement id (unique per embed instance). */
  placementId: string;
  /**
   * Public client API key. Safe to ship in the page bundle — embed
   * keys are scoped to the brand's placement.
   */
  apiKey: string;
  /** Extra classes on the container. */
  className?: string;
}

/**
 * Drops a Genuin Web SDK placement into the page. Loads
 * `https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js` once via
 * `<Script strategy="afterInteractive">` and calls
 * `window.genuin.init(...)` when the loader is ready.
 *
 * Mirrors the embed snippet used by SDK consumers:
 *
 * ```html
 * <div id="gen-sdk" class="gen-sdk-class" style="width: 600px; height: 600px"></div>
 * <script src="https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js"></script>
 * <script>
 *   window.genuin.init({ style_id, placement_id, api_key })
 * </script>
 * ```
 *
 * The container fills its parent (`width/height: 100%`); the host
 * controls actual dimensions. The SDK scans for `#gen-sdk` on
 * `init()` — only one instance per page is supported with this
 * configuration. For multi-embed pages, use the `data-*`-attribute
 * pattern from `packages/web-sdk/index.multi.html.example`.
 */
export function GenuinEmbedCarousel({ styleId, placementId, apiKey, className }: GenuinEmbedCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  function initSdk() {
    const w = window as Window & GenuinWindow;
    if (initializedRef.current || !w.genuin || !containerRef.current) return;
    initializedRef.current = true;
    w.genuin.init({
      style_id: styleId,
      placement_id: placementId,
      api_key: apiKey,
    });
  }

  useEffect(() => {
    // If the SDK script was already loaded (cached from an earlier
    // navigation, or another `<GenuinEmbedCarousel>` mounted first),
    // `<Script onReady>` won't re-fire — initialise immediately.
    initSdk();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init runs once per mount; the refs guard re-init
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        id="gen-sdk"
        data-testid="websitev5-genuin-embed"
        className={`gen-sdk-class ${className ?? ""}`.trim()}
        style={{ width: "100%", height: "100%" }}
      />
      <Script src={SDK_SRC} strategy="afterInteractive" onReady={initSdk} />
    </>
  );
}
