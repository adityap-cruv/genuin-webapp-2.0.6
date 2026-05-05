import { useMutation } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";

export async function deleteDrafts(postIds: string[], axiosInstance: AxiosInstance) {
  return await axiosInstance
    .delete(API_PATHS.DELETE_DRAFT, {
      data: {
        draft_video_ids: postIds,
      },
    })
    .then(() => {
      return "Drafts deleted successfully";
    })
    .catch((_e) => {
      throw new Error("Failed to delete drafts");
    });
}

/**
 * Custom hook to use the delete drafts mutation.
 */
export function useDeleteDraftsMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (postIds: string[]) => deleteDrafts(postIds, axiosInstance),
    onError,
    onSuccess,
  });
}
