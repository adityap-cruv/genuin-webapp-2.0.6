"use client";
import { cn } from "@genuin/ui/lib/utils";
import { useEffect, useRef } from "react";

import { useAnalytics } from "../../../context/analytics/context";
import { ensureStylesInShadowRoot } from "../../root-portal/shadow-root/shadow-dom.utils";

import type { GenAdConfig, GenAdContainerProps } from "./gen-ad.types";
import { getMinBannerSize } from "./gen-ad.utils";

function getAdSource(config: GenAdConfig, provider?: string): string {
  const map: Record<string, string | undefined> = {
    video: Array.isArray(config.video) ? config.video[0]?.platform : config.video?.platform,
    // Key must be "banner" — the waterfall emits "banner" (see gen-ad.utils.ts), not "display"
    banner: Array.isArray(config.banner) ? config.banner[0]?.platform : config.banner?.platform,
    native: Array.isArray(config.native) ? config.native[0]?.platform : config.native?.platform,
    prebid: config.prebid ? "prebid" : undefined,
  };
  return provider ? (map[provider] ?? "") : (map.video ?? map.banner ?? map.native ?? "");
}

const GEN_AD_SCRIPT_URL = "https://media.begenuin.com/ad-sdk/1.0.0/gen_ad.min.js";

// const GEN_AD_SCRIPT_URL = "http://localhost:3000/src/gen_ad.js";

export function loadGenAdScript(): void {
  const existing = document.querySelector(`script[src="${GEN_AD_SCRIPT_URL}"]`);
  if (existing) return; // already loading or loaded

  const script = document.createElement("script");
  script.src = GEN_AD_SCRIPT_URL;
  script.async = true;
  script.onerror = () => {};
  script.onload = () => {
    // Ensure required styles are injected into all relevant shadow roots
    const injectStylesIntoShadowRoots = () => {
      const mainHost = document.querySelector("[data-genuin-host]");
      if (mainHost?.shadowRoot) {
        void ensureStylesInShadowRoot(mainHost.shadowRoot);
      }

      const overlayHost = document.querySelector("[data-genuin-overlay-host]");
      if (overlayHost?.shadowRoot) {
        void ensureStylesInShadowRoot(overlayHost.shadowRoot);
      }
    };

    injectStylesIntoShadowRoots();
  };
  document.head.appendChild(script);
}

export function GenAdContainer({
  config,
  isActive,
  isVisible,
  videoId,
  videoType,
  muted,
  moveToNextVideo,
  onAdInit,
  onAdFilled,
  onAdFillFailed,
  onAdCompleted,
  onAdSkipped,
  onSystemMuteChange,
}: GenAdContainerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const instanceIdRef = useRef<string | null>(null);
  const { track, EventName } = useAnalytics();
  const trackRef = useRef(track);
  trackRef.current = track;

  const moveToNextVideoRef = useRef(moveToNextVideo);
  moveToNextVideoRef.current = moveToNextVideo;

  const onAdInitRef = useRef(onAdInit);
  onAdInitRef.current = onAdInit;

  const onAdFilledRef = useRef(onAdFilled);
  onAdFilledRef.current = onAdFilled;

  const onAdFillFailedRef = useRef(onAdFillFailed);
  onAdFillFailedRef.current = onAdFillFailed;

  const onAdCompletedRef = useRef(onAdCompleted);
  onAdCompletedRef.current = onAdCompleted;

  const onAdSkippedRef = useRef(onAdSkipped);
  onAdSkippedRef.current = onAdSkipped;

  const onSystemMuteChangeRef = useRef(onSystemMuteChange);
  onSystemMuteChangeRef.current = onSystemMuteChange;

  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    if (!isActive) return;

    let initInterval: ReturnType<typeof setInterval>;
    let missingContainerAttempts = 0;
    // Smallest [w, h] the banner waterfall needs; null when no banner is
    // requested (video/native-only waterfalls don't care about slot size).
    const minBannerSize = getMinBannerSize(configRef.current.banner);
    // Track whether we suppressed mount due to slot size, so a later
    // resize-up can attempt again. Distinct from `instanceIdRef` (which
    // tracks successful mounts).
    let suppressedForSize = false;

    const measureSlot = (): [number, number] => {
      const el = adContainerRef.current;
      if (!el) return [0, 0];
      // The container has `hidden` (display:none) while `isVisible=false`
      // — which is its initial state, because `isVisible` is bound to
      // `isAdFilled` and the ad hasn't filled yet. A display:none element's
      // clientWidth/Height read 0, so reading the container directly would
      // spuriously suppress every banner request before init can ever fire.
      // Fall back to the parent (the player frame), since the container
      // is `h-full w-full` of its parent when shown — the parent's bounds
      // are the effective slot size for the size-guard decision.
      const ownW = el.clientWidth;
      const ownH = el.clientHeight;
      const parent = el.parentElement;
      const w = ownW || parent?.clientWidth || 0;
      const h = ownH || parent?.clientHeight || 0;
      return [w, h];
    };

    const slotMeetsBannerMin = (): boolean => {
      if (!minBannerSize) return true;
      const [w, h] = measureSlot();
      const [minW, minH] = minBannerSize;
      return w >= minW && h >= minH;
    };

    const initAd = () => {
      if ((window as any).GenAd && !adContainerRef.current) {
        missingContainerAttempts += 1;
        if (missingContainerAttempts >= 2) {
          clearInterval(initInterval);
        }
        return;
      }
      if ((window as any).GenAd && adContainerRef.current) {
        // IAB compliance: refuse to request a banner ad when the slot is
        // smaller than the requested creative size. Rendering a 300×250
        // creative in a 200×200 container produces an off-spec, non-viewable
        // impression — the SDK and the ad-server would still count it, so the
        // only place to stop it is before init runs. ResizeObserver below
        // re-tries when the slot grows back to spec.
        if (minBannerSize && !slotMeetsBannerMin()) {
          if (!instanceIdRef.current && !suppressedForSize) {
            const [w, h] = measureSlot();
            const [minW, minH] = minBannerSize;
            console.warn(
              `[GenAd] slot ${w}×${h} smaller than required banner ${minW}×${minH}; suppressing ad request.`
            );
            suppressedForSize = true;
            onAdFillFailedRef.current?.();
          }
          clearInterval(initInterval);
          return;
        }
        suppressedForSize = false;
        clearInterval(initInterval);
        try {
          const { adSlotId: _adSlotId, waterfallOrder, ...genAdInitConfig } = configRef.current;
          const baseAdParams = {
            video_id: videoId,
            ad_type: "in_feed",
            video_type: videoType,
          };
          onAdInitRef.current?.();
          instanceIdRef.current = (window as any).GenAd.init({
            containerElement: adContainerRef.current,
            muted: muted,
            ...genAdInitConfig,
            ...(!!waterfallOrder && waterfallOrder.length !== 0 ? { waterfallOrder } : {}),
            onStageStart: (provider: string) => {
              trackRef.current(EventName.AD_REQUESTED, {
                ...baseAdParams,
                provider,
                ad_source: getAdSource(configRef.current, provider),
              });
            },
            onStageSuccess: (
              provider: string,
              meta?: { timestamp?: number; requestBody?: Record<string, unknown> }
            ) => {
              trackRef.current(EventName.AD_RESPONSE_RECEIVED, {
                ...baseAdParams,
                provider,
                ad_source: getAdSource(configRef.current, provider),
              });
              onAdFilledRef.current?.(provider);
            },
            onStageFail: (provider: string, error: Error) => {
              const msg = error?.message ?? "";
              // Surface the raw SDK error so dev/QA can tell why a stage
              // failed (unknown platform, bad tag_id, network) — categorised
              // analytics events alone discard `error.message`.
              console.warn(`[GenAd] stage fail (provider=${provider}):`, msg, error);
              const adSource = getAdSource(configRef.current, provider);
              const params = { ...baseAdParams, provider, ad_source: adSource };
              if (msg.includes("303")) {
                trackRef.current(EventName.AD_REQUEST_FAILED, params);
              } else if (msg.includes("401") || msg.includes("403") || msg.includes("404")) {
                trackRef.current(EventName.AD_RENDER_FAILED, params);
              } else {
                trackRef.current(EventName.AD_ERROR, params);
              }
            },
            // onWaterfallSuccess: (provider: string) => {

            // },
            onWaterfallFail: () => {
              onAdFillFailedRef.current?.();
            },
            onAdCompleted: (provider: string) => {
              trackRef.current(EventName.AD_COMPLETED, {
                ...baseAdParams,
                provider,
                ad_source: getAdSource(configRef.current, provider),
              });
              onAdCompletedRef.current?.();
              moveToNextVideoRef.current?.();
            },
            onVolumeChange: (data: { isMuted: boolean; volume: number; reason?: "system" | "user" }) => {
              if (data.reason === "system") {
                onSystemMuteChangeRef.current?.(data.isMuted);
              }
            },
            onAdBlocked: (_reason: string) => {},
            events: {
              onAdRendered: (event: any) => {
                trackRef.current(EventName.AD_RENDERED, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(configRef.current, event?.provider),
                });
              },
              onAdImpression: (event: any) => {
                trackRef.current(EventName.AD_IMPRESSION, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(configRef.current, event?.provider),
                  advertiser_domain: event?.advertiserDomain,
                  creative_id: event?.creativeId,
                  media_file_url: event?.mediaFileUrl,
                });
              },
              onAdStarted: (event: any) => {
                trackRef.current(EventName.AD_STARTED, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(configRef.current, event?.provider),
                });
              },
              onAdQuartile: (event: any) => {
                trackRef.current(EventName.AD_MEDIA_QUARTILE, {
                  ...baseAdParams,
                  provider: event?.provider,
                  quartile: event?.quartile,
                  ad_source: getAdSource(configRef.current, event?.provider),
                });
              },
              onAdSkipped: (event: any) => {
                // Whenever the user skips the ad window loses focus and player pauses to avoid this behavious we have kept window.focus here.
                window.focus();
                trackRef.current(EventName.AD_SKIPPED, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(configRef.current, event?.provider),
                });
                // Release the ad slot so the organic video underneath is revealed;
                // without this isAdFilled stays true, the VideoPlayer stays unmounted, and the slot goes black.
                onAdSkippedRef.current?.();
              },
              onAdClicked: (event: any) => {
                trackRef.current(EventName.AD_CLICKED, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(configRef.current, event?.provider),
                });
              },
            },
          });
        } catch (error) {
          console.warn("[GenAd] failed to initialise ad:", error);
        }
      }
    };

    if ((window as any).GenAd && adContainerRef.current) {
      initAd();
    } else {
      const scriptAlreadyInjected = !!document.querySelector(`script[src="${GEN_AD_SCRIPT_URL}"]`);
      if (!scriptAlreadyInjected) {
        loadGenAdScript();
      }
      initInterval = setInterval(initAd, 100);
    }

    // Banner-only: track the slot's live dimensions so we can
    //   (a) re-attempt init if the slot was too small at mount time but
    //       grew back to spec, and
    //   (b) tear the running banner down if it shrinks below spec mid-play,
    //       so an off-spec impression isn't kept on screen.
    // Observe the *parent* element: while the container is hidden
    // (display:none, isVisible=false) it has no box and ResizeObserver
    // wouldn't fire on it. The parent is the player frame, whose size we
    // already fall back to in `measureSlot()`. Real video / native creatives
    // are size-responsive and don't need this.
    let resizeObserver: ResizeObserver | null = null;
    if (minBannerSize && adContainerRef.current?.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        const ok = slotMeetsBannerMin();
        if (instanceIdRef.current && !ok) {
          const [w, h] = measureSlot();
          const [minW, minH] = minBannerSize;
          console.warn(`[GenAd] slot resized to ${w}×${h}; destroying banner (below ${minW}×${minH}).`);
          (window as any).GenAd?.destroy?.(instanceIdRef.current);
          instanceIdRef.current = null;
          suppressedForSize = true;
          onAdFillFailedRef.current?.();
        } else if (!instanceIdRef.current && ok && suppressedForSize) {
          // Slot grew back to spec — attempt a fresh mount.
          initAd();
        }
      });
      resizeObserver.observe(adContainerRef.current.parentElement);
    }

    return () => {
      clearInterval(initInterval);
      resizeObserver?.disconnect();
      if (instanceIdRef.current && (window as any).GenAd) {
        (window as any).GenAd.destroy(instanceIdRef.current);
        instanceIdRef.current = null;
      }
    };
    // `config` is included so a caller swapping configs (e.g. picking a
    // different banner size, advancing waterfall) triggers cleanup + a fresh
    // init rather than leaving the previous instance in place. videoId /
    // videoType / muted are still captured at init time by closure (muted
    // changes are handled by the separate mute effect below); EventName is
    // stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [isActive, config]);

  useEffect(() => {
    if (!isActive) return;

    const instanceId = instanceIdRef.current;
    if (!instanceId || !(window as any).GenAd?.mute) return;

    (window as any).GenAd.mute(instanceId, muted);
  }, [isActive, muted]);

  useEffect(() => {
    if (!isActive) return;

    const instanceId = instanceIdRef.current;
    if (!instanceId || !(window as any).GenAd?.mute) return;

    (window as any).GenAd.mute(instanceId, muted);
  }, [isActive, muted]);

  return (
    <div
      ref={adContainerRef}
      id={config.adSlotId}
      className={cn(
        "gencl:absolute gencl:z-20 gencl:text-white gencl:h-full gencl:w-full gencl:flex gencl:items-center gencl:justify-center",
        !isVisible && "gencl:opacity-0 gencl:pointer-events-none"
      )}
    />
  );
}
