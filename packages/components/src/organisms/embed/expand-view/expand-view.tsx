import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { FeedView } from "@genuin/components/templates/feed";
import { useEffect, useState } from "react";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { QueryKey } from "@tanstack/react-query";
import { RootPortal } from "@genuin/components/molecules/root-portal";

type EmbedExpandViewProps = {
  videos: PostDetailsType[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  queryKey: QueryKey;
};

export function EmbedExpandView({
  videos,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  queryKey,
}: EmbedExpandViewProps) {
  const { changeActiveIndex, embedEventBus, goBackToPreviousPlayerType } =
    useEmbedContext();
  const [showExpandView, setShowExpandView] = useState(
    embedEventBus.getContext().activePlayerType === "expand-view"
  );
  const [startIndex, setStartIndex] = useState(0);
  const {
    engagement: {
      engagementTools: { comment, share, repost, spark },
    },
  } = useEmbedConfigs();

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType
    ) => {
      if (context.activePlayerType === "expand-view") {
        setShowExpandView(true);
        setStartIndex(context.activeIndex);
      } else {
        setShowExpandView(false);
      }
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, []);

  if (showExpandView)
    return (
      <RootPortal>
        <FeedView
          startIndex={startIndex}
          defaultExpandView
          onCloseExpandView={goBackToPreviousPlayerType}
          variant="expand"
          feedData={{
            videos,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading,
            queryKey,
          }}
          embedOptions={{
            actions: {
              comments: comment,
              share: share,
              reaction: spark,
              repost: repost,
            },
          }}
          onActiveIndexChange={changeActiveIndex}
          disableNativeFullscreenApi
        />
      </RootPortal>
    );
}
