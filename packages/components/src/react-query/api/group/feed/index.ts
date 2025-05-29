import { useInfiniteQuery } from "@tanstack/react-query";

import { getQueryKeyForGroupFeed } from "src/react-query/keys/feed";

import { parseFeed } from "../../feed/parser";

import { axiosInstance } from "src/react-query/axios-instance";
import { API_PATHS } from "src/react-query/paths";

/**
 *
 * @param slug
 * @param pageParam
 * @returns
 */
async function fetchFeed(
  slug: string,
  pageParam: {
    lastVideoId?: string | undefined;
  }
) {
  return await axiosInstance
    .get(API_PATHS.GROUP_FEED, {
      params: {
        slug,
        is_order_by_pinned: true,
        last_video_id: pageParam?.lastVideoId ?? undefined,
      },
    })
    .then((res) => {
      if (res.status !== 200) {
        throw new Error("Something went wrong feed api.");
      }
      return {
        feed: parseFeed(res.data.data.feeds),
        end: res.data.data.end_of_feed,
      };
    })
    .catch(() => {
      throw new Error("Something went wrong feed api.");
    });
}

/**
 * Custom hook to fetch group feed.
 * @param slug - The unique identifier for the group.
 * @returns An object containing the query key and query function.
 */
export function useGetGroupFeed(slug: string) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }: { pageParam: { lastVideoId?: string } }) =>
      await fetchFeed(slug, pageParam),
    queryKey: getQueryKeyForGroupFeed(slug),
    initialPageParam: { lastVideoId: undefined },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) {
        return;
      }
      return {
        lastVideoId: lastPage.feed[lastPage.feed.length - 1]?.video.id,
      };
    },
  });
}
