import { useMutation } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";

export async function deletePosts(postIds: string[], axiosInstance: AxiosInstance) {
  return await axiosInstance
    .delete(API_PATHS.DELETE_POST, {
      data: {
        video_ids: postIds,
      },
    })
    .then(() => {
      return "Posts deleted successfully";
    })
    .catch((_e) => {
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
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (postIds: string[]) => deletePosts(postIds, axiosInstance),
    onError,
    onSuccess,
  });
}
