import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";

import type { CommunityType, LoopType } from "./schema";

/***
 * This type is used to define the structure of the video for tree structure component.
 */
export type VideoType = {
  id: string;
  thumbnail: string;
  sparkCount: number;
};

export type FetchCommunityReturnType = {
  communities: CommunityType[];
  end: boolean;
  nextPageParam: FetchCommunityPageParamType;
};
/**
 * This type is defined for pageParams of fetchCommunity api.
 */
export type FetchCommunityPageParamType = {
  lastCommunityId: string;
  pageSession: string;
} | null;

export type FetchLoopPropsType = {
  communityId: string;
  pageParams: FetchLoopPageParamType;
};

export type FetchLoopPageParamType = {
  lastLoopId: string;
  pageSession: string;
} | null;

export type FetchLoopReturnType = {
  loops: LoopType[];
  end: boolean;
  nextPageParam: FetchLoopPageParamType;
};

export type FetchVideosPropsType = {
  communityId: string;
  loopId: string;
  pageParams: FetchVideosPageParamType;
};

export type FetchVideosPageParamType = {
  lastVideoId: string;
  pageSession: string;
} | null;

export type FetchVideosReturnType = {
  videos: VideoType[];
  end: boolean;
  nextPageParam: FetchVideosPageParamType;
};

/**
 * Will modify the type of UseInfiniteQueryResult to exclude the data field.
 */
export type InfiniteQueryResultForTreeStructureType<T> = Omit<
  UseInfiniteQueryResult<InfiniteData<T>>,
  "data"
>;

/**
 * Pass the page param type in input.
 */
export type BaseFunctionPropsType<P = unknown, Others = object> = {
  pageParam: P;
  profileId: string;
  videosLimit: number;
  forBrand: boolean;
} & Others;
