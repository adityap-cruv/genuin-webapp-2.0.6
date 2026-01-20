import { EmbedExpandView } from "./expand-view";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useBaseContext, useEmbedContext } from "@genuin/components/context";
import { useEffect, useMemo, useState } from "react";
import { useFeed } from "@genuin/components/react-query/api/feed";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { isMiddlewareOverlayEnabled } from "@genuin/components/lib/utils";

type EmbedExpandViewProps = {
  videos: PostDetailsType[];
  pageSession?: string;
};

export function EmbedExpandSectionedView({
  videos,
  pageSession,
}: EmbedExpandViewProps) {
  const { embedEventBus, embedData } = useEmbedContext();
  const { isInIframe } = useBaseContext();
  const isSectioned = embedEventBus.getContext().isSectioned;
  const [selectedSection, setSelectedSection] = useState<
    PostDetailsType["section"]
  >(embedEventBus.getContext().selectedSection);

  // Memoize selectedSectionVideos calculation
  const filteredSelectedSectionVideos = useMemo(() => {
    if (!selectedSection?.id) return [];
    return videos.filter((video) => video.section?.id === selectedSection.id);
  }, [videos, selectedSection?.id]);

  // Create feed options object for better memoization and caching
  const feedOptions = useMemo(
    () => ({
      enabled: isSectioned && !!selectedSection?.id,
      sectionId: selectedSection?.id ?? undefined,
      embedId: embedData.embed_id,
      pageSession: pageSession,
      isInIframe,
      shouldShowMiddlewareOverlay: isMiddlewareOverlayEnabled({
        videoLayoutId: embedData.placement_video_layout_id,
        cardLayoutId: embedData.placement_card_layout_id,
      }),
      lastVideoId:
        filteredSelectedSectionVideos.length > 0
          ? (filteredSelectedSectionVideos[
              filteredSelectedSectionVideos.length - 1
            ]?.video?.id ?? undefined)
          : videos.length > 0
            ? (videos[videos.length - 1]?.video?.id ?? undefined)
            : undefined,
      // Pass filtered section videos as placeholder data
      placeholderData:
        filteredSelectedSectionVideos.length > 0
          ? {
              pages: [
                {
                  feed: filteredSelectedSectionVideos,
                  hasSection: true,
                  pageSession: pageSession,
                  endOfFeed: false,
                  timestamp: 0,
                  totalVideos: filteredSelectedSectionVideos.length,
                },
              ],
              pageParams: [{ pageSession: "", lastVideoId: "" }],
            }
          : undefined,
      // Caching configuration for better performance
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    }),
    [
      isSectioned,
      selectedSection?.id,
      pageSession,
      videos,
      filteredSelectedSectionVideos,
      isInIframe,
    ]
  );

  // Use the correct feed type and options for the query with caching
  const {
    isLoading,
    data: sectionFeedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed("SECTION_FEED", feedOptions);
  const totalVideos = sectionFeedData?.pages[0]?.totalVideos;

  // Generate the correct query key for the actual query being made
  const queryKey = getQueryKeyForFeed("SECTION_FEED", feedOptions);

  const sectionVideos = useMemo(
    () => sectionFeedData?.pages?.flatMap((page) => page.feed) || [],
    [sectionFeedData]
  );

  useEffect(() => {
    const handleSelectionChange = () => {
      const newSelectedSection = embedEventBus.getContext().selectedSection;
      // Only update state if the section actually changed
      if (newSelectedSection?.id !== selectedSection?.id) {
        setSelectedSection(newSelectedSection);
      }
    };

    embedEventBus.on("selectedSectionChange", handleSelectionChange);

    // Initial setup on mount
    const initialSection = embedEventBus.getContext().selectedSection;
    if (initialSection?.id !== selectedSection?.id) {
      setSelectedSection(initialSection);
    }

    return () => {
      embedEventBus.off("selectedSectionChange", handleSelectionChange);
    };
  }, [embedEventBus, selectedSection?.id]);

  return (
    <EmbedExpandView
      videos={sectionVideos}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={false}
      queryKey={queryKey}
      totalVideos={totalVideos}
    />
  );
}
