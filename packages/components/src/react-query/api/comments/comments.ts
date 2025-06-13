import { useInfiniteQuery } from "@tanstack/react-query";

import { axiosInstance } from "@react-query/axios-instance";
import { getQueryKeyForComments } from "@react-query/keys/comment";

import { parseComments } from "./parser";

async function fetchComments(videoId: string, pageParam?: string) {
  try {
    const res = await axiosInstance.get("/api/v3/comments", {
      params: {
        conversation_id: videoId,
        last_comment_id: pageParam,
      },
    });
    const resData = res.data.data;
    return {
      comments: parseComments(resData.comments),
      end: resData.endOfResult,
    };
  } catch (e) {
    throw new Error("Something went wrong with comments API!");
  }
}

export function useComments(videoId: string) {
  return useInfiniteQuery({
    queryKey: getQueryKeyForComments(videoId),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      fetchComments(videoId, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.end) {
        return;
      }
      return lastPage.comments[lastPage.comments.length - 1]?.commentId;
    },
  });
}
