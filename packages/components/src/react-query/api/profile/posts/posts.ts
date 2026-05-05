import { useInfiniteQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { NEXT_PUBLIC_API_URL } from "@genuin/components/lib/utils/env";
import { queryClient } from "@genuin/components/react-query/client";
import {
  getQueryKeyForProfileCommunities,
  getQueryKeyForProfileFeed,
  getQueryKeyForProfileLoops,
  getQueryKeyForProfileVideos,
} from "@genuin/components/react-query/keys/profile";
import { API_PATHS } from "@genuin/components/react-query/paths";
import type { GroupUserStatusType } from "@genuin/components/types/roles";

import { parseFeed } from "../../feed/parser";

import type { VideoType, LoopType } from "./schema";
import { parseCommunityResponse, parseGroupResponse, parseVideoResponse } from "./schema";
import type {
  BaseFunctionPropsType,
  FetchCommunityPageParamType,
  FetchCommunityReturnType,
  FetchLoopPageParamType,
  FetchLoopReturnType,
  FetchVideosPageParamType,
  FetchVideosReturnType,
} from "./types";

// TODO: Refactor these functions to use API_PATHS

/**
 * This will prepare api url for brand or profile as both gives same response and brand page is same as profile page.
 * @param endpoint -> Url which contains the brand.By default pass the url which contains the brand.
 * @param param1
 * @returns
 */
function prepareApiUrl(
  endpoint: string,
  { forBrand, profileId, videosLimit }: { forBrand: boolean; profileId: string; videosLimit?: number }
) {
  const url = new URL(NEXT_PUBLIC_API_URL + "/" + (forBrand ? endpoint : endpoint.replace("/brand", "")));
  url.searchParams.append(forBrand ? "brand_id" : "user_id", profileId);
  if (videosLimit) url.searchParams.append("page_limit_profile_videos", videosLimit.toString());
  return url;
}

/**
 * To figure out how much videos elements needs to be fetched.
 * @param hasPageParam - If the next page is being called.
 * @returns
 */
export function getVideoLimit(hasPageParam: boolean, isMobile: boolean) {
  // If the user is on mobile, fetch 3 videos for the first page and 6 for the next page.
  // If the user is on desktop, fetch 8 videos for the first page and 16 for the next page.
  if (isMobile) {
    return hasPageParam ? 6 : 3;
  } else {
    return hasPageParam ? 16 : 8;
  }
}

/**
 * Fetches the communities for the profile or brand.
 * @param param0
 * @param axiosInstance - Axios instance to use for the request
 * @returns
 */
async function fetchProfileCommunities({
  pageParam,
  profileId,
  videosLimit,
  forBrand,
  axiosInstance,
}: BaseFunctionPropsType<FetchCommunityPageParamType> & {
  axiosInstance: AxiosInstance;
}): Promise<FetchCommunityReturnType> {
  try {
    const url = prepareApiUrl(API_PATHS.USER_COMMUNITIES, {
      forBrand,
      profileId,
      videosLimit,
    });

    if (pageParam?.pageSession) url.searchParams.append("page_session", pageParam.pageSession);
    if (pageParam?.lastCommunityId) url.searchParams.append("last_community_id", pageParam.lastCommunityId);

    const response = await axiosInstance.get(url.toString());

    const resData = response.data;
    const communities = parseCommunityResponse(resData.data?.communities);
    return {
      communities,
      end: resData.data?.end_of_communities ?? false,
      nextPageParam: {
        lastCommunityId: communities[communities.length - 1]?.id ?? "",
        pageSession: resData.data?.page_session ?? "",
      },
    };
  } catch (error) {
    console.error("::Error fetching communities::", error);
    throw new Error("Something went wrong with the communities API.");
  }
}

/**
 * Fetches the communities for the profile or brand.
 * @param profileId - The ID of the profile to fetch communities for.
 * @param forBrand - A boolean indicating whether to fetch communities for a brand or a user profile.
 * @returns
 */
export function useGetProfileCommunities(profileId: string, forBrand = false) {
  const axiosInstance = useAxiosInstance();

  return useInfiniteQuery({
    queryFn: ({ pageParam }) =>
      fetchProfileCommunities({
        profileId,
        pageParam,
        videosLimit: getVideoLimit(!!pageParam.lastCommunityId, false),
        forBrand,
        axiosInstance,
      }),
    queryKey: getQueryKeyForProfileCommunities(profileId, forBrand),
    initialPageParam: { lastCommunityId: "", pageSession: "" },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null;
      return lastPage.nextPageParam;
    },
  });
}
type OldQueryData = Awaited<ReturnType<typeof useGetProfileCommunities>>["data"];

/**
 * This function updates the query data for joining a community in the profile's communities.
 * @param newRole - The new role to set for the community.
 * @param communityId - The ID of the community to update.
 * @param profileId  - The ID of the profile to update.
 * @param forBrand - A boolean indicating whether the update is for a brand or a user profile.
 */
export function setQueryDataForJoinCommunityInProfileCommunities(
  newRole: string,
  communityId: string,
  profileId: string,
  forBrand: boolean
) {
  const queryKey = getQueryKeyForProfileCommunities(profileId, forBrand);

  queryClient.setQueryData(queryKey, (oldData: OldQueryData | undefined) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        communities: page.communities.map((community) =>
          community.id === communityId ? { ...community, role: newRole } : community
        ),
      })),
    };
  });
}

/**
 * Fetches the loops for the profile or brand.
 * @param param0
 * @param axiosInstance - Axios instance to use for the request
 * @returns
 */
async function fetchProfileGroups({
  pageParam,
  profileId,
  communityId,
  videosLimit,
  forBrand,
  axiosInstance,
}: BaseFunctionPropsType<FetchLoopPageParamType, { communityId: string }> & {
  axiosInstance: AxiosInstance;
}): Promise<FetchLoopReturnType> {
  try {
    const url = prepareApiUrl(API_PATHS.USER_GROUPS, {
      forBrand,
      profileId,
      videosLimit,
    });

    url.searchParams.append("community_id", communityId);
    if (pageParam?.lastLoopId) url.searchParams.append("last_chat_id", pageParam.lastLoopId);
    if (pageParam?.pageSession) url.searchParams.append("page_session", pageParam.pageSession);

    const response = await axiosInstance.get(url.toString());

    const resData = response.data;
    const loops = parseGroupResponse(resData.data?.loops);
    return {
      loops,
      end: resData.data?.end_of_loops ?? false,
      nextPageParam: {
        lastLoopId: loops[loops.length - 1]?.id ?? "",
        pageSession: pageParam?.pageSession ?? "",
      },
    };
  } catch (error) {
    console.error("::Error in api/v3/profile/loops::", error);
    throw new Error("Something went wrong with the profile loops API.");
  }
}

export function useGetProfileGroups(
  profileId: string,
  communityId: string,
  forBrand = false,
  initialLoops: LoopType[],
  totalLoops: number
) {
  const axiosInstance = useAxiosInstance();

  return useInfiniteQuery({
    queryFn: ({ pageParam }) =>
      fetchProfileGroups({
        profileId,
        communityId,
        pageParam,
        videosLimit: getVideoLimit(!!pageParam?.lastLoopId, false),
        forBrand,
        axiosInstance,
      }),
    initialPageParam: {
      lastLoopId: initialLoops[initialLoops.length - 1]?.id ?? "",
      pageSession: "",
    },
    initialData: {
      pageParams: [{ lastLoopId: "", pageSession: "" }],
      pages: [
        {
          loops: initialLoops,
          nextPageParam:
            totalLoops > initialLoops.length
              ? {
                  lastLoopId: initialLoops[initialLoops.length - 1]?.id ?? "",
                  pageSession: "",
                }
              : null,
          end: totalLoops <= initialLoops.length,
        },
      ],
    },
    queryKey: getQueryKeyForProfileLoops(communityId, forBrand),
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null;
      return lastPage.nextPageParam;
    },
    enabled: false,
  });
}

/**
 * Sets the query data for the group join status in the profile groups.
 * @param communityId - The ID of the community to update.
 * @param forBrand - A boolean indicating whether the update is for a brand or a user profile.
 * @param newRole - The new role to set for the group.
 */
export function setQueryDataForGroupJoinStatusInProfileGroups({
  communityId,
  loopId,
  forBrand,
  newRole,
}: {
  communityId: string;
  loopId: string;
  forBrand: boolean;
  newRole: GroupUserStatusType;
}) {
  type QueryData = Awaited<ReturnType<typeof useGetProfileGroups>>["data"];
  queryClient.setQueryData<QueryData>(getQueryKeyForProfileLoops(communityId, forBrand), (oldData) => {
    if (!oldData) return oldData;

    // Update the loops in the query data
    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        loops: page.loops.map((loop) =>
          loop.id === loopId
            ? {
                ...loop,
                role: newRole, // Set the status to JOINED
                isSubscriber: newRole === "JOINED" ? true : loop.isSubscriber, // Set isSubscriber based on the new role
              }
            : loop
        ),
      })),
    };
  });
}

/**
 * Sets the query data for the group subscription status in the profile groups.
 * @param param0
 */
export function setQueryDataForGroupSubscribeInProfileGroups({
  communityId,
  loopId,
  forBrand,
  isSubscribed,
}: {
  communityId: string;
  loopId: string;
  forBrand: boolean;
  isSubscribed: boolean;
}) {
  type QueryData = Awaited<ReturnType<typeof useGetProfileGroups>>["data"];

  queryClient.setQueryData<QueryData>(getQueryKeyForProfileLoops(communityId, forBrand), (oldData) => {
    if (!oldData) return oldData;

    // Update the loops in the query data
    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        loops: page.loops.map((loop) => (loop.id === loopId ? { ...loop, isSubscriber: isSubscribed } : loop)),
      })),
    };
  });
}

/**
 * Fetches the videosList for the profile or brand.
 * @param param0
 * @param axiosInstance - Axios instance to use for the request
 * @returns
 */
async function fetchProfileVideos({
  profileId,
  communityId,
  loopId,
  pageParam,
  videosLimit,
  forBrand,
  axiosInstance,
}: BaseFunctionPropsType<FetchVideosPageParamType, { communityId: string; loopId: string }> & {
  axiosInstance: AxiosInstance;
}): Promise<FetchVideosReturnType> {
  try {
    const url = prepareApiUrl(API_PATHS.USER_VIDEOS, {
      forBrand,
      profileId,
      videosLimit,
    });

    url.searchParams.append("community_id", communityId);
    url.searchParams.append("chat_id", loopId);
    if (pageParam?.lastVideoId) {
      url.searchParams.append("last_message_id", pageParam.lastVideoId);
    }
    if (pageParam?.pageSession) {
      url.searchParams.append("page_session", pageParam.pageSession);
    }

    const response = await axiosInstance.get(url.toString());

    const resData = response.data;
    const videos = parseVideoResponse(resData.data?.messages);

    return {
      videos,
      end: resData.data.end_of_messages,
      nextPageParam: {
        lastVideoId: videos[videos.length - 1]?.id ?? "",
        pageSession: resData.data?.page_session ?? "",
      },
    };
  } catch (error) {
    console.error("::Error in profile videos API::", error);
    throw new Error("Something went wrong with the profile videos API.");
  }
}

export function useGetProfileVideos(
  profileId: string,
  loopId: string,
  communityId: string,
  forBrand = false,
  initialVideos: VideoType[],
  totalVideos: number
) {
  const axiosInstance = useAxiosInstance();

  return useInfiniteQuery({
    queryKey: getQueryKeyForProfileVideos(communityId, loopId, forBrand),
    queryFn: ({ pageParam }: { pageParam: { lastVideoId: string; pageSession: string } | null }) =>
      fetchProfileVideos({
        profileId,
        loopId,
        pageParam,
        communityId,
        videosLimit: getVideoLimit(!!pageParam?.lastVideoId, false),
        forBrand,
        axiosInstance,
      }),
    initialPageParam: null as { lastVideoId: string; pageSession: string } | null,
    initialData: {
      pageParams: [null],
      pages: [
        {
          videos: initialVideos,
          end: initialVideos.length === totalVideos,
          nextPageParam:
            // If totalVideos is equal to the length of initialVideos, it means there are no more videos to fetch.
            initialVideos.length === totalVideos
              ? null
              : {
                  lastVideoId: initialVideos[initialVideos.length - 1]?.id as string,
                  pageSession: "",
                },
        },
      ],
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null;
      return lastPage.nextPageParam;
    },
    enabled: false,
  });
}

/**
 *
 * @param profileId - The ID of the profile to fetch the feed for.
 * @param forBrand - A boolean indicating whether to fetch the feed for a brand or a user profile.
 * @param pageParam - An optional parameter to handle pagination, containing the last message ID.
 * @param fromVideoId - An optional parameter to specify the video ID from which to start fetching.
 * @param axiosInstance - Axios instance to use for the request
 * @returns
 */
export async function fetchProfileFeed(
  profileId: string,
  forBrand: boolean,
  axiosInstance: AxiosInstance,
  pageParam?: { lastMessageId?: string },
  fromVideoId?: string
) {
  try {
    const url = prepareApiUrl(`goservices${!forBrand ? "/profile" : ""}/feed${forBrand ? "/brand" : ""}`, {
      forBrand,
      profileId,
    });

    if (pageParam?.lastMessageId) {
      url.searchParams.append("last_video_id", pageParam.lastMessageId);
    }

    if (!pageParam?.lastMessageId && fromVideoId) {
      url.searchParams.append("from_video_id", fromVideoId);
    }

    const response = await axiosInstance.get(url.toString());

    const data = response.data;
    const feeds = parseFeed(data.data.feeds);

    return {
      feed: feeds,
      end: data.data.end_of_feed as boolean,
    };
  } catch (e) {
    console.error("Error in fetchBrandFeed:", e);
    throw new Error("Something went wrong!!");
  }
}

/**
 * Returns a QueryKey for fetching profile feed.
 * @param profileId - The identifier for the profile.
 * @param forBrand - Determines if the key is for a brand or profile.
 * @param videoId - The identifier for the video.
 * @returns The generated query key.
 */
export function useGetProfileFeed(profileId: string, forBrand: boolean, videoId?: string) {
  const axiosInstance = useAxiosInstance();

  return useInfiniteQuery({
    queryKey: getQueryKeyForProfileFeed(profileId, forBrand, videoId ?? ""),
    queryFn: async ({ pageParam }) => {
      // pageParam will be of type ProfileFeedPageParam | undefined here
      // TanStack Query v5 passes the initialPageParam as the first pageParam
      // or the result of getNextPageParam for subsequent pages.
      // If initialPageParam is undefined, pageParam will be undefined for the first call.
      const currentLastMessageId = pageParam?.lastMessageId;

      if (!currentLastMessageId && videoId) {
        return await fetchProfileFeed(profileId, forBrand, axiosInstance, undefined, videoId);
      }

      return await fetchProfileFeed(
        profileId,
        forBrand,
        axiosInstance,
        pageParam, // pageParam can be { lastMessageId: string } or undefined
        undefined
      );
    },
    initialPageParam: { lastMessageId: "" }, // Start with an empty object or specific initial lastMessageId if needed
    getNextPageParam: (lastPage) => {
      if (lastPage.end) {
        return undefined; // Return undefined to indicate no more pages
      }
      // Get the last video ID from the current page
      const lastVideo = lastPage.feed[lastPage.feed.length - 1];
      return lastVideo?.video ? { lastMessageId: lastVideo.video.id } : undefined;
    },
  });
}
