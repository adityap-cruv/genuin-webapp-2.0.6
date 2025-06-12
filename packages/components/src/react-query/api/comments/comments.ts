import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

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

type PostCommentProps = {
  videoId: string;
  loopId: string;
  type: number;
  commentText: string;
  commentData: any;
};

type PostCommentMutationCallbacks = {
  onSuccess?: (
    data: Awaited<ReturnType<typeof postComment>>,
    variables: PostCommentProps,
    context: unknown
  ) => void;
  onError?: (
    error: Error,
    variables: PostCommentProps,
    context: unknown
  ) => void;
};

/**
 * Posts a new comment to the specified video and loop.
 * @param videoId - The ID of the video.
 * @param loopId - The ID of the loop/chat.
 * @param type - The type of the comment.
 * @param commentText - The text of the comment.
 * @param commentData - Additional commen data.
 * @returns The response code and comment data.
 */
export async function postComment({
  videoId,
  loopId,
  type,
  commentText,
  commentData,
}: PostCommentProps) {
  try {
    const res = await axiosInstance.post("/api/v3/comment/create", {
      conversation_id: videoId,
      chat_id: loopId,
      type,
      comment_text: commentText,
      comment_data: JSON.stringify(commentData),
    });
    return { code: res.status, commentData: res.data.data };
  } catch (e: any) {
    return { code: Number(e?.response?.data?.code) || 500, commentData: null };
  }
}

/**
 * React Query mutation hook for posting a comment.
 * @param callbacks - Optional onSuccess and onError callbacks.
 */
export function usePostComment({
  onSuccess,
  onError,
}: PostCommentMutationCallbacks = {}) {
  return useMutation({
    mutationFn: postComment,
    retry: false,
    onSuccess,
    onError,
  });
}
