import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { parseComments } from "./parser";
import { API_PATHS } from "../../paths";

type PostCommentProps = {
  videoId: string;
  loopId: string;
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
 * @param commentData - Additional comment data.
 * @returns The response code and comment data.
 */
async function postComment({
  videoId,
  loopId,
  commentText,
  commentData,
}: PostCommentProps) {
  try {
    const res = await axiosInstance.post(API_PATHS.FEED_CREATE_COMMENT, {
      conversation_id: videoId,
      chat_id: loopId,
      type: 3,
      comment_text: commentText,
      comment_data: JSON.stringify(commentData),
    });
    if (res.data.code === 1003) {
      throw new Error("Failed to post comment");
    }

    return { commentData: parseComments([res.data.data]) };
  } catch (e: any) {
    console.error("Failed to post comment:", e);
    throw new Error(`Failed to post comment: ${e?.message || e}`);
  }
}

/**
 * React Query mutation hook for posting a comment.
 * @param callbacks - Optional onSuccess and onError callbacks.
 */
export function useCreateCommentMutation({
  onSuccess,
  onError,
}: PostCommentMutationCallbacks) {
  return useMutation({
    mutationFn: postComment,
    retry: false,
    onSuccess,
    onError,
  });
}
