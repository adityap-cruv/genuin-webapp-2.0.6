import { useInfiniteQuery } from "@tanstack/react-query";

import { axiosInstance } from "@react-query/axios-instance";
import { getQueryKeyForComments } from "@react-query/keys/comment";

import { parseComments } from "./parser";
import { API_PATHS } from "@react-query/paths";
import { queryClient } from "@react-query/client";

/**
 * Fetch comments for a video.
 * @param videoId - The ID of the video for which comments are to be fetched.
 * @param pageParam - The ID of the last fetched comment, used for pagination.
 * @returns A promise that resolves to the fetched comments.
 */
async function fetchComments(videoId: string, pageParam?: string) {
  try {
    const res = await axiosInstance.get(API_PATHS.FEED_GET_COMMENTS, {
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

/**
 * Custom hook to fetch comments for a video.
 * @param videoId - The ID of the video for which comments are to be fetched.
 * @returns
 */
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

type QueryData = ReturnType<typeof useComments>["data"];

/**
 * Handle the reaction state change for comments.
 * @param videoId - The ID of the video for which comments are to be updated.
 * @param isSparked
 */
export function handleReactionStateChangeInComments(
  videoId: string,
  commentId: string,
  isSparked: boolean
) {
  queryClient.setQueryData<QueryData>(
    getQueryKeyForComments(videoId),
    (oldData) => {
      if (!oldData) return oldData;
      console.log("Old data:", oldData);
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          comments: page.comments.map((comment) =>
            comment.commentId === commentId
              ? {
                  ...comment,
                  isSparked,
                  noOfSparks: isSparked
                    ? comment.noOfSparks + 1
                    : comment.noOfSparks - 1,
                }
              : comment
          ),
        })),
      };
    }
  );
}
