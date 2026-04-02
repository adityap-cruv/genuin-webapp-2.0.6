"use client";
import { useEffect, useRef } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { useAnalytics } from "../../../context/analytics/context";
import type { GenAdConfig, GenAdContainerProps } from "./gen-ad.types";

function getAdSource(config: GenAdConfig, provider?: string): string {
  const map: Record<string, string | undefined> = {
    video: config.video?.platform,
    display: config.banner?.platform,
    native: config.native?.platform,
  };
  return provider
    ? (map[provider] ?? "")
    : (map.video ?? map.display ?? map.native ?? "");
}

const GEN_AD_SCRIPT_URL =
  "https://media.begenuin.com/ad-sdk/in-feed/gen_ad.min.js";

// const GEN_AD_SCRIPT_URL = "http://localhost:4000/dist/gen_ad.min.js";

function loadGenAdScript(): void {
  const existing = document.querySelector(`script[src="${GEN_AD_SCRIPT_URL}"]`);
  if (existing) return; // already loading or loaded
  const script = document.createElement("script");
  script.src = GEN_AD_SCRIPT_URL;
  script.async = true;
  script.onerror = () => {};
  document.head.appendChild(script);
}

export function GenAdContainer({
  config,
  isActive,
  isVisible,
  videoId,
  videoType,
  moveToNextVideo,
  onAdFilled,
  onAdFillFailed,
  onAdCompleted,
}: GenAdContainerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const { track, EventName } = useAnalytics();
  const trackRef = useRef(track);
  trackRef.current = track;

  const moveToNextVideoRef = useRef(moveToNextVideo);
  moveToNextVideoRef.current = moveToNextVideo;

  const onAdFilledRef = useRef(onAdFilled);
  onAdFilledRef.current = onAdFilled;

  const onAdFillFailedRef = useRef(onAdFillFailed);
  onAdFillFailedRef.current = onAdFillFailed;

  const onAdCompletedRef = useRef(onAdCompleted);
  onAdCompletedRef.current = onAdCompleted;

  useEffect(() => {
    if (!isActive) return;

    let instanceId: string | null = null;
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
          const { adSlotId: _adSlotId, ...genAdInitConfig } = config;
          const baseAdParams = {
            video_id: videoId,
            ad_type: "in_feed",
            video_type: videoType,
          };
          instanceId = (window as any).GenAd.init({
            containerElement: adContainerRef.current,
            ...genAdInitConfig,
            onStageStart: (provider: string) => {
              trackRef.current(EventName.AD_REQUESTED, {
                ...baseAdParams,
                provider,
                ad_source: getAdSource(config, provider),
              });
            },
            onStageSuccess: (provider: string) => {
              trackRef.current(EventName.AD_RESPONSE_RECEIVED, {
                ...baseAdParams,
                provider,
                ad_source: getAdSource(config, provider),
              });
              onAdFilledRef.current?.(provider);
            },
            onStageFail: (provider: string, error: Error) => {
              const msg = error?.message ?? "";
              const adSource = getAdSource(config, provider);
              const params = { ...baseAdParams, provider, ad_source: adSource };
              if (msg.includes("303")) {
                trackRef.current(EventName.AD_REQUEST_FAILED, params);
              } else if (
                msg.includes("401") ||
                msg.includes("403") ||
                msg.includes("404")
              ) {
                trackRef.current(EventName.AD_RENDER_FAILED, params);
              } else {
                trackRef.current(EventName.AD_ERROR, params);
              }
            },
            // onWaterfallSuccess: (provider: string) => {

            // },
            onWaterfallFail: () => {
              console.log("waterfall failed");
              onAdFillFailedRef.current?.();
            },
            onAdCompleted: (provider: string) => {
              trackRef.current(EventName.AD_COMPLETED, {
                ...baseAdParams,
                provider,
                ad_source: getAdSource(config, provider),
              });
              moveToNextVideoRef.current();
              onAdCompletedRef.current?.();
            },
            onVolumeChange: (_data: { isMuted: boolean; volume: number }) => {},
            onAdBlocked: (_reason: string) => {},
            events: {
              onAdRendered: (event: any) => {
                trackRef.current(EventName.AD_RENDERED, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(config, event?.provider),
                });
              },
              onAdImpression: (event: any) => {
                trackRef.current(EventName.AD_IMPRESSION, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(config, event?.provider),
                });
              },
              onAdStarted: (event: any) => {
                trackRef.current(EventName.AD_STARTED, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(config, event?.provider),
                });
              },
              onAdQuartile: (event: any) => {
                trackRef.current(EventName.AD_MEDIA_QUARTILE, {
                  ...baseAdParams,
                  provider: event?.provider,
                  quartile: event?.quartile,
                  ad_source: getAdSource(config, event?.provider),
                });
              },
              onAdSkipped: (event: any) => {
                trackRef.current(EventName.AD_SKIPPED, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(config, event?.provider),
                });
              },
              onAdClicked: (event: any) => {
                trackRef.current(EventName.AD_CLICKED, {
                  ...baseAdParams,
                  provider: event?.provider,
                  ad_source: getAdSource(config, event?.provider),
                });
              },
            },
          });
        } catch (error) {}
      }
    };

    if ((window as any).GenAd && adContainerRef.current) {
      initAd();
    } else {
      loadGenAdScript();
      initInterval = setInterval(initAd, 100);
    }

    return () => {
      clearInterval(initInterval);
      if (instanceId && (window as any).GenAd) {
        (window as any).GenAd.destroy(instanceId);
      }
    };
  }, [isActive, config]);

  return (
    <div
      ref={adContainerRef}
      id={config.adSlotId}
      className={cn(
        "gencl:absolute gencl:z-20 gencl:text-white gencl:h-full gencl:w-full gencl:flex gencl:items-center gencl:justify-center",
        !isVisible && "gencl:hidden",
      )}
    />
  );
}
