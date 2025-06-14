import { QueryKey, useInfiniteQuery } from "@tanstack/react-query";

import { getDeviceId } from "@genuin/components/lib/utils/device-id";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import type {
  CommunityUserRole,
  FeedType,
} from "@genuin/components/types/post";

import { axiosInstance } from "../../axios-instance";

import { parseFeed } from "./parser";
import { queryClient } from "@genuin/components/react-query/client";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { GroupUserStatusType } from "@genuin/components/types/roles";
// Mapper for FeedType to corresponding numbers
const feedTypeToNumber: Record<FeedType, number> = {
  HOME: 1,
  LATEST: 2,
  POPULAR: 3,
};

// TODO: Suggestion unify this api with all the apis for feed in profile/group/community. So that
// mismatch between response types in the feed apis can be avoided.
/**
 *
 * @param feedType 1 for home, 2 for latest, 3 for popular
 * @param pageParam
 * @returns
 */
async function fetchFeed(
  feedType: FeedType,
  pageParam?: {
    pageSession?: string;
    lastVideoId?: string | undefined;
  }
) {
  const deviceId = getDeviceId()
    ? encodeURI(getDeviceId() as string)
    : undefined;

  return await axiosInstance
    .post(API_PATHS.FEED_HOME, {
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
    queryFn: async ({
      pageParam,
    }: {
      pageParam?: { pageSession?: string; lastVideoId?: string };
    }) => await fetchFeed(feedType, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      const lastPageData = lastPage.feed[lastPage.feed.length - 1];
      if (!lastPageData) return undefined;

      return {
        pageSession: lastPage.pageSession,
        lastVideoId: lastPageData.video.id,
      };
    },
  });
};

type QueryData = ReturnType<typeof useFeed>["data"];
/**
 *
 * @param param0 - Parameters for setting query data
 */
export function setQueryDataForReactionInFeed({
  queryKey,
  videoId,
  isReacted,
}: {
  queryKey: QueryKey;
  videoId: string;
  isReacted: boolean;
}) {
  queryClient.setQueryData<QueryData>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    // Create a new array with the updated reaction state
    const updatedPages = oldData.pages.map((page) => {
      return {
        ...page,
        feed: page.feed.map((video) => {
          if (video.video.id === videoId) {
            return {
              ...video,
              video: {
                ...video.video,
                isSparked: isReacted,
                sparkCount: isReacted
                  ? (video.video.sparkCount ?? 0) + 1
                  : (video.video.sparkCount ?? 0) - 1,
              },
            };
          }
          return video;
        }),
      };
    });

    // Return the updated data structure
    return {
      ...oldData,
      pages: updatedPages,
    };
  });
}

/**
 * Set query data for join community status in feed
 * @param param0 - Parameters for setting query data for join community status in feed
 */
export function setQueryDataForJoinCommunityStatusInFeed({
  queryKey,
  communityId,
  newRole,
}: {
  queryKey: QueryKey;
  communityId: string;
  newRole: CommunityUserRole;
}) {
  queryClient.setQueryData<QueryData>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    // Create a new array with the updated community role
    const updatedPages = oldData.pages.map((page) => {
      return {
        ...page,
        feed: page.feed.map((video) => {
          if (video.community.id === communityId) {
            return {
              ...video,
              community: {
                ...video.community,
                userRole: newRole,
              },
            };
          }
          return video;
        }),
      };
    });

    // Return the updated data structure
    return {
      ...oldData,
      pages: updatedPages,
    };
  });
}

/**
 * Set query data for join group status in feed
 * @param param0 - Parameters for setting query data for join group status in feed
 */
export function setQueryDataForJoinGroupStatusInFeed({
  queryKey,
  groupId,
  newRole,
}: {
  queryKey: QueryKey;
  groupId: string;
  newRole: GroupUserStatusType;
}) {
  queryClient.setQueryData<QueryData>(queryKey, (oldData): QueryData => {
    if (!oldData) return oldData;

    // Create a new array with the updated group role
    const updatedPages = oldData.pages.map((page) => {
      return {
        ...page,
        feed: page.feed.map((video) => {
          if (video.group?.id === groupId) {
            return {
              ...video,
              group: {
                ...video.group,
                role: newRole,
                isSubscribed:
                  newRole === "JOINED" ? true : video.group.isSubscribed,
              },
            };
          }
          return video;
        }),
      };
    });

    // Return the updated data structure
    return {
      ...oldData,
      pages: updatedPages,
    };
  });
}

/**
 * Set query data for group subscription change in feed
 * @param param0 - Parameters for setting query data for group subscription change in feed
 */
export function setQueryDataForGroupSubscriptionChangeInFeed({
  queryKey,
  groupId,
  isSubscribed,
}: {
  queryKey: QueryKey;
  groupId: string;
  isSubscribed: boolean;
}) {
  queryClient.setQueryData<QueryData>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    // Create a new array with the updated group subscription status
    const updatedPages = oldData.pages.map((page) => {
      return {
        ...page,
        feed: page.feed.map((video) => {
          if (video.group?.id === groupId) {
            return {
              ...video,
              group: {
                ...video.group,
                isSubscribed,
              },
            };
          }
          return video;
        }),
      };
    });

    // Return the updated data structure
    return {
      ...oldData,
      pages: updatedPages,
    };
  });
}
