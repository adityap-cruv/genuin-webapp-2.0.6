import { useInfiniteQuery } from "@tanstack/react-query";

import { axiosInstance } from "src/react-query/axios-instance";
import {
  getQueryKeyForProfileCommunities,
  getQueryKeyForProfileLoops,
  getQueryKeyForProfileVideos,
} from "src/react-query/keys/profile";
import { API_PATHS } from "src/react-query/paths";

import type { VideoType, LoopType } from "./schema";
import {
  parseCommunityResponse,
  parseGroupResponse,
  parseVideoResponse,
} from "./schema";
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
  {
    forBrand,
    profileId,
    videosLimit,
  }: { forBrand: boolean; profileId: string; videosLimit?: number }
) {
  const url = new URL(
    "https://api.qa.begenuin.com/" +
      (forBrand ? endpoint : endpoint.replace("/brand", ""))
  );
  console.log("::API URL::", url.toString());
  url.searchParams.append(forBrand ? "brand_id" : "user_id", profileId);
  if (videosLimit)
    url.searchParams.append(
      "page_limit_profile_videos",
      videosLimit.toString()
    );
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
 * @returns
 */
async function fetchProfileCommunities({
  pageParam,
  profileId,
  videosLimit,
  forBrand,
}: BaseFunctionPropsType<FetchCommunityPageParamType>): Promise<FetchCommunityReturnType> {
  try {
    const url = prepareApiUrl(API_PATHS.USER_COMMUNITIES, {
      forBrand,
      profileId,
      videosLimit,
    });

    if (pageParam?.pageSession)
      url.searchParams.append("page_session", pageParam.pageSession);
    if (pageParam?.lastCommunityId)
      url.searchParams.append("last_community_id", pageParam.lastCommunityId);

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

export function useGetProfileCommunities(profileId: string, forBrand = false) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) =>
      fetchProfileCommunities({
        profileId,
        pageParam,
        videosLimit: getVideoLimit(!!pageParam.lastCommunityId, false),
        forBrand,
      }),
    queryKey: getQueryKeyForProfileCommunities(profileId, forBrand),
    initialPageParam: { lastCommunityId: "", pageSession: "" },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null;
      return lastPage.nextPageParam;
    },
  });
}

/**
 * Fetches the loops for the profile or brand.
 * @param param0
 * @returns
 */
async function fetchProfileGroups({
  pageParam,
  profileId,
  communityId,
  videosLimit,
  forBrand,
}: BaseFunctionPropsType<
  FetchLoopPageParamType,
  { communityId: string }
>): Promise<FetchLoopReturnType> {
  try {
    const url = prepareApiUrl(API_PATHS.USER_GROUPS, {
      forBrand,
      profileId,
      videosLimit,
    });

    url.searchParams.append("community_id", communityId);
    if (pageParam?.lastLoopId)
      url.searchParams.append("last_chat_id", pageParam.lastLoopId);
    if (pageParam?.pageSession)
      url.searchParams.append("page_session", pageParam.pageSession);

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
  initialLoops: LoopType[]
) {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) =>
      fetchProfileGroups({
        profileId,
        communityId,
        pageParam,
        videosLimit: getVideoLimit(!!pageParam?.lastLoopId, false),
        forBrand,
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
          nextPageParam: {
            lastLoopId: initialLoops[initialLoops.length - 1]?.id ?? "",
            pageSession: "",
          },
          end: false,
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
 * Fetches the videosList for the profile or brand.
 * @param param0
 * @returns
 */
async function fetchProfileVideos({
  profileId,
  communityId,
  loopId,
  pageParam,
  videosLimit,
  forBrand,
}: BaseFunctionPropsType<
  FetchVideosPageParamType,
  { communityId: string; loopId: string }
>): Promise<FetchVideosReturnType> {
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
      end: false, // Assuming this stays hardcoded like your original
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
  initialVideos: VideoType[]
) {
  return useInfiniteQuery({
    queryKey: getQueryKeyForProfileVideos(communityId, loopId, forBrand),
    queryFn: ({ pageParam }) =>
      fetchProfileVideos({
        profileId,
        loopId,
        pageParam,
        communityId,
        videosLimit: getVideoLimit(!!pageParam?.lastVideoId, false),
        forBrand,
      }),
    initialPageParam: {
      lastVideoId: initialVideos[initialVideos.length - 1]?.id ?? "",
      pageSession: "",
    },
    initialData: {
      pageParams: [
        {
          lastVideoId: initialVideos[initialVideos.length - 1]?.id ?? "",
          pageSession: "",
        },
      ],
      pages: [
        {
          videos: initialVideos,
          end: false,
          nextPageParam: {
            lastVideoId: initialVideos[initialVideos.length - 1]?.id ?? "",
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
