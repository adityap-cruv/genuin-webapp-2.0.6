import { useInfiniteQuery } from "@tanstack/react-query";

import { getQueryKeyForFeed } from "src/react-query/keys/feed";
import type { FeedType } from "src/types/post";

import { axiosInstance } from "../../axios-instance";

import { parseFeed } from "./parser";
import { getDeviceId } from "src/lib/utils/device-id";
// Mapper for FeedType to corresponding numbers
const feedTypeToNumber: Record<FeedType, number> = {
  HOME: 1,
  LATEST: 2,
  POPULAR: 3,
};

/**
 *
 * @param feedType 1 for home, 2 for latest, 3 for popular
 * @param pageParam
 * @returns
 */
async function fetchFeed(
  feedType: FeedType,
  pageParam: {
    pageSession?: string;
    lastVideoId?: string | undefined;
  }
) {
  const deviceId = getDeviceId()
    ? encodeURI(getDeviceId() as string)
    : undefined;
  return await axiosInstance
    .post("/goservices/feed/home", {
      type: feedTypeToNumber[feedType],
      last_video_id: pageParam?.lastVideoId ?? undefined,
      page_session: pageParam?.pageSession ?? undefined,
      device_id: deviceId,
    })
    .then((res) => {
      if (res.status !== 200) {
        throw new Error("Something went wrong feed api.");
      }
      return {
        feed: parseFeed(res.data.data.feeds),
        pageSession: res.data.data.page_session,
      };
    })
    .catch(() => {
      throw new Error("Something went wrong feed api.");
    });
}

/**
 * Return the feed data for the given feed type.
 * @param feedType
 * @returns
 */
export const useFeed = (feedType: FeedType) => {
  return useInfiniteQuery({
    queryKey: getQueryKeyForFeed(feedType),
    queryFn: ({
      pageParam,
    }: {
      pageParam?: { pageSession?: string; lastVideoId?: string | undefined };
    }) =>
      fetchFeed(
        feedType,
        pageParam ?? { pageSession: undefined, lastVideoId: undefined }
      ),
    initialPageParam: {
      pageSession: undefined,
      lastVideoId: undefined,
    },
    getNextPageParam: (lastPage) => {
      const lastPageData = lastPage.feed[lastPage.feed.length - 1];
      if (!lastPageData) return undefined;

      return {
        pageSession: lastPage.pageSession,
        lastVideoId: lastPageData.video.id as string | undefined,
      };
    },
  });
};
