import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";

export async function deletePosts(postIds: string[]) {
  return await axiosInstance
    .delete(API_PATHS.DELETE_POST, {
      data: {
        video_ids: postIds,
      },
    })
    .then(() => {
      return "Posts deleted successfully";
    })
    .catch((e) => {
      throw new Error("Failed to delete posts");
    });
}

/**
 * Custom hook to use the delete posts mutation.
 */
export function useDeletePostsMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: deletePosts,
    onError,
    onSuccess,
  });
}
