import { useInfiniteQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { getQueryKeyForGroupFeed } from "@genuin/components/react-query/keys/feed";
import { API_PATHS } from "@genuin/components/react-query/paths";

import { parseFeed } from "../../feed/parser";

/**
 *
 * @param slug
 * @param pageParam
 * @param axiosInstance - Axios instance to use for the request
 * @returns
 */
async function fetchFeed(
  slug: string,
  pageParam: {
    lastVideoId?: string | undefined;
  },
  axiosInstance: AxiosInstance
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
  const axiosInstance = useAxiosInstance();

  return useInfiniteQuery({
    queryFn: ({ pageParam }: { pageParam: { lastVideoId?: string } }) => fetchFeed(slug, pageParam, axiosInstance),
    queryKey: getQueryKeyForGroupFeed(slug),
    initialPageParam: { lastVideoId: undefined as string | undefined },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) {
        return;
      }
      return {
        lastVideoId: lastPage.feed[lastPage.feed.length - 1]?.video?.id,
      };
    },
  });
}
