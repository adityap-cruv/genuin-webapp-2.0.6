"use client";
import { cn } from "@genuin/ui/lib/utils";
import { useEffect, useRef } from "react";

import { useAnalytics } from "../../../context/analytics/context";
import { ensureStylesInShadowRoot } from "../../root-portal/shadow-root/shadow-dom.utils";

import type { GenAdConfig, GenAdContainerProps } from "./gen-ad.types";

function getAdSource(config: GenAdConfig, provider?: string): string {
  const map: Record<string, string | undefined> = {
    video: Array.isArray(config.video) ? config.video[0]?.platform : config.video?.platform,
    display: Array.isArray(config.banner) ? config.banner[0]?.platform : config.banner?.platform,
    native: Array.isArray(config.native) ? config.native[0]?.platform : config.native?.platform,
  };
  return provider ? (map[provider] ?? "") : (map.video ?? map.display ?? map.native ?? "");
}

const GEN_AD_SCRIPT_URL = "https://media.begenuin.com/ad-sdk/1.0.0/gen_ad.min.js";

// const GEN_AD_SCRIPT_URL = "http://localhost:4000/dist/gen_ad.min.js";

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

  const onSystemMuteChangeRef = useRef(onSystemMuteChange);
  onSystemMuteChangeRef.current = onSystemMuteChange;

  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    if (!isActive) return;

    let initInterval: ReturnType<typeof setInterval>;
    let missingContainerAttempts = 0;

    const initAd = () => {
      if ((window as any).GenAd && !adContainerRef.current) {
        missingContainerAttempts += 1;
        if (missingContainerAttempts >= 2) {
          clearInterval(initInterval);
        }
        return;
      }
      if ((window as any).GenAd && adContainerRef.current) {
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
            onStageSuccess: (provider: string) => {
              trackRef.current(EventName.AD_RESPONSE_RECEIVED, {
                ...baseAdParams,
                provider,
                ad_source: getAdSource(configRef.current, provider),
              });
              onAdFilledRef.current?.(provider);
            },
            onStageFail: (provider: string, error: Error) => {
              const msg = error?.message ?? "";
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

    return () => {
      clearInterval(initInterval);
      if (instanceIdRef.current && (window as any).GenAd) {
        (window as any).GenAd.destroy(instanceIdRef.current);
        instanceIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- videoId/videoType/muted captured at init time; muted changes handled by separate effect; EventName is stable
  }, [isActive]);

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
        !isVisible && "gencl:hidden"
      )}
    />
  );
}
