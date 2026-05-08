import { UrlParamProvider } from "@genuin/components";
import { AxiosProvider } from "@genuin/components";
import { AnalyticsProvider } from "@genuin/components/context/analytics";
import { AuthProvider } from "@genuin/components/context/auth";
import { BaseContextProvider } from "@genuin/components/context/base";
import { EmbedProvider } from "@genuin/components/context/embed";
import type { EmbedDataType } from "@genuin/components/context/embed/embed.types";
import { LinkProvider } from "@genuin/components/context/link";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { type BrandType } from "@genuin/components/lib/utils/brand-layout";
import { TRACK_OBSERVABILITY } from "@genuin/components/lib/utils/env";
import { ReactQueryClientProvider } from "@genuin/components/react-query/react-query-provider";
import type { AuthUser } from "@genuin/components/types/auth";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { cn } from "@genuin/ui/lib/utils";
import { Suspense, lazy, useEffect } from "react";

import type { SingleEmbedDataConfig } from "@/type";

import { Genuin } from "./genuin-sdk";

const LazyEmbed = lazy(() =>
  import("@genuin/components/organisms/embed/embed")
    .then((module) => ({
      default: module.Embed,
    }))
    .catch((error) => {
      console.error("Failed to load Embed component:", error);
      // Fallback to a basic error component
      return { default: () => <div>Failed to load embed component</div> };
    })
);

const LazyStandardWall = lazy(() =>
  import("@genuin/components/page/standard-wall/standard-wall")
    .then((module) => ({
      default: module.StandardWall,
    }))
    .catch((error) => {
      console.error("Failed to load StandardWall component:", error);
      // Fallback to a basic error component
      return {
        default: () => <div>Failed to load standard wall component</div>,
      };
    })
);

interface EmbedRootProps {
  targetContainer: HTMLElement;
  container: HTMLElement;
  embedData: EmbedDataType;
  brandDetails: BrandDetailsConfigType;
  config: Partial<SingleEmbedDataConfig>;
  user?: AuthUser | null;
  wasLazilyLoaded?: boolean;
  brandLayoutType: BrandType;
  isOnlyForExpand?: boolean;
  /** Called once on first mount of the embed content — used to remove the shadow-DOM skeleton loader. */
  onContentReady?: () => void;
}

function EmbedSkeleton({ container, theme }: { container: HTMLElement; theme?: "dark" | "light" }) {
  const bgClass = theme === "dark" ? "gencl:bg-secondary-900" : "gencl:bg-secondary-200";
  const shimmerBgClass = theme === "dark" ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100";
  const { isDesktop } = useDeviceDetectMediaQuery();
  const websiteType = container.getAttribute("data-website-type");

  return (
    <div className={`gencl:relative gencl:h-full gencl:w-full gencl:rounded-md ${isDesktop && bgClass}`}>
      {websiteType ? (
        <div
          style={{
            height: !isDesktop ? "100%" : "calc(100% - 68px)",
          }}
          className={cn(
            "gencl:w-full gencl:flex gencl:overflow-auto gencl:gap-2",
            !isDesktop && websiteType === "polaris" && "gencl:flex-col"
          )}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className={cn(
                "gencl:aspect-square gencl:flex-shrink-0 gencl:rounded-md",
                !isDesktop && websiteType === "polaris" ? "gencl:w-full" : "gencl:h-full",
                shimmerBgClass
              )}
            />
          ))}
        </div>
      ) : (
        // TODO IMPROVE IT AS MAKE IT DYNAMIC BASED ON THE CONTAINER SIZE
        // <SdkSkeleton
        //   containerHeight={container.clientHeight || 400}
        //   containerWidth={container.clientWidth || 600}
        //   statsHeight={68}
        //   linkoutHeight={40}
        //   spaceBetweenVideos={8}
        //   availableHeight={container.clientHeight || 400}
        // />
        <></>
      )}
    </div>
  );
}

export function EmbedRoot({
  targetContainer,
  container,
  embedData,
  brandDetails,
  config,
  user,
  wasLazilyLoaded,
  brandLayoutType,
  isOnlyForExpand,
  onContentReady,
}: EmbedRootProps) {
  // Signal to the SDK that real content has mounted so it can remove the shadow-DOM skeleton.
  useEffect(() => {
    onContentReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ReactQueryClientProvider>
      <AxiosProvider brandId={brandDetails.brand_id}>
        <EmbedProvider
          container={targetContainer}
          trackObservability={(brandDetails.track_observability_enabled ?? true) && TRACK_OBSERVABILITY === "true"}
          sdkInitTime={Genuin.getSDKInitTime()}
          embedData={{
            ...embedData,
            brand_id: embedData.brand_id,
            action: embedData.autoUserInteractionToPerform,
            initialVideoIds: config.initialVideoIds,
            videoIds: config.videoIds,
            websiteType: config.websiteType,
            startVideoSlug: config.startVideoSlug,
            configs: {
              allowGestureScroll: config.allowGestureScroll,
            },
          }}
          brandLayoutType={brandLayoutType}>
          <BaseContextProvider
            brandDetails={brandDetails}
            theme={config.theme}
            useShadowDOM={config.useShadowDOM ?? false}
            isEmbed>
            <LinkProvider>
              <AnalyticsProvider
                embedData={embedData}
                isWebSDK={true}
                user={user ?? null}
                brandDetails={brandDetails}
                currentScreen={config.embedDetails?.placement_id ? "view_placement" : "view_embed"}>
                <AuthProvider onSignIn={() => {}} onSignOut={() => {}} onUpdateUser={() => {}} user={user}>
                  <UrlParamProvider name={embedData.name}>
                    <Suspense fallback={<EmbedSkeleton theme={config.theme} container={container} />}>
                      {embedData.style === "standard_wall" ? (
                        <LazyStandardWall />
                      ) : (
                        <LazyEmbed wasLazilyLoaded={wasLazilyLoaded} isOnlyForExpand={isOnlyForExpand} />
                      )}
                    </Suspense>
                    {/* {config.useShadowDOM && (
                      <Suspense fallback={null}>
                        <LazyToaster />
                      </Suspense>
                    )} */}
                  </UrlParamProvider>
                </AuthProvider>
              </AnalyticsProvider>
            </LinkProvider>
          </BaseContextProvider>
        </EmbedProvider>
      </AxiosProvider>
    </ReactQueryClientProvider>
  );
}
