import { useInfiniteQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { getQueryKeyForCommunityFeed } from "@genuin/components/react-query/keys/community";
import { API_PATHS } from "@genuin/components/react-query/paths";

import { parseFeed } from "../../feed/parser";

async function fetchLoopVideos(slug: string, axios: AxiosInstance, pageParams?: { lastVideoId: string }) {
  return await axios
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
    .catch((_e) => {
      throw new Error("Something went wrong with loop videos fetching api.");
    });
}

export function useGetCommunityFeed(slug: string, videoId: string) {
  const axios = useAxiosInstance();

  return useInfiniteQuery({
    queryFn: ({ pageParam }) => fetchLoopVideos(slug, axios, pageParam),
    queryKey: getQueryKeyForCommunityFeed(slug, videoId),
    initialPageParam: { lastVideoId: videoId },
    getNextPageParam: (lastPage) => {
      if (lastPage.end || lastPage.feed.length === 0) {
        return undefined;
      }
      const lastFeed = lastPage.feed[lastPage.feed.length - 1];
      if (!lastFeed) {
        return undefined;
      }
      return {
        lastVideoId: lastFeed.video?.id ?? "",
      };
    },
  });
}
