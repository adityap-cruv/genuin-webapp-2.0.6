import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";

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
import { useGetVideoDetailsAsFeed } from "../video";
import { EmbedDataType } from "@genuin/components/context/embed/embed.types";
// Mapper for FeedType to corresponding numbers
const feedTypeToNumber: Record<FeedType, number> = {
  HOME: 1,
  LATEST: 2,
  POPULAR: 3,
  EMBED_HOME: 1,
  PLACEMENT_SECTIONS: 1,
  SECTION_FEED: 1,
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
  },
  options?: UseFeedOptionsType
) {
  const deviceId = getDeviceId()
    ? encodeURI(getDeviceId() as string)
    : undefined;

  const contextualFeedParamsBody = {
    ...(options?.contextualParams?.page_context && {
      page_context: options?.contextualParams?.page_context,
    }),
    ...((options?.contextualParams?.geo?.lat ||
      options?.contextualParams?.geo?.long) && {
      geo: {
        lat: parseFloat(options.contextualParams.geo.lat || ""),
        long: parseFloat(options.contextualParams.geo.long || ""),
      },
    }),
    ...{
      url: window.location.href,
    },
  };

  // Select URL and build requestBody based on options
  let url: string;
  let requestBody: Record<string, any> = {};
  switch (true) {
    case feedType === "EMBED_HOME":
      url = API_PATHS.EMBED_FEED_HOME;
      requestBody = {
        type: feedTypeToNumber[feedType],
        ...(deviceId && { device_id: deviceId }),
        ...(pageParam?.lastVideoId && { last_video_id: pageParam.lastVideoId }),
        ...(pageParam?.pageSession && { page_session: pageParam.pageSession }),
        ...(options?.communityIds?.length && {
          community_ids: options.communityIds,
        }),
        ...(options?.groupIds?.length && { loop_ids: options.groupIds }),
      };
      break;

    case feedType === "PLACEMENT_SECTIONS":
      url = API_PATHS.PLACEMENT_SECTIONS;
      requestBody = {
        ...(deviceId && { device_id: deviceId }),
        ...(options?.placementId && { placement_id: options.placementId }),
        ...(options?.styleId && { style_id: options.styleId }),
      };
      break;

    case feedType === "SECTION_FEED":
      url = API_PATHS.SECTION_FEED;
      requestBody = {
        ...(deviceId && { device_id: deviceId }),
        ...(pageParam?.lastVideoId
          ? { last_video_id: pageParam.lastVideoId }
          : options?.lastVideoId
            ? { last_video_id: options.lastVideoId }
            : {}),
        ...(options?.pageSession && { page_session: options.pageSession }),
        ...(options?.sectionId && { section_id: options.sectionId }),
      };
      break;

    default:
      url = API_PATHS.FEED_HOME;
      requestBody = {
        type: feedTypeToNumber[feedType],
        ...(deviceId && { device_id: deviceId }),
        ...(pageParam?.lastVideoId && { last_video_id: pageParam.lastVideoId }),
        ...(pageParam?.pageSession && { page_session: pageParam.pageSession }),
        ...(options?.communityIds?.length && {
          community_ids: options.communityIds,
        }),
        ...(options?.groupIds?.length && { loop_ids: options.groupIds }),
      };
  }

  return await axiosInstance
    .post(url, {
      ...requestBody,
      ...contextualFeedParamsBody,
    })
    .then((res) => {
      if (res.status !== 200) {
        throw new Error("Something went wrong feed api.");
      }
      if (!res.data || !res.data.data) {
        return {
          feed: [],
          hasSection: false,
          pageSession: undefined,
          endOfFeed: true,
          timestamp: 0,
        };
      }

      return {
        feed: parseFeed(res.data.data.feeds),
        hasSection: res.data.data.has_section ?? false,
        pageSession: res.data.data.page_session,
        endOfFeed: res.data.data.end_of_feed,
        timestamp: res.data.data.timestamp,
      };
    })
    .catch(() => {
      throw new Error("Something went wrong feed api.");
    });
}

type UseFeedOptionsType = {
  communityIds?: string[];
  groupIds?: string[];
  startVideoSlug?: string;
  enabled?: boolean;
  placementId?: string;
  styleId?: string;
  sectionId?: string;
  pageSession?: string;
  lastVideoId?: string;
  contextualParams?: EmbedDataType["contextualParams"];
  // Caching options
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
};

/**
 * Return the feed data for the given feed type.
 *
 * This hook supports configurable caching behavior:
 * - By default, no caching is applied (staleTime: 0) to maintain real-time data
 * - Components can override caching options via the options parameter
 * - When caching is enabled, it prevents unnecessary API calls with same parameters
 * - Real-time updates are still possible through the helper functions for reactions, comments, etc.
 *
 * @param feedType - Type of feed (HOME, LATEST, POPULAR, etc.)
 * @param options - Optional configuration including filter parameters and caching options
 * @returns TanStack Query result with feed data and pagination
 */
export type FeedPage = Awaited<ReturnType<typeof fetchFeed>>;

// This variable is used to ensure that the start video is only appended once
let firstTimeAppended = false;

export const useFeed = (feedType: FeedType, options?: UseFeedOptionsType) => {
  // Always call the hook but control its behavior through the enabled flag
  // This ensures consistent hook call order regardless of options changes
  const startVideoSlug = options?.startVideoSlug;
  const videoDetailsQuery = useGetVideoDetailsAsFeed(startVideoSlug || "");

  // Emulate the old conditional behavior while keeping hook call order consistent
  const videoQueryResult = {
    isLoading: startVideoSlug ? videoDetailsQuery.isLoading : false,
    data: startVideoSlug ? videoDetailsQuery.data : undefined,
    isError: startVideoSlug ? videoDetailsQuery.isError : false,
  };

  // Common query configuration with conditional overrides
  const infiniteQueryResult = useInfiniteQuery({
    queryKey: getQueryKeyForFeed(feedType, options),
    queryFn: async ({ pageParam }) =>
      await fetchFeed(feedType, pageParam, options),
    // Calculate the enabled state based on both options.enabled and videoQueryResult if startVideoSlug exists
    enabled: options?.startVideoSlug
      ? !videoQueryResult.isLoading && options?.enabled !== false
      : options?.enabled,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.endOfFeed) return undefined;
      const lastPageData = lastPage.feed[lastPage.feed.length - 1];
      if (!lastPageData) return undefined;
      return {
        pageSession: lastPage.pageSession,
        lastVideoId: lastPageData.video.id,
      };
    },
    // Use custom caching options if provided, otherwise use default behavior
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 0,
    gcTime: options?.gcTime ?? 0,
    // Conditional properties based on startVideoSlug
    ...(options?.startVideoSlug &&
      !videoDetailsQuery.isError && {
        enabled: !videoDetailsQuery.isLoading,
        initialData: videoDetailsQuery.data
          ? {
              pages: [
                {
                  feed: [videoDetailsQuery.data],
                  hasSection: false,
                  pageSession: null,
                  endOfFeed: false,
                  timestamp: 0,
                },
              ],
              pageParams: [{ pageSession: "", lastVideoId: "" }],
            }
          : undefined,
        select: (data: InfiniteData<FeedPage>) => {
          if (firstTimeAppended) return data;
          if (!data) {
            // If no infinite data but video data exists, return it as a single page
            if (videoQueryResult.data) {
              return {
                pages: [
                  {
                    feed: [videoQueryResult.data],
                    hasSection: false,
                    pageSession: null,
                    endOfFeed: false,
                    timestamp: 0,
                  },
                ],
              };
            }
            return undefined;
          }

          let pages = data.pages;

          // Prepend video data if available
          if (videoQueryResult.data) {
            pages = [
              {
                feed: [videoQueryResult.data],
                hasSection: false,
                pageSession: null,
                endOfFeed: false,
                timestamp: 0,
              },
              ...data.pages,
            ];
          }

          // Filter out the start video from subsequent pages if startVideoSlug is provided
          if (options?.startVideoSlug) {
            pages = pages.map((page, index) => {
              if (index === 0 && videoQueryResult.data) {
                // Don't filter the prepended page
                return page;
              }
              return {
                ...page,
                feed: page.feed.filter(
                  (video) => video.video.slug !== options.startVideoSlug
                ),
              };
            });
          }

          firstTimeAppended = true;
          return {
            ...data,
            pages,
          };
        },
      }),
  });

  // Override isLoading when videoQueryResult is loading
  return {
    ...infiniteQueryResult,
    isLoading: videoQueryResult.isLoading || infiniteQueryResult.isLoading,
  };
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
            const sparkCount = video.video.sparkCount ?? 0;
            return {
              ...video,
              video: {
                ...video.video,
                isSparked: isReacted,
                sparkCount: isReacted
                  ? (video.video.sparkCount ?? 0) + 1
                  : sparkCount > 0
                    ? sparkCount - 1
                    : 0,
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

/**
 * Set query data for comment count change in feed
 * @param param0 - Parameters for setting query data for comment count change in feed
 */
export function setQueryDataForCommentCountInFeed({
  queryKey,
  videoId,
  increment = true,
}: {
  queryKey: QueryKey;
  videoId: string;
  increment?: boolean;
}) {
  queryClient.setQueryData<QueryData>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    // Create a new array with the updated comment count
    const updatedPages = oldData.pages.map((page) => {
      return {
        ...page,
        feed: page.feed.map((video) => {
          if (video.video.id === videoId) {
            const commentCount = video.video.commentCount ?? 0;
            return {
              ...video,
              video: {
                ...video.video,
                commentCount: increment
                  ? commentCount + 1
                  : commentCount > 0
                    ? commentCount - 1
                    : 0,
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
