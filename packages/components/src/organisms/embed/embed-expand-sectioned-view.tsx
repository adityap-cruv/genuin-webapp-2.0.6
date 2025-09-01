import { EmbedExpandView } from "./expand-view";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useEmbedContext } from "@genuin/components/context";
import { useEffect, useMemo, useState } from "react";
import { useFeed } from "@genuin/components/react-query/api/feed";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";

type EmbedExpandViewProps = {
  videos: PostDetailsType[];
  pageSession: string;
};

export function EmbedExpandSectionedView({
  videos,
  pageSession,
}: EmbedExpandViewProps) {
  const { embedEventBus } = useEmbedContext();
  const isSectioned = embedEventBus.getContext().isSectioned;
  const [selectedSection, setSelectedSection] = useState<
    PostDetailsType["section"]
  >(embedEventBus.getContext().selectedSection);

  // TODO IMPROVE API CALLS
  // Create feed options object for better memoization
  const feedOptions = useMemo(
    () => ({
      enabled: isSectioned && !!selectedSection?.id,
      sectionId: selectedSection?.id ?? undefined,
      pageSession: pageSession,
      lastVideoId:
        videos.length > 0
          ? (videos[videos.length - 1]?.video?.id ?? undefined)
          : undefined,
    }),
    [isSectioned, selectedSection?.id, pageSession, videos]
  );

  // Use the correct feed type and options for the query
  const {
    isLoading,
    data: sectionFeedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed("SECTION_FEED", feedOptions);

  // Generate the correct query key for the actual query being made
  const queryKey = getQueryKeyForFeed("SECTION_FEED", feedOptions);

  const sectionVideos = useMemo(
    () => sectionFeedData?.pages?.flatMap((page) => page.feed) || [],
    [sectionFeedData]
  );

  // Memoize selectedSectionVideos calculation
  const filteredSelectedSectionVideos = useMemo(() => {
    if (!selectedSection?.id) return [];
    return videos.filter((video) => video.section?.id === selectedSection.id);
  }, [videos, selectedSection?.id]);

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

  // Combine videos: local filtered videos first, then API fetched videos when available
  const finalVideos = useMemo(() => {
    if (!isSectioned) return videos;

    const localVideos = filteredSelectedSectionVideos;

    // If API is still loading or no data yet, return only local videos
    if (isLoading || !sectionFeedData || sectionVideos.length === 0) {
      return localVideos;
    }

    // When API data is available, combine local videos with API videos
    // Avoid duplicates by filtering out API videos that already exist in local videos
    const uniqueApiVideos = sectionVideos.filter(
      (apiVideo) =>
        !localVideos.some(
          (localVideo) => localVideo.video.id === apiVideo.video.id
        )
    );

    return [...localVideos, ...uniqueApiVideos];
  }, [
    isSectioned,
    videos,
    filteredSelectedSectionVideos,
    sectionVideos,
    isLoading,
    sectionFeedData,
  ]);

  return (
    <EmbedExpandView
      videos={finalVideos}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={false}
      queryKey={queryKey}
    />
  );
}
