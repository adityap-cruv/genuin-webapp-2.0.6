import { QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import {
  useAxiosInstance,
} from "@genuin/components/context/axios";
import { axiosInstance as globalAxiosInstance } from "@genuin/components/context/axios/context";

import { getDeviceId } from "@genuin/components/lib/utils/device-id";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import type {
  CommunityUserRole,
  FeedType,
} from "@genuin/components/types/post";

import { parseFeed } from "./parser";
import { queryClient } from "@genuin/components/react-query/client";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { GroupUserStatusType } from "@genuin/components/types/roles";
import { fetchVideoDetails } from "../video";
import { EmbedDataType } from "@genuin/components/context/embed/embed.types";
import { type AxiosInstance } from "axios";
import { AdsPostDetailsType } from "./schema";
// Mapper for FeedType to corresponding numbers
const feedTypeToNumber: Record<FeedType, number> = {
  HOME: 1,
  LATEST: 2,
  POPULAR: 3,
  EMBED_HOME: 1,
  PLACEMENT_SECTIONS: 1,
  SECTION_FEED: 1,
  VIDEO: 1,
  // This is just a placeholder value. The actual value should be set according to the backend implementation for FEED_V1.
  FEED_V1: -1,
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
  options?: UseFeedOptionsType,
  axiosInstance?: AxiosInstance,
) {
  const requestAxiosInstance = axiosInstance ?? globalAxiosInstance;

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
        ...(options?.embedId && { embed_id: options.embedId }),
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
        ...(options?.placementId && { placement_id: options.placementId }),
        ...(options?.styleId && { style_id: options.styleId }),
        ...(pageParam?.lastVideoId
          ? { last_video_id: pageParam.lastVideoId }
          : options?.lastVideoId
            ? { last_video_id: options.lastVideoId }
            : {}),
        ...(options?.pageSession && { page_session: options.pageSession }),
        ...(options?.sectionId && { section_id: options.sectionId }),
      };
      break;

    case feedType === "FEED_V1":
      url = API_PATHS.FEED_V1;
      requestBody = {
        ...(deviceId && { device_id: deviceId }),
        ...(options?.embedId && { embed_id: options.embedId }),
        ...(pageParam?.lastVideoId && { last_video_id: pageParam.lastVideoId }),
        ...(pageParam?.pageSession && { page_session: pageParam.pageSession }),
        ...(options?.communityIds?.length && {
          community_ids: options.communityIds,
        }),
        ...(options?.groupIds?.length && { loop_ids: options.groupIds }),
      };
      break;

    default:
      url = API_PATHS.FEED_HOME;
      requestBody = {
        type: feedTypeToNumber[feedType],
        ...(deviceId && { device_id: deviceId }),
        ...(options?.embedId && { embed_id: options.embedId }),
        ...(pageParam?.lastVideoId && { last_video_id: pageParam.lastVideoId }),
        ...(pageParam?.pageSession && { page_session: pageParam.pageSession }),
        ...(options?.communityIds?.length && {
          community_ids: options.communityIds,
        }),
        ...(options?.groupIds?.length && { loop_ids: options.groupIds }),
      };
  }

  return await requestAxiosInstance
    .post(url, {
      ...requestBody,
      ...contextualFeedParamsBody,
    })
    .then((res) => {
      // if (res.status !== 200) {
      //   throw new Error("Something went wrong feed api.");
      // }
      if (!res.data || !res.data.data || res.status !== 200) {
        return {
          feed: [],
          hasSection: false,
          pageSession: undefined,
          endOfFeed: true,
          timestamp: 0,
          totalVideos: 0,
        };
      }

      return {
        feed: parseFeed(
          res.data.data.feeds,
          options?.shouldShowMiddlewareOverlay,
          res.data.data.end_of_feed,
        ),
        hasSection: res.data.data.has_section ?? false,
        pageSession: res.data.data.page_session,
        endOfFeed: res.data.data.end_of_feed,
        timestamp: res.data.data.timestamp,
        totalVideos: res.data.data.no_of_videos ?? 0,
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
  videoIds?: string[];
  isSingleVideo?: boolean;
  initialVideoIds?: string[];
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

/**
 * Default empty feed page structure used when no feed data is available
 */
const createEmptyFeedPage = (): FeedPage => ({
  feed: [],
  hasSection: false,
  pageSession: null,
  endOfFeed: false,
  timestamp: 0,
  totalVideos: 0,
});

/**
 * Fetches feed data when specific video IDs are provided.
 * This bypasses the normal feed fetching and directly retrieves the specified videos.
 *
 * @param options - Feed options containing videoIds and related parameters
 * @returns Feed page with the requested video details
 */
async function fetchFeedByVideoIds(
  options: UseFeedOptionsType,
): Promise<FeedPage> {
  const videoDetails = await fetchVideoDetails(
    "",
    options.embedId,
    options.placementId,
    options.shouldShowMiddlewareOverlay,
    options.brandContext,
    options.videoIds,
  );

  return {
    ...createEmptyFeedPage(),
    // as only one page call should be made here
    endOfFeed: true,
    feed: videoDetails,
  };
}

/**
 * Checks if a video with the given slug exists in the feed.
 *
 * @param feed - Array of feed items to search
 * @param slug - Video slug or ID to find
 * @returns True if the video exists in the feed
 */
function isVideoInFeed(feed: FeedPage["feed"], slug: string): boolean {
  return feed.some(
    (item) => item.video?.slug === slug || item.video?.id === slug,
  );
}

/**
 * Moves a video with the given slug to the top of the feed array.
 *
 * @param feed - Array of feed items
 * @param slug - Video slug or ID to move to top
 * @returns New feed array with the video moved to the top, or original array if not found
 */
function moveVideoToTop(
  feed: FeedPage["feed"],
  slug: string,
): FeedPage["feed"] {
  const videoIndex = feed.findIndex(
    (item) => item.video?.slug === slug || item.video?.id === slug,
  );
  const video = feed[videoIndex];

  if (videoIndex === -1 || !video) {
    return feed; // Video not found, return original array
  }

  const remainingFeed = [
    ...feed.slice(0, videoIndex),
    ...feed.slice(videoIndex + 1),
  ];

  return [video, ...remainingFeed];
}

/**
 * Fetches and prepends a specific video to the feed.
 * Used when a startVideoSlug is provided but the video isn't in the current feed.
 *
 * @param feedData - Existing feed data to prepend to
 * @param startVideoSlug - Slug of the video to fetch and prepend
 * @param options - Feed options for video fetching
 * @returns Updated feed page with the video prepended
 */
async function prependVideoToFeed(
  feedData: FeedPage,
  startVideoSlug: string,
  options?: UseFeedOptionsType,
): Promise<FeedPage> {
  try {
    const videoDetails = await fetchVideoDetails(
      startVideoSlug,
      options?.embedId,
      options?.placementId,
      options?.shouldShowMiddlewareOverlay,
      options?.brandContext,
    );

    // For single video mode, return only the fetched video
    // Otherwise, prepend the video to the existing feed
    const feed = options?.isSingleVideo
      ? [...videoDetails]
      : [...videoDetails, ...feedData.feed];

    return {
      ...feedData,
      feed,
    };
  } catch (error) {
    console.error("Failed to fetch video details:", error);
    return feedData;
  }
}

/**
 * Fetches and prepends initial videos to the feed.
 * Used when initialVideoIds are provided to ensure those videos appear first.
 *
 * @param feedData - Existing feed data to prepend to
 * @param initialVideoIds - Array of video IDs to fetch and prepend
 * @param options - Feed options for video fetching
 * @returns Updated feed page with the initial videos prepended
 */
async function prependInitialVideosToFeed(
  feedData: FeedPage,
  initialVideoIds: string[],
  options?: UseFeedOptionsType,
): Promise<FeedPage> {
  try {
    const videoDetails = await fetchVideoDetails(
      "",
      options?.embedId,
      options?.placementId,
      options?.shouldShowMiddlewareOverlay,
      options?.brandContext,
      initialVideoIds,
    );
    // Filter out any videos that are already in the feed to avoid duplicates
    const existingVideoIds = new Set(initialVideoIds);
    const uniqueFeedVideos = feedData.feed.filter(
      (feed) => !feed.video?.id || !existingVideoIds.has(feed.video.id),
    );
    return {
      ...feedData,
      feed: [...videoDetails, ...uniqueFeedVideos],
    };
  } catch (error) {
    console.error("Failed to fetch initial video details:", error);
    return feedData;
  }
}

/**
 * Main query function for fetching feed data.
 * Handles four scenarios:
 * 1. Fetching specific videos by IDs
 * 2. Fetching a single video (isSingleVideo mode)
 * 3. Fetching the regular feed with optional video prepending
 * 4. Prepending initial videos when initialVideoIds are provided
 *
 * @param feedType - Type of feed to fetch
 * @param pageParam - Pagination parameters
 * @param options - Feed configuration options
 * @returns Feed page data
 */
async function createFeedQueryFn(
  feedType: FeedType,
  pageParam: { pageSession?: string; lastVideoId?: string } | undefined,
  options?: UseFeedOptionsType,
  axiosInstance?: AxiosInstance,
): Promise<FeedPage> {
  const startVideoSlug = options?.startVideoSlug;
  const hasVideoIds = options?.videoIds && options.videoIds.length > 0;
  // Scenario 1: Fetch specific videos by their IDs
  if (hasVideoIds) {
    return fetchFeedByVideoIds(options!);
  }

  // Scenario 2: Single video mode - start with empty feed
  // Scenario 3: Regular feed - fetch from API
  let feedData = options?.isSingleVideo
    ? createEmptyFeedPage()
    : await fetchFeed(feedType, pageParam, options, axiosInstance);

  // For the first page with a startVideoSlug, ensure the video is included
  const isFirstPage = !pageParam;
  const videoExistsInFeed = startVideoSlug
    ? isVideoInFeed(feedData.feed, startVideoSlug)
    : false;

  if (isFirstPage && startVideoSlug) {
    if (videoExistsInFeed) {
      // Move existing video to the top
      feedData.feed = moveVideoToTop(feedData.feed, startVideoSlug);
    } else {
      // Prepend video if it doesn't exist in feed
      feedData = await prependVideoToFeed(feedData, startVideoSlug, options);
    }
  }

  const hasInitialVideoIds =
    options?.initialVideoIds && options.initialVideoIds.length > 0;

  // Scenario 4: Prepend initial videos if initialVideoIds are provided (first page only)
  if (isFirstPage && hasInitialVideoIds) {
    feedData = await prependInitialVideosToFeed(
      feedData,
      options!.initialVideoIds!,
      options,
    );
  }

  // Check the placementData and if found than add feed after that
  const hasPlaceholderData =
    options?.placeholderData &&
    options.placeholderData.pages.length > 0 &&
    options.placeholderData.pages[0] &&
    options.placeholderData.pages[0].feed.length > 0;

  if (isFirstPage && hasPlaceholderData) {
    const placeholderVideos = options!.placeholderData!.pages[0]!.feed;
    const placeholderVideoIds = new Set(
      placeholderVideos.flatMap((item) =>
        item.video?.id ? [item.video.id] : [],
      ),
    );
    // Filter out any videos from feedData that are already in placeholder data
    const uniqueFeedVideos = feedData.feed.filter(
      (item) => !item.video?.id || !placeholderVideoIds.has(item.video.id),
    );
    feedData = {
      ...feedData,
      feed: [...placeholderVideos, ...uniqueFeedVideos],
    };
  }

  // Filter out initial videos and startVideoSlug from subsequent pages to avoid duplicates
  if (!isFirstPage && (hasInitialVideoIds || startVideoSlug)) {
    const idsToFilter = new Set<string>(options?.initialVideoIds ?? []);
    if (startVideoSlug) {
      idsToFilter.add(startVideoSlug);
    }

    feedData = {
      ...feedData,
      feed: feedData.feed.filter(
        (item) =>
          (!item.video?.id || !idsToFilter.has(item.video.id)) &&
          (!item.video?.slug || !idsToFilter.has(item.video.slug)),
      ),
    };
  }

  return feedData;
}

export const useFeed = (feedType: FeedType, options?: UseFeedOptionsType) => {
  const queryKey = getQueryKeyForFeed(feedType, options);

  const axiosInstance = useAxiosInstance();

  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      createFeedQueryFn(feedType, pageParam, options, axiosInstance),
    enabled: options?.enabled !== false,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.endOfFeed) return undefined;
      const lastPageData = lastPage.feed[lastPage.feed.length - 1];
      if (!lastPageData) return undefined;
      // If the last item is an ads item, find the last non-ads video for lastVideoId
      const lastVideoData =
        (lastPageData as AdsPostDetailsType).type === "ads" ||
        lastPageData?.video?.videoLayoutId === 6
          ? [...lastPage.feed]
              .reverse()
              .find(
                (item) =>
                  (item as AdsPostDetailsType).type !== "ads" &&
                  item.video?.videoLayoutId !== 6,
              )
          : lastPageData;

      return {
        pageSession: lastPage.pageSession,
        lastVideoId: lastVideoData?.video?.id,
      };
    },
    refetchOnWindowFocus: false,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
    refetchOnReconnect: options?.refetchOnReconnect,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground,
    placeholderData:
      options?.placeholderData && !options?.startVideoSlug
        ? options.placeholderData
        : undefined,
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
          if (video.video?.id === videoId) {
            const sparkCount = video.video?.sparkCount ?? 0;
            return {
              ...video,
              video: {
                ...video.video,
                isSparked: isReacted,
                sparkCount: isReacted
                  ? (video.video?.sparkCount ?? 0) + 1
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
    } as NonNullable<QueryData>;
  });
}

/**
 * Set query data for join community status in feed
 * Supports partial query keys (e.g., ['feed']) to update all matching queries
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
  queryClient.setQueriesData<QueryData>(
    { queryKey, exact: false },
    (oldData) => {
      if (!oldData) return oldData;

      // Create a new array with the updated community role
      const updatedPages = oldData.pages.map((page) => {
        return {
          ...page,
          feed: page.feed.map((video) => {
            if (video.community?.id === communityId) {
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
      } as NonNullable<QueryData>;
    },
  );
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
    } as NonNullable<QueryData>;
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
  queryClient.setQueriesData<QueryData>(
    { queryKey, exact: false },
    (oldData) => {
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
      } as NonNullable<QueryData>;
    },
  );
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
          if (video.video?.id === videoId) {
            const commentCount = video.video?.commentCount ?? 0;
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
    } as NonNullable<QueryData>;
  });
}
