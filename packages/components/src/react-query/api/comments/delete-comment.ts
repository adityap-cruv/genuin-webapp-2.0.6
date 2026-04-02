import { useMutation } from "@tanstack/react-query";
import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "../../paths";
import type { AxiosInstance } from "axios";

type DeleteCommentProps = {
  commentId: string;
};

type DeleteCommentMutationCallbacks = {
  onSuccess?: (
    data: Awaited<ReturnType<typeof deleteComment>>,
    variables: DeleteCommentProps,
    context: unknown
  ) => void;
  onError?: (
    error: Error,
    variables: DeleteCommentProps,
    context: unknown
  ) => void;
};

/**
 * Deletes a comment by its ID.
 * @param commentId - The ID of the comment to delete.
 * @returns The response indicating success or failure.
 */
async function deleteComment({ commentId }: DeleteCommentProps, axiosInstance: AxiosInstance) {
  try {
    const res = await axiosInstance.delete(
      `${API_PATHS.FEED_DELETE_COMMENT}?comment_id=${commentId}`
    );

    if (res.data.code === 200) {
      return { success: true };
    }
  } catch (e: any) {
    console.error("Failed to delete comment:", e);
    throw new Error(`Failed to delete comment: ${e?.message || e}`);
  }
}

/**
 * React Query mutation hook for deleting a comment.
 * @param callbacks - Optional onSuccess and onError callbacks.
 */
export function useDeleteCommentMutation({
  onSuccess,
  onError,
}: DeleteCommentMutationCallbacks) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (props: DeleteCommentProps) => deleteComment(props, axiosInstance),
    retry: false,
    onSuccess,
    onError,
  });
}
