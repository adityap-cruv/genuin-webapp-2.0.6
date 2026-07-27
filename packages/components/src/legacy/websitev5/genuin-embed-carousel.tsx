"use client";

import Script from "next/script";
import { useId, useLayoutEffect, useRef } from "react";

const SDK_SRC = "https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js";

type PlacementConfiguration = {
  sections: ReadonlyArray<{
    readonly title: string;
  }>;
};

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
      api_key?: string;
      configuration?: PlacementConfiguration;
    }) => void;
  };
}

let sdkInitScheduled = false;
let pendingConfiguration: PlacementConfiguration | undefined;

/**
 * The SDK discovers every pending `.gen-sdk-class` host at init time. Batch calls
 * from sibling React components so every host is mounted and its own data
 * attributes are available before discovery runs.
 */
function scheduleSdkInitialization(configuration?: PlacementConfiguration) {
  pendingConfiguration = configuration ?? pendingConfiguration;
  if (sdkInitScheduled) return;

  sdkInitScheduled = true;
  queueMicrotask(() => {
    sdkInitScheduled = false;

    const sdk = (window as Window & GenuinWindow).genuin;
    if (!sdk) return;

    const configurationForBatch = pendingConfiguration;
    pendingConfiguration = undefined;
    sdk.init(configurationForBatch ? { configuration: configurationForBatch } : {});
  });
}

type GenuinEmbedIdentity =
  | {
      /** Genuin embed id. */
      embedId: string;
      placementId?: never;
      styleId?: never;
    }
  | {
      embedId?: never;
      /** Genuin placement style id. */
      styleId: string;
      /** Genuin placement id (unique per embed instance). */
      placementId: string;
    };

export type GenuinEmbedCarouselProps = GenuinEmbedIdentity & {
  /**
   * Public client API key. Safe to ship in the page bundle — embed
   * keys are scoped to the brand's placement.
   */
  apiKey: string;
  /** Optional SDK placement configuration supplied by the placement owner. */
  configuration?: PlacementConfiguration;
  /** Optional stable id override. A unique React-derived id is used by default. */
  containerId?: string;
  /** Test id placed on the SDK host. */
  testId?: string;
  /** Optional carousel navigation alignment applied after the SDK mounts. */
  navigationLayout?: "default" | "side-overlay";
  /** Optional fixed width for each SDK carousel slide. */
  carouselItemWidth?: number;
  /** Enables mouse-wheel, pointer-drag, and touch scrolling for a carousel. */
  enableCarouselScroll?: boolean;
  /** Expands the SDK host to its slide width so its parent can provide native horizontal scrolling. */
  nativeHorizontalScroll?: boolean;
  /** Extra classes on the container. */
  className?: string;
};

type MountedSwiper = {
  allowTouchMove: boolean;
  params: {
    allowTouchMove?: boolean;
    simulateTouch?: boolean;
    slidesPerView?: number | "auto";
    touchReleaseOnEdges?: boolean;
  };
  mousewheel?: {
    enable: () => void;
  };
  update: () => void;
};

/**
 * Drops a Genuin Web SDK placement into the page. Loads
 * `https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js` once via
 * `<Script strategy="afterInteractive">`, exposes placement values through the
 * SDK's multi-embed data attributes, and batches sibling initialization calls.
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
 * controls actual dimensions. Each instance receives a unique id, allowing
 * multiple placements on the same page.
 */
export function GenuinEmbedCarousel({
  embedId,
  styleId,
  placementId,
  apiKey,
  configuration,
  containerId,
  testId = "genuin-placement",
  navigationLayout = "default",
  carouselItemWidth,
  enableCarouselScroll = false,
  nativeHorizontalScroll = false,
  className,
}: GenuinEmbedCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId().replaceAll(":", "");
  const resolvedContainerId = containerId ?? `gen-sdk-${generatedId}`;

  useLayoutEffect(() => {
    // Handles cached SDK scripts and client-side navigation.
    scheduleSdkInitialization(configuration);
  }, [configuration]);

  useLayoutEffect(() => {
    if (navigationLayout !== "side-overlay") return;

    let animationFrame = 0;
    let attempts = 0;

    const alignNavigation = () => {
      const shadowRoot = containerRef.current?.shadowRoot;
      const previousButton = shadowRoot?.querySelector<HTMLButtonElement>('button[aria-label="Previous"]');
      const nextButton = shadowRoot?.querySelector<HTMLButtonElement>('button[aria-label="Next"]');
      const navigation = previousButton?.parentElement?.parentElement;

      if (navigation && nextButton && navigation.contains(nextButton)) {
        Object.assign(navigation.style, {
          position: "absolute",
          inset: "0",
          zIndex: "20",
          margin: "0",
          padding: "0 12px",
          justifyContent: "space-between",
          pointerEvents: "none",
        });
        previousButton.style.pointerEvents = "auto";
        nextButton.style.pointerEvents = "auto";
        return;
      }

      attempts += 1;
      if (attempts < 600) animationFrame = window.requestAnimationFrame(alignNavigation);
    };

    alignNavigation();
    return () => window.cancelAnimationFrame(animationFrame);
  }, [navigationLayout]);

  useLayoutEffect(() => {
    if (!carouselItemWidth && !enableCarouselScroll && !nativeHorizontalScroll) return;

    let pollTimer = 0;
    let observer: MutationObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;

    const configureCarousel = () => {
      const shadowRoot = containerRef.current?.shadowRoot;
      const swiperElement = shadowRoot?.querySelector<HTMLElement>(".swiper");
      const swiper = (swiperElement as (HTMLElement & { swiper?: MountedSwiper }) | null)?.swiper;

      if (!shadowRoot || !swiperElement || !swiper) {
        return;
      }

      window.clearInterval(pollTimer);

      if (carouselItemWidth && !shadowRoot.querySelector("[data-genuin-carousel-sizing]")) {
        const sizingStyles = document.createElement("style");
        sizingStyles.dataset.genuinCarouselSizing = "true";
        sizingStyles.textContent = `
          .swiper-slide {
            width: ${carouselItemWidth}px !important;
            min-width: ${carouselItemWidth}px !important;
            max-width: ${carouselItemWidth}px !important;
            flex: 0 0 ${carouselItemWidth}px !important;
          }
        `;
        shadowRoot.appendChild(sizingStyles);
      }

      const updateNativeTrackWidth = () => {
        if (!nativeHorizontalScroll || !carouselItemWidth || !containerRef.current) return;

        const slides = shadowRoot.querySelectorAll(".swiper-slide");
        if (slides.length === 0) return;

        const gap = Number.parseFloat(getComputedStyle(slides.item(0)).marginRight) || 0;
        const contentWidth = slides.length * carouselItemWidth + Math.max(0, slides.length - 1) * gap;
        const viewportWidth = containerRef.current.parentElement?.clientWidth ?? 0;

        if (contentWidth > 0) {
          const trackWidth = `${Math.max(viewportWidth, contentWidth)}px`;
          containerRef.current.style.setProperty("width", trackWidth, "important");
          containerRef.current.style.setProperty("min-width", trackWidth, "important");
        }
      };

      if (carouselItemWidth) {
        swiper.params.slidesPerView = "auto";
      }

      if (enableCarouselScroll) {
        swiper.allowTouchMove = true;
        swiper.params.allowTouchMove = true;
        swiper.params.simulateTouch = true;
        swiper.params.touchReleaseOnEdges = true;
        swiper.mousewheel?.enable();
        swiperElement.style.cursor = "grab";
        swiperElement.style.touchAction = "pan-y";
      }

      swiper.update();
      updateNativeTrackWidth();

      observer = new MutationObserver(() => {
        swiper.update();
        updateNativeTrackWidth();
      });
      observer.observe(swiperElement, { childList: true, subtree: true });

      resizeObserver = new ResizeObserver(updateNativeTrackWidth);
      const scrollViewport = containerRef.current?.parentElement;
      if (scrollViewport) resizeObserver.observe(scrollViewport);
    };

    pollTimer = window.setInterval(configureCarousel, 250);
    configureCarousel();
    return () => {
      window.clearInterval(pollTimer);
      observer?.disconnect();
      resizeObserver?.disconnect();
    };
  }, [carouselItemWidth, enableCarouselScroll, nativeHorizontalScroll]);

  return (
    <>
      <div
        ref={containerRef}
        id={resolvedContainerId}
        data-api-key={apiKey}
        data-embed-id={embedId}
        data-placement-id={placementId}
        data-style-id={styleId}
        data-testid={testId}
        className={`gen-sdk-class ${className ?? ""}`.trim()}
        style={{ width: "100%", height: "100%" }}
      />
      <Script src={SDK_SRC} strategy="afterInteractive" onReady={() => scheduleSdkInitialization(configuration)} />
    </>
  );
}
