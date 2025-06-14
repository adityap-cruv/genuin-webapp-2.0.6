import { API_PATHS } from "@genuin/components/react-query/paths";
import { parseFeed } from "../../feed/parser";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getQueryKeyForCommunityFeed } from "@genuin/components/react-query/keys/community";

async function fetchLoopVideos(
  slug: string,
  pageParams?: { lastVideoId?: string }
) {
  return await axiosInstance
    .get(API_PATHS.COMMUNITY_FEED, {
      params: {
        slug,
        from_video_id: pageParams?.lastVideoId,
      },
    })
    .then((res) => {
      const resData = res.data.data;
      const videos = parseFeed(resData.feeds);
      return { feed: videos, end: resData.end_of_feed };
    })
    .catch((e) => {
      throw new Error("Something went wrong with loop videos fetching api.");
    });
}

export function useGetCommunityFeed(slug: string, videoId: string) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }: { pageParam?: { lastVideoId?: string } }) =>
      await fetchLoopVideos(slug, pageParam),
    queryKey: getQueryKeyForCommunityFeed(slug, videoId),
    initialPageParam: { lastVideoId: videoId },
    getNextPageParam: (lastPage) => {
      if (lastPage.end || lastPage.feed.length === 0) {
        return undefined;
      }
      return {
        lastVideoId: lastPage?.feed[lastPage.feed.length - 1]?.video.id,
      };
    },
  });
}
