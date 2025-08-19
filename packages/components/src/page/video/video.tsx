"use client";
import { useBaseContext } from "@genuin/components/context/base";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { useGetVideoDetailsAsFeed } from "@genuin/components/react-query/api/video";
import { getQueryKeyForVideoDetails } from "@genuin/components/react-query/keys/video";
import { FeedView } from "@genuin/components/templates/feed";
import { useEffect, useState } from "react";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";

import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
export function VideoPage({ videoId }: { videoId: string }) {
  const [showGetApp, setShowGetApp] = useState(false);

  const { data, isLoading, isError } = useGetVideoDetailsAsFeed(videoId);
  const queryKey = getQueryKeyForVideoDetails(videoId);
  const { brandDetails } = useBaseContext();
  const { isMobile } = useDeviceDetection();
  useEffect(() => {
    // This feature is used to show the get app screen to ted(2357) and lululemon(2922)
    if (
      !isMobile &&
      (brandDetails.brand_id.toString() === "2357" ||
        brandDetails.brand_id.toString() === "2922")
    ) {
      setShowGetApp(true);
    }
  }, []);

  if (isError) {
    return <ErrorState type="NO_VIDEO" />;
  }
  return (
    <>
      <FeedView
        feedData={{
          fetchNextPage: () => {},
          hasNextPage: false,
          isFetchingNextPage: false,
          isLoading,
          queryKey,
          videos: data ? [data] : [],
        }}
      />
      {showGetApp && (
        <AuthenticationModal
          open={true}
          showClose={false}
          customStep="GET_APP_WITH_BLURRED_BG"
          getAppData={{ data: { type: "video" } }}
        />
      )}
    </>
  );
}
