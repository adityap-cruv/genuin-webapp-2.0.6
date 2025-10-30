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
  const deviceId = getDeviceId(options?.isInIframe || false)
    ? encodeURI(getDeviceId(options?.isInIframe || false) as string)
    : undefined;

  const contextualFeedParamsBody = {
    // Basic context
    ...(options?.contextualParams?.page_context && {
      page_context: options?.contextualParams?.page_context,
    }),
    ...(options?.contextualParams?.previous_page_context && {
      previous_page_context: options?.contextualParams?.previous_page_context,
    }),
    ...(options?.contextualParams?.user_context && {
      user_context: options?.contextualParams?.user_context,
    }),

    // Geographic context
    ...((options?.contextualParams?.geo?.lat ||
      options?.contextualParams?.geo?.long) && {
      geo: {
        lat:
          typeof options.contextualParams.geo.lat === "number"
            ? options.contextualParams.geo.lat
            : parseFloat(String(options.contextualParams.geo.lat || "")),
        long:
          typeof options.contextualParams.geo.long === "number"
            ? options.contextualParams.geo.long
            : parseFloat(String(options.contextualParams.geo.long || "")),
        ...(options.contextualParams.geo.radius_limit && {
          radius_limit: options.contextualParams.geo.radius_limit,
        }),
      },
    }),

    // Place context
    ...(options?.contextualParams?.place &&
      (options.contextualParams.place.country ||
        options.contextualParams.place.state ||
        options.contextualParams.place.city ||
        options.contextualParams.place.zipcode) && {
        place: {
          ...(options.contextualParams.place.country && {
            country: options.contextualParams.place.country,
          }),
          ...(options.contextualParams.place.state && {
            state: options.contextualParams.place.state,
          }),
          ...(options.contextualParams.place.city && {
            city: options.contextualParams.place.city,
          }),
          ...(options.contextualParams.place.zipcode && {
            zipcode: options.contextualParams.place.zipcode,
          }),
        },
      }),

    // User segmentation
    ...(options?.contextualParams?.user_segments &&
      (options.contextualParams.user_segments.age ||
        options.contextualParams.user_segments.min_age ||
        options.contextualParams.user_segments.max_age ||
        options.contextualParams.user_segments.segment ||
        options.contextualParams.user_segments.gender ||
        options.contextualParams.user_segments.race) && {
        user_segments: {
          ...(options.contextualParams.user_segments.age && {
            age: options.contextualParams.user_segments.age,
          }),
          ...(options.contextualParams.user_segments.min_age && {
            min_age: options.contextualParams.user_segments.min_age,
          }),
          ...(options.contextualParams.user_segments.max_age && {
            max_age: options.contextualParams.user_segments.max_age,
          }),
          ...(options.contextualParams.user_segments.segment && {
            segment: options.contextualParams.user_segments.segment,
          }),
          ...(options.contextualParams.user_segments.gender && {
            gender: options.contextualParams.user_segments.gender,
          }),
          ...(options.contextualParams.user_segments.race && {
            race: options.contextualParams.user_segments.race,
          }),
        },
      }),

    // Targeting arrays
    ...(options?.contextualParams?.brands_ids?.length && {
      brands_ids: options.contextualParams.brands_ids,
    }),
    ...(options?.contextualParams?.user_interests?.length && {
      user_interests: options.contextualParams.user_interests,
    }),
    ...(options?.contextualParams?.posted_by_user_ids?.length && {
      posted_by_user_ids: options.contextualParams.posted_by_user_ids,
    }),
    ...(options?.contextualParams?.community_ids?.length && {
      community_ids: options.contextualParams.community_ids,
    }),
    ...(options?.contextualParams?.loop_ids?.length && {
      loop_ids: options.contextualParams.loop_ids,
    }),

    // Time context
    ...(options?.contextualParams?.time && {
      time: options.contextualParams.time,
    }),

    // URL context (always include current URL)
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
        ...(pageParam?.pageSession && { page_session: pageParam.pageSession }),
        ...(pageParam?.lastVideoId
          ? { last_video_id: pageParam.lastVideoId }
          : options?.lastVideoId
            ? { last_video_id: options.lastVideoId }
            : {}),
        ...(options?.brandContext && { brand_context: options.brandContext }),
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
        feed: parseFeed(
          res.data.data.feeds,
          options?.shouldShowMiddlewareOverlay,
          res.data.data.end_of_feed
        ),
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
  // Placeholder data for the query - must match the FeedPage structure
  placeholderData?: {
    pages: FeedPage[];
    pageParams: (undefined | { pageSession?: string; lastVideoId?: string })[];
  };
  // Caching options
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number;
  refetchIntervalInBackground?: boolean;
  embedId?: string;
  isInIframe: boolean;
  shouldShowMiddlewareOverlay?: boolean;
  brandContext?: Array<{
    id: string;
    type: string;
  }>;
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

export const useFeed = (feedType: FeedType, options?: UseFeedOptionsType) => {
  // Always call the hook but control its behavior through the enabled flag
  // This ensures consistent hook call order regardless of options changes
  const startVideoSlug = options?.startVideoSlug;
  const videoDetailsQuery = useGetVideoDetailsAsFeed(
    startVideoSlug || "",
    options?.embedId,
    options?.placementId,
    options?.shouldShowMiddlewareOverlay
  );
  const queryKey = getQueryKeyForFeed(feedType, options);

  // Emulate the old conditional behavior while keeping hook call order consistent
  const videoQueryResult = {
    isLoading: startVideoSlug ? videoDetailsQuery.isLoading : false,
    data: startVideoSlug ? videoDetailsQuery.data : undefined,
    isError: startVideoSlug ? videoDetailsQuery.isError : false,
  };

  // Common query configuration with conditional overrides
  const infiniteQueryResult = useInfiniteQuery({
    queryKey,
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
    refetchOnWindowFocus: false, // Default to false for better UX

    // Use custom caching options if provided, otherwise use default behavior
    ...(options?.staleTime !== undefined && { staleTime: options.staleTime }),
    ...(options?.gcTime !== undefined && { gcTime: options.gcTime }),
    ...(options?.refetchOnMount !== undefined && {
      refetchOnMount: options.refetchOnMount,
    }),
    ...(options?.refetchOnWindowFocus !== undefined && {
      refetchOnWindowFocus: options.refetchOnWindowFocus,
    }),
    ...(options?.refetchOnReconnect !== undefined && {
      refetchOnReconnect: options.refetchOnReconnect,
    }),
    ...(options?.refetchInterval !== undefined && {
      refetchInterval: options.refetchInterval,
    }),
    ...(options?.refetchIntervalInBackground !== undefined && {
      refetchIntervalInBackground: options.refetchIntervalInBackground,
    }),

    // Use select to merge placeholder data with API data when both are available
    ...(options?.placeholderData &&
      !options?.startVideoSlug && {
        placeholderData: options?.placeholderData,
        select: (data: InfiniteData<FeedPage>) => {
          if (!data || !options?.placeholderData) return data;

          const initialPage = options.placeholderData.pages[0];
          const initialVideos = initialPage?.feed || [];

          // If we only have the initial data, return as is
          if (
            data.pages.length === 1 &&
            data.pages[0]?.feed?.length === initialVideos.length
          ) {
            return data;
          }

          // If we have API data, merge it with initial data
          const allApiVideos = data.pages.flatMap((page) => page.feed || []);

          // Check if initial videos are already in the API data
          const apiVideoIds = new Set(allApiVideos.map((v) => v.video.id));
          const hasInitialVideosInApi = initialVideos.some((v) =>
            apiVideoIds.has(v.video.id)
          );
          
          // If initial videos are already in API, return API data as is
          if (hasInitialVideosInApi) {
            return data;
          }

          const mergedPage: FeedPage = {
            feed: [...initialVideos, ...allApiVideos],
            hasSection:
              data.pages[0]?.hasSection || initialPage?.hasSection || false,
            pageSession:
              data.pages[data.pages.length - 1]?.pageSession ||
              initialPage?.pageSession,
            endOfFeed: data.pages[data.pages.length - 1]?.endOfFeed || false,
            timestamp:
              data.pages[data.pages.length - 1]?.timestamp ||
              initialPage?.timestamp ||
              0,
          };

          // Update cache with merged data for other components to access
          queryClient.setQueryData(queryKey, {
            pages: [mergedPage],
            pageParams: [undefined],
          });

          return {
            pages: [mergedPage],
            pageParams: [undefined],
          };
        },
      }),

    // Conditional properties based on startVideoSlug
    ...(options?.startVideoSlug &&
      !videoDetailsQuery.isError && {
        enabled: !videoDetailsQuery.isLoading,
        initialData: videoDetailsQuery.data
          ? {
              pages: [
                {
                  feed: videoDetailsQuery.data,
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
          if (!data || !videoQueryResult.data || !options?.startVideoSlug)
            return data;

          // Check if the first page already contains the start video
          const firstPage = data.pages[0];
          const firstVideo = firstPage?.feed[0];
          if (firstVideo && firstVideo.video.slug === options.startVideoSlug) {
            // Already prepended, return as is
            return data;
          }

          let pages = data.pages;

          // Prepend video data if available
          pages = [
            {
              feed: videoQueryResult.data,
              hasSection: false,
              pageSession: null,
              endOfFeed: false,
              timestamp: 0,
            },
            ...data.pages,
          ];

          // Filter out the start video from subsequent pages
          pages = pages.map((page, index) => {
            if (index === 0) {
              // Don't filter the prepended page
              return page;
            }
            return {
              ...page,
              feed: page.feed.filter(
                (video) => (video.video.id !== options.startVideoSlug && video.video.slug !== options.startVideoSlug)
              ),
            };
          });

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
