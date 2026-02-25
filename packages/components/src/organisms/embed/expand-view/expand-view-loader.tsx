import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { lazy, Suspense, useEffect, useState } from "react";
import { QueryKey } from "@tanstack/react-query";
import { FeedSkeleton } from "@genuin/components/templates/feed/feed-skeleton.js";

const EmbedExpandView = lazy(() =>
  import("./expand-view.js").then((m) => ({ default: m.EmbedExpandView })),
);

const EmbedExpandSectionedView = lazy(() =>
  import("./embed-expand-sectioned-view.js").then((m) => ({
    default: m.EmbedExpandSectionedView,
  })),
);

type ExpandViewLoaderProps = {
  videos: PostDetailsType[];
  isSectioned: boolean;
  pageSession?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  queryKey: QueryKey;
  totalVideos: number;
  fetchNextPage: () => void;
};

export function ExpandViewLoader({
  videos,
  isSectioned,
  pageSession,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  queryKey,
  totalVideos,
  fetchNextPage,
}: ExpandViewLoaderProps) {
  const { embedEventBus } = useEmbedContext();
  const [isExpandMode, setIsExpandMode] = useState(
    embedEventBus.getContext().activePlayerType === "expand-view",
  );

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      _eventData: any,
      context: EmbedEventContextType,
    ) => {
      setIsExpandMode(context.activePlayerType === "expand-view");
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [embedEventBus]);

  if (!isExpandMode) {
    return null;
  }

  if (isSectioned) {
    return (
      <EmbedExpandSectionedView videos={videos} pageSession={pageSession} />
    );
  }

  return (
    <Suspense fallback={<FeedSkeleton variant="fullscreen" />}>
      <EmbedExpandView
        videos={videos}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        queryKey={queryKey}
        totalVideos={totalVideos}
        fetchNextPage={fetchNextPage}
      />
    </Suspense>
  );
}
