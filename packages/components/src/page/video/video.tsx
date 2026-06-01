"use client";
import { useEffect, useState } from "react";
import { lazy, Suspense } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { ErrorState } from "@genuin/components/molecules/error-state";
import type { AuthenticationModalProps } from "@genuin/components/organisms/authentication-modal";
import { useFeed } from "@genuin/components/react-query/api/feed";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { FeedView } from "@genuin/components/templates/feed";

const AuthenticationModal = lazy(() =>
  import("@genuin/components/organisms/authentication-modal").then((m) => ({
    default: m.AuthenticationModal,
  }))
) as React.ComponentType<AuthenticationModalProps>;
export function VideoPage({ videoId }: { videoId: string }) {
  const [showGetApp, setShowGetApp] = useState(false);
  const videoParams = {
    isSingleVideo: true,
    isInIframe: false,
    startVideoSlug: videoId,
  };
  const { data, isLoading, isError } = useFeed("VIDEO", videoParams);
  const queryKey = getQueryKeyForFeed("VIDEO", videoParams);
  const { brandDetails } = useBaseContext();

  const { isMobile } = useDeviceDetection();

  useEffect(() => {
    // This feature is used to show the get app screen to ted(2357) and lululemon(2922)
    if (!isMobile && (brandDetails.brand_id.toString() === "2357" || brandDetails.brand_id.toString() === "2922")) {
      setShowGetApp(true);
    }
  }, []);

  if (isError) {
    return <ErrorState type="NO_VIDEO" />;
  }
  return (
    <>
      <FeedView
        variant="page"
        feedData={{
          fetchNextPage: () => {},
          hasNextPage: false,
          isFetchingNextPage: false,
          isLoading,
          queryKey,
          videos: data?.pages?.[0]?.feed || [],
        }}
      />
      {showGetApp && (
        <Suspense fallback={null}>
          <AuthenticationModal
            open={true}
            showClose={false}
            customStep="GET_APP_WITH_BLURRED_BG"
            getAppData={{ data: { type: "video" } }}
          />
        </Suspense>
      )}
    </>
  );
}
