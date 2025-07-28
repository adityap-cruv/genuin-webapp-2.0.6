import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import {
  getQueryKeyForComments,
  getQueryKeyForMentions,
} from "@genuin/components/react-query/keys/comment";

import { parseComments } from "./parser";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { queryClient } from "@genuin/components/react-query/client";

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
      end: resData.end_of_result,
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

/**
 * Set the query data for a new comment.
 * @param videoId - The ID of the video for which the comment is posted.
 * @param newComment - The new comment to be added.
 */
export function setQueryDataForNewComment(
  videoId: string,
  newComment: Awaited<ReturnType<typeof fetchComments>>["comments"]
) {
  console.log("Setting new comment data for video:", videoId, newComment);
  queryClient.setQueryData<QueryData>(
    getQueryKeyForComments(videoId),
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page, index) =>
          index === 0
            ? {
                ...page,
                comments: [...newComment, ...page.comments],
              }
            : page
        ),
      };
    }
  );
}

async function fetchMentionUser(
  chatId: string,
  queryString: string,
  signal?: AbortSignal
) {
  const searchParams = new URLSearchParams({
    query_string: queryString,
    chat_id: chatId,
  });

  try {
    const response = await axiosInstance.get(
      API_PATHS.FEED_GET_MENTIONS_COMMENTS,
      {
        params: searchParams,
        signal,
      }
    );

    const resData = response.data.data ?? null;
    return { data: resData };
  } catch (e: any) {
    throw new Error("Something went wrong with mentions API!");
  }
}

// React Query hook for mentions
export function useMentionUser(
  chatId: string,
  queryString: string,
  enabled = true,
  mentionSignal: AbortSignal | undefined
) {
  return useQuery({
    queryKey: getQueryKeyForMentions(chatId, queryString),
    queryFn: ({ signal }) => fetchMentionUser(chatId, queryString, signal),
    enabled: !!chatId && !!queryString && enabled,
    // staleTime: 60 * 1000, // adjust as needed
  });
}
